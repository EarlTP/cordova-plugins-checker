# cordova-plugins-checker
Cordova Plugins Checker

Checks the plugins' version specified in the config.xml file with the current installed ones.

From CLI use `cordova-plugins-checker -r` to start the check

With the `--available-updates` option, for those has a registry version it will check also if there is an available update.

In code use the function `check` to start the check.

This plugin can be used in a cordova hook (see an example in the hook folder) or in a gulp task.