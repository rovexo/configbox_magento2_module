/* global alert, confirm, alert, console, define, cbrequire: false */
/* jshint -W116 */
/**
 * @module configbox/shapediver
 */
define(['cbj', 'configbox/configurator'], function(cbj, configurator) {

	"use strict";

	var privateMethods = {

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

		}

	};

	/**
	 * @exports configbox/shapediver
	 */
	var module = {

		/**
		 * This one holds the callback functions for ongoing requests
		 */
		callbackFunctions: {},

		/**
		 * Holds timeouts for timeout function of ongoing requests
		 */
		timeouts: {},

		messageListenerAdded: false,

		parameterDefinitions: {},

		onceCallHasFinished: false,

		initShapeDiverVisOnce: function() {

			// Set our message listener
			module.addMessageListener();

			// Set the iframe height (see iframe width/height ratio) and let it run on window resize
			cbj(window).on('resize', module.setIframeHeight);

			// Get a ref to the iframe (mind this var is the DOM object, not a jQuery collection)
			var iframe = module.getIframe();

			// Assign handlers once the iframe has finished loading
			cbj(iframe).on('load', function() {
				// This is the handler that fires when a selection change happens
				cbj(document).on('cbSelectionChange', module.updateVisualization);
			});

			// Set the listener for geometry updates
			cbj(document).on('sdGeometryUpdateDone', module.setExternalTextures);

			// Mark the once-call as done (see initShapeDiverVisEach)
			module.onceCallHasFinished = true;

		},

		initShapeDiverVisEach: function() {

			// The each calls need the once call to be done first, setting an interval to wait for it
			var interval = window.setInterval(function() {

				if (module.onceCallHasFinished === true) {

					module.setIframeHeight();
					var iframe = module.getIframe();

					// Finally set the iframe URL and let the viewer load
					iframe.src = iframe.dataset.src;
					window.clearInterval(interval);

				}

			}, 100);

		},

		setIframeHeight: function() {

			var iframe = module.getIframe();

			var relativeHeight = cbj(iframe).data('relative-height');

			if (relativeHeight) {
				var width = parseInt(cbj(iframe).width());
				var height = width * parseFloat(relativeHeight) / 100;
				cbj(iframe).css('height', height + 'px');
			}

		},

		addMessageListener: function() {

			if (module.messageListenerAdded !== true) {
				module.messageListenerAdded = true;
				cbj(window).on('message', this.onReceiveMessage);
			}
		},

		/**
		 * @listens event:cbSelectionChange
		 * @param event jQuery event object
		 * @param {int} questionId
		 * @param {string} selection
		 */
		updateVisualization: function(event, questionId, selection) {

			var isControl = configurator.getQuestionPropValue(questionId, 'is_shapediver_control');

			// If question is no SD control, we're done
			if (isControl === 0 || isControl === '0') {
				return;
			}

			// See what type the question is
			var type = configurator.getQuestionPropValue(questionId, 'question_type');

			if (type === 'upload') {

				// Get the geometry name
				var geometryName = configurator.getQuestionPropValue(questionId, 'shapediver_geometry_name');

				// No geometry name, so no
				if (!geometryName) {
					return;
				}

				// This is set client-side while user uploads image, see questionUpload.init in questions.js
				var imgData = cbj('#question-' + questionId).data('file-contents');

				if (imgData) {

					// The image stash is used to keep hrefs and/or data URIs to re-apply textures after a geometry update
					// Here we add an image in case that here isn't a selection update
					if (cbj('#image-question-id-' + questionId).length === 0) {

						cbj('<img alt="" src="about:blank" id="image-question-id-' + questionId + '" data-question-id="' + questionId + '" data-geometry-name="' + geometryName + '" />')
							.appendTo('.view-sdvisualization .current-images');

					}

					// Set the image from in image stash (stash is used to get image data for re-applying textures)
					cbj('#image-question-id-' + questionId).attr('src', imgData);

					console.log('Adding texture to geometry named ' + geometryName);

					// Go get the texture set
					module.sendMessage({
						'command': 'setExternalTexture',
						'arguments': [geometryName, imgData]
					});

				}
				else {

					// Remove the image from the image stash (stash is used to get image data for re-applying textures)
					cbj('#image-question-id-' + questionId).remove();

					console.log('Removing texture from geometry named ' + geometryName);

					// Go get rid of the texture
					module.sendMessage({
						'command': 'removeExternalTexture',
						'arguments': [geometryName]
					});

				}

				return;

			}


			var parameterId = configurator.getQuestionPropValue(questionId, 'shapediver_parameter_id');

			if (parameterId === '') {
				return;
			}

			// This will be the value for the parameter that we send to the model API
			var parameterValue = null;

			var answers = configurator.getQuestionPropValue(questionId, 'answers');

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

				default:

					if (answers && typeof(answers[selection]) !== 'undefined') {
						parameterValue = answers[selection].shapediver_choice_value;
					}
					else {
						parameterValue = selection;
					}

			}

			module.getParameterDefinitions(function(parameterDefinitions) {

				if (typeof(parameterDefinitions[parameterId]) === 'undefined') {
					throw 'Parameter ' + parameterId + ' not found in parameter definitions.';
				}

				// If the SD parameter type is 'Boolean' we transform the values 'true'/'false' into boolean true/false
				if (parameterDefinitions[parameterId].type === 'Boolean') {

					if (selection && answers[selection].shapediver_choice_value === 'true') {
						parameterValue = true;
					}
					else {
						parameterValue = false;
					}

				}

				module.setParameterValue(parameterId, parameterValue);

			});


		},

		getParameterDefinitions: function(callback) {

			var payload = {
				command: "getParameterDefinitions"
			};

			module.sendMessage(payload, null,  function(response) {
				callback(response.result);
			});

		},

		/**
		 * @listens event:sdGeometryUpdateDone
		 */
		setExternalTextures: function() {

			cbj('.view-sdvisualization .current-images img').each(function() {

				var name = cbj(this).data('geometry-name');
				var url = cbj(this).attr('src');

				// If the URL is a data URI, we set the texture right away
				if (url.substr(0, 5) === 'data:') {

					module.sendMessage({
						'command': 'setExternalTexture',
						'arguments': [name, url]
					});

				}
				// Otherwise we go get the data uri from the URL
				else {

					privateMethods.getDataUri(url, function(blob) {

						module.sendMessage({
							'command': 'setExternalTexture',
							'arguments': [name, blob]
						});

					});

				}

			});

		},

		setParameterValue: function(parameterId, value) {

			console.log('Setting parameter ID "' + parameterId + '" with value "' + value + '". Value type is ' + typeof(value));

			var payload = {
				command: "setParameterValue",
				arguments: [parameterId, value]
			};

			module.sendMessage(payload);

		},

		/**
		 * Method to send messages to our ShapeDiver iframe with a callback function that
		 * processes the response.
		 *
		 * @param payload
		 * @param {String=} iframeId
		 * @param {Function=} callbackFunction - Optional callback for the response
		 * @param {Function=} timeoutFunction - Optional callback if timeout for the response expired
		 */
		sendMessage: function(payload, iframeId, callbackFunction, timeoutFunction) {

			// Add the message listener (method method prevents multiple adds)
			// module.addMessageListener();

			// We just invent some id
			// var callbackId = Math.random();

			console.log('Sending message with this payload:');
			console.log(payload);

			// Until we got payload IDs, we use the command name and hope we won't have two concurrent requests
			// with the same command name
			var callbackId = payload.command;

			// If we have a callback function, then we add the callbackId to the payload
			if (callbackFunction) {

				// Here we attach it so that hopefully we get it back in the response
				payload.callbackId = callbackId;

				// Here we store the callback function, so that our onReceiveMessage can find it
				module.callbackFunctions[callbackId] = callbackFunction;

			}

			// Start a timeout for the timeout function (if there is one)
			if (timeoutFunction) {
				module.timeouts[callbackId] = window.setTimeout(timeoutFunction, 3000);
			}

			// Get the iframe..
			var iframe = module.getIframe(iframeId);

			// ..and off it goes
			iframe.contentWindow.postMessage(payload, "https://app.shapediver.com");

		},

		/**
		 * Listener for incoming messages
		 * @param event
		 * @fires sdGeometryUpdateDone
		 */
		onReceiveMessage: function(event) {

			// Get the message data
			var data = event.data || event.originalEvent.data;

			if (typeof(data.errorCode) !== 'undefined' && data.errorCode !== 0) {
				throw 'Error received on iframe message response. "' + data.errorMessage + '"';
			}

			// If the message is about a geometry update, fire our own event
			if (data.hasOwnProperty('viewerMessage') && data.viewerMessage === 'GeometryUpdateDone') {

				console.log('triggering sdGeometryUpdateDone');

				/**
				 * @event sdGeometryUpdateDone
				 */
				cbj(document).trigger('sdGeometryUpdateDone');

				return;

			}

			// Until we got payload IDs, we use the command name and hope for the best
			data.callbackId = data.command || null;

			console.log('Received message for command ' + data.command + ' with this data:');
			console.log(data);

			// See if we got a callback id
			if (data.callbackId) {

				// If so, see if we actually got a callback function for this id
				if (typeof(module.callbackFunctions[data.callbackId]) === 'function') {
					// Call it and remove the callback id
					module.callbackFunctions[data.callbackId](data);
					delete module.callbackFunctions[data.callbackId];
				}

				// Clear timeouts
				if (typeof(module.timeouts[data.callbackId]) !== 'undefined') {
					window.clearTimeout(module.timeouts[data.callbackId]);
					delete module.timeouts[data.callbackId];
				}

			}

		},

		/**
		 *
		 * @param {String=} [id=shapediver-vis] id
		 * @returns object|null
		 */
		getIframe: function(id) {

			if (!id) {
				id = 'shapediver-vis';
			}

			var iframe = window.document.getElementById(id);

			if (iframe) {
				return iframe;
			}
			else {
				return null;
			}

		}

	};

	return module;

});