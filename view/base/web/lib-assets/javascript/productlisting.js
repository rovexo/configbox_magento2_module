/**
 * @module configbox/productlisting
 */
define(['cbj'], function(cbj) {

	"use strict";

	/**
	 * @exports configbox/productlisting
	 */
	var module = {

		initListingPage: function() {

			// Clicks on the 'show reviews' button
			cbj(document).on('click', '.trigger-show-reviews', function() {

				// Start loading boostrap JS ahead of time (might save a bit of time)
				cbrequire(['cbj.bootstrap']);

				var url = cbj(this).data('url-reviews');
				var modal = cbj('#reviews-modal');

				modal.find('.modal-content').load(url, function() {
					cbrequire(['cbj.bootstrap'], function() {
						// Get the modal open
						modal.modal();
						// Run the view injected functions
						cbj(document).trigger('cbViewInjected');
					});

				});

			});

			// Clicks on the 'add reviews' button
			cbj(document).on('click', '.trigger-show-review-form-modal', function() {

				// Start loading boostrap JS ahead of time (might save a bit of time)
				cbrequire(['cbj.bootstrap']);

				var url = cbj(this).data('url-reviews');
				var modal = cbj('#reviews-modal');

				modal.find('.modal-content').load(url, function() {
					cbrequire(['cbj.bootstrap'], function() {
						// Get the modal open
						modal.modal();
						// Run the view injected functions
						cbj(document).trigger('cbViewInjected');
					});

				});

			});

		}

	};

	return module;

});