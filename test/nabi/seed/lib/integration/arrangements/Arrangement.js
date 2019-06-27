sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";

	function getFrameUrl(sHash, sUrlParameters) {
		sHash = sHash || "";
		var sUrl = sap.ui.require.toUrl("test/nabi/seed/lib/sample/customerSelection/index.html");

		if (sUrlParameters) {
			sUrlParameters = "?" + sUrlParameters;
		}

		return sUrl + sUrlParameters + "#" + sHash;
	}

	return Opa5.extend("test.nabi.seed.lib.integration.arrangements.Arrangement", {

		constructor: function (oConfig) {
			Opa5.apply(this, arguments);
			this._oConfig = oConfig;
		},

		iStartMyApp: function (oOptions) {
			oOptions = oOptions ? oOptions : {};
			// start the app UI component
			this.iStartMyUIComponent({
				componentConfig: {
					name: "test.nabi.seed.lib.sample.customerSelection",
					async: true
				},
				hash: oOptions.hash || ""
			});
		},

		/* succeeds in testsuite */
		theAppIsStartedInAFrame: function (oOptions) {
			var sUrlParameters;
			oOptions = oOptions || { delay: 0 };

			sUrlParameters = "serverDelay=" + oOptions.delay;

			this.iStartMyAppInAFrame(getFrameUrl(oOptions.hash, sUrlParameters));
		}

	});
});
