#!/usr/bin/env node

var deferred = require("deferred");

var core = require("./core.js");

module.exports = {
    check: function () {
        var def = deferred();

        function runAsPromise() {
            core.run();
            def.resolve();
        }

        runAsPromise();

        return def.promise;
    }
};