define(['cbj', 'configbox/server'], function($, server) {

	return {

		initViewOnce: function() {
			console.log('View examples1 runs its initOnce method');
		},

		initViewEach: function() {
			console.log('View examples1 runs its initEach method');
		}

	};

});