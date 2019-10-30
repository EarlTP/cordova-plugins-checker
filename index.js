var fs = require('fs');
var xml2js = require('xml2js');
var semver = require('semver');

var parser = new xml2js.Parser({ attrkey: "ATTR" });
var execSync = require('child_process').execSync;

var xml_string = fs.readFileSync("config.xml", "utf8");