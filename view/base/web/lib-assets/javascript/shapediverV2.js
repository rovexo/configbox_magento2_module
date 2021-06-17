/* global alert, confirm, alert, console, define, cbrequire: false, SDVApp: false */
/* jshint -W116 */
/**
 * @module configbox/shapediverV2
 */
define(['cbj', 'configbox/configurator'], function(cbj, configurator) {

	"use strict";

	var privateMethods = {

		/**
		 * Callback for parameter updates, checks results and logs
		 * @param result
		 */
		checkParamUpdateResult: function(result) {

			if (result.err != null) {
				console.warn('Problem occurred with updating SD parameter values. Result and error stack follow.');
				console.log(result);
				console.error(result.err.stack);
			}
			else {

				var paramResult;

				for (var i in result.data) {
					if (result.data.hasOwnProperty(i)) {
						paramResult = result.data[i];
						if (paramResult.result != 'value_ok') {
							console.warn('Parameter ' + paramResult.id + ' received invalid value "' + paramResult.value + '". Result code was ' + paramResult.result);
						}
						else {
							console.log('Parameter ' + paramResult.id + ' update to value "' + paramResult.value + '" successful.');
						}
					}
				}
			}

		},

		runSettingsRegisteredFunctions: function(event) {

			privateMethods.settingsRegistered = true;

			for (var i in privateMethods.settingsRegisteredFunctions) {
				if (privateMethods.settingsRegisteredFunctions.hasOwnProperty(i)) {
					// Call the function
					privateMethods.settingsRegisteredFunctions[i](event.api);
					// Remove it from the array
					privateMethods.settingsRegisteredFunctions.shift();
				}
			}

		},

		settingsRegisteredFunctions: [],
		settingsRegistered: false,

		runSceneReadyFunctions: function(event) {

			privateMethods.sceneReady = true;

			for (var i in privateMethods.sceneReadyFunctions) {
				if (privateMethods.sceneReadyFunctions.hasOwnProperty(i)) {
					// Call the function
					privateMethods.sceneReadyFunctions[i](event.api);
					// Remove it from the array
					privateMethods.sceneReadyFunctions.shift();
				}
			}

		},

		sceneReadyFunctions: [],
		sceneReady: false,

		updateFileParameters: function(api) {

			// Get any parameter values to set initially
			var images = cbj('.view-sdvisualization').data('used-images');

			for (const i in images) {
				if (images.hasOwnProperty(i)) {
					privateMethods.getBlobFromUrl(images[i].url, function(blob) {
						api.parameters.updateAsync({
							id: images[i].parameter_id,
							value: blob,
						})
							.then(privateMethods.checkParamUpdateResult);
					});
				}
			}

		},

		getBlobFromUrl: function(url, callback) {

			var xhr = new XMLHttpRequest();
			xhr.open("GET", url);
			xhr.responseType = "blob";
			xhr.onload = function() {
				callback(this.response);
			};
			xhr.send();

		},

		getDataUri: function(url, callback) {

			var image = new window.Image();

			image.onload = function () {

				var canvas = document.createElement('canvas');
				canvas.width = this.naturalWidth;
				canvas.height = this.naturalHeight;

				canvas.getContext('2d').drawImage(this, 0, 0);
				callback(canvas.toDataURL('image/png'));
			};

			image.src = url;

		},

	};

	/**
	 * @exports configbox/shapediverV2
	 */
	var module = {

		initFrontendOnce: function() {

			cbj(document).on('cbSelectionChange', module.updateVisualization);

			// Get general settings
			var settings = module.getViewerSettings();

			// Get geometry loading going
			settings.deferGeometryLoading = false;

			// Get any parameter values to set initially
			var parameterUpdates = cbj('.view-sdvisualization').data('parameters');

			// Init the API, any ready functions are done with addSceneReadyFunction
			module.initApi(settings);

			module.addSettingsRegisteredFunction(function(api) {

				api.parameters.updateAsync(parameterUpdates)
					.then(privateMethods.checkParamUpdateResult)
					.then(api.scene.camera.zoomAsync);

				privateMethods.updateFileParameters(api);
			});

		},


		/**
		 * @param {Object} settings 		Viewer settings for the Parametric viewer
		 */
		initApi: function(settings) {

			// SDVApp does not init right when AMD loaders are in place, this is a workaround
			var backup = window.define.amd;
			window.define.amd = null;

			cbj.ajax({
				url: 'https://viewer.shapediver.com/v2/2.28.0/sdv.concat.min.js',
				dataType: "script",
				complete: function() {
					window.define.amd = backup;
				},
				success: function() {

					var api = new SDVApp.ParametricViewer(settings);
					module.setApi(api);

					// Run any settings-registered functions once the API settings have been registered
					api.addEventListener(api.EVENTTYPE.SETTINGS_REGISTERED, privateMethods.runSettingsRegisteredFunctions);

					api.addEventListener(api.EVENTTYPE.SETTINGS_REGISTERED, function() {
						// Run any scene-ready functions once the scene is published
						api.scene.addEventListener(api.scene.EVENTTYPE.SUBSCENE_PUBLISHED, privateMethods.runSceneReadyFunctions);
					});
				}
			});

		},

		/**
		 * Drop a function here and it will run right after the SD settings have been registered
		 * Settings have been registered already, the function will run immediately
		 * @param fn
		 */
		addSettingsRegisteredFunction: function(fn) {

			if (privateMethods.settingsRegistered === true) {
				fn(module.getApi());
			}
			else {
				privateMethods.settingsRegisteredFunctions.push(fn);
			}

		},


		/**
		 * Drop a function here and it will run right after the SD scene is published.
		 * If it is already published, it'll run immediately
		 * @param fn
		 */
		addSceneReadyFunction: function(fn) {

			if (privateMethods.sceneReady === true) {
				fn(module.getApi());
			}
			else {
				privateMethods.sceneReadyFunctions.push(fn);
			}

		},


		/**
		 * @returns {SDVApp.ParametricViewer}
		 */
		getApi: function() {
			return module.api;
		},

		/**
		 * $param {SDVApp.ParametricViewer} api
		 */
		setApi: function(api) {
			window.api = api;
			module.api = api;
		},

		/**
		 * Gets you the settings for the viewer API
		 * @param {object} overrides to settings that the method determines
		 * @returns {{container: HTMLElement, deferGeometryLoading: boolean, ticket, modelViewUrl: string, brandedMode: boolean, apiversion: number}}
		 */
		getViewerSettings: function(overrides) {

			// Settings can be defined here, or as attributes of the viewport container. Settings defined here take precedence.
			var ticket = cbj('.view-sdvisualization').data('ticket');
			var modelViewUrl = cbj('.view-sdvisualization').data('model-view-url');
			var container = document.getElementById('sdv-container');

			var settings = {
				container: container,
				ticket: ticket,
				modelViewUrl: modelViewUrl,
				apiversion: 2,
				deferGeometryLoading: true,
				brandedMode: false,
			};

			for (var i in overrides) {
				if (overrides.hasOwnProperty(i)) {
					settings[i] = overrides[i];
				}
			}

			return settings;

		},

		/**
		 * @listens event:cbSelectionChange
		 * @param event jQuery event object
		 * @param {int} questionId
		 * @param {string} selection
		 */
		updateVisualization: function(event, questionId, selection) {

			var parameterData = module.getParameterData(questionId, selection);

			if (parameterData) {
				module.getApi().parameters.updateAsync([parameterData]).then(privateMethods.checkParamUpdateResult);
			}

		},

		/**
		 * Returns an ShapeDiver parameter object for a question/selection combo or NULL if it's not an SD question
		 * @param {int} questionId
		 * @param {string} selection
		 * @returns {{id: *, value: null}|null}
		 */
		getParameterData: function(questionId, selection) {

			var isControl = configurator.getQuestionPropValue(questionId, 'is_shapediver_control');

			// If question is no SD control, we're done
			if (!isControl) {
				return null;
			}

			var parameterId = configurator.getQuestionPropValue(questionId, 'shapediver_parameter_id');

			if (!parameterId) {
				return null;
			}

			// This will be the parameter value that we send to the model API
			var parameterValue = null;

			// See what type the question is
			var type = configurator.getQuestionPropValue(questionId, 'question_type');

			// Depending on the type of question we transform the selection into a format that works for SD
			switch (type) {

				case 'colorpicker':
					if (selection) {
						parameterValue = '0x' + selection.replace('#', '') + 'ff';
					}
					break;

				case 'ralcolorpicker':
					if (selection) {
						var colorId = selection.replace('RAL ', '');
						var hexCode = cbj('#question-' + questionId).find('.ral-color[data-color-id=' + colorId + ']').data('hex');
						parameterValue = '0x' + hexCode.replace('#', '').toLowerCase() + 'ff';
					}
					break;

				case 'upload':

					if (selection) {
						parameterValue = cbj('#question-' + questionId).data('file');
					}
					else {
						parameterValue = '';
					}

					break;

				default:

					var answers = configurator.getQuestionPropValue(questionId, 'answers');

					if (answers && typeof(answers[selection]) !== 'undefined') {
						parameterValue = answers[selection].shapediver_choice_value;
					}
					else {
						parameterValue = selection;
					}

			}

			return {
				id: parameterId,
				value: parameterValue,
			};

		}

	};

	return module;

});