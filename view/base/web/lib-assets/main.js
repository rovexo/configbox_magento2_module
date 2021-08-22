/* global require, cbrequire, requirejs, define, console: false */

(function (window, document, require) {

	'use strict';

	// ConfigboxViewHelper::addAmdLoader() about more details on how we deal with requireJS.

	// Prepare the app config object (see info below)
	var appConfig = {};

	// On the requireJS script tag we made a data attribute with settings from the server
	// This serves as the 'gateway' for passing server data without using a separate xhr call
	if (document.getElementById('cb-require-tag')) {
		appConfig = JSON.parse(document.getElementById('cb-require-tag').dataset.appConfig);
	}
	// In case other software already loaded requirejs, CB does not load requireJS again. In this case
	// a <script> tag gets added for the main.js file and the same JSON data. The following fetches the appConfig data.
	else {
		if(document.getElementById('cb-main-file-tag')) {
			appConfig = JSON.parse(document.getElementById('cb-main-file-tag').dataset.appConfig);
		}
	}

	// Prepare the configuration object for requireJS
	var configuration = {

		// Context makes sure we don't clash too much with other software using requireJS
		context: 'CB',

		baseUrl: appConfig.urlSystemAssets,

		// For cache busting
		urlArgs: (appConfig.useAssetsCacheBuster === true) ? 'version=' + appConfig.cacheVar : null,

		// We spell out all paths
		paths: {
			// Mind this is a directory
			'configbox':					'javascript',
			// So is this
			'configbox/custom': 			appConfig.urlCustomAssets + '/javascript',
			'kenedo':						'kenedo/assets/javascript/kenedo',
			'configbox/customerform':		'javascript/customerform',
			'configbox/server':				'javascript/server',
			'configbox/configurator': 		'javascript/configurator',
			'configbox/productlisting': 	'javascript/productlisting',
			'configbox/user': 				'javascript/user',
			'configbox/questions': 			'javascript/questions',
			'configbox/admin': 				'javascript/admin',
			'configbox/ruleEditor': 		'javascript/rule-editor',
			'configbox/calcEditor': 		'javascript/calc-editor',
			// Watch out with jQuery - we changed the JS file a bit. We changed the define call to make it register unnamed
			// Also, we made it not write itself in the global scope (see comments with 'rovexo')
			'cbj': 							'kenedo/external/jquery-3.4.1/jquery',
			// All the plugins got wrapped in a define requiring cbj, jqueryUI's define call was changed to require cbj
			'cbj.ui': 						'kenedo/external/jquery.ui-1.12.1/jquery-ui',
			'cbj.bootstrap': 				'kenedo/external/bootstrap-4.6.0/js/bootstrap.bundle',
			'cbj.chosen': 					'kenedo/external/jquery.chosen-1.8.7/chosen.jquery',
			'cbj.colorbox': 				'kenedo/external/jquery.colorbox-1.6.4/jquery.colorbox',
			'cbj.dragtable':				'kenedo/external/jquery.dragtable-3.0.0/jquery.dragtable',
            'cbj.spectrum':				    'kenedo/external/jquery.spectrum-1.8.0/spectrum',
			'cbj.touchpunch':			    'kenedo/external/jquery.ui.touch-punch-0.2.3/jquery.ui.touch-punch',
			'tinyMCE':						'kenedo/external/tinymce-5.7.1/tinymce'
		},

		// As per CM's documentation, we use packages (makes editor mode JS files load properly without surprises)
		packages: [{
			name: 'codemirror',
			location: 'kenedo/external/codemirror-5.30.0',
			main: "lib/codemirror"
		}],

		// TinyMCE needs a bit of love from shim
		shim: {
			'tinyMCE': {
				exports: 'tinyMCE'
			}
		}

	};

	// With a customization function one can add shims (see ConfigboxViewHelper::getAmdLoaderJs)
	if (appConfig.customShims) {
		for (var shim in appConfig.customShims) {
			if (appConfig.customShims.hasOwnProperty(shim)) {
				configuration.shim[shim] = appConfig.customShims[shim];
			}
		}
	}

	// With a customization function one can add custom paths (see ConfigboxViewHelper::getAmdLoaderJs)
	if (appConfig.customPaths) {
		for (var path in appConfig.customPaths) {
			if (appConfig.customPaths.hasOwnProperty(path)) {
				configuration.paths[path] = appConfig.customPaths[path];
			}
		}
	}

	// Change path config to use min files if settings say so
	if (appConfig.useMinifiedJs) {
		for (var i in configuration.paths) {
			if (configuration.paths.hasOwnProperty(i)) {

				// Ignore certain paths
				if (['configbox/custom', 'configbox'].indexOf(i) !== -1) {
					continue;
				}

				// Be sure to avoid arrays
				if (typeof(configuration.paths[i]) !== 'string') {
					continue;
				}

				// Ignore paths that use .min in the first place
				if (configuration.paths[i].slice(-4) === '.min') {
					continue;
				}

				configuration.paths[i] += '.min';

			}
		}
	}

	// Init require, get our own cbrequire to stay within context
	window.cbrequire = require.config(configuration);

	var dependencies = ['cbj'];
	if (appConfig.requireCustomJs === true) {
		dependencies.push('configbox/custom/custom');
	}

	// 'Start' the app (load the customization JS file as well)
	window.cbrequire(dependencies, function(cbj) {

		var doneModuleCalls = [];

		// Keeping track of existing stylesheets (since we can't trust the head data due to sheet concatenators)
		var existingStylesheets = [];

		// This tag gets added by KenedoPlatform::renderOutput
		if (cbj('#cb-stylesheets').length !== 0) {
			existingStylesheets = JSON.parse(cbj('#cb-stylesheets').text());
		}

		/**
		 * This function looks into all .cb-content wrappers and checks if there are JS calls to make or CSS to load
		 * @listens Event:cbViewInjected
		 */
		var onViewsInjected = function() {

			cbj('.cb-content:not(.view-processed)').each(function() {

				var view = cbj(this);

				// Finally, add a CSS class so subsequent calls won't process that view again
				cbj(this).addClass('view-processed');

				// Get data from view wrapper
				var styleSheets = cbj(this).data('stylesheets');
				var moduleCallsOnce = cbj(this).data('init-calls-once');
				var moduleCallsEach = cbj(this).data('init-calls-each');

				// If there are stylesheet URLs, add them (unless they're already in the head)
				if (styleSheets) {

					cbj.each(styleSheets, function(i, url) {

						if (existingStylesheets.indexOf(url) !== -1) {
							return;
						}

						if (cbj('link[href="' + url + '"]').length !== 0) {
							return;
						}

						existingStylesheets.push(url);

						cbj('head').find('link[rel="stylesheet"]').last().after('<link rel="stylesheet" type="text/css" href="' + url + '">');

					});

				}

				// Prime moduleIds and calls (we will split the configbox/cart::initCartPage strings)
				var moduleIds, calls = [];

				// First deal, with the one-off calls
				// Make sure we're empty
				moduleIds = [];
				calls = [];

				// Loop through the module calls
				cbj.each(moduleCallsOnce, function(i, moduleCall) {

					var moduleId, call;

					// If we got a ::, then split between moduleId and call
					if (moduleCall.split('::', 2).length === 2) {
						moduleId = moduleCall.split('::', 2)[0];
						call = moduleCall.split('::', 2)[1];
					}
					// Otherwise leave call null
					else {
						moduleId = moduleCall;
						call = null;
					}

					// Push moduleIds and calls (making sure we keep array indices same)
					moduleIds.push(moduleId);
					calls.push(call);

				});

				// No the same for recurring init calls
				cbj.each(moduleCallsEach, function(i, moduleCall) {

					var moduleId, call;

					if (moduleCall.split('::', 2).length === 2) {
						moduleId = moduleCall.split('::', 2)[0];
						call = moduleCall.split('::', 2)[1];
					}
					else {
						moduleId = moduleCall;
						call = null;
					}

					moduleIds.push(moduleId);
					calls.push(call);

				});

				// We might have no module calls at all
				if (moduleIds.length !== 0) {

					// Now require all modules at once
					cbrequire(moduleIds, function() {

						// Make a copy of the function arguments for later
						var args = arguments;

						// Loop through all calls
						cbj.each(calls, function(i, call) {

							// Put the module call string together again for next step
							var moduleCall = moduleIds[i] + '::' + calls[i];

							// If the call is part of a one-off, then check if we did it already
							if (moduleCallsOnce.indexOf(moduleCall) !== -1) {
								// If so, skip that loop
								if (doneModuleCalls.indexOf(moduleCall) !== -1) {
									return;
								}
								else {
									doneModuleCalls.push(moduleCall);
								}
							}

							// If there is a module call, do it
							if (call !== null) {

								// In case the function doesn't exist in that module, output some analysis data out
								// and throw an exception
								if (typeof(args[i][call]) !== 'function') {
									console.log('Module contents:');
									console.log(args[i]);
									console.log('All module IDs:');
									console.log(moduleIds);
									console.log('All callback args:');
									console.log(args);
									throw('module function ' + moduleIds[i] + '::' + calls[i] + ' does not exist.');
								}

								// Now call that method
								args[i][call](view);

							}

						});

					});

				}

			});

		};

		// Now set that function up as a handler for cbViewInjected
		cbj(document).on('cbViewInjected', onViewsInjected);
		// Call it initially
		onViewsInjected();

	});

})(window, document, require);

