"use strict";

/* eslint-env es6,node */
module.exports = function (grunt) {

	// Log time how long tasks take
	require("grunt-timer").init(grunt, { deferLogs: true, friendlyTime: true, color: "cyan"});

	const nabiProject = require("./.nabi/lib/nabiProject");

	const CONFIG = nabiProject.readConfig();
	//grunt.log.writeln("\n### nabi config sapdeploy ###\n" + JSON.stringify(CONFIG.sapDeploy, null, 2));
	//grunt.log.writeln("\n### nabi config ###\n" + JSON.stringify(CONFIG, null, 2));

	// read ui5 app descriptor (manifest.json) => this file must exist!!!
	const ui5Descriptor = grunt.file.readJSON("./src/nabi/seed/lib/manifest.json");

	// get the namespace from ui5 descriptor
	const myNamespaceDot = ui5Descriptor["sap.app"].id;
	// i.e. converts "nabi.seed.lib" from ui5 descriptor to "nabi/seed/lib"
	//const myNamespaceSlash = myNamespaceDot.replace(new RegExp('\\.', 'g'), "/");
	const myNamespaceSlash = myNamespaceDot.replace(/\./g, "/");

	//const process = require("process");
	// npm i -D puppeteer
	//process.env.CHROME_BIN = require("puppeteer").executablePath();

	// Project configuration.
	grunt.initConfig({

		//pkg: grunt.file.readJSON("package.json"),

		dir: {
			src: "src",
			test: "test",
			dist: "dist",
			build: "build",
			jsdoc: "jsdoc",
			buildReportsCoverage: "build/reports/coverage",
			buildBabel: "build/babel",
			nodeModules: "node_modules",
			//srcLib: "src/" + myNamespaceSlash,
			testWebapp: `test/${myNamespaceSlash}/sample`,
			distResources: "dist/resources",
			distResourcesManifestRoot: "dist/resources/" + myNamespaceSlash,
			distTestResources: "dist/test-resources"
		},

		nabiUi5Manifest : {
			dist : {
				src: `<%= dir.distResources %>/${myNamespaceSlash}/manifest.json`
			}
		},

		karma: {
			options: {
				browsers: ["Chrome"], //or use ChromeHeadless
				basePath: ".",
				files: [
					{ pattern: `src/${myNamespaceSlash}/**`, 				included: false, served: true, watched: true },
					{ pattern: `test/${myNamespaceSlash}/unit/**`,			included: false, served: true, watched: true },
					{ pattern: `test/${myNamespaceSlash}/integration/**`,	included: false, served: true, watched: true },
					{ pattern: `test/${myNamespaceSlash}/sample/**/*`,		included: false, served: true, watched: true }
				],
				proxies : {
					//"/base/src/nabi/seed/lib/thirdparty/" : "http://localhost:8080/resources/nabi/seed/lib/thirdparty/",
					[`/base/src/${myNamespaceSlash}/thirdparty/`] : `http://localhost:8080/resources/${myNamespaceSlash}/thirdparty/`,
					//these two are needed for OPA + StartMyAppInFrame
					"/resources/" : "http://localhost:8080/resources/",
					"/sapui5/resources/" : "http://localhost:8080/sapui5/resources/"
				},
				frameworks: ["qunit", "openui5"],
				openui5: {
					path: !CONFIG.nabi.sapui5.required ? "http://localhost:8080/resources/sap-ui-core.js" : "http://localhost:8080/sapui5/resources/sap-ui-core.js",
					useMockServer: false
				},
				//clearContext: true,
				//useIframe: false,
				//captureConsole: true,
				//captureTimeout: 210000,
				//browserDisconnectTolerance: 3,
				//browserDisconnectTimeout : 40000,
				//browserNoActivityTimeout : 210000,
				client: {
					openui5: {
						config: {
							theme: "sap_belize",
							//libs: "nabi.seed.lib",
							//bindingSyntax: "complex",
							compatVersion: "edge",
							animation: "false",
							//frameOptions: "deny",	// this would make the QUnit results in browser "not clickable" etc.
							preload: "async",
							resourceRoots: {
								[myNamespaceDot]: `./base/src/${myNamespaceSlash}/`,
								//["test." + myNamespaceDot]: `./base/test/${myNamespaceSlash}/`,
								["test." + myNamespaceDot]: `http://localhost:8080/test-resources/${myNamespaceSlash}/`	//we could move this up to proxies as well
								//DEPENDENCIES, i.e.
								//"my.required.comp": "http://localhost:8080/test-resources/my.required.comp/src/main/webapp",
								// NEVER DO THIS because it would lead to "non-instrumentalized" sources (i.e. coverage not detected):
								//"nabi.seed.lib": "http://localhost:8080/..."
							}
						},
						tests: [
							`test/${myNamespaceSlash}/unit/allTests`,
							`test/${myNamespaceSlash}/integration/AllJourneys`		// remove this in case it takes too long, i.e. tdd/dev time
						]
					}
				},
				reporters: ["progress"],
				port: 9876,
				logLevel: "INFO",
				browserConsoleLogOptions: {
					level: "info" // "warn"
				}
			},
			ci: {
				singleRun: true,
				browsers: ["ChromeHeadless"],
				preprocessors: {
					// src files for which we want to get coverage.
					// Exclude thirdparty libs, irrelevant folders (i.e. themes, test), and maybe also library.js and UI5 Renderers (your decision).
					//"{src/nabi/seed/lib,src/nabi/seed/lib/**/!(thirdparty|themes|test)}/!(library|*Renderer)*.js": ["coverage"]
					[`{src/${myNamespaceSlash},src/${myNamespaceSlash}/**/!(thirdparty|themes|test)}/!(library|*Renderer)*.js`]: ["coverage"]
				},
				coverageReporter: {
					includeAllSources: true,
					dir: "<%= dir.buildReportsCoverage %>",
					reporters: [
						{ type: "html", subdir: "report-html"},
						{ type: "cobertura", subdir: "." },	//jenkins
						{ type: "text"}
					],
					check: {
						each: {
							statements: 30,
							branches: 30,
							functions: 30,
							lines: 30
						}
					}
				},
				reporters: ["progress", "coverage"]
			},
			watch: {
				client: {
					clearContext: false,
					qunit: {
						showUI: true
					}
				}
			},
			coverage: {		//same as ci, but  without the checks
				singleRun: true,
				//captureTimeout: 210000,
				//browserDisconnectTolerance: 3,
				//browserDisconnectTimeout : 210000,
				//browserNoActivityTimeout : 210000,
				browsers: ["ChromeHeadless"],
				/*
				browsers: ["MyChromeHeadless"],
				customLaunchers: {
					MyChromeHeadless: {
						base: "ChromeHeadless",
						flags: [
							"--no-sandbox",
							"--disable-web-security",
							"--no-default-browser-check",
							"--disable-translate",
							"--disable-background-timer-throttling",
							//"--disable-device-discovery-notifications",
							//"--disable-renderer-backgrounding",
							//"--remote-debugging-port=1234",
							//"--enable-logging",
							//"--disable-popup-blocking",
							//"--disable-gpu",
							//"--no-first-run",
						]
					}
				},*/
				preprocessors: {
					// src files for which we want to get coverage.
					// Exclude thirdparty libs, irrelevant folders (i.e. themes, test), and maybe also library.js and UI5 Renderers (your decision).
					//"{src/nabi/seed/lib,src/nabi/seed/lib/**/!(thirdparty|themes|test)}/!(library|*Renderer)*.js": ["coverage"]
					[`{src/${myNamespaceSlash},src/${myNamespaceSlash}/**/!(thirdparty|themes|test)}/!(library|*Renderer)*.js`]: ["coverage"]
				},
				coverageReporter: {
					includeAllSources: true,
					dir: "<%= dir.buildReportsCoverage %>",
					reporters: [
						{ type: "html", subdir: "report-html"},
						{ type: "cobertura", subdir: "." },	//jenkins
						{ type: "text"}
					],
				},
				reporters: ["progress", "coverage"]
			}
		},

		babel : {
			options : {
				// see .babelrc
			},
			dist : {
				files : [{
					expand: true,
					cwd: "<%= dir.distResources %>",
					src: [
						"**/*.js",
						`!${myNamespaceSlash}/themes/**`,
						`!${myNamespaceSlash}/thirdparty/**`,
						`!${myNamespaceSlash}/**/*-dbg.js`,
						`!${myNamespaceSlash}/**/*-dbg.controller.js`
					],
					dest: "<%= dir.distResources %>/"	//trailing slash is important
				}]
			},
			srcToBuildBabel : {
				files : [{
					expand: true,
					cwd: "<%= dir.src %>",
					src: [
						"**/*.js",
						`!${myNamespaceSlash}/themes/**`,
						`!${myNamespaceSlash}/thirdparty/**`
					],
					dest: "<%= dir.buildBabel %>/"		//trailing slash is important
				}]
			}
		},

		concurrent: {
			options: {
				logConcurrentOutput: true
			},
			serveSrcBabel: {
				tasks: ["watch:babel", "serve:srcWithBabel"]
			},
			serveSrcEdge : {
				tasks: ["watch:babel", "serve:srcWithBabel", "karma:watch"]		//TODO do we need the last one?
			}
		},

		watch: {
			babel: {
				//cwd: "<%= dir.src %>",	//this seems not to work with the next LoC as expected
				//files: ["**/*.js", "!nabi/seed/lib/themes/**", "!nabi/seed/lib/thirdparty/**"],
				files: ["<%= dir.src %>/**/*.js", `!<%= dir.src %>/${myNamespaceSlash}/themes/**`, `!<%= dir.src %>/${myNamespaceSlash}/thirdparty/**`],
				tasks: ["clean:buildBabel", "babel:srcToBuildBabel"],
				options: {
					interrupt: true
				}
			}
		},

		connect: {
			options: {
				port: 8080,
				hostname: "*"
			},
			src: {},
			srcWithBabel: {},
			dist: {}
		},

		//openui5: { },

		openui5_connect: {
			options: {
				cors: {
					origin: "http://localhost:<%= karma.options.port %>"
				},
				proxypath : "northwind",
				/*
				appresources : [
					CONFIG.nabi.app.appresources.symlinkParent,
					CONFIG.nabi.sapui5.sdk
				].concat( CONFIG.nabi.app.appresources.dirs ),	//append non-symlink items
				*/
				appresources : [
					CONFIG.nabi.sapui5.sdk
				],
				testresources : [
					"<%= dir.test %>",
					CONFIG.nabi.app.testresources.symlinkParent
				].concat( CONFIG.nabi.app.testresources.dirs )	//append non-symlink items
			},
			src: {
				options: {
					resources: CONFIG.nabi.app.resources.concat(
						CONFIG.nabi.app.appresources.dirs,
						[
							CONFIG.nabi.app.appresources.symlinkParent,
							"<%= dir.src %>"
						]
					)
				}
			},
			srcWithBabel: {
				options: {
					resources: CONFIG.nabi.app.resources.concat(
						CONFIG.nabi.app.appresources.dirs,
						[
							CONFIG.nabi.app.appresources.symlinkParent,
							// the order of these two is important because contents from buildBabel shall be preferred over src
							"<%= dir.buildBabel %>",
							"<%= dir.src %>"
						]
					)
				}
			},
			dist: {
				options: {
					resources: CONFIG.nabi.app.resources.concat( ["<%= dir.distResources %>"] ),
					testresources: [
						"<%= dir.distTestResources %>",
						CONFIG.nabi.app.testresources.symlinkParent
					].concat( CONFIG.nabi.app.testresources.dirs )	//append non-symlink items
				}
			}
		},

		openui5_theme: {
			theme: {
				files: [
					{
						expand: true,
						cwd: "<%= dir.src %>",
						src: "**/themes/*/library.source.less",
						dest: "<%= dir.dist %>/resources"
					}
				],
				options: {
					rootPaths: [
						"<%= dir.nodeModules %>/@openui5/sap.ui.core/src",
						"<%= dir.nodeModules %>/@openui5/themelib_sap_belize/src",
						"<%= dir.src %>"
					],
					library: {
						name: myNamespaceDot
					}
				}
			}
		},

		openui5_preload: {
			component : {
				options : {
					compatVersion : '1.60',
					resources: '<%= dir.src %>',
					dest: '<%= dir.distResources %>',
					// insead of the 2 previous lines we could use the following
					// (would even include the manifest,json in Component-preload.js file):
					// resources : {
					// 	cwd : 'src/nabi/seed/lib/comp',
					// 	prefix : 'nabi/seed/lib/comp',
					// 	src : [
					// 		"**/*.js",
					// 		"**/*.fragment.html",
					// 		"**/*.fragment.json",
					// 		"**/*.fragment.xml",
					// 		"**/*.view.html",
					// 		"**/*.view.json",
					// 		"**/*.view.xml",
					// 		"**/*.properties",
					// 		"**/manifest.json"
					// 	]
					// }
				},
				components : true
			},
			library: {
				options: {
					resources: "<%= dir.distResources %>",
					dest: "<%= dir.distResources %>",
					compatVersion : "1.60"
				},
				libraries: {
					[myNamespaceSlash]: {
						src : [
							`${myNamespaceSlash}/**`,
							`!${myNamespaceSlash}/thirdparty/**`,
							`!${myNamespaceSlash}/**/*-dbg.js`,
							`!${myNamespaceSlash}/**/*-dbg.controller.js`
						]
					}
				}
			}
		},
		clean : {
			dist: ["<%= dir.dist %>/"],
			build: ["<%= dir.build %>/"],
			buildBabel: ["<%= dir.buildBabel %>/"],
			coverage: "<%= dir.buildReportsCoverage %>",
			jsdoc: ["<%= dir.jsdoc %>"]
		},

		copy: {
			appResourcesToDist: { //from .nabi.json / .user.nabi.json
				files: CONFIG.nabi.app.appresources.symlinks.reduce((a,v) => {
					var sTarget = v.name;
					if (v.target){
						sTarget = `${v.target}/${sTarget}`;
					}
					a.push({
						expand: true,
						src: ["**"],
						cwd: `${v.path}`,
						dest: `<%= dir.distResources %>/${myNamespaceSlash}/${sTarget}/`,
					});
					return a;

				}, [] ).concat( CONFIG.nabi.app.appresources.dirs.map(v => {
					return {
						expand: true,
						src: ["**"],
						cwd: `${v}`,
						dest: `<%= dir.distResources %>/${myNamespaceSlash}/`
					};
				}) )
			},

			srcToDist: {
				files: [
					{	// first all resources incl. themes, thirdparty and even less files (won't harm)
						expand: true,
						src: [ "**", `${myNamespaceSlash}/.library` ],
						cwd: "<%= dir.src %>",
						dest: "<%= dir.distResources %>/",		//trailing slash is important
					}, {
						//finally the test resources
						expand: true,
						cwd: "<%= dir.test %>",
						src: ["**"],
						dest: "<%= dir.distTestResources %>"
					}

				]
			},
			srcToDistDbg : {
				files : [
					{	// rename ui5 js files to *-dbg.js / *-dbg.controller.js
						expand: true,
						src: ["**/*.js", `!${myNamespaceSlash}/themes/**`, `!${myNamespaceSlash}/thirdparty/**`],
						cwd: "<%= dir.src %>",
						dest: "<%= dir.distResources %>/",		//trailing slash is important
						rename: nabiProject.fileRename
					}

				]
			},
			distToDistDbg : {
				files : [
					{	// rename ui5 js files to *-dbg.js / *-dbg.controller.js
						expand: true,
						cwd: "<%= dir.distResources %>",
						src: ["**/*.js", `!${myNamespaceSlash}/themes/**`, `!${myNamespaceSlash}/thirdparty/**`],
						dest: "<%= dir.distResources %>/",		//trailing slash is important
						rename: nabiProject.fileRename
					}
				]
			}

		},

		jsdoc : {
			dist : {
				src : ["src/**/*.js", "README.md", `!${myNamespaceSlash}/themes/**`, `!${myNamespaceSlash}/thirdparty/**`],
				options : {
					destination : "<%= dir.jsdoc %>",
					template : "node_modules/ink-docstrap/template",
					configure : "node_modules/ink-docstrap/template/jsdoc.conf.json"
				}
			}
		},

		eslint: {
			options : {										// see http://eslint.org/docs/developer-guide/nodejs-api#cliengine
				useEslintrc: true, 							// default ==> use .eslintrc file, rulse: http://eslint.org/docs/rules/
				ignore : true,								// default ==> use .eslintignore file
				quiet : true								// only report errors
				//outputFile : "log/eslint.log"				// save result to file
				//format: require("eslint-tap")
			},
			//cwd: "",
			src: ["<%= dir.src %>"],
			test: ["<%= dir.test %>"],
			gruntfile: ["Gruntfile.js"]
		},

		compress: {
			dist : {
				options: {
					archive: `<%= dir.dist %>/${myNamespaceDot.replace(/\./g, "-")}.zip`	//i.e. nabi.seed.lib ==> nabi-seed-lib.zip
				},
				expand: true,
				cwd: `<%= dir.dist %>/resources/${myNamespaceSlash}`,
				src: ["**/*"],
				dot : true,
				dest: "/"
			}
		},

		nwabap_ui5uploader: CONFIG.sapDeploy

	});	//END grunt.initConfig

	//grunt.log.writeln("\n### grunt.config() ###\n" + JSON.stringify(grunt.config(), null, "\t"));

	// plugins
	grunt.loadNpmTasks("grunt-babel");
	grunt.loadNpmTasks("grunt-jsdoc");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-compress");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-openui5");
	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-concurrent");
	grunt.loadNpmTasks("grunt-karma");
	grunt.loadNpmTasks("grunt-nwabap-ui5uploader");
	grunt.task.loadTasks(".nabi/grunt-tasks");

	// Server task
	grunt.registerTask("serve", function(target) {
		grunt.task.run("openui5_connect:" + (target || "src") + ":keepalive");
	});
	grunt.registerTask("serve:tdd", ["clean:coverage", "openui5_connect:src", "karma:watch"]);
	grunt.registerTask("serve:babel", ["clean:buildBabel", "babel:srcToBuildBabel", "concurrent:serveSrcBabel"]);
	grunt.registerTask("serve:edge", ["clean:coverage", "clean:buildBabel", "babel:srcToBuildBabel", "concurrent:serveSrcEdge"]);
	grunt.registerTask("serve:srcBabel", ["clean:buildBabel", "babel:srcToBuildBabel", "serve:srcWithBabel"]);
	grunt.registerTask("serve:distBabel", ["build:babel","serve:dist"]);

	// Default: linting + run directly without build
	//grunt.registerTask("default", ["eslint:src", "serve:src"]);

	// Default task
	grunt.registerTask("default", ["lint","build","serve:dist"]);

	// Test tasks
	grunt.registerTask("test", ["clean:coverage", "openui5_connect:src", "karma:coverage"]);
	grunt.registerTask("test:ci",["clean:coverage", "openui5_connect:src", "karma:ci"]);

	// Linting tasks
	grunt.registerTask("lint", ["eslint"]);

	// Build tasks - create distribution ready for abap upload (includes nabi-seed-lib.zip, no index.html...)
	grunt.registerTask("build", ["clean:dist", "openui5_theme", "copy:srcToDist", "nabiUi5Manifest:dist", "copy:srcToDistDbg", "openui5_preload", "copy:appResourcesToDist", "compress:dist"]);
	grunt.registerTask("build:babel", ["clean:dist", "openui5_theme", "copy:srcToDist", "nabiUi5Manifest:dist", "babel:dist", "copy:distToDistDbg", "openui5_preload", "copy:appResourcesToDist", "compress:dist"]);

	// SAP deployments
	grunt.registerTask("sapdeploy", ["lint", "build", "nwabap_ui5uploader"]);
	grunt.registerTask("sapdeploy:babel", ["lint", "build:babel", "nwabap_ui5uploader"]);

	// Disabled because usually not needed - also, need to check if this still works after years of change...
	// build a distribution for dev purposes (includes index.html)
	//grunt.registerTask("build-dev", ["clean:dist", "eslint:src", "openui5_preload:distdev", "copy:distdev", "copy:appResourcesToDist"]);

};