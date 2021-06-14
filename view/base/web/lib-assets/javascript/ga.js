/* global require, cbrequire, requirejs, define, console: false */

/**
 * @module configbox/ga
 */
define(['cbj'], function(cbj) {

	"use strict";

	/**
	 * @exports configbox/ga
	 */
	var module = {

		/**
		 * Init code for product listing pages (see ConfigboxViewProductListing).
		 */
		initEcListingPage: function() {

			// Get the script tag holding the product data JSON (see template analytic-data in template folder)
			var productListDataTag = cbj('#product-list-data');

			// Let it be in case there is none
			if (productListDataTag.length === 0) {
				throw('Cannot find product list data in script tag with ID #product-list-data. Template may need an update, compare with original template.');
			}

			// Get the data as array of objects
			var productListData = JSON.parse(productListDataTag.text());

			// Track product impressions on all products in the list
			module.trackProductImpressions(productListData);

			cbj('.trigger-ga-track-product-click').click(function(e) {

				// In case the GA plugin isn't loaded on the site, don't do anything
				if (!module.gaLoaded()) {
					return;
				}

				// Prevent the link click default for now
				e.preventDefault();

				// Extract product data needed for the tracking
				var el = cbj(this);
				var url = el.attr('href');
				var productId = el.data('id');

				var productData = productListData.find( function (item) {
					return parseInt(item.product_id) === productId;
				} );

				module.trackProductClick(productData, function () {
					document.location = url;
				});

			});

			cbj('.trigger-ga-track-add-to-cart').click(function(e) {

				// In case the GA plugin isn't loaded on the site, don't do anything
				if (!module.gaLoaded()) {
					return;
				}

				// Prevent the link click default for now
				e.preventDefault();

				// Extract product data needed for the tracking
				var el = cbj(this);
				var url = el.attr('href');
				var productId = el.data('id');
				var productData = productListData.find(function(item) {
					return parseInt(item.product_id) === productId;
				});
				module.trackAddToCart(productData, function () {
					document.location = url;
				});

			});
		},

		/**
		 * Init code for product pages (see ConfigboxViewProduct).
		 */
		initEcProductPage: function() {

			// Get the script tag holding the product data JSON (see template analytic-data in template folder)
			var productDataTag = cbj('#product-data');

			// Let it be in case there is none
			if (productDataTag.length === 0) {
				throw('Cannot find product page data in script tag with ID #product-data. Template may need an update, compare with original template.');
			}

			// Extract the product's data
			var productData = JSON.parse(productDataTag.text());

			// Track the product impression
			module.trackProductDetailView(productData);

			// Add to cart click handler
			cbj('.trigger-ga-track-add-to-cart').click(function(e) {

				// Ignore in case we got no GA plugin at all
				if (!module.gaLoaded()) {
					return;
				}

				// Prevent the default click action
				e.preventDefault();

				var url = cbj(this).attr('href');
				module.trackAddToCart(productData, function () {
					document.location = url;
				});

			});

		},

		/**
		 * Init code for product listing pages (see ConfigboxViewConfiguratorpage).
		 */
		initEcConfiguratorPage: function() {

			// Get the script tag holding the product data JSON (see template metadata in template folder)
			var productDataTag = cbj('#product-data');

			// Let it be in case there is none
			if (productDataTag.length === 0) {
				throw('Cannot find Configurator Page data in script tag with ID #product-data. Template may need an update, compare with original template.');
			}

			// Extract the product's data
			var productData = JSON.parse(productDataTag.text());

			// Track the product impression
			module.trackProductImpressions(productData);

			// Add to cart click handler
			cbj('.trigger-ga-track-add-to-cart').click(function(e) {

				// Ignore in case we got no GA plugin at all
				if (!module.gaLoaded()) {
					return;
				}

				// Prevent the default click action
				e.preventDefault();

				var url = cbj(this).attr('href');
				module.trackAddToCart(productData, function () {
					document.location = url;
				});

			});

		},
		/**
		 * Init code for product cart page (see ConfigboxViewCart).
		 */
		initEcCartPage: function() {

			// Add to remove click handler from cart
			cbj('.trigger-ga-track-remove-position').click(function(e) {

				// Ignore in case we got no GA plugin at all
				if (!module.gaLoaded()) {
					return;
				}

				// Prevent the default click action
				e.preventDefault();

				// Get the script tag holding the cart data JSON (see template metadata in template folder)
				var cartsDataTag = cbj('#cart-data');

				// Let it be in case there is none
				if (cartsDataTag.length === 0) {
					throw('Cannot find cart page data in script tag with ID #cart-data. Template summary in cart view may need an update, compare with original template.');
				}

				// Extract the cart's data
				var cartData = JSON.parse(cartsDataTag.text());

				// Extract product data needed for the tracking
				var el = cbj(this);
				var url = el.attr('href');
				var positionId = el.attr('data-position-id');

				// In case the cart templates are outdated
				if (!positionId) {
					throw('Cannot find position-id data attribute in the position remove link. Template positioncontrols.php and summary.php in cart view may need an update, compare with original template.');
				}

				var cartPositionData = cartData.find( function (item) {
					return item.positionId === positionId;
				});

				module.trackRemoveFromCart(cartPositionData, function () {
					document.location = url;
				});

			});

		},
		/**
		 * Init code for checkout page (see ConfigboxViewCheckout).
		 */
		initEcCheckoutPage: function() {

			// Track checkout start (1)
			cbrequire(['configbox/checkout'], function(checkout) {
				var orderData = checkout.getOrderMetaData();
				module.trackCheckoutVisit(orderData);
			});

			// Track address saved (2)
			cbj(document).on('cb.checkout.address_saved', function() {
				module.trackCheckoutFunnelStep(2);
			});

			// Track payment saved (3)
			cbj(document).on('cb.checkout.payment_saved', function() {
				module.trackCheckoutFunnelStep(3);
			});

			// Track delivery saved (4)
			cbj(document).on('cb.checkout.delivery_saved', function() {
				module.trackCheckoutFunnelStep(4);
			});

			// Track order placed (5) (mind that this is just a funnel step, actual payment makes the final conversion or transaction
			cbj(document).on('cb.checkout.order_placed', function() {
				module.trackCheckoutFunnelStep(5);
			});

		},

		/**
		 * Helper var for getGaObject. Tells if the EC plugin got required already
		 */
		ecPluginGotRequired: false,

		/**
		 * Returns the GA plugin object (loads the EC plugin as well). If the plugin didn't load yet, it'll return
		 * the placeholder function for queuing commands.
		 * @returns {*}
		 */
		getGaObject: function() {
			// Set up the ga placeholder function if GA plugin isn't loaded yet
			window.ga = window.ga || function() {
				(window.ga.q = window.ga.q || []).push(arguments);
			};

			window.ga.l=+new Date();

			// Load the EC plugin
			if(module.ecPluginGotRequired === false) {
				window.ga('require', 'ec');
				module.ecPluginGotRequired = true;
			}

			return window.ga;

		},

		/**
		 * Gives you the client ID in the provided callback function's first parameter
		 * @param {function} callback
		 */
		getClientId: function(callback) {

			var ga = module.getGaObject();

			ga(function() {

				var trackers = ga.getAll();

				if (trackers.length === 0) {
					throw ('Tried to get GA trackers, but none found');
				}

				var tracker = trackers[0];
				var clientId = tracker.get('clientId');

				callback(clientId);

			});

		},

		/**
		 * The method tells you if the GA plugin is really loaded. Useful in click handler to know if we actually use
		 * GA or not
		 * @returns {boolean}
		 */
		gaLoaded: function() {
			return (typeof module.getGaObject().loaded !== 'undefined');
		},

		/**
		 * Data comes from ConfigboxViewProductlisting, template metadata.php
		 *
		 * @param {Array|{id: number|string, product_id: number, name: string, list: string}[]} data
		 */
		trackProductImpressions: function(data) {

			if(window.gtag) {

				window.gtag('event', 'view_item_list',{
					'event_category': 'configbox',
					'event_label': 'Product impressions',
					'items':data
				});

			} else {
				var ga = module.getGaObject();

				if (cbj.isArray(data)) {
					for (var i=0; i < data.length; i++) {
						ga('ec:addImpression', data[i]);
					}
				} else {
					ga('ec:addImpression', data);
				}

				ga('send', 'event', 'configbox', 'view_product_list', 'Product impressions', {
					nonInteraction: true
				});
			}
		},

		/**
		 * Data comes from ConfigboxViewProductlisting, template metadata.php
		 *
		 * @param {{id: number|string, product_id: number, name: string, list: string}} data
		 * @param callback
		 */
		trackProductClick: function(data, callback) {

			if(window.gtag) {

				window.gtag('event', 'select_content',{
					'event_category' : 'configbox',
					'event_label' : 'Product click',
					'items':data,
					'event_callback' : callback
				});

			} else {
				var ga = module.getGaObject();
				ga('ec:addProduct', data);

				ga('ec:setAction', 'click', {
					'list': data.list
				});
				ga('send', 'event', 'configbox', 'product_click', 'Product click', {
					hitCallback: callback
				});
			}

		},

		/**
		 * Data comes from either ConfigboxViewConfiguratorpage or ConfigboxViewProduct, template metadata.php
		 *
		 * @param {{id: number|string, product_id: number, name: string, list: string}} data
		 */
		trackProductDetailView: function(data) {

			if (window.gtag) {

				window.gtag('event', 'view_item', {
					'event_category': 'configbox',
					'event_label': 'Product detail view',
					'items': data
				});

			} else {

				var ga = module.getGaObject();
				ga('ec:addProduct', data);

				ga('ec:setAction', 'detail');

				ga('send', 'event', 'configbox', 'view_item', 'Product detail view', {
					nonInteraction: true
				});
			}
		},

		/**
		 * Data comes from ConfigboxViewCart, template metadata.php
		 *
		 * @param {{id: number|string, name: string}} data
		 * @param callback
		 */
		trackAddToCart: function(data, callback) {

			if (window.gtag) {

				window.gtag('event', 'add_to_cart', {
					'event_category': 'configbox',
					'event_label': 'Add cart position',
					'items': data,
					'event_callback': callback
				});

			} else {

				var ga = module.getGaObject();
				ga('ec:addProduct', data);
				ga('ec:setAction', 'add');
				ga('send', 'event', 'configbox', 'add_to_cart', 'Add cart position' , {
					hitCallback: callback
				});
			}
		},

		/**
		 * Data comes from ConfigboxViewCart, template metadata.php
		 *
		 * @param {{id: number|string, name: string}} data
		 * @param callback
		 */
		trackRemoveFromCart: function(data, callback) {

			if (window.gtag) {

				window.gtag('event', 'remove_to_cart', {
					'event_category': 'configbox',
					'event_label': 'Remove cart position',
					'items': data,
					'event_callback': callback
				});

			} else {

				var ga = module.getGaObject();
				ga('ec:addProduct', data);
				ga('ec:setAction', 'remove');
				ga('send', 'event', 'configbox', 'remove_to_cart', 'Remove cart position' , {
					hitCallback: callback
				});
			}

		},

		/**
		 * Data comes from ConfigboxViewOrderrecord, template metadata.php
		 *
		 * @param {{
		 * 	orderId: number,
		 * 	cartId: number,
		 * 	userId: number,
		 * 	currencyCode: string
		 * 	orderGrandTotalNet: number,
		 * 	orderGrandTotalTax: number,
		 * 	orderGrandTotalGross: number,
		 * 	deliveryNet: number,
		 * 	deliveryTax: number,
		 * 	deliveryGross: number,
		 * 	paymentNet: number,
		 * 	paymentTax: number,
		 * 	paymentGross: number,
		 * 	positions: [
		 * 		{
		 * 		positionId: number,
		 * 		quantity: number,
		 * 		productId: number
		 * 		productSku: string,
		 * 		productTitle: string,
		 * 		pricePerItemNet: number,
		 * 		pricePerItemTax: number,
		 * 		pricePerItemGross: number,
		 *
		 * 		}
		 * 	]
		 *
		 * }} data
		 */
		trackCheckoutVisit: function(data) {

			if(window.gtag) {

				window.gtag('set', {'currencyCode': data.currencyCode});

				window.gtag('event', 'begin_checkout', {
					'event_category': 'configbox',
					'event_label': 'checkout start',
					"items": function () {

						var result = [];

						for (var i in data.positions) {
							if (data.positions.hasOwnProperty(i) === true) {

								var position = data.positions[i];

								result.push({
									'id': position.productId,
									'position': position.positionId,
									'name': position.productTitle,
									'price': position.pricePerItemGross,
									'quantity': position.quantity
								});

							}
						}

						return result;
					}

				});

			} else {

				var ga = module.getGaObject();

				ga('set', 'currencyCode', data.currencyCode);

				for (var i in data.positions) {
					if (data.positions.hasOwnProperty(i) === true) {
						var position = data.positions[i];
						ga('ec:addProduct', {
							'id': position.productId,
							'position': position.positionId,
							'name': position.productTitle,
							'price': position.pricePerItemGross,
							'quantity': position.quantity
						});
					}
				}

				ga('ec:setAction','checkout', {
					'step': 1
				});

				ga('send', 'event', 'configbox', 'begin_checkout', 'checkout start');

			}
		},

		/**
		 * @param {number} stepNumber
		 */
		trackCheckoutFunnelStep: function(stepNumber) {

			if (window.gtag) {

				window.gtag('event', 'checkout_step', {
					'event_category': 'configbox',
					'event_label': 'Funnel step',
					'checkout_step': stepNumber
				});

			} else {

				var ga = module.getGaObject();

				ga('ec:setAction','checkout', {
					'step': stepNumber
				});

				ga('send', 'event', 'configbox', 'click', 'Funnel step');
			}
		}
	};

	return module;

});
