/* eslint-env es6,node */
"use strict";

var fs = require("fs-extra");
const { Console } = require("console");

const console = new Console({ stdout: process.stdout, stderr: process.stderr });
console.log("Prepare UI5 Lab Browser: Copy ./test/libraries.json ==> ./node_modules/ui5lab-browser/dist/browser/libraries.json");

fs.copySync("./test/libraries.json", "./node_modules/ui5lab-browser/dist/libraries.json", {
	overwrite : true
});
