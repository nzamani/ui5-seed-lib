sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/I18NText",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/matchers/AggregationFilled",
], function (Opa5, AggregationLengthEquals, I18NText, BindingPath, Press, EnterText, AggregationFilled) {
	"use strict";

	var sViewName = "Home";

	Opa5.createPageObjects({
		onTheHomePage: {
			actions: {

				iPressOnTheButtonWithId: function (sId) {
					return this.waitFor({
						id: sId,
						//controlType: "sap.m.Button",
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "Button '" + sId + "' not found on Home page"
					});
				}

			},

			assertions: {

				iShouldSeeAListOfCustomersInADialog: function (sExpectedMessage) {
					return this.waitFor({
						matchers: new AggregationFilled({name : "items"}),
						controlType: "sap.m.TableSelectDialog",
						success: function (aTSDialogs) {
							var oTSDialog, bHasItems;

							oTSDialog = aTSDialogs[0];
							bHasItems = oTSDialog.getItems().length > 0;

							Opa5.assert.strictEqual(bHasItems, true);
						},
						errorMessage: "No customers displayed"
					});
				}

			}

		}
	});

});
