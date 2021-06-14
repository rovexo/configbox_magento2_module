/**
 * @module configbox/adminAnswer
 */
define(['cbj'], function(cbj) {

	"use strict";

	/**
	 * @exports configbox/adminAnswer
	 */
	var module = {

		initAnswerViewOnce: function() {

			cbj(document).on('change', '.view-adminoptionassignment select[name=option_id]', function() {
				var view = cbj(this).closest('.view-adminoptionassignment');
				var optionId = cbj(this).val();

				cbrequire(['configbox/server'], function(server) {

					var target = view.find('.option-fields-target');
					var data = {
						id: optionId,
					};

					target.html('');

					server.injectHtml(target, 'adminoptions', 'getPropertiesHtml', data, function() {
						//console.log('injected');
					});

				});

			});

		}

	};

	return module;

});