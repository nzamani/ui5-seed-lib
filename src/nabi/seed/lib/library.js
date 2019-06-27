/*!
 * ${copyright}
 */

/**
 * Initialization code and shared classes of library nabi.seed.lib
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/library"
], function(jQuery, library) {
	"use strict";

	// delegate initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "nabi.seed.lib",
		dependencies : ["sap.ui.core", "sap.m" , "sap.ui.unified"],
		types: [],
		interfaces: [],
		controls: [
			"nabi.seed.lib.ProductRating"
		],
		elements: [],
		noLibraryCSS: true,
		version: "${version}"
	});

	/* eslint-disable no-undef */
	/**
	 * A demo ui5 library template.
	 *
	 * @namespace
	 * @alias nabi.seed.lib
	 * @author Nabi Zamani, nabisoft GmbH
	 * @version "0.4.0"
	 * @public
	 */
	var thisLib = nabi.seed.lib;
	/* eslint-enable no-undef */

	// now you could use thisLib as a shortcut, i.e. to create enums...
	//...

	return thisLib;

});
