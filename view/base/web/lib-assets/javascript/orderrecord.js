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

				cbrequire(['cbj.bootstrap'], function() {
					cbj('.position-id-' + positionId).modal();
				});

			});

		}

	};

	return module;

});