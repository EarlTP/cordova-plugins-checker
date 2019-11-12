# cordova-plugins-checker
# ![npm](https://img.shields.io/npm/v/cordova-plugins-checker?style=plastic) ![npm](https://img.shields.io/npm/dt/cordova-plugins-checker?style=plastic)

Checks the plugins' version specified in the config.xml file with the current installed ones.

From CLI use `cordova-plugins-checker` to start the check

With the `--available-updates` option, for those has a registry version it will check also if there is an available update.

In code use the function `check` to start the check.

This plugin can be used in a cordova hook (see an example in the hook folder) or in a gulp task.
