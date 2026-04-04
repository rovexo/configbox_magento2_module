/* global alert, console, define, cbrequire: false */
/* jshint -W116 */

/**
 * @module configbox/cart
 */
define(['cbj', 'bootstrap'], function(cbj, bootstrap) {

	"use strict";

	// noinspection UnnecessaryLocalVariableJS
	/**
	 * @exports configbox/cart
	 */
	let module = {

		initCartPage: function() {

			cbj(document).on('click', '.view-cart .trigger-edit-quantity', function() {
				const row = cbj(this).closest('.position-row');
				row.find('.trigger-edit-quantity').hide();
				row.find('.trigger-remove-position').hide();
				row.find('.position-quantity').hide();
				row.find('.quantity-edit-wrapper').show();
				row.find('.quantity-edit-box').focus().select();
			});

			cbj(document).on('click', '.view-cart .trigger-cancel-quantity-edit', function() {
				const row = cbj(this).closest('.position-row');
				row.find('.trigger-edit-quantity').show();
				row.find('.trigger-remove-position').show();
				row.find('.position-quantity').show();
				row.find('.quantity-edit-wrapper').hide();
			});

			cbj(document).on('keyup', '.view-cart .quantity-edit-box', function(event) {
				if (event.which === 13) {
					cbj(this).closest('.position-row').find('.trigger-store-quantity').click();
				}
			});

			cbj(document).on('click', '.view-cart .trigger-store-quantity', function() {

				let btn = cbj(this);

				let row = btn.closest('.position-row');
				let qtyNew = row.find('.quantity-edit-box').val();
				let positionId = row.data('position-id');

				cbrequire(['configbox/server'], function(server) {

					server.updateCartPositionQuantity(positionId, qtyNew)

						.done(function(response) {

							if (response.success === false) {
								alert(response.errors.join("\n"));
								return;
							}

							// Reload the summary to get the right prices
							let urlSummary = btn.closest('.view-cart').data('url-cart-summary');

							btn.closest('.view-cart').find('.wrapper-cart-summary').load(urlSummary, function() {
								cbj(document).trigger('cbViewInjected');
							});

						});

				});

			});

			cbj(document).on('click', '.view-cart .trigger-show-position-details', function() {
				let row = cbj(this).closest('.position-row');
				let positionId = row.data('position-id');
				let modal = new bootstrap.Modal(cbj('#cart-position-' + positionId + ' .modal').get(0));
				if (modal) {
					modal.show();
				}
			});

			cbj(document).on('click', '.view-cart .trigger-close-modal', function() {
				let btn = cbj(this);
				let modal = bootstrap.Modal.getInstance(btn.closest('.modal').get(0));
				if (modal) {
					modal.hide();
				}
			});

			cbj(document).on('click', '.trigger-checkout-cart', function(event) {

				event.preventDefault();

				cbj('.cart-buttons').slideUp();

				cbj('.button-copy-product, .button-edit-product, .button-remove-product, .trigger-edit-quantity, .trigger-remove-position').hide();


				let cartId = cbj(this).closest('.view-cart').data('cart-id');

				cbrequire(['configbox/server'], function(server) {

					server.checkoutCart(cartId)

						.done(function(response) {

							if (response.errors.length !== 0) {
								alert(response.errors.join("\n"));
								return;
							}

							cbj('.wrapper-checkout-view').load(response.checkoutViewUrl + ' .kenedo-view.view-checkout', function() {

								cbj(document).trigger('cbViewInjected');

								cbj('html, body').animate({
									scrollTop: cbj('.wrapper-checkout-view').offset().top - 50
								}, 1000);

							});

						});

				});

			});

		},

		initCartPageEach: function() {
			const options = {
				trigger 	: 'focus',
				delay		: 200,
				html		: true,
				customClass	: 'cb-popover'
			};
			const popoverTriggerList = document.querySelectorAll('*[data-toggle=popover]');
			popoverTriggerList.forEach(function(trigger) {
				if (!trigger.dataset.bsContent) {
					options.content = trigger.dataset.content;
				}
				new bootstrap.Popover(trigger, options);
			});
		}

	};

	return module;

});