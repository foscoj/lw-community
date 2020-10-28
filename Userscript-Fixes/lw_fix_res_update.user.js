// ==UserScript==
// @name         lw_fix_res_update
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  Fix the Resource-Update in LW
// @author       FQS
// @match        https://*.last-war.de/main.php*
// @grant        GM_log
// ==/UserScript==


class Resources {
    constructor(resources, resourcesPerHour, resourcesCapacity, resourceUpdateFunction) {
        this.resources = resources;
        this.resourcesPerHour = resourcesPerHour;
        this.resourcesCapacity = resourcesCapacity;
        this.timestamp = Date.now();
        this.resourceUpdateFunction = resourceUpdateFunction;

        this.resourceUpdateTimer = setInterval(() => { this.resourceUpdateFunction({data: this.getResources()}); }, 1000);
    }

    setResources(resources, resourcesPerHour) {
        this.resources = resources;
        this.resourcesPerHour = resourcesPerHour;
        this.timestamp = Date.now();
        GM_log(this.resources, this.resourcesPerHour);
    }

    getResources() {
        let now = Date.now();
        let resources = [];

        for (let resource of ['roheisen', 'kristall', 'frubin', 'orizin', 'frurozin', 'gold']) {
            resources.push(Math.min(this.resources[resource] + this.resourcesPerHour[resource] * (now - this.timestamp) / 1000 / 60 / 60, this.resourcesCapacity[resource]));
        }

        return resources;
    }
}

(function() {
    'use strict';

    setup();

    function setup() {
        let resources = { 'roheisen': unsafeWindow.Roheisen, 'kristall': unsafeWindow.Kristall, 'frubin': unsafeWindow.Frubin, 'orizin': unsafeWindow.Orizin, 'frurozin': unsafeWindow.Frurozin, 'gold': unsafeWindow.Gold }
        let resourcesPerHour = unsafeWindow.getResourcePerHour()[0];
        let resourcesCapacity = { 'roheisen': unsafeWindow.RoheisenLagerCapacity, 'kristall': unsafeWindow.KristallLagerCapacity, 'frubin': unsafeWindow.FrubinLagerCapacity, 'orizin': unsafeWindow.OrizinLagerCapacity, 'frurozin': unsafeWindow.FrurozinLagerCapacity, 'gold': unsafeWindow.GoldLagerCapacity };

        unsafeWindow.resourceStore = new Resources(resources, resourcesPerHour, resourcesCapacity, unsafeWindow.resources.onmessage);

        unsafeWindow.stopWorkerForResource();
        unsafeWindow.stopWorkerForResource = function() {};

        unsafeWindow.jQuery(document).ajaxComplete((event, xhr, settings) => {
            let page = undefined;

            if (settings.url.includes('/ajax_request/') ) {
                page = settings.url.slice(settings.url.indexOf('/ajax_request/')+14, settings.url.indexOf('.php'));
            }

            if ( !page ) {
                return;
            }

            let data = JSON.parse(xhr.responseText);

            if (['put_building', 'cancel_building', 'put_new_trade_offer', 'delete_aktuelle_produktion', 'delete_trade_offer', 'accept_trade_offer', 'put_research', 'cancel_research', 'send_flotten'].includes(page)) {
                let resources = {
                    'roheisen': parseInt(data.roheisen || data.Roheisen),
                    'kristall': parseInt(data.kristall || data.Kristall),
                    'frubin': parseInt(data.frubin || data.Frubin),
                    'orizin': parseInt(data.orizin || data.Orizin),
                    'frurozin': parseInt(data.frurozin || data.Frurozin),
                    'gold': parseInt(data.gold || data.Gold)
                };

                unsafeWindow.resourceStore.setResources(resources, unsafeWindow.getResourcePerHour()[0]);
            }
        });
    }


})();