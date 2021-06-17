/**
 * @module configbox/adminShapediverV2
 */
define(['cbj', 'configbox/shapediverV2'], function(cbj, shapeDiverFrontend) {

	"use strict";

	/**
	 * @exports configbox/adminShapediverV2
	 */
	var module = {

		initBackendPropsEach: function() {

			cbj('.view-adminproduct .task-apply a').click(function() {
				module.setPropertyJson();
			});

		},

		initBackendPropsOnce: function() {

			// Clicks on the ShapeDiver load model data button
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
				var ticketInput = wrapper.find('.model-ticket');
				var parameterInput = wrapper.find('.model-parameters');
				var geometriesInput = wrapper.find('.model-textured-geometries');
				var modelViewUrlOverrideInput = wrapper.find('.model-view-url-override');

				// Remove any existing SD container
				if (wrapper.find('.shapediver-container').length !== 0) {
					wrapper.find('.shapediver-container').remove();
				}

				// Make a new SD container
				wrapper.append('<div class="shapediver-container" style="display:none"></div>');

				var container = wrapper.find('.shapediver-container').get(0);
				var ticket = ticketInput.val();

				if (!ticket) {
					wrapper.find('.feedback-box').text('Please enter a ticket number');
					return;
				}
				else {
					wrapper.find('.feedback-box').text('');
				}

				// Prep the SD viewer settings
				var viewerSettings = shapeDiverFrontend.getViewerSettings();
				viewerSettings.container = container;
				viewerSettings.ticket = ticket;
				viewerSettings.deferGeometryLoading = false;
				viewerSettings.modelViewUrl = 'https://sdeuc1.eu-central-1.shapediver.com';

				if (modelViewUrlOverrideInput.val()) {
					viewerSettings.modelViewUrl = modelViewUrlOverrideInput.val();
				}

				shapeDiverFrontend.addSceneReadyFunction(function(api) {

					// Get the model parameters
					var params = api.parameters.get();

					console.log('Model parameters:');
					console.log(params);

					// Feedback if that didnd't work
					if (params.err !== null) {
						button.text(button.data('ready-text'));
						button.removeClass('btn-success');
						button.removeClass('processing');
						console.log('Could not fetch model parameters');
						window.alert('A problem has occurred with loading model parameters. Please check ticket and your model and try again.');
						return;
					}

					// Assemble model parameters in our structure
					var paramData = {};
					for (var i in params.data) {
						if (params.data.hasOwnProperty(i) === true) {
							paramData[params.data[i].id] = params.data[i];
						}
					}

					// Get scene assets (for the textures)
					var sceneAssets = api.scene.get(null,"CommPlugin_1");

					console.log('Scene assets:');
					console.log(sceneAssets);

					// Assemble in our own structure
					var geometries = {};
					for (var i in sceneAssets.data) {
						if (sceneAssets.data.hasOwnProperty(i) === true) {
							geometries[sceneAssets.data[i].id] = sceneAssets.data[i].name;
						}
					}

					// Put both things as JSON into our text input fields
					parameterInput.val(JSON.stringify(paramData));
					geometriesInput.val(JSON.stringify(geometries));

					console.log('Collected parameters and geometries');
					console.log(paramData);
					console.log(geometries);

					// Get all data combined into our model data text input field
					module.setPropertyJson();

					// Change the button to show all went ok
					button.text(button.data('done-text'));
					button.addClass('btn-success');

					// Revert the button back to initial state (after 1 sec)
					window.setTimeout(function(){
						button.text(button.data('ready-text'));
						button.removeClass('btn-success');
						button.removeClass('processing');
					}, 1000);


				});

				shapeDiverFrontend.initApi(viewerSettings);

			});

		},

		setPropertyJson: function() {

			var wrapper = cbj('.property-type-shapedivermodel');

			var data = {
				ticket: wrapper.find('.model-ticket').val(),
				parameterData: JSON.parse(wrapper.find('.model-parameters').val()),
				texturedGeometries: JSON.parse(wrapper.find('.model-textured-geometries').val()),
				modelViewUrlOverride: wrapper.find('.model-view-url-override').val(),
			};

			wrapper.find('.shapediver-model-data').val(JSON.stringify(data));

		},

	};

	return module;

});