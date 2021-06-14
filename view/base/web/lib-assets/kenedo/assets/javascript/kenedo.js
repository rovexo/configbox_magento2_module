/**
 * @module kenedo
 */
define(['cbj', 'configbox/server'], function(cbj, server) {

	"use strict";

	/**
	 * @exports kenedo
	 */
	var kenedo = {

		initAdminPageEach: function(view) {

			// Attach task button listeners to lists
			view.find('.kenedo-listing-form:not(.default-handlers-attached)').each(function() {

				var list = cbj(this);

				list.find('.trigger-kenedo-list-task').each(function() {
					cbj(this).on('click', kenedo.onListTaskButtonClicked);
				});

				list.on('cbListTaskTriggered', kenedo.onListTaskTriggered);
				list.on('cbListTaskResponseReceived', kenedo.onListTaskResponseReceived);

				list.addClass('default-handlers-attached');
				list.trigger('cbDefaultHandlersAttached');

			});

			// Attach task button listeners to detail forms
			view.find('.kenedo-details-form:not(.default-handlers-attached)').each(function() {

				var form = cbj(this);

				form.find('.trigger-kenedo-form-task').each(function() {
					cbj(this).on('click', kenedo.onFormTaskButtonClicked);
				});

				form.on('cbFormTaskTriggered', kenedo.onFormTaskTriggered);
				form.on('cbFormTaskResponseReceived', kenedo.onFormTaskResponseReceived);

				form.addClass('default-handlers-attached');
				form.trigger('cbDefaultHandlersAttached');

			});

		},

		initAdminPageOnce: function() {

			// Event handlers for common Kenedo form and listing tasks
			cbj(document).on('click',  '.kenedo-listing-form .trigger-order-list', kenedo.onChangeListOrder);
			cbj(document).on('click',  '.kenedo-listing-form .trigger-change-page', kenedo.onChangeListPage);
			cbj(document).on('change', '.kenedo-listing-form .kenedo-limit-select', kenedo.onChangeListLimit);
			cbj(document).on('change', '.kenedo-listing-form .listing-filter', kenedo.onChangeListFilters);
			cbj(document).on('click',  '.kenedo-listing-form .trigger-toggle-record-activation', kenedo.onToggleRecordActivation);
			cbj(document).on('click', '.kenedo-listing-form .kenedo-check-all-items', kenedo.toggleCheckboxes);
			cbj(document).on('click', '.kenedo-listing-form .listing-link', kenedo.openListingLink);

			window.addEventListener('popstate', function(event) {

				if (typeof(event.state) != 'undefined' && event.state !== null && event.state.isSubview === true) {
					kenedo.loadSubview(event.state.url, event.state.targetSelector, event.state.callbackFunction, false);
					event.preventDefault();
				}

			});

			// Prevent Bootstrap dialog from blocking focusin
			cbj(document).on('focusin', function(e) {
				if (cbj(e.target).closest(".tox-tinymce, .tox-tinymce-aux, .moxman-window, .tam-assetmanager-root").length) {
					e.stopImmediatePropagation();
				}
			});

			// ajax-target-links do a pushState and load via loadSubview
			cbj(document).on('click', '.ajax-target-link', function(event) {

				event.preventDefault();

				// If the user held shift or the Win/Cmd button, let the browser open a new tab/window
				if (event.shiftKey === true && event.metaKey === true) {
					return;
				}

				var url = cbj(this).attr('href');
				kenedo.loadSubview(url);

			});

			cbj(document).on('click', '.task-toggle-help', function() {
				var btn = cbj(this);
				btn.toggleClass('active');
				btn.closest('.kenedo-details-form').toggleClass('show-help');
			});


			// Handler for opening modals on clicks on .trigger-open-modal
			cbj(document).on('click', '.trigger-open-modal', kenedo.onOpenColorBoxModal);

			// New tab links
			cbj(document).on('click','.kenedo-new-tab', function(event) {
				window.open(this.href);
				event.preventDefault();
			});

			// Language switcher for translatables
			cbj(document).on('click', '.property-type-translatable .language-switcher', function(){
				var wrapper = cbj(this).closest('.kenedo-property');
				cbj(this).siblings().removeClass('active');
				cbj(this).addClass('active');

				var selector = cbj(this).attr('for');
				wrapper.find('#translation-' + selector).show().siblings().hide();

			});

			// Trigger event when form content changes
			cbj(document).on('change','.kenedo-property :input', function(){

				var form = cbj(this).closest('.kenedo-details-form');
				var propName = cbj(this).closest('.kenedo-property').attr('id').replace('property-name-','');
				var value = cbj(this).val();
				var record = form.data('record');

				if (typeof(record[propName]) != 'undefined') {
					record[propName] = value;
				}

				/**
				 * @event kenedoFormDataChanged
				 */
				cbj(this).closest('.kenedo-details-form').trigger('kenedoFormDataChanged', [record, form]);

			});

			// Toggle form field groups display
			cbj(document).on('click','.property-group-using-toggles>.property-group-legend', function() {

				if (cbj(this).closest('.property-group').hasClass('property-group-opened')) {
					cbj(this).closest('.property-group').removeClass('property-group-opened').addClass('property-group-closed');
					cbj(this).closest('.property-group').find('.property-group-toggle-state').val('closed');
				}
				else {
					cbj(this).closest('.property-group').removeClass('property-group-closed').addClass('property-group-opened');
					cbj(this).closest('.property-group').find('.property-group-toggle-state').val('opened');
				}

			});

			// Link to show the file upload input for file upload fields
			cbj(document).on('click', '.show-file-uploader', function(event){

				event.preventDefault();

				// Store the empty input field for replacement on cancel (this makes it possible to 'reset'
				// the file upload input element when clicking cancel and preventing unwanted storage)
				var inputField = cbj(this).closest('.property-body').find('.file-upload-field').clone();
				cbj(this).data('inputfield',inputField);

				cbj(this).closest('.property-body').find('.file-uploader').slideDown(300);
				cbj(this).closest('.property-body').find('.file-current-file, .file-delete, .file-upload').slideUp(300);

			});

			// Link to hide it again
			cbj(document).on('click', '.file-upload-cancel', function(event){

				event.preventDefault();

				cbj(this).closest('.property-body').find('.file-uploader').slideUp(300);
				cbj(this).closest('.property-body').find('.file-current-file, .file-delete, .file-upload').slideDown(300);

				// Get the saved empty input field and replace it (See handler above for reference)
				var inputField = cbj(this).closest('.property-body').find('.show-file-uploader').data('inputfield');
				cbj(this).closest('.property-body').find('.file-upload-field').replaceWith(inputField);

			});

			/* EVENT HANDLERS FOR KENEDO POPUPS - START */

			// Open the popup when the trigger was entered
			cbj(document).on('mouseenter', '.kenedo-popup-trigger', KenedoPopup.cancelClosing);
			cbj(document).on('mouseenter', '.kenedo-popup-trigger', KenedoPopup.scheduleOpening);

			// Close when trigger was left
			cbj(document).on('mouseleave', '.kenedo-popup-trigger', KenedoPopup.scheduleClosing);
			cbj(document).on('mouseleave', '.kenedo-popup-trigger', KenedoPopup.cancelOpening);

			// Close when popup was left
			cbj(document).on('mouseleave', '.kenedo-popup', KenedoPopup.scheduleClosing);

			// Cancel closing when popup is entered (so also when re-entered)
			cbj(document).on('mouseenter', '.kenedo-popup', KenedoPopup.cancelClosing);

			// Prevent clicks on trigger making selections (or whatever the click would trigger)
			cbj('.kenedo-popup-trigger').click(function(event){
				event.stopPropagation();
				event.preventDefault();
				cbj(this).trigger('mouseenter');
			});

			/* EVENT HANDLERS FOR KENEDO POPUPS - END */

			cbj(document).on('click', '.trigger-select-all-multi', function() {
				cbj(this).closest('.kenedo-property').find('.property-body option').prop('selected', true);
				cbj(this).closest('.kenedo-property').find('.property-body input').prop('checked', true);
			});

			cbj(document).on('click', '.trigger-deselect-all-multi', function() {

				cbj(this).closest('.kenedo-property').find('.property-body option').prop('selected', false);
				cbj(this).closest('.kenedo-property').find('.property-body input').prop('checked', false);

			});

		},

		onChangeListOrder: function() {
			var link = cbj(this);
			var list = link.closest('.kenedo-listing-form');
			var propertyName = link.data('property-name');
			var currentDir = link.data('current-direction');
			var direction = (currentDir === '' || currentDir === 'desc') ? 'asc':'desc';

			kenedo.setListParameter(list, 'listing_order_property_name', propertyName);
			kenedo.setListParameter(list, 'listing_order_dir', direction);
			kenedo.refreshList(list);
		},

		onChangeListPage: function() {
			var link = cbj(this);
			var list = link.closest('.kenedo-listing-form');
			var start = parseInt(link.data('start'));
			kenedo.setListParameter(list, 'limitstart', start);
			kenedo.refreshList(list);
		},

		onChangeListLimit: function() {
			var select = cbj(this);
			var list = select.closest('.kenedo-listing-form');
			kenedo.setListParameter(list, 'limit', select.val());
			kenedo.refreshList(list);
		},

		onChangeListFilters: function() {
			var list = cbj(this).closest('.kenedo-listing-form');
			kenedo.refreshList(list);
		},

		/**
		 *
		 * @param {jQuery} list
		 * @param {String} key
		 * @param {mixed} value
		 */
		setListParameter: function(list, key, value) {
			list.find('.listing-data[data-key=' + key + ']').data('value', value);
		},

		/**
		 *
		 * @param {jQuery} list
		 * @param {String} key
		 * @param {=mixed} fallback
		 * @returns {*}
		 */
		getListParameter: function(list, key, fallback) {
			var value = list.find('.listing-data[data-key=' + key + ']').data('value');
			if (typeof value === 'undefined') {
				return fallback;
			}
			else {
				return value;
			}
		},

		/**
		 *
		 * @param {jQuery} list
		 * @returns {*}
		 */
		getListParameters: function(list) {
			var parameters = {};
			list.find('.listing-data').each(function() {
				var key = cbj(this).data('key');
				parameters[key] = cbj(this).data('value');
			});
			return parameters;
		},

		getListFilters: function(list) {
			var filters = {};
			list.find('.listing-filter').each(function() {
				var key = cbj(this).attr('name');
				filters[key] = cbj(this).val();
			});
			return filters;
		},

		/**
		 * Returns an array of IDs of currently checked list items in given kenedo list
		 * @param {jQuery} list
		 * @returns {Number[]}
		 */
		getCheckedListItemIds: function(list) {
			var checkedIds = [];
			list.find('.kenedo-item-checkbox').each(function() {
				if (cbj(this).prop('checked') === true) {
					checkedIds.push(cbj(this).val());
				}
			});
			return checkedIds;
		},

		/**
		 *
		 * @param {jQuery} list Kenedo list to refresh
		 * @param {=function} callback Optional callback function
		 */
		refreshList: function(list, callback) {
			var params = kenedo.getListParameters(list);
			var filters = kenedo.getListFilters(list);

			var view = list.closest('.kenedo-view.cb-content');

			var data = {};

			cbj.each(params, function(key, value) {
				data[key] = value;
			});

			cbj.each(filters, function(key, value) {
				data[key] = value;
			});

			cbrequire(['configbox/server'], function(server) {
				server.replaceHtml(
					view,
					params.controller,
					params.task,
					data)
					.done(callback);
			});
		},

		/**
		 *
		 * @param {jQuery} form Kenedo form to refresh
		 * @param {=function} callback Optional callback function
		 */
		refreshForm: function(form, callback) {
			var controller = kenedo.getFormParameter(form, 'controller');
			var task = 'edit';
			var data = {
				'id': kenedo.getFormParameter(form, 'id'),
				'return': kenedo.getFormParameter(form, 'return')
			};

			cbrequire(['tinyMCE'], function(tinyMCE) {
				if (tinyMCE.majorVersion > 3) {
					tinyMCE.remove();
				}
			});

			server.replaceHtml(form.closest('.kenedo-view'), controller, task, data)
				.done(callback);
		},

		getFormParameter: function(form, key, fallback) {
			var val = form.find(':input[name='+key+']').val();
			if (typeof val === 'undefined' && typeof fallback !== 'undefined') {
				return fallback;
			}
			else {
				return val;
			}
		},

		setFormParameter: function(form, key, value) {
			form.find(':input[name='+key+']').val(value);
		},

		/**
		 * @typedef {Object} taskInfo
		 * @property {jQuery} btn
		 * @property {string} task
		 * @property {jQuery} form
		 * @property {jQuery} list
		 * @property {string} viewName
		 * @property {Event} event
		 *
		 * @fires cbFormTaskTriggered
		 * @param event
		 */
		onFormTaskButtonClicked: function(event) {

			var btn = cbj(this);
			var task = btn.data('task');
			var form = btn.closest('.kenedo-details-form');
			var viewName = form.data('view');

			var taskInfo = {
				btn: btn,
				task: task,
				form: form,
				viewName: viewName,
				event: event
			};

			if (btn.hasClass('disabled')) {
				return;
			}
			btn.addClass('disabled');

			kenedo.setFormParameter(form, 'task', task);

			/**
			 * @event cbFormTaskTriggered
			 */
			form.trigger('cbFormTaskTriggered', taskInfo);

		},

		/**
		 *
		 * @listens event:cbFormTaskTriggered
		 * @param event
		 * @param {taskInfo} taskInfo
		 */
		onFormTaskTriggered: function(event, taskInfo) {

			switch (taskInfo.task) {
				case 'cancel':

					if (taskInfo.form.closest('.modal').length > 0) {
						cbrequire(['cbj.bootstrap'], function() {
							taskInfo.form.closest('.modal').modal('hide').find('.modal-content').html('');
						});
					}
					else {
						var returnUrlEncoded = taskInfo.form.find('input[name=return]').val();
						if (returnUrlEncoded) {
							window.location.href = kenedo.base64UrlDecode(returnUrlEncoded);
						}
					}
					break;

				case 'store':
				case 'apply':
				case 'storeAndNew':

					cbrequire(['tinyMCE'], function(tinyMCE) {

						tinyMCE.triggerSave();

						var xhr = new XMLHttpRequest();
						xhr.onload = function() {
							/**
							 * @event cbFormTaskResponseReceived
							 */
							taskInfo.form.trigger('cbFormTaskResponseReceived', [this, taskInfo]);
						};
						xhr.open("post", taskInfo.form[0].action, true);
						xhr.send(new FormData(taskInfo.form[0]));

					});
					break;
			}

		},

		/**
		 * @listens event:cbFormTaskResponseReceived
		 *
		 * @param {event} event
		 * @param {XMLHttpRequest} xhr
		 * @param {taskInfo} taskInfo
		 */
		onFormTaskResponseReceived: function(event, xhr, taskInfo) {

			try {
				var data = JSON.parse(xhr.responseText);
			}
			catch(e) {
				console.warn('Could not parse JSON response. Response text was: "' + xhr.responseText + '"');
				console.warn('Error message follows:');
				console.warn(e);
				return;
			}

			taskInfo.btn.removeClass('disabled');

			var list;

			switch (taskInfo.task) {

				case 'store':

					if (data.success === false) {
						kenedo.showResponseMessages(taskInfo.form, data.errors || [], data.messages || []);
						return;
					}

					if (taskInfo.form.closest('.modal').length > 0) {

						// if we're in a modal, assume form was opened via an intra listing, refresh it
						list = taskInfo.form.closest('.modal').data('parent-intra-listing');
						if (list) {
							kenedo.refreshList(list);
						}

						// Hide and clear the modal
						taskInfo.form.closest('.modal').modal('hide').find('.modal-content').html('');

					}
					else {

						var url = kenedo.base64UrlDecode(kenedo.getFormParameter(taskInfo.form, 'return'));
						var callback = function() {
							var form = cbj('.kenedo-listing-form').first();
							kenedo.showResponseMessages(form, data.errors || [], data.messages || []);
						};

						kenedo.loadSubview(url, null, callback);

					}

					break;

				case 'storeAndNew':

					kenedo.showResponseMessages(taskInfo.form, data.errors || [], data.messages || []);

					if (data.success === true && data.data && data.data.id) {
						kenedo.setFormParameter(taskInfo.form, 'id', '');
					}

					// if we're in a modal, assume form was opened via an intra listing, refresh it
					list = taskInfo.form.closest('.modal').data('parent-intra-listing');
					if (list) {
						kenedo.refreshList(list);
					}

					break;
					
				case 'apply':

					if (data.success === false) {
						kenedo.showResponseMessages(taskInfo.form, data.errors || [], data.messages || []);
						return;
					}

					if (data.success === true && data.data && data.data.id) {
						kenedo.setFormParameter(taskInfo.form, 'id', data.data.id);
					}

					var parent = taskInfo.form.closest('.kenedo-view').parent();
					kenedo.refreshForm(taskInfo.form, function() {
						taskInfo.form = parent.find('.kenedo-details-form').first();
						kenedo.showResponseMessages(taskInfo.form, data.errors || [], data.messages || []);
					});

					// if we're in a modal, assume form was opened via an intra listing, refresh it
					list = taskInfo.form.closest('.modal').data('parent-intra-listing');
					if (list) {
						kenedo.refreshList(list);
					}

					break;

			}

			/**
			 * @event cbFormTaskResponseReceivedGlobal
			 */
			cbj(document).trigger('cbFormTaskResponseReceivedGlobal', [xhr, taskInfo]);

		},

		showResponseMessages: function(form, errors, notices) {

			var wrapper = form.find('.kenedo-messages').first();

			wrapper.find('.kenedo-messages-error').html('<ul></ul>');
			wrapper.find('.kenedo-messages-notice').html('<ul></ul>');

			if (errors.length !== 0) {

				cbj.each(errors, function(i, item) {
					wrapper.find('.kenedo-messages-error ul').append('<li>'+item+'</li>');
				});

				wrapper.find('.kenedo-messages-error').show();

				wrapper.find('.kenedo-messages-error').addClass('flash');
				window.setTimeout(function(){
					wrapper.find('.kenedo-messages-error').removeClass('flash');
				}, 1000);
			}

			if (notices.length !== 0) {

				cbj.each(notices, function(i, item) {
					wrapper.find('.kenedo-messages-notice ul').append('<li>'+item+'</li>');
				});

				wrapper.find('.kenedo-messages-notice').show();

				wrapper.find('.kenedo-messages-notice').addClass('flash');
				window.setTimeout(function(){
					wrapper.find('.kenedo-messages-notice').removeClass('flash');
				}, 1000);
			}

			if (notices.length > 0 || errors.length > 0) {
				wrapper.show();
			}

		},


		/**
		 * Loads a subview into the ajax target div (currently hard-coded as .configbox-ajax-target)
		 * Takes care of things like of executing the subview's loading scripts
		 * @param {(String|Event)} parameter - URL to load or event object (takes the URL from jQuery(this).attr('href') then)
		 * @param {String=} targetSelector - CSS selector of the div that gets the view
		 * @param {Function=} callbackFunction - Optional callback function
		 * @param {Boolean=} skipPushState - Optional, defaults to false. Use true to avoid a pushState call
		 */
		loadSubview: function(parameter, targetSelector, callbackFunction, skipPushState) {

			var selector = (targetSelector) ? targetSelector : '.configbox-ajax-target';

			// The URL we will load eventually
			var url;

			// If used as a click handler, get the URL through cbj(this)
			if (typeof(parameter) == 'object') {

				// Get the URL from the link
				url = parameter.value;

			}

			// If used as a regular function call, get the URL from the parameter
			if (typeof(parameter) == 'string' && parameter !== '') {
				url = parameter;
			}

			if (!url) {
				throw('loadSubview called, but no URL could be determined.');
			}

			// Change the history state and push one in (unless we deal with a load via back button)
			if (skipPushState === undefined || skipPushState === false) {
				var state = {
					isSubview: true,
					url : url,
					targetSelector: selector
				};

				window.history.pushState(state, '', url);
			}

			// Add the output_mode query string param in case it is missing
			if (url.indexOf('output_mode') === -1) {
				if (server.config.platformName === 'magento' || server.config.platformName === 'magento2') {
					url += 'output_mode/view_only';
				}
				else {
					url += (url.indexOf('?') === -1) ? '?' : '&';
					url += 'output_mode=view_only';
				}
			}

			cbrequire(['tinyMCE'], function(tinyMCE) {
				if (tinyMCE.majorVersion > 3) {
					tinyMCE.remove();
				}
			});

			// Load the sub view with a nice fade effect

			// First fade out the current target area
			cbj(selector).animate( {'opacity':'.0'}, 200, function() {

				// Then load the new content into the target area
				cbj(selector).load(url, function(responseText, textStatus, jqXHR){

					if (jqXHR.status !== 200) {

						var text = '<div id="view-error" class="kenedo-view">';
						text += '<div class="kenedo-listing-form">';
						text += '<p>Encountered a system error: HTTP code is ' + jqXHR.status + '. Text message is: ' + jqXHR.statusText + '</p>';
						text += '</div>';
						text += '</div>';
						cbj(selector).html(text);

					}

					// Now fade in the content
					cbj(selector).animate( {'opacity':'1'}, 200, function(){

						// When done, do the rest of the initialization
						cbj(document).trigger('cbViewInjected');

						if (typeof(callbackFunction) == 'function') {
							callbackFunction(cbj(selector));
						}

					});

				});

			});

		},

		/**
		 * Click target should have data attributes modal-width and modal-height (number telling pixel values)
		 * Click target should have href attribute for the URL to load in modal
		 * @param event
		 */
		onOpenColorBoxModal: function(event) {

			var btn = cbj(this);
			event.preventDefault();

			var modalWidth	= btn.data('modal-width');
			var modalHeight	= btn.data('modal-height');
			var href = btn.attr('href');

			if (!modalWidth) {
				modalWidth = 900;
			}
			if (!modalHeight) {
				modalHeight = 600;
			}

			cbrequire(['cbj.colorbox'], function() {
				cbj.colorbox({
					transition 		: 'fade',
					href 			: href,
					overlayClose 	: true,
					iframe 			: true,
					fastIframe		: false,
					className		: 'cb-modal',
					width			: modalWidth,
					height			: modalHeight
				});
			});

		},

		addedStylesheets: [],

		/**
		 * Adds a stylesheet to the doc's head
		 * @param {String} url
		 */
		addStylesheet: function(url) {

			if (this.addedStylesheets.indexOf(url.toLowerCase()) === -1) {
				this.addedStylesheets.push(url.toLowerCase());
				var link = '<link rel="stylesheet" type="text/css" href="' + url + '">';
				cbj('head').append(link);
			}

		},

		/**
		 *  @var {{Function[]}} subviewReadyFunctions
		 *  @see kenedo.registerSubviewReadyFunction
		 *	@see kenedo.runSubviewReadyFunctions
		 */
		subviewReadyFunctions : {},

		base64UrlEncode : function(input) {
			var encoded = Base64.encode(input);
			return encoded.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,',');
		},

		base64UrlDecode : function(input) {
			var unreplaced = input.replace(/-/g,'+').replace(/_/g,'/').replace(/,/g,'=');
			return Base64.decode(unreplaced);
		},

		openDetailsFormModal: function(list, form, controller, task, id, prefillPropName, prefillValue) {

			var modalParent = cbj('.view-admin .configbox-modals');

			var modal;
			if (modalParent.find('.intra-listing-modal').length > 0) {
				modal = modalParent.find('.intra-listing-modal');
			}
			else {
				modal = cbj('<div class="modal intra-listing-modal" tabindex="-1" role="dialog"><div class="modal-dialog" role="document"><div class="modal-content"></div></div></div>');
				modal.appendTo(modalParent);
			}

			modal.data('parent-form', form);
			modal.data('parent-intra-listing', list);

			cbrequire(['cbj', 'cbj.bootstrap'], function(cbj) {

				var data = {
					id: id
				};

				if (prefillPropName) {
					data['prefill_' + prefillPropName] = prefillValue;
				}

				server.injectHtml(
					modal.find('.modal-content'),
					controller,
					task,
					data,
					function() {
						modal.modal({keyboard: false, backdrop: 'static'});
					});

			});

		},

		openListingLink : function(event) {

			event.preventDefault();

			var link = cbj(this);

			if (link.closest('.intra-listing').length > 0) {

				var list = link.closest('.kenedo-listing-form');
				var form = link.closest('.kenedo-details-form');
				var controller = link.data('controller');
				var task = link.data('task');
				var id = link.data('id');
				var prefillPropName = kenedo.getListParameter(list, 'foreignKeyField');
				var prefillValue = kenedo.getListParameter(list, 'foreignKeyPresetValue');

				kenedo.openDetailsFormModal(list, form, controller, task, id, prefillPropName, prefillValue);

			}
			else {
				var url = cbj(this).attr('href');
				kenedo.loadSubview(url);
			}

		},

		/**
		 * @listens Event:kenedoFormDataChanged
		 * @param {event} event
		 * @param {string[]} settings
		 * @param {jQuery} form Kenedo form to deal with
		 */
		setPropertyVisibility : function(event, settings, form) {

			var property;
			var propDef = {};
			var testProp;
			var currentValue;
			var shouldValues;
			var foundMatch;
			var conditionUnfulfilled;
			var showProperty;
			var groupId;
			var input;

			if (!settings) {
				settings = {};
			}

			// Group start/Group end properties do not show up in the record data, so we add them for easier processing later.
			form.find('.property-group').each(function(){
				groupId = cbj(this).attr('id');
				groupId = groupId.replace('property-name-', '');
				settings[groupId] = '';
			});

			// Loop through all current settings
			for (var propertyName in settings) {
				if (settings.hasOwnProperty(propertyName)) {

					// Get the prop defs of the setting (somehow either jQuery or HTML5 gives you a JS object already, not JSON)
					// propDef = cbj('#property-name-' + propertyName).data('propertyDefinition');

					property = form.find('.property-name-' + propertyName);
					propDef = property.data('propertyDefinition');

					// Just in case somehow there is no propdef JSON
					if (!propDef) {
						continue;
					}

					// Start with assuming that we gonna show the property (later on we might find reasons not to)
					showProperty = true;

					// In case we deal with an invisible field, leave it be (invisible-field comes from propDef 'invisible')
					if (property.hasClass('invisible-field')) {
						continue;
					}

					// If the prop has appliesWhen instructions, look into them
					if (propDef.appliesWhen) {

						conditionUnfulfilled = true;

						// Loop through the appliesWhens
						for (testProp in propDef.appliesWhen) {
							if (propDef.appliesWhen.hasOwnProperty(testProp)) {

								// Get the prop's current value..
								currentValue = settings[testProp];
								// ..and the should values for the appliesWhen
								shouldValues = propDef.appliesWhen[testProp];

								// Convert the shouldValues to an array if they aren't already
								if (typeof(shouldValues) != 'object') {
									shouldValues = [shouldValues];
								}

								foundMatch = false;
								// Loop through the shouldValues and see if we got a match with the currentValue
								for (var i in shouldValues) {
									if (shouldValues.hasOwnProperty(i)) {

										var operator = 'is';

										// An exclamation mark in the beginning of the shouldValue means 'is not'
										if (typeof(shouldValues[i]) == 'string' && shouldValues[i].substr(0, 1) === '!') {
											shouldValues[i] = shouldValues[i].substr(1);
											operator = 'is not';
										}

										if (operator === 'is') {

											// Asterisk as shouldValue means that any non-empty value is good
											if (shouldValues[i] === '*') {
												if (currentValue && currentValue != '0') {
													foundMatch = true;
													break;
												}
											}

											if (shouldValues[i] == currentValue) {
												// If we got one, make a mark
												foundMatch = true;
												break;
											}

										}
										else {

											// Asterisk as shouldValue means that any non-empty value is good
											if (shouldValues[i] === '*') {
												if (!currentValue || currentValue == '0') {
													foundMatch = true;
													break;
												}
											}

											if (shouldValues[i] != currentValue) {
												// If we got one, make a mark
												foundMatch = true;
												break;
											}

										}

									}
								}

								if (foundMatch === false) {
									showProperty = false;
								}

							}
						}
					}

					if (showProperty) {

						if (property.css('display') === 'none') {

							property.show();

							var defaultValue = (typeof(propDef['default']) === 'undefined') ? '' : propDef['default'];

							if (defaultValue) {

								input = property.find(':input[name=' + propertyName + ']');

								if (input.is('select')) {
									input.val(defaultValue).change().trigger('chosen:updated');
								}
								else {
									if (input.is('[type=radio]')) {
										property.find('input[value=' + defaultValue + ']').prop('checked', true);
									}
									else {
										input.val(defaultValue);
									}

								}

								input.change();

								settings[propertyName] = defaultValue;

							}

						}

					}
					else {

						if (property.css('display') !== 'none') {

							property.hide();

							var nullValue;

							input = property.find(':input[name=' + propertyName + ']');

							if (input.is('select')) {
								nullValue = (typeof(propDef['default']) === 'undefined') ? '0' : propDef['default'];
								input.val(nullValue).trigger('chosen:updated');

							}
							else {

								if (input.is('[type=radio]')) {
									nullValue = (typeof(propDef['default']) === 'undefined') ? '0' : propDef['default'];
									property.find('input[value=' + nullValue + ']').prop('checked', true);
								}
								else {
									nullValue = (typeof(propDef['default']) === 'undefined') ? '' : propDef['default'];
									input.val(nullValue);
								}

								if (property.hasClass('property-type-translatable')) {
									property.find('.form-control').val(nullValue).change();
								}
								
							}

							settings[propertyName] = nullValue;

						}

					}

				}
			}

		},

		onToggleRecordActivation: function() {

			var btn = cbj(this);
			var list = btn.closest('.kenedo-listing-form');

			var id = btn.data('id');
			var task = (btn.data('active')) ? 'unpublish' : 'publish';

			btn.find('.fa').addClass('fa-spinner fa-spin');

			kenedo.setListParameter(list, 'task', task);
			kenedo.setListParameter(list, 'ids', id);
			kenedo.refreshList(list);

		},

		/**
		 * @param event
		 * @fires cbFormTaskTriggered
		 */
		onListTaskButtonClicked: function(event) {

			var btn = cbj(this);
			var task = btn.data('task');
			var list = btn.closest('.kenedo-listing-form');
			var viewName = list.data('view');

			var taskInfo = {
				btn: btn,
				task: task,
				list: list,
				viewName: viewName,
				event: event
			};

			if (btn.hasClass('disabled')) {
				return;
			}
			btn.addClass('disabled');

			/**
			 * @event cbListTaskTriggered
			 */
			list.trigger('cbListTaskTriggered', taskInfo);

		},

		/**
		 *
		 * @listens event:cbListTaskTriggered
		 * @param event
		 * @param {taskInfo} taskInfo
		 */
		onListTaskTriggered: function(event, taskInfo) {

			switch (taskInfo.task) {

				case 'add':

					var isIntraListing = taskInfo.list.closest('.intra-listing').length > 0;

					if (isIntraListing === false) {
						var encodedUrl = kenedo.getListParameter(taskInfo.list, 'add-link');
						var url = kenedo.base64UrlDecode(encodedUrl);
						kenedo.loadSubview(url);
					}
					else {
						var form = taskInfo.list.closest('.kenedo-details-form');
						var controller = kenedo.getListParameter(taskInfo.list, 'controller');
						var prefillPropName = kenedo.getListParameter(taskInfo.list, 'foreignKeyField');
						var prefillValue = kenedo.getListParameter(taskInfo.list, 'foreignKeyPresetValue');
						kenedo.openDetailsFormModal(taskInfo.list, form, controller, 'edit', 0, prefillPropName, prefillValue);
					}

					taskInfo.btn.removeClass('disabled');

					break;

				case 'copy':
				case 'remove':
				case 'delete':

					var deleteController = kenedo.getListParameter(taskInfo.list, 'controller');
					var data = {
						'ids': kenedo.getCheckedListItemIds(taskInfo.list).join(',')
					};
					
					server.makeRequest(deleteController, taskInfo.task, data)
						.then(function(data, textStatus, jqXhr) {
							/**
							 * @event cbListTaskResponseReceived
							 */
							taskInfo.list.trigger('cbListTaskResponseReceived', [jqXhr, taskInfo]);
						});
					break;

				default:
					console.log('Unknown task "' + taskInfo.task + '"');
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

			taskInfo.btn.removeClass('disabled');

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
				case 'copy':
				case 'remove':
					let viewId = taskInfo.list.data('view');
					kenedo.refreshList(taskInfo.list, function() {
						taskInfo.list = cbj('.kenedo-view[data-view-id=' + viewId + ']').find('.kenedo-listing-form');
						kenedo.showResponseMessages(taskInfo.list, data.errors || [], data.messages || []);
					});
			}


			/**
			 * @event cbFormTaskResponseReceivedGlobal
			 */
			cbj(document).trigger('cbListTaskResponseReceivedGlobal', [xhr, taskInfo]);
		},

		/**
		 * Registers a function to be executed when a certain subview is loaded via kenedo.loadSubview().
		 * This is a similar concept to document.ready, but these functions are fired when kenedo.loadSubview()
		 * injects the sub view of that name into the document.
		 * @param {String} viewId Content of the ID HTML attribute of the subview's wrapping div
		 * @param {Function} fn Ready function
		 *
		 */
		registerSubviewReadyFunction : function(viewId, fn) {

			if (typeof(kenedo.subviewReadyFunctions[viewId]) == 'undefined') {
				kenedo.subviewReadyFunctions[viewId] = [];
			}

			kenedo.subviewReadyFunctions[viewId].push(fn);

		},

		/**
		 * Checks for a registered ready function and executes the function
		 * This is used to run any JS needed for the content of an ajax subview.
		 * @see kenedo.loadSubview for reference on loading subviews
		 * @see kenedo.registerSubviewReadyFunction for reference on registering subview ready functions
		 * @param {String} viewId Content of the ID HTML attribute of the subview's wrapping div
		 */
		runSubviewReadyFunctions : function (viewId) {
			if (typeof(kenedo.subviewReadyFunctions[viewId]) != 'undefined') {
				cbj.each(kenedo.subviewReadyFunctions[viewId],function(key, fn){
					if (typeof(fn) == 'function') {
						fn();
					}
				});
			}
		},

		toggleCheckboxes: function() {
			var checked = cbj(".kenedo-listing .kenedo-check-all-items").prop('checked');
			cbj(this).closest('.kenedo-listing').find('.kenedo-item-checkbox').prop('checked',checked);
		}

	};


	/* KENEDO POPUP - START */

	var KenedoPopup = {

		openingDelay : 200,
		closingDelay : 200,

		openers : [],
		closers : [],

		/**
		 * Every popup gets opened by a timeout function. This method clears all opening timeouts.
		 */
		clearOpeners : function() {
			cbj.each(KenedoPopup.openers, function(i,item) {
				if (typeof(item) != 'undefined') {
					window.clearTimeout(item.timeout);
				}

			});
			KenedoPopup.openers = [];
		},

		/**
		 * Every popup gets closed by a timeout function. This method clears all closing timeouts.
		 */
		clearClosers : function() {
			cbj.each(KenedoPopup.closers, function(i,item) {
				if (typeof(item) != 'undefined') {
					window.clearTimeout(item.timeout);
				}

			});
			KenedoPopup.closers = [];
		},

		/**
		 * This method sets a timeout function that actually opens the popup.
		 * Before setting one, all existing opening timeout functions get cleared.
		 */
		scheduleOpening: function() {

			// Get the ID of the popup
			var popupId = cbj(this).attr('id').replace('kenedo-popup-trigger-', '');

			// If that popup has already got a scheduled opening, cancel it
			if (KenedoPopup.openers[popupId]) {
				window.clearTimeout(KenedoPopup.openers[popupId].timeout);
			}

			// Set the timeout, add it to the openers
			KenedoPopup.openers[popupId] = {
				popupId : popupId,
				timeout : window.setTimeout(
					function(){
						KenedoPopup.open(popupId);
					},
					KenedoPopup.openingDelay)
			};

		},

		/**
		 * This method sets a timeout function that actually closes the popup.
		 * Before setting one, all existing closing timeout functions get cleared.
		 */
		scheduleClosing: function() {

			var popupId;

			if (cbj(this).is('.kenedo-popup')) {
				popupId = cbj(this).attr('id').replace('kenedo-popup-', '');
			}
			if (cbj(this).is('.kenedo-popup-trigger')) {
				popupId = cbj(this).attr('id').replace('kenedo-popup-trigger-', '');
			}

			// If that popup has already got a scheduled closing, cancel it
			if (KenedoPopup.closers[popupId]) {
				window.clearTimeout(KenedoPopup.closers[popupId].timeout);
			}

			KenedoPopup.closers[popupId] = {
				popupId : popupId,
				timeout :  window.setTimeout(
					function() {
						KenedoPopup.close(popupId);
					},
					KenedoPopup.closingDelay
				)
			};

		},

		cancelOpening: function() {

			var popupId;

			if (cbj(this).is('.kenedo-popup')) {
				popupId = cbj(this).attr('id').replace('kenedo-popup-', '');
			}
			if (cbj(this).is('.kenedo-popup-trigger')) {
				popupId = cbj(this).attr('id').replace('kenedo-popup-trigger-', '');
			}

			if (KenedoPopup.openers[popupId]) {
				window.clearTimeout(KenedoPopup.openers[popupId].timeout);
			}

		},

		cancelClosing: function() {

			var popupId;

			if (cbj(this).is('.kenedo-popup')) {
				popupId = cbj(this).attr('id').replace('kenedo-popup-', '');
			}
			if (cbj(this).is('.kenedo-popup-trigger')) {
				popupId = cbj(this).attr('id').replace('kenedo-popup-trigger-', '');
			}

			if (KenedoPopup.closers[popupId]) {
				window.clearTimeout(KenedoPopup.closers[popupId].timeout);
			}

		},

		open : function( popupId ) {

			var popup = cbj('#kenedo-popup-original-' + popupId).clone(true);

			// Delete any existing popups
			cbj('#kenedo-popup-' + popupId).remove();

			popup.hide();
			popup.attr('id', 'kenedo-popup-' + popupId);
			popup.appendTo('body');

			KenedoPopup.position(popupId);

			popup.fadeIn();

			cbj('#kenedo-popup-trigger-' + popupId).trigger('popup-open');

		},

		close : function( popupId ) {

			cbj('#kenedo-popup-' + popupId).fadeOut(200, function() {
				cbj(this).remove();
			});

			cbj('#kenedo-popup-trigger-' + popupId).trigger('popup-close');

		},

		position : function( popupId ) {

			var popupTrigger = cbj('#kenedo-popup-trigger-' + popupId);
			var popup = cbj('#kenedo-popup-' + popupId);

			popup.css('visibility', 'hidden');
			popup.css('display', 'block');

			cbj('body').append(popup);

			var triggerContent = popupTrigger.find('.kenedo-popup-trigger-content');

			var triggerWidth = triggerContent.outerWidth();
			var triggerHeight = triggerContent.outerHeight();
			var triggerPos = triggerContent.offset();

			var popupWidth = popup.find('.kenedo-popup-content').outerWidth();
			var popupHeight = popup.find('.kenedo-popup-content').outerHeight();

			var arrowBoxWidth = 26;
			var arrowBoxHeight = 26;

			var arrowHeight = Math.sqrt(arrowBoxWidth * arrowBoxWidth + arrowBoxHeight * arrowBoxHeight) / 2;

			popup.outerWidth(popupWidth);
			popup.outerHeight(popupHeight + arrowHeight);

			var viewPortWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
			var viewPortHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
			var scrollTop = cbj('body').scrollTop();
			var scrollLeft = cbj('body').scrollLeft();


			var popupLeftEdge = triggerPos.left + triggerWidth / 2 - popupWidth / 2;

			var topPosTopEdge = triggerPos.top - popupHeight - arrowHeight;

			var bottomPosTopEdge = triggerPos.top + triggerHeight + arrowHeight;
			var bottomPosBottomEdge = bottomPosTopEdge + popupHeight;

			var newLeft, delta;

			// If popup goes over the viewport left edge, adjust
			if (popupLeftEdge + scrollLeft < 0) {

				newLeft = 10 + scrollLeft;
				delta = popupLeftEdge - newLeft;

				var styleEl = document.createElement('style');
				document.head.appendChild(styleEl);
				styleEl.sheet.insertRule('.kenedo-popup-content:before {left:'+ delta +'px;}', styleEl.sheet.cssRules.length);
				styleEl.sheet.insertRule('.kenedo-popup-content:after {left:'+ delta +'px;}', styleEl.sheet.cssRules.length);

				popupLeftEdge = newLeft;

			}
			else {
				var styleEl1 = document.createElement('style');
				document.head.appendChild(styleEl1);
				styleEl1.sheet.insertRule('.kenedo-popup-content:before {left:auto;}', styleEl1.sheet.cssRules.length);
				styleEl1.sheet.insertRule('.kenedo-popup-content:after {left:auto;}', styleEl1.sheet.cssRules.length);
			}

			var popupRightEdge = popupWidth + popupLeftEdge;

			// If popup goes over the viewport right edge, adjust
			if (popupRightEdge > viewPortWidth) {

				newLeft = viewPortWidth - popupWidth - 10;
				delta = popupLeftEdge - newLeft;

				var styleEl2 = document.createElement('style');
				document.head.appendChild(styleEl2);
				styleEl2.sheet.insertRule('.kenedo-popup-content:before {left:' + delta + 'px;}', styleEl2.sheet.cssRules.length);
				styleEl2.sheet.insertRule('.kenedo-popup-content:after {left:' + delta + 'px;}', styleEl2.sheet.cssRules.length);

				popupLeftEdge = newLeft;

			}

			var fitsTop = topPosTopEdge > scrollTop;
			var fitsBottom = bottomPosBottomEdge < viewPortHeight + scrollTop;

			// Figure out if popup should show on top or bottom of the trigger
			var showOnTop = null;

			// With class prefer-top and if it fits, to top
			if (popup.hasClass('position-prefer-top') && fitsTop) {
				showOnTop = true;
			}
			// Vice versa
			if (popup.hasClass('position-prefer-bottom') && fitsBottom) {
				showOnTop = false;
			}
			// Preference doesn't go, so use top if it filts, bottom otherwise
			if (showOnTop === null) {
				showOnTop = fitsTop;
			}

			if (showOnTop) {
				popup.addClass('position-top').removeClass('position-bottom');
				popup.offset({left:popupLeftEdge, top:topPosTopEdge});
			}
			else {
				popup.addClass('position-bottom').removeClass('position-top');
				popup.offset({left:popupLeftEdge, top:bottomPosTopEdge});
			}

			popup.css('display', 'none');
			popup.css('visibility', 'visible');

			return popup;

		}

	};

	/* KENEDO POPUP - END */


	/**
	 *
	 *  Base64 encode / decode
	 *  http://www.webtoolkit.info/
	 *
	 **/
	var Base64 = {

		// private property
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		// public method for encoding
		encode : function (input) {
			/* jshint -W016 */
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;

			input = Base64._utf8_encode(input);

			while (i < input.length) {

				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output +
					this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
					this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

			}

			return output;
		},

		// public method for decoding
		decode : function (input) {
			/* jshint -W016 */
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;

			input = input.replace(/[^A-Za-z0-9\+\/=]/g, "");

			while (i < input.length) {

				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				output = output + String.fromCharCode(chr1);

				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}

			}

			output = Base64._utf8_decode(output);

			return output;

		},

		// private method for UTF-8 encoding
		_utf8_encode : function (string) {
			/* jshint -W016 */
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}

			return utftext;
		},

		// private method for UTF-8 decoding
		_utf8_decode : function (utftext) {
			/* jshint -W016 */
			var string = "";
			var i = 0;
			var c = 0;
			var c2 = 0;
			var c3 = 0;

			while ( i < utftext.length ) {

				c = utftext.charCodeAt(i);

				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}

			}

			return string;
		}

	};

	return kenedo;

});
