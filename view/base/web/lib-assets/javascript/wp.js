/**
 * @module configbox/wp
 */
define(['cbj', 'configbox/configurator', 'configbox/server'], function(cbj, configurator, server) {

	"use strict";

	/**
	 * @exports configbox/wp
	 */
	var module = {

		loadConfigurator: function() {

			var view = cbj('.view-wpconfigurator');

			var data = {
				"pageId": view.data('page-id')
			};

			server.injectHtml(
				view,
				'wpconfigurator',
				'getConfiguratorHtml',
				data, function() {
					cbj(document).trigger('cbConfiguratorInjected');
				});

		}

	};

	return module;
});