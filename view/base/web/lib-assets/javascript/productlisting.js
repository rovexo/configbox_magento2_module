/**
 * @module configbox/productlisting
 */
define(['cbj'], function(cbj) {

	"use strict";

	/**
	 * @exports configbox/productlisting
	 */
	let module = {

		initListingPage: function() {

			// Clicks on the 'show reviews' button
			cbj(document).on('click', '.trigger-show-reviews', function() {

				let url = cbj(this).data('url-reviews');
				let modal = cbj('#reviews-modal');

				modal.find('.modal-content').load(url, function() {
					cbrequire(['bootstrap'], function(bootstrap) {

						const modalEl = modal.get(0);
						new bootstrap.Modal(modalEl).show();

						// Run the view injected functions
						cbj(document).trigger('cbViewInjected');
					});

				});

			});

			// Clicks on the 'add reviews' button
			cbj(document).on('click', '.trigger-show-review-form-modal', function() {

				let url = cbj(this).data('url-reviews');
				let modal = cbj('#reviews-modal');

				modal.find('.modal-content').load(url, function() {
					cbrequire(['bootstrap'], function(bootstrap) {

						const modalEl = modal.get(0);
						new bootstrap.Modal(modalEl).show();

						// Run the view injected functions
						cbj(document).trigger('cbViewInjected');
					});

				});

			});

		}

	};

	return module;

});