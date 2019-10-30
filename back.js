var execSync = require('child_process').execSync;

gulp.task("check-plugins", function () {
    const xml2js = require('xml2js');
    const fs = require('fs');
    const parser = new xml2js.Parser({ attrkey: "ATTR" });
    var semver = require('semver');
    var execSync = require('child_process').execSync;
    var xml_string = fs.readFileSync("config.xml", "utf8");

    var i, pluginsList = [], installedPlugins = {};
    var pluginLs = execSync("cordova plugin ls").toString().trim().split('\n');
    for (i = 0; i < pluginLs.length; i++) {
        if(pluginLs[i].length > 0) {
            var row = pluginLs[i].split(" ");
            installedPlugins[row[0]] = row[1];
        }
    }

    parser.parseString(xml_string, function (error, result) {
        if (error === null) {
            var pluginsXmlList = result.widget.plugin;
            for (i = 0; i < pluginsXmlList.length; i++) {
                var pluginName = pluginsXmlList[i].ATTR.name;
                var pluginSpec = pluginsXmlList[i].ATTR.spec;
                var pluginVariable = pluginsXmlList[i].variable || [];
                var installed = installedPlugins.hasOwnProperty(pluginName);
                var toUpdate = false;
                var toUpdateSpec = "";
                var availableUpdateSpec = "";

                if (semver.valid(pluginSpec)) {
                    if (installed) {
                        toUpdate = !semver.satisfies(installedPlugins[pluginName], pluginSpec);
                        toUpdateSpec = pluginSpec;
                    }
                    var registryVersion = checkRegistryVersion(pluginName);
                    availableUpdateSpec = registryVersion.length > 0 && semver.satisfies(registryVersion, ">" + pluginSpec) ? registryVersion : "";
                } else {

                }

                pluginsList.push({
                    name: pluginName,
                    spec: pluginSpec,
                    variable: pluginVariable,
                    installed: installed,
                    toUpdate: toUpdate,
                    toUpdateSpec: toUpdateSpec,
                    availableUpdateSpec: availableUpdateSpec
                });
            }
        } else {
            console.log(error);
        }
    });

    var toInstall = [], toUpdate = [], withAvailableUpdate = [];
    for (i = 0; i < pluginsList.length; i++) {
        if (pluginsList[i].installed) {
            if (pluginsList[i].toUpdate) {
                toUpdate.push(pluginsList[i]);
            }
            if (pluginsList[i].availableUpdateSpec.length > 0) {
                withAvailableUpdate.push(pluginsList[i]);
            }
        } else {
            toInstall.push(pluginsList[i]);
        }
    }

    if (toInstall.length === 0) {
        console.log("Good! No plugin to install.");
    } else {
        console.log("Plugins to install:");
        for (i = 0; i < toInstall.length; i++) {
            console.log("- " + toInstall[i].name);
        }
    }

    if (toUpdate.length === 0) {
        console.log("Good! No plugin to update.");
    } else {
        console.log("Plugins to update:");
        for (i = 0; i < toUpdate.length; i++) {
            console.log("- " + toUpdate[i].name);
        }
    }

    if (withAvailableUpdate.length > 0) {
        console.log("Plugins to with available update:");
        for (i = 0; i < withAvailableUpdate.length; i++) {
            console.log("- " + withAvailableUpdate[i].name + " - required: " + withAvailableUpdate[i].spec + " - available: " + withAvailableUpdate[i].availableUpdateSpec);
        }
    }
});

function checkRegistryVersion(pluginName) {
    var v = "";
    try {
        v = execSync("npm view " + pluginName + " version").toString().trim();
        if (!semver.valid(v)) {
            v = "";
        }
    } catch (e) {

    }

    return v;
}