var checkCordovaPlugins = require("cordova-plugins-checker");

module.exports = function (ctx) {
    /*
     * For old cordova versions use:
     * var qModule = ctx.requireCordovaModule('q');
     */
    var qModule = require('q');
    var deferral = qModule.defer();

    var cmdParts = ctx.cmdLine.split(' ');
    var isPrepare = false;
    var cordovaPath = false;

    for (var i = 0; i < cmdParts.length; i++) {
        if (cordovaPath) {
            if (cmdParts[i] === "prepare") {
                isPrepare = true;
            }
            break;
        }

        var cmdPartLength = cmdParts[i].length;
        if (cmdParts[i].lastIndexOf('cordova') === (cmdPartLength - 'cordova'.length)) {
            cordovaPath = true;
        }
    }

    if (!isPrepare) {
        console.log('################ not in prepare fase, skip project check ################');
        deferral.resolve();
        return deferral.promise;
    }

    console.log("-> project check");
    return checkCordovaPlugins.check()
        .then(function () {
            console.log("-> project check end");
        });
};
