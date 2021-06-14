/* jshint -W116 */

/**
 * @module configbox/checkout
 */
define(['cbj', 'configbox/server', 'configbox/ga'], function(cbj, server, gaModule) {

	"use strict";

	/**
	 * @exports configbox/checkout
	 */
	var module = {

		/**
		 * Initializes the checkout page functionality.
		 *
		 * During the user's interactions, we emit a number of custom events that you can use for tracking checkout
		 * behavior. All events are triggered on window.document
		 *
		 * Events (the numbers are not funnel steps, just iterations):
		 *
		 * 1: cb.checkout.address_saved: When the user saved his billing/shipping address
		 * 2: cb.checkout.delivery_saved: Delivery method chosen
		 * 3: cb.checkout.payment_saved: Payment method chosen
		 * 4: cb.checkout.order_placed: When the user hits the 'buy' button
		 * 5: Mind that actual payment is tracked server-side using the Measurement Protocol. 'order_placed' should
		 *    NOT track a conversion or a transaction. For offline PSPs (like bank transfer) you can choose in the
		 *    settings if order placement makes a conversion (and it gets tracked with the Measurement Protocol as well)
		 *    See PHP: ObserverGoogleAnalytics class, that is where server-side tracking happens
		 *
		 * There is event data passed along (when you use jQuery's on method, you get them in the second parameter of
		 * your callback function. Best console.log them to see each key/value.
		 *
		 * Event data:
		 *
		 * 1: cb.checkout.address_saved: { orderData: {}, customerData: {} }
		 * 2: cb.checkout.delivery_saved: None
		 * 3: cb.checkout.payment_saved: None
		 * 4: cb.checkout.order_placed: { orderData: {}, customerData: {} }
		 *
		 * Example for making a listener for number 1:
		 *
		 * cbj(document).on('cb.checkout.address_saved', function(event, eventData) {
		 *   console.log(eventData);
		 * });
		 *
		 * Getting order meta data yourself at any time:
		 *
		 * Use this module's method getOrderMetaData() to get order information (e.g. when you want to track the start
		 * of checkout and send order data).
		 *
		 * Getting customer meta data:
		 *
		 * Use module configbox/customerform, method getCustomerFormData() to get billing/shipping address at any time
		 * in the checkout process. Use cbrequire() instead of require to get ConfigBox AMD modules.
		 *
		 */
		initCheckoutPage: function() {

			// Store the GA client ID
			gaModule.getClientId(function(clientId){
				server.makeRequest('checkout', 'storeGaClientId', {gaClientId: clientId});
			});

			cbj(document).on('click', '.trigger-show-order-address-form', function() {
				cbj('.wrapper-order-address .order-address-display').slideUp();
				cbj('.wrapper-order-address .order-address-form').slideDown();
			});

			cbj(document).on('click', '.trigger-save-order-address', function() {

				// Add the spinner to the button
				cbj(this).addClass('processing');

				cbrequire(['configbox/customerform'], function(customerform) {

					// Get the customer data from the customer form
					var customerData = customerform.getCustomerFormData();

					server.storeOrderAddress(customerData)

						.done(function(response) {

							// Remove the spinner
							cbj('.trigger-save-order-address').removeClass('processing');

							// Show validation issues (or errors)
							if (response.success === false) {

								if (response.validationIssues.length !== 0) {
									customerform.displayValidationIssues(response.validationIssues);
								}
								if (response.errors.length !== 0) {
									window.alert(response.errors.join("\n"));
								}

								return;

							}

							// Remove all invalid classes from fields
							cbj('.order-address-field').removeClass('invalid').removeClass('valid');

							// Refresh the rest of the checkout sub-views
							module.refreshOrderAddress();
							module.refreshCartSummary();
							module.refreshDeliveryOptions();
							module.refreshPaymentOptions();

							// After order record data refreshed, fire the event for 'address saved'
							// (callback because the taxes can change in the order record data)
							module.refreshOrderRecord(function() {

								var eventData = {
									customerData: customerData,
									orderData: module.getOrderMetaData()
								};

								cbj(document).trigger('cb.checkout.address_saved', eventData);

							});

						});

				});

			});

			// Store delivery method
			cbj(document).on('change', '#subview-delivery .option-control', function() {

				cbj(this).closest('li').addClass('processing');
				var id = cbj(this).val();

				server.setDeliveryOption(id)
					.done(function() {

						// Refresh the sub views
						module.refreshPaymentOptions();
						module.refreshOrderRecord();
						module.refreshCartSummary();

						// Remove the loading indicator
						cbj('#subview-delivery li.processing').removeClass('processing');

						// Trigger the event for 'delivery saved'
						cbj(document).trigger('cb.checkout.delivery_saved');

					});

			});

			// Store payment method
			cbj(document).on('change', '#subview-payment .option-control', function() {

				cbj(this).closest('li').addClass('processing');
				var id = cbj(this).val();

				server.setPaymentOption(id)
					.done(function() {

						// Refresh the sub views
						module.refreshOrderRecord();
						module.refreshCartSummary();

						// Remove the loading indicator
						cbj('#subview-payment li.processing').removeClass('processing');

						// Trigger the event for 'payment saved'
						cbj(document).trigger('cb.checkout.payment_saved');

					});

			});

			cbj(document).on('click', '.trigger-show-terms', function() {
				cbrequire(['cbj.bootstrap'], function() {
					cbj('#modal-terms').modal();
				});
			});

			cbj(document).on('click', '.trigger-show-refund-policy', function() {
				cbrequire(['cbj.bootstrap'], function() {
					cbj('#modal-refund-policy').modal();
				});
			});

			cbj(document).on('click', '.trigger-place-order', function() {

				var button = cbj(this);

				// Don't process if clicked already
				if (button.hasClass('processing') === true) {
					return;
				}
				// Add the css class flag
				button.addClass('processing');

				var termsAgreementMissing = false;
				var refundsAgreementMissing = false;

				var agreeTermsRequired = cbj(this).closest('.view-checkout').data('agree-to-terms');
				var agreeRpRequired = cbj(this).closest('.view-checkout').data('agree-to-rp');
				var textAgreeToTerms = cbj(this).closest('.view-checkout').data('text-agree-terms');
				var textAgreeToRp = cbj(this).closest('.view-checkout').data('text-agree-rp');
				var textAgreeToBoth = cbj(this).closest('.view-checkout').data('text-agree-both');

				if (agreeTermsRequired) {
					var agreed = cbj('#agreement-terms').prop('checked');
					if (agreed === false) {
						termsAgreementMissing = true;
					}
				}
				if (agreeRpRequired) {
					var agreedRp = cbj('#agreement-refund-policy').prop('checked');
					if (agreedRp === false) {
						refundsAgreementMissing = true;
					}
				}

				var agreementsMissingMessage = '';

				// If both terms and refund policy missing
				if (termsAgreementMissing && refundsAgreementMissing) {
					agreementsMissingMessage = textAgreeToBoth;
				}
				// If the terms missing
				if (termsAgreementMissing && !refundsAgreementMissing) {
					agreementsMissingMessage = textAgreeToTerms;
				}
				// If the refund policy missing
				if (!termsAgreementMissing && refundsAgreementMissing) {
					agreementsMissingMessage = textAgreeToRp;
				}

				// Show and bounce if agreements are missing
				if (agreementsMissingMessage) {
					cbj(this).removeClass('processing');
					window.alert(agreementsMissingMessage);
					return;
				}

				cbrequire(['configbox/customerform'], function(customerForm) {

					// Place the order (set's the status to 'ordered');
					server.placeOrder()
						.done(function(response) {

							button.removeClass('processing');

							if (response.success === false) {
								window.alert(response.errors.join("\n"));
								return;
							}

							// Prepare  data for the tracking event
							var eventData = {
								customerData: customerForm.getCustomerFormData(),
								orderData: module.getOrderMetaData()
							};

							// Fire the event for 'order placed'
							cbj(document).trigger('cb.checkout.order_placed', eventData);

							// Then load the PSP bridge and get going with the payment
							var url = button.closest('.view-checkout').data('url-psp-view');
							cbj('.wrapper-psp-bridge').load(url, function(){
								cbj('.trigger-redirect-to-psp').trigger('click');
							});

						});

				});

			});

			// Make sure firing click events on the .trigger-redirect-to-psp link redirect (apparently there are cases where
			// it's not the case). After order placement the system triggers that click.
			cbj(document).on('click', '.trigger-redirect-to-psp', function(){
				if (typeof(cbj(this).attr('href')) !== 'undefined') {
					window.location = cbj(this).attr('href');
				}
				else {
					cbj(this).closest('form').submit();
				}
			});

		},

		refreshOrderAddress : function(callback) {

			var url = cbj('.kenedo-view.view-checkout').data('url-address-view');

			// Refresh the order address display and toggle
			cbj('.wrapper-order-address .order-address-display').load(url, function() {
				cbj('.wrapper-order-address .order-address-display').slideDown();
				cbj('.wrapper-order-address .order-address-form').slideUp();
				if (callback) {
					callback();
				}
			});
		},

		refreshCartSummary: function(callback) {

			var url = cbj('.kenedo-view.view-cart').data('url-cart-summary');

			if (url) {

				server.injectHtml(cbj('.wrapper-cart-summary'), 'cart', 'reloadCartSummary', {}, function() {

					cbj('.button-copy-product, .button-edit-product, .button-remove-product, .trigger-edit-quantity, .trigger-remove-position').hide();

					cbj('*[data-toggle=popover]').popover({
						trigger 	: 'hover',
						delay		: 200,
						html		: true
					});

					if (callback) {
						callback();
					}

				});
			}
		},

		refreshDeliveryOptions : function(callback) {

			var url = cbj('.kenedo-view.view-checkout').data('url-delivery-view');

			cbj('.wrapper-delivery-options').load(url, {}, function() {
				cbj(document).trigger('cbViewInjected');
				if (callback) {
					callback();
				}
			});
		},

		refreshPaymentOptions : function(callback) {

			var url = cbj('.kenedo-view.view-checkout').data('url-payment-view');

			cbj('.wrapper-payment-options').load(url, {}, function() {
				cbj(document).trigger('cbViewInjected');
				if (callback) {
					callback();
				}
			});
		},

		refreshOrderRecord : function(callback) {

			var url = cbj('.kenedo-view.view-checkout').data('url-order-view');
			cbj('.wrapper-order-record').load(url, {}, function() {
				cbj(document).trigger('cbViewInjected');
				if (callback) {
					callback();
				}
			});
		},

		/**
		 * Returns meta data about the order and positions. Intended for use in tracking code. See
		 * ConfigboxViewRecord::$orderMetaData
		 * @returns {object}
		 */
		getOrderMetaData: function() {

			var tag = cbj('.kenedo-view.view-record #order-meta-data');

			// Let it be in case there is none
			if (tag.length === 0) {
				throw('Cannot find order meta data script tag in view record. The template may need an update, compare with original template of view \'record\'.');
			}

			// Get the data as array of objects
			return JSON.parse(tag.text());

		}

	};

	return module;

});