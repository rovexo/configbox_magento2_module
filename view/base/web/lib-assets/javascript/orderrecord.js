/**
 * @module configbox/orderrecord
 */
define(['cbj'], function(cbj) {

	"use strict";

	/**
	 * @exports configbox/orderrecord
	 */
	var module = {

		initOrderRecord: function() {

			cbj(document).on('click', '.trigger-show-position-modal', function() {

				var positionId = cbj(this).data('position-id');

				cbrequire(['bootstrap'], function(bootstrap) {
					const modalEl = cbj('.position-id-' + positionId).get(0);
					new bootstrap.Modal(modalEl).show();
				});

			});

		}

	};

	return module;

});