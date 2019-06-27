/*global QUnit */
sap.ui.require([
	"nabi/seed/lib/comp/reuse/northwind/customer/selectionBtn/Component",
	//do not add to parameter list:
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(CustomerSelectionButton) {
	"use strict";

	QUnit.module("nabi.seed.lib.comp.reuse.northwind.customer.selectionBtn");

	QUnit.test("Should always be successful - dummy QUnit test", function (assert) {
		assert.strictEqual(true, true);
	});

});
