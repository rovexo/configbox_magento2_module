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

			server.injectHtml(view, 'm2configurator', 'getConfiguratorHtml', data, privateMethods.onConfiguratorLoaded);

		}

	};

	var privateMethods = {

		onConfiguratorLoaded: function() {
			cbj(document).on('cbPricingChange', privateMethods.updateMagento2Total);
			// Trying to make this event the standard for customizations to listen to when it comes to reacting
			// config on page loads
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