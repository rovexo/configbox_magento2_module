define(['cbj', 'configbox/server'], function($, server) {

	return {

		initViewOnce: function() {

			console.log('Runs once per page load');

			$(document).on('click', '.trigger-load-json', function() {

				server.makeRequest('examples', 'getAsJson', {})

					.done(function(json) {
						console.log(json);
					});

			});

			$(document).on('click', '.trigger-inject-view', function() {

				let target = $('.target-examples1-view');
				let controller = 'examples1';
				let task = 'display';

				target.html('<i class="fas fa-spin fa-spinner"></i>');

				server.injectHtml(target, controller, task,{}, function() {
					console.log('Callback for injecting examples1 view fired.');
				});
			});

		},

		initViewEach: function() {
			console.log('Runs at page load and again each time this view gets injected.');
		}

	};

});