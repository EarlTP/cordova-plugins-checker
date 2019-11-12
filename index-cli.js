#!/usr/bin/env node

var fs = require("fs");
var path = require("path");
var minimist = require("minimist");

var core = require("./core.js");

function help() {
    var helpText = fs.readFileSync(path.resolve(__dirname, "help.txt"), "utf-8");
    console.log(helpText);
}

var args = minimist(process.argv.slice(2));
var version = require('./package.json').version;

if (args["v"] || args["version"]) {
    return consola.info(version);
}

if (args["h"] || args["help"]) {
    return help();
}

if (args["au"] || args["available-updates"]) {
    core.checkAvailableUpdates = true;
}

core.run();