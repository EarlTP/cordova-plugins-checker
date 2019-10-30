#!/usr/bin/env node

var fs = require("fs");
var path = require("path");
var xml2js = require("xml2js");
var semver = require("semver");
var consola = require("consola");

var parser = new xml2js.Parser({attrkey: "ATTR"});
var execSync = require("child_process").execSync;


function help() {
    var helpText = fs.readFileSync(path.resolve(__dirname, 'usage.txt'), 'utf-8');
    consola.info(helpText);
}

function start() {
    var xml_string = fs.readFileSync("config.xml", "utf8");

    var i, pluginsList = [], installedPlugins = {};
    var pluginLs = execSync("cordova plugin ls").toString().trim().split('\n');
    for (i = 0; i < pluginLs.length; i++) {
        if (pluginLs[i].length > 0) {
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
                var availableUpdateSpec = "";

                if (semver.valid(pluginSpec)) {
                    if (installed) {
                        toUpdate = !semver.satisfies(installedPlugins[pluginName], pluginSpec);
                    }
                    var registryVersion = getRegistryVersion(pluginName);
                    availableUpdateSpec = registryVersion.length > 0 && semver.satisfies(registryVersion, ">" + pluginSpec) ? registryVersion : "";
                } else {
                    var installedVersion = getInstalledVersion(pluginName);
                    if (installed) {
                        toUpdate = installedVersion !== pluginSpec;
                    }
                }

                pluginsList.push({
                    name: pluginName,
                    spec: pluginSpec,
                    variable: pluginVariable,
                    installed: installed,
                    toUpdate: toUpdate,
                    toUpdateSpec: toUpdate ? "" : pluginSpec,
                    availableUpdateSpec: availableUpdateSpec
                });
            }
        } else {
            consola.error(error);
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
        consola.success("Good! No plugin to install.");
    } else {
        consola.info("Plugins to install:");
        for (i = 0; i < toInstall.length; i++) {
            consola.info("- " + toInstall[i].name);
        }
    }

    if (toUpdate.length === 0) {
        consola.success("Good! No plugin to update.");
    } else {
        consola.warn("Plugins to update:");
        for (i = 0; i < toUpdate.length; i++) {
            consola.warn("- " + toUpdate[i].name);
        }
    }

    if (withAvailableUpdate.length > 0) {
        consola.info("Plugins with available update:");
        for (i = 0; i < withAvailableUpdate.length; i++) {
            consola.info("- " + withAvailableUpdate[i].name + " - required: " + withAvailableUpdate[i].spec + " - available: " + withAvailableUpdate[i].availableUpdateSpec);
        }
    }
}

function getRegistryVersion(pluginName) {
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

function getInstalledVersion(pluginName) {
    var v = "";
    try {
        var file = fs.readFileSync("./plugins/" + pluginName + "/package.json");
        var json = JSON.parse(file);
        if (json.hasOwnProperty("_spec")) {
            v = json._spec;
        }
        if (v.length === 0 && json.hasOwnProperty("_requested") && json._requested.hasOwnProperty("raw")) {
            v = json._requested.raw;
        }
    } catch (e) {

    }

    return v;
}

function run() {
    try {
        consola.info("Running cordova-plugins-checker...");

        var args = process.argv.slice(2);

        if (args["v"] || args["version"]) {
            return consola.info(require('./package.json').version);
        }

        if (args["h"] || args["help"]) {
            return help();
        }

        start();
    } catch (e) {
        consola.error(e);
    }
}

run();