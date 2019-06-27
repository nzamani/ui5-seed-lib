sap.ui.define([
	"sap/ui/test/Opa5",
	"test/nabi/seed/lib/integration/arrangements/Arrangement",
	"test/nabi/seed/lib/integration/CustomerSelectionJourney"
], function (Opa5, Arrangement) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		viewNamespace: "test.nabi.seed.lib.sample.customerSelection.view",	// every waitFor will append this namespace in front of your viewName
		autoWait: true
	});
});
