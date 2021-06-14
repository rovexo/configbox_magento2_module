/**
 * @module configbox/adminShapediver
 */
define(['cbj'], function(cbj) {

	"use strict";

	/**
	 * @exports configbox/adminShapediver
	 */
	var module = {

		initBackendPropsOnce: function() {

			// Clicks on the shapediver load model data button
			cbj(document).on('click', '.trigger-load-model-data', function() {

				var button = cbj(this);

				if (button.hasClass('processing')) {
					return;
				}

				button.addClass('processing');
				button.css('width', button.css('width'));
				button.data('ready-text', button.text());
				button.text(button.data('processing-text'));

				var wrapper = cbj(this).closest('.property-type-shapedivermodel');

				var urlInput = wrapper.find('.model-url');
				var parameterInput = wrapper.find('.model-parameters');
				var geometriesInput = wrapper.find('.model-textured-geometries');
				var iframe = wrapper.find('.shapediver-iframe');

				var url = urlInput.val();

				cbrequire(['configbox/shapediver'], function(shapeDiver) {

					// Sanitize the iframe URL: extract the URL if input is the whole iframe HTML
					if (url.substr(0,4) !== 'http') {
						var regex = /<iframe.*?src="(.*?)"/;
						var matches = regex.exec(url);
						if (matches && typeof(matches[1]) !== 'undefined') {
							url = regex.exec(url)[1];
						}
						else {
							regex = /<iframe.*?src='(.*?)'/;
							matches = regex.exec(url);
							if (matches && typeof(matches[1]) !== 'undefined') {
								url = regex.exec(url)[1];
							}
						}
					}

					// Sanitize the iframe URL: Remove the query string
					var pos = url.indexOf('?');

					if (pos !== -1) {
						url = url.substr(0, pos);
					}

					// Insert the sanitized URL
					urlInput.val(url).change();

					shapeDiver.addMessageListener();

					// We have to collect parameters and textures. Each come from async calls, so this
					// thing here 'waits' for both jobs done and fires a function when all is done.
					var supervisor = {

						doneJobs: [],

						requiredJobs: ['getParameters', 'getTextures'],

						/**
						 *
						 * @param {String} job
						 */
						registerDoneJob: function(job) {

							this.doneJobs.push(job);

							var jobIsMissing = false;

							for (var i in this.requiredJobs) {
								if (this.requiredJobs.hasOwnProperty(i)) {
									if (this.doneJobs.indexOf(this.requiredJobs[i]) === -1) {
										jobIsMissing = true;
									}
								}
							}

							if (jobIsMissing === false) {
								this.doneCallback();
							}

						},

						doneCallback: function() {

							// Change the button to show all went ok
							button.text(button.data('done-text'));
							button.addClass('btn-success');

							// Revert back to initial state after 1s
							window.setTimeout(function(){
								button.text(button.data('ready-text'));
								button.removeClass('btn-success');
								button.removeClass('processing');
							}, 1000);

						}

					};

					// Set the load handler for the iframe (note that at this point the iframe content isn't loaded -> it has about:blank as URL)
					iframe.on('load', function() {

						var payload;

						payload = {
							command: 'getParameterDefinitions',
							arguments: []
						};

						shapeDiver.sendMessage(payload, 'shapediver-iframe', function(response) {

							var parameters = [];

							if (response.errorCode !== 0 ) {
								window.alert('Cannot get parameter definitions from model. Error code is '+ response.errorCode +' Error message is ' + response.errorMessage + '. Assuming that there are no parameters in model.');
							}
							else {
								parameters = response.result;
							}

							// Temporary fix for missing type on choices parameters
							for (var i in parameters) {
								if (parameters.hasOwnProperty(i) === true) {
									if (typeof(parameters[i].type) === 'undefined' && typeof(parameters[i].choices) !== 'undefined') {
										parameters[i].type = 'choices';
									}
								}
							}

							parameterInput.val(JSON.stringify(parameters)).change();

							supervisor.registerDoneJob('getParameters');

						});

						// That event is fired in the in the shapediver module's onReceiveMessage
						cbj(document).on('sdGeometryUpdateDone', function() {

							var payload = {
								command: 'findTexturedGeometry',
								arguments: []
							};

							shapeDiver.sendMessage(payload, 'shapediver-iframe', function(response) {

								var geometries = [];

								if (response.errorCode !== 0 ) {
									window.alert('Cannot get texturedGeometries from model. Error code is '+ response.errorCode +' Error message is ' + response.errorMessage + '. Assuming that there are no textures in model.');
								}
								else {
									geometries = response.result;
								}

								geometriesInput.val(JSON.stringify(geometries)).change();

								supervisor.registerDoneJob('getTextures');

							});

						});


					});

					// Append the right version flag
					url += '?version=' + iframe.data('api-version');

					// If the new URL isn't different, we just change it to force a load in the next step
					if (url !== iframe.attr('src')) {
						iframe.attr('src', 'about:blank');
					}

					// Finally, load the iframe content
					iframe.attr('src', url);

				});

			});

			// Changes to SD data inputs update the hidden JSON string
			cbj(document).on('change', '.model-parameters, .model-textured-geometries, .model-url, .model-ratio', function() {

				var wrapper = cbj(this).closest('.property-type-shapedivermodel');

				var urlInput = wrapper.find('.model-url');
				var parameterInput = wrapper.find('.model-parameters');
				var geometriesInput = wrapper.find('.model-textured-geometries');
				var ratioInput = wrapper.find('.model-ratio');

				var dataInput = wrapper.find('.shapediver-model-data');

				var data = {
					iframeUrl: urlInput.val(),
					ratioDimensions: ratioInput.val(),
					parameterData: JSON.parse(parameterInput.val()),
					texturedGeometries: JSON.parse(geometriesInput.val())
				};

				dataInput.val(JSON.stringify(data));

			});

			// Just makes sure that ratio changes get copied over on keyup
			cbj(document).on('keyup', '.model-ratio', function() {
				cbj(this).trigger('change');
			});

		}

	};

	return module;

});