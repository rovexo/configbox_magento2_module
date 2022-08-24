/* global alert, console, define, cbrequire: false */
/* jshint -W116 */

/**
 * @module configbox/cart
 */
define(['cbj', 'cbj.bootstrap'], function(cbj) {

	"use strict";

	/**
	 * @exports configbox/cart
	 */
	var module = {

		initCartPage: function() {

			cbj(document).on('click', '.view-cart .trigger-edit-quantity', function() {
				var row = cbj(this).closest('.position-row');
				row.find('.trigger-edit-quantity').hide();
				row.find('.trigger-remove-position').hide();
				row.find('.position-quantity').hide();
				row.find('.quantity-edit-wrapper').show();
				row.find('.quantity-edit-box').focus().select();
			});

			cbj(document).on('click', '.view-cart .trigger-cancel-quantity-edit', function() {
				var row = cbj(this).closest('.position-row');
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

				var btn = cbj(this);

				var row = btn.closest('.position-row');
				var qtyNew = row.find('.quantity-edit-box').val();
				var positionId = row.data('position-id');

				cbrequire(['configbox/server'], function(server) {

					server.updateCartPositionQuantity(positionId, qtyNew)

						.done(function(response) {

							if (response.success === false) {
								alert(response.errors.join("\n"));
								return;
							}

							// Reload the summary to get the right prices
							var urlSummary = btn.closest('.view-cart').data('url-cart-summary');

							btn.closest('.view-cart').find('.wrapper-cart-summary').load(urlSummary, function() {
								cbj(document).trigger('cbViewInjected');
							});

						});

				});

			});

			cbj(document).on('click', '.view-cart .trigger-show-position-details', function() {
				var row = cbj(this).closest('.position-row');
				var positionId = row.data('position-id');
				cbrequire(['cbj.bootstrap'], function() {
					cbj('#cart-position-' + positionId + ' .modal').modal();
				});
			});

			cbj(document).on('click', '.view-cart .trigger-close-modal', function() {
				cbj(this).closest('.modal').modal('hide');
			});

			cbj(document).on('click', '.trigger-checkout-cart', function(event) {

				event.preventDefault();

				cbj('.cart-buttons').slideUp();

				cbj('.button-copy-product, .button-edit-product, .button-remove-product, .trigger-edit-quantity, .trigger-remove-position').hide();


				var cartId = cbj(this).closest('.view-cart').data('cart-id');

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
			cbj('*[data-toggle=popover]').popover({
				trigger 	: 'focus',
				delay		: 200,
				html		: true,
				customClass	: 'cb-popover'
			});
		}

	};

	return module;

});