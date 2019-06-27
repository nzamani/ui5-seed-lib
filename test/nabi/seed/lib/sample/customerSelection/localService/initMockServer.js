sap.ui.define([
	"./mockserver"
], function (mockserver) {
	"use strict";

	// start
	mockserver.init();

	// initialize the embedded component on the HTML page
	sap.ui.require(["sap/ui/core/ComponentSupport"]);

});
