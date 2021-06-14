/**
 * @module configbox/productTour
 */
define(['cbj', 'configbox/server', 'cbj.bootstrap'], function(cbj, server) {

    "use strict";

    /**
     * @exports configbox/productTour
     */
    var module = {

		initAdminProductTour: function() {

			cbj('.cb-popover').popover();

			var stops = cbj('.view-adminproducttour .tour-stop');

			cbj.each(stops, function() {
				var stop = cbj(this);
				var selector = stop.data('selector');
				var title = stop.data('title') ? stop.data('title') : '';
				var html = stop.html().trim();
				var step = stop.data('step');

				var popover = cbj('.view-adminproducttour .popover-blueprint .popover').clone();
				popover.find('.popover-title').text(title);
				popover.find('.popover-content').html(html);

				var test = popover.html();

				cbj('.view-adminproducttour .popover-staging').html('').append(popover);

			});


        }

    };

    return module;

});
