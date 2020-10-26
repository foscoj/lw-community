// ==UserScript==
// @name         lw_fix_res_update
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  Fix the Resource-Update in LW
// @author       FQS
// @match        https://*.last-war.de/main.php*
// @grant        GM_log
// ==/UserScript==

class Shadow {
    constructor(window) {
        this.window = window;
        this.variables = [];
        this.storage = {};
    }

    addVariable(name) {
        this.variables.push(name);
        this.storage[name] = this.window[name];
    }

    update() {
        for (let variable of this.variables) {
            this.storage[variable] = this.window[variable];
        }
    }

    hasChanged() {
        for (let variable of this.variables) {
            if (this.storage[variable] != this.window[variable]) {
                return true;
            }
        }
        return false;
    }
}

class Resources {
    constructor(resources, resourcesPerHour) {
        this.resources = resources;
        this.resourcesPerHour = resourcesPerHour;
        this.timestamp = Date.now();
        this.tainted = false;
    }

    taint() {
        this.tainted = true;
    }

    isTainted() {
        return this.tainted;
    }

    setResources(resources, resourcesPerHour) {
        GM_log(Date + ': resources changed!');
        this.resources = resources;
        this.resourcesPerHour = resourcesPerHour;
        this.timestamp = Date.now();
        this.tainted = false;
    }

    getResources() {
        let now = Date.now();
        let resources = [];

        for (let resource of ['roheisen', 'kristall', 'frubin', 'orizin', 'frurozin', 'gold']) {
            resources.push(this.resources[resource] + this.resourcesPerHour[resource] * (now - this.timestamp) / 1000 / 60 / 60);
        }

        return resources;
    }
}

(function() {
    'use strict';

    setup();

    function setup() {
        unsafeWindow.resourceShadow = new Shadow(unsafeWindow);
        unsafeWindow.resourceShadow.addVariable('Energy');
        unsafeWindow.resourceShadow.addVariable('lvlRoheisen');
        unsafeWindow.resourceShadow.addVariable('lvlKristall');
        unsafeWindow.resourceShadow.addVariable('lvlFrubin');
        unsafeWindow.resourceShadow.addVariable('lvlOrizin');
        unsafeWindow.resourceShadow.addVariable('lvlFrurozin');
        unsafeWindow.resourceShadow.addVariable('lvlGold');
        unsafeWindow.resourceShadow.addVariable('lvlRoheisenLager');
        unsafeWindow.resourceShadow.addVariable('lvlKristallLager');
        unsafeWindow.resourceShadow.addVariable('lvlFrubinLager');
        unsafeWindow.resourceShadow.addVariable('lvlOrizinLager');
        unsafeWindow.resourceShadow.addVariable('lvlFrurozinLager');
        unsafeWindow.resourceShadow.addVariable('lvlGoldLager');
        unsafeWindow.resourceShadow.addVariable('Roheisen');
        unsafeWindow.resourceShadow.addVariable('Kristall');
        unsafeWindow.resourceShadow.addVariable('Frubin');
        unsafeWindow.resourceShadow.addVariable('Orizin');
        unsafeWindow.resourceShadow.addVariable('Frurozin');
        unsafeWindow.resourceShadow.addVariable('Gold');
        unsafeWindow.resourceShadow.addVariable('RoheisenLagerCapacity');
        unsafeWindow.resourceShadow.addVariable('KristallLagerCapacity');
        unsafeWindow.resourceShadow.addVariable('FrubinLagerCapacity');
        unsafeWindow.resourceShadow.addVariable('OrizinLagerCapacity');
        unsafeWindow.resourceShadow.addVariable('FrurozinLagerCapacity');
        unsafeWindow.resourceShadow.addVariable('GoldLagerCapacity');

        unsafeWindow.resourcesUpdateFunc = unsafeWindow.resources.onmessage;

        unsafeWindow.stopWorkerForResource();

        let resources = { 'roheisen': unsafeWindow.Roheisen, 'kristall': unsafeWindow.Kristall, 'frubin': unsafeWindow.Frubin, 'orizin': unsafeWindow.Orizin, 'frurozin': unsafeWindow.Frurozin, 'gold': unsafeWindow.Gold }

        let resourcesPerHour = unsafeWindow.getResourcePerHour()[0];
        unsafeWindow.resourceStore = new Resources(resources, resourcesPerHour);
        unsafeWindow.resourceShadow.update();



        GM_log(unsafeWindow);

        unsafeWindow.resourceUpdateTimer = setInterval(updateResources, 1000);
    }

    function updateResources() {
        if (unsafeWindow.resourceShadow.hasChanged()) {
            GM_log(Date.now() + ': Change detected');
            let resources = { 'roheisen': unsafeWindow.Roheisen, 'kristall': unsafeWindow.Kristall, 'frubin': unsafeWindow.Frubin, 'orizin': unsafeWindow.Orizin, 'frurozin': unsafeWindow.Frurozin, 'gold': unsafeWindow.Gold }

            let resourcesPerHour = unsafeWindow.getResourcePerHour()[0];
            unsafeWindow.resourceStore.setResources(resources, resourcesPerHour);
        }
        let r = unsafeWindow.resourceStore.getResources();
        unsafeWindow.resourcesUpdateFunc({data: r});

        unsafeWindow.resourceShadow.update();
    }


})();