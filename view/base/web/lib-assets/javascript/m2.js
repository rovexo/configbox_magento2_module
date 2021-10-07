/**
 * @module configbox/m2
 */
define(['cbj', 'configbox/configurator', 'configbox/server'], function(cbj, configurator, server) {

	"use strict";

	/**
	 * @exports configbox/m2
	 */
	var module = {

		loadConfigurator: function() {

			var view = cbj('.view-m2configurator');

			var data = {
				"configInfo": view.data('config-info'),
				"taxRate": view.data('tax-rate'),
			};

			// We hide the price box and make it visible again when privateMethods.setMagento2Total() is done
			cbj('.price-box').css('visibility', 'hidden'); 

			server.injectHtml(view, 'm2configurator', 'getConfiguratorHtml', data, privateMethods.onConfiguratorLoaded);

		}

	};

	var privateMethods = {

		onConfiguratorLoaded: function() {

			// Updates the M2 price box on selection changes
			cbj(document).on('cbPricingChange', privateMethods.updateMagento2Total);

			// Sets the m2 price box pricing on load
			privateMethods.setMagento2Total();

			// This event indicates that the configurator page is ready to go
			cbj(document).trigger('cbConfiguratorInjected');

			privateMethods.initMagento2Validation();
			privateMethods.loadVisualization();
		},

		onVisualizationLoaded: function() {
			configurator.initImagePreloading();
		},

		/**
		 * The method adds a jquery.validator method ('configbox_m2_validation')
		 * It kicks in on M2 add-to-cart form submits
		 * It checks for missing CB selections and not only responds with true/false but also shows validation messages (
		 * until a solution is found, that
		 */
		initMagento2Validation: function() {

			window.require(['jquery', 'mage/validation'], function($) {

				$.validator.addMethod(
					'configbox_m2_validation',
					function (value, element) {

						var missingSelections = configurator.getConfiguratorData('missingProductSelections');

						if (missingSelections.length === 0) {

							var questions = configurator.getConfiguratorData('questions');

							cbj.each(questions, function() {
								configurator.clearValidationError(this.id);
							});

							return true;
						}
						else {

							var shouldPageId = parseInt(missingSelections[0].pageId);

							if (shouldPageId !== configurator.getPageId()) {
								configurator.switchPage(shouldPageId, function() {
									// Timeout as workaround (questions may not have finished registration)
									window.setTimeout(function() {
										configurator.addValidationErrors(missingSelections);
									}, 100);

								});
							}
							else {
								configurator.addValidationErrors(missingSelections);
							}

							return false;
						}

					},
					'' // Empty validation response (for not showing M2's validation message)
				);

			});

		},

		/**
		 * For setting the price in the M2 price box (original price box does not include any CB prices)
		 */
		setMagento2Total: function() {

			let cartPositionId = configurator.getCartPositionId();
			server.makeRequest('m2configurator', 'getPricing', {"cartPositionId": cartPositionId})

				.done(function(pricing) {
					privateMethods.updateMagento2Total(null, pricing);
					cbj('.price-box').css('visibility', 'visible');
				});

		},

		/**
		 * @listens Event:cbPricingChange
		 * @param {Event} event
		 * @param {JsonResponses.configuratorUpdates.pricing} pricing
		 */
		updateMagento2Total: function(event, pricing) {

			var price = pricing.total.price;
			var priceNet = pricing.total.priceNet;
			var optionId = cbj('.view-m2configurator').data('magento-option-id');
			var selectorPriceBox = '.price-box';

			window.require(['jquery'], function($)
			{

				var key = 'options[' + optionId + ']';

				var newPrice = {};

				newPrice[key] = {
					'oldPrice': {
						'amount': priceNet,
						'adjustments': []
					},
					'basePrice': {
						'amount': priceNet
					},
					'finalPrice': {
						'amount': price
					}
				};

				$(selectorPriceBox).trigger('updatePrice', newPrice);

			});

		},

		loadVisualization: function() {

			var configuratorView = cbj('.view-configuratorpage');
			var visView = cbj('.view-m2visualization');

			var data = {
				positionId: configuratorView.data('cart-position-id'),
				productId: configuratorView.data('product-id'),
				pageId: configuratorView.data('page-id')
			};

			server.injectHtml(visView, 'm2configurator', 'getVisualizationHtml', data, privateMethods.onVisualizationLoaded);

		}

	};

	return module;
});