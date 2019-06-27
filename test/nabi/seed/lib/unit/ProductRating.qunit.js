/*global QUnit */
sap.ui.require([
	"nabi/seed/lib/ProductRating",
	//do not add to parameter list:
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(ProductRating) {
	"use strict";

	QUnit.module("nabi.seed.lib.ProductRating");

	QUnit.test("Should always be successful - dummy QUnit test", function (assert) {
		assert.strictEqual(true, true);
	});
});
