/**
 * @module configbox/calcCode
 */
define(['cbj', 'cbj.chosen'], function(cbj) {

	"use strict";

	/**
	 * @exports configbox/calcCode
	 */
	var module = {

		initCalcCodeViewEach: function() {

			// Add IDs to the placeholders in calculation code
			cbj('.view-admincalccode select option').each(function() {

				if (cbj(this).attr('value') === '0') {
					return;
				}

				var text = cbj(this).text() + " (ID: " + cbj(this).attr('value') + ")";
				cbj(this).text(text);

			});

			// Make dropdowns searchable
			cbj('.view-admincalccode select').chosen();

		}

	};

	return module;

});