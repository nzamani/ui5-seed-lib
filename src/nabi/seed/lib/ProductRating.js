sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/RatingIndicator",
	"sap/m/Label",
	"sap/m/Button",
	"sap/ui/core/InvisibleText"
], function (Control, RatingIndicator, Label, Button, InvisibleText) {
	"use strict";

	return Control.extend("nabi.seed.lib.ProductRating", {

		metadata: {
			properties: {
				value: {type: "float", defaultValue: 0}
			},
			aggregations: {
				_rating: {type: "sap.m.RatingIndicator", multiple: false, visibility: "hidden"},
				_label: {type: "sap.m.Label", multiple: false, visibility: "hidden"},
				_button: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
			},
			events: {
				change: {
					parameters: {
						value: {type: "int"}
					}
				}
			}
		},

		init : function (){
			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("nabi.seed.lib");

			this.setAggregation("_rating", new RatingIndicator({
				value: this.getValue(),
				iconSize: "2rem",
				visualMode: "Half",
				liveChange: this._onRate.bind(this)
			}));

			this._labelTextKey = "productRatingLabelInitial";
			this.setAggregation("_label", new Label({
				text: this._oResourceBundle.getText(this._labelTextKey)
			}).addStyleClass("sapUiSmallMargin"));

			this.setAggregation("_button", new Button({
				text: this._oResourceBundle.getText("productRatingButton"),
				press: this._onSubmit.bind(this)
			}).addStyleClass("sapUiTinyMarginTopBottom"));
		},

		exit : function () {
			this._oResourceBundle = null;
			this._labelTextKey = null;
		},

		setValue : function (fValue) {
			this.setProperty("value", fValue, true);
			this.getAggregation("_rating").setValue(fValue);
		},

		reset : function () {
			this.setValue(0);
			this.getAggregation("_label").setDesign("Standard");
			this.getAggregation("_rating").setEnabled(true);
			this.getAggregation("_label").setText(this._oResourceBundle.getText("productRatingLabelInitial"));
			this.getAggregation("_button").setEnabled(true);
		},

		/**
		 * Illustrates how to write controls that react on changed localization at runtime.
		 * For details see https://stackoverflow.com/questions/41039588/language-switch-in-sapui5/41070360
		 *
		 * We're useing this._labelTextKey to buffer the current text state for the label in order set the correct
		 * text when the localization has changed. Another option would be to put the ResourceBundle into a local
		 * i18n model (inside control or library) and then use databinding for the texts.
		 *
		 * @param {sap.ui.base.Even} oEvent an event containing a map of the changed localization properties (among other changes)
		 */
		onlocalizationChanged : function(oEvent) {
			var oChanges = oEvent.changes;		//this doesn't work here: oEvent.getParameter("changes");
			if (oChanges && oChanges.language){
				this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("nabi.seed.lib", oChanges.language);
				// update the texts here manually one by one (i.e. because rerender() is too expensive or can't be used)
				this.getAggregation("_button").setText(this._oResourceBundle.getText("productRatingButton"));
				this.getAggregation("_label").setText(this._oResourceBundle.getText(this._labelTextKey));
			}
		},

		_onRate : function (oEvent) {
			var fValue, oLabel;

			fValue = oEvent.getParameter("value");
			this.setValue(fValue);

			this._labelTextKey = "productRatingLabelIndicator";
			oLabel = this.getAggregation("_label");
			oLabel.setText(this._oResourceBundle.getText(this._labelTextKey, [fValue, oEvent.getSource().getMaxValue()]));
			oLabel.setDesign("Bold");

		},

		_onSubmit : function (oEvent) {
			this._labelTextKey = "productRatingLabelFinal";
			this.getAggregation("_rating").setEnabled(false);
			this.getAggregation("_label").setText(this._oResourceBundle.getText(this._labelTextKey));
			this.getAggregation("_button").setEnabled(false);
			this.fireEvent("change", {
				value: this.getValue()
			});

		},

		renderer : function (oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("nabiSeedLibProductRating");
			oRM.writeClasses();
			oRM.write(">");
			oRM.renderControl(oControl.getAggregation("_rating"));
			oRM.renderControl(oControl.getAggregation("_label"));
			oRM.renderControl(oControl.getAggregation("_button"));
			oRM.write("</div>");
		}

	});
});
