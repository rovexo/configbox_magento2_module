/**
 * @module configbox/adminCurrencies
 */
define(['cbj', 'configbox/server', 'kenedo'], function(cbj, server, kenedo) {

	"use strict";

	/**
	 * @exports configbox/adminCurrencies
	 */
	var module = {

		initListEach: function (view) {

			var list = view.find('.kenedo-listing-form');

			if (list.hasClass('default-handlers-attached') === true) {
				list.on('cbListTaskTriggered', module.onListTaskTriggered);
				list.on('cbListTaskResponseReceived', module.onListTaskResponseReceived);
			}
			else {
				list.on('cbDefaultHandlersAttached', function() {
					list.on('cbListTaskTriggered', module.onListTaskTriggered);
					list.on('cbListTaskResponseReceived', module.onListTaskResponseReceived);
				});
			}

		},

		/**
		 *
		 * @listens event:cbListTaskTriggered
		 * @param event
		 * @param {taskInfo} taskInfo
		 */
		onListTaskTriggered: function(event, taskInfo) {

			switch (taskInfo.task) {

				case 'makeDefault':

					var ids = kenedo.getCheckedListItemIds(taskInfo.list);

					server.makeRequest('admincurrencies', 'makeDefault', {ids: ids.join(',')})

						.then(function(data, textStatus, jqXhr) {
							/**
							 * @event cbListTaskResponseReceived
							 */
							taskInfo.list.trigger('cbListTaskResponseReceived', [jqXhr, taskInfo]);
						});

					break;

				case 'makeBase':

					var ids = kenedo.getCheckedListItemIds(taskInfo.list);

					server.makeRequest('admincurrencies', 'makeBase', {ids: ids.join(',')})

						.then(function(data, textStatus, jqXhr) {
							/**
							 * @event cbListTaskResponseReceived
							 */
							taskInfo.list.trigger('cbListTaskResponseReceived', [jqXhr, taskInfo]);
						});

					break;

			}

		},

		/**
		 * @listens event:cbListTaskResponseReceived
		 *
		 * @param {event} event
		 * @param {jqXHR} xhr
		 * @param {taskInfo} taskInfo
		 */
		onListTaskResponseReceived: function(event, xhr, taskInfo) {

			try {
				var data = JSON.parse(xhr.responseText);
			}
			catch(e) {
				console.warn('Could not parse JSON response. Response text was: "' + xhr.responseText + '"');
				console.warn('Error message follows:');
				console.warn(e);
				return;
			}

			switch (taskInfo.task) {

				case 'makeDefault':
				case 'makeBase':

					if (data.success === false) {
						kenedo.showResponseMessages(taskInfo.list, data.errors || [], data.messages || []);
						return;
					}

					var viewWrapper = taskInfo.list.closest('.kenedo-view').closest('div');
					kenedo.refreshList(taskInfo.list, function() {
						kenedo.showResponseMessages(viewWrapper.find('.kenedo-listing-form').first(), data.errors || [], data.messages || []);
					});
					break;

			}
		}

	};

	return module;

});