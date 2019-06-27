/*global QUnit */
sap.ui.require([
	"nabi/seed/lib/comp/reuse/northwind/customer/selection/Component",
	//do not add to parameter list:
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(CustomerSelection, CustomerSelectionButton) {
	"use strict";

	QUnit.module("nabi.seed.lib.comp.reuse.northwind.customer.selection");

	QUnit.test("Should always be successful - dummy QUnit test", function (assert) {
		assert.strictEqual(true, true);
	});

});
