/**
 * @module configbox/admin
 */
define(['cbj', 'kenedo', 'configbox/server', 'cbj.ui', 'cbj.bootstrap'], function(cbj, kenedo, server) {

	"use strict";

	/**
	 * @exports configbox/admin
	 */
	var admin = {

		initBackendOnce: function() {
			privateMethods.registerLegacyReadyFunctions();
			privateMethods.initRulePropertyFunctionality();
			privateMethods.initGroupPriceFunctionality();
			privateMethods.initCalculationOverrideFunctionality();
			privateMethods.initCalculationJoinLinks();
			kenedo.initAdminPageOnce();
		},

		initBackendEach: function(view) {

			privateMethods.initKenedoForm(view);
			privateMethods.initChosenDropdowns(view);
			privateMethods.initHtmlEditors(view);
			privateMethods.initDatePickers(view);
			privateMethods.initSortables(view);
			privateMethods.initRulePasteButtonVisibility(view);

			privateMethods.runLegacyReadyFunctions(view);
			kenedo.initAdminPageEach(view);
		}

	};

	var privateMethods = {

		initHtmlEditors : function(view) {

			if (view.find('.kenedo-html-editor.not-initialized').length !== 0) {

				cbrequire(['tinyMCE', 'configbox/server'], function(tinyMCE, server) {

					try {

						view.find('.kenedo-html-editor.not-initialized').each(function() {
							var target = cbj(this);
							var element = cbj(this).get(0);
							target.removeClass('not-initialized');

							tinyMCE.init({
								convert_urls : false,
								document_base_url : server.config.urlBase,
								base_url : server.config.urlTinyMceBase,
								suffix : (server.config.useMinifiedJs === true) ? '.min' : '',
								target	 	: element,
								plugins		: [
									"advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
									"searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime nonbreaking",
									"save table directionality emoticons template paste"
								],
								toolbar		: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons",
								template_external_list_url 	: "js/template_list.js",
								external_link_list_url 		: "js/link_list.js",
								external_image_list_url 	: "js/image_list.js",
								media_external_list_url 	: "js/media_list.js",

								style_formats: [
									{title: 'Headers', items: [
											{title: 'Header 1', format: 'h1'},
											{title: 'Header 2', format: 'h2'},
											{title: 'Header 3', format: 'h3'},
											{title: 'Header 4', format: 'h4'},
											{title: 'Header 5', format: 'h5'},
											{title: 'Header 6', format: 'h6'}
										]},
									{title: 'Inline', items: [
											{title: 'Bold', icon: 'bold', format: 'bold'},
											{title: 'Italic', icon: 'italic', format: 'italic'},
											{title: 'Underline', icon: 'underline', format: 'underline'},
											{title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough'},
											{title: 'Superscript', icon: 'superscript', format: 'superscript'},
											{title: 'Subscript', icon: 'subscript', format: 'subscript'},
											{title: 'Code', icon: 'code', format: 'code'}
										]},
									{title: 'Blocks', items: [
											{title: 'Paragraph', format: 'p'},
											{title: 'Blockquote', format: 'blockquote'},
											{title: 'Div', format: 'div'},
											{title: 'Pre', format: 'pre'}
										]},
									{title: 'Alignment', items: [
											{title: 'Left', icon: 'alignleft', format: 'alignleft'},
											{title: 'Center', icon: 'aligncenter', format: 'aligncenter'},
											{title: 'Right', icon: 'alignright', format: 'alignright'},
											{title: 'Justify', icon: 'alignjustify', format: 'alignjustify'}
										]},
									{title: 'Others', items: [
											{title : 'Custom 1', selector : 'p', classes : 'custom-1'},
											{title : 'Custom 2', selector : 'p', classes : 'custom-2'},
											{title : 'Custom 3', selector : 'p', classes : 'custom-3'},
											{title : 'Custom 4', selector : 'p', classes : 'custom-4'}
										]}
								]

							});

						});

					} catch(error) {
						console.log('Init of TinyMCE failed. Error message was ' + error);
					}

				});

			}

		},

		initKenedoForm: function(view) {

			cbj(view).find('.kenedo-details-form').each(function() {
				var record = cbj(this).closest('.kenedo-details-form').data('record');
				kenedo.setPropertyVisibility(null, record, cbj(this));
				cbj(this).on('kenedoFormDataChanged', kenedo.setPropertyVisibility);
			});

		},

		initDatePickers: function(view) {

			cbj(view).find('.datepicker').datepicker({dateFormat: 'yy-mm-dd'});

			cbj(view).find('.kenedo-datepicker').each(function() {

				var altField = cbj(this).closest('.kenedo-property').find('.form-control');
				var value = altField.val();

				if (value === '' || value === '0000-00-00' || value === '0000-00-00 00:00:00') {
					value = null;
				}

				var params = {
					dateFormat: 'yy-mm-dd',
					altFormat: 'yy-mm-dd',
					altField: altField,
				};

				cbj(this).datepicker(params);
				cbj(this).datepicker('setDate', value);

			});

		},

		initSortables: function(view) {

			cbj(view).find('.sortable-listing tbody').sortable({

				handle 		: '.sort-handle',
				items		: 'tr',
				axis		: 'y',
				scroll		: false,

				helper: function(e, ui) {
					ui.children().each(function() {
						cbj(this).width(cbj(this).width());
					});
					return ui;
				},

				start: function() {

					var list = cbj(this).closest('.kenedo-listing-form');
					var paginationLimit = kenedo.getListParameter(list, 'limit');

					if (paginationLimit != 0) {
						var feedback = cbj(this).find('.sort-handle:first').data('unset-pagination-text');
						if (feedback) {
							alert(feedback);
						}
						else {
							alert('Please set items per page to all first');
						}

					}
				},

				update: function() {

					var list = cbj(this).closest('.kenedo-listing-form');
					var direction = kenedo.getListParameter(list, 'listing_order_dir');

					// This will contain record ids and position numbers and gets sent as JSON to the server
					var sortingData = {};

					// This will be used to set position numbers (gets in- or decremented)
					var positionNumber;
					if (direction.toLowerCase() === 'asc') {
						positionNumber = 10;
					}
					else {
						positionNumber = list.find('.item-row').length * 10;
					}

					list.find('.item-row').each(function() {

						var recordId = cbj(this).data('item-id');

						sortingData[recordId] = positionNumber;

						if (direction.toLowerCase() === 'asc') {
							positionNumber = positionNumber + 10;
						}
						else {
							positionNumber = positionNumber - 10;
						}

					});

					var controller = kenedo.getListParameter(list, 'controller');
					var updates = JSON.stringify(sortingData);

					// Storing position will be delayed with timeouts so that frantic sorters can't flood the server
					if (privateMethods.sortingTimeout) {
						window.clearTimeout(privateMethods.sortingTimeout);
					}

					privateMethods.sortingTimeout = window.setTimeout(
						function() {
							server.makeRequest(controller, 'storeOrdering', {updates: updates});
						},
						500
					);

				}

			});

		},

		sortingTimeout: null,

		initRulePasteButtonVisibility: function(view) {
			if (this.hasClipboardRule()) {
				view.find('.rule-wrapper .trigger-paste-rule').show();
			}
			else {
				view.find('.rule-wrapper .trigger-paste-rule').hide();
			}
		},

		hasClipboardRule: function() {
			return this.getClipboardRule() !== null;
		},
		
		setClipboardRule: function(ruleData) {
			window.sessionStorage.setItem('clipboardRule', JSON.stringify(ruleData));
		},

		getClipboardRule: function() {
			var json = window.sessionStorage.getItem('clipboardRule');

			if (json === null) {
				return null;
			}
			else {
				return JSON.parse(json);
			}

		},

		initChosenDropdowns: function(wrapper) {

			if (cbj(wrapper).find('select.listing-filter, select.join-select, .property-type-dropdown select, select.make-me-chosen, select.chosen-dropdown').length > 0) {

				cbrequire(['cbj.chosen'], function() {

					// Init the chosen select form items
					cbj(wrapper).find('select.listing-filter, select.join-select, .property-type-dropdown select, select.make-me-chosen, select.chosen-dropdown').chosen({
						disable_search_threshold : 10,
						search_contains : true,
						inherit_select_classes : true,
						width:'100%'
					});

					// Deal with the width problem of initially hidden drop-downs
					cbj(wrapper).find('.chosen-container:hidden').each(function(){
						if (cbj(this).is('.join-select')) {
							cbj(this).css('width','100%');
						}
						else {
							if (cbj(this).closest('.kenedo-properties').length) {
								cbj(this).css('width','100%');
							}
							else {
								cbj(this).css('width','auto');
							}

						}
					});

				});

			}

		},

		initGroupPriceFunctionality: function() {

			cbj(document).on('click', '.property-type-groupPrice .trigger-show-group-picker', function() {
				var wrapper = cbj(this).closest('.property-type-groupPrice');

				wrapper.find('.group-picker').show();
				wrapper.find('.trigger-show-group-picker').hide();
				wrapper.find('.trigger-cancel-group-picker').show();
			});

			cbj(document).on('click', '.property-type-groupPrice .trigger-cancel-group-picker', function() {
				var wrapper = cbj(this).closest('.property-type-groupPrice');
				wrapper.find('.group-picker').hide();
				wrapper.find('.trigger-show-group-picker').show();
				wrapper.find('.trigger-cancel-group-picker').hide();
			});

			/**
			 * Price overrides ultimately get stored as a JSON string holding all overrides. This function gets called
			 * after any change made in the UI. It collects the overrides in the HTML and writes a the JSON in the
			 * hidden input (with class .overrides-json-data).
			 * It also hides the 'add override' button if there are overrides for all groups (and vice versa).
			 *
			 * @param {jQuery} wrapper jQuery object with the property
			 */
			var updateOverrideJson = function(wrapper) {

				// Prime the array to store, loop through all overrides to collect group ids and prices..
				var overrides = [];
				wrapper.find('.price-overrides .price-override').each(function(){
					overrides.push({
						'group_id': cbj(this).data('group-id'),
						'price': cbj(this).find('.chosen-price').val()
					});
				});

				// ..then store the array as JSON in the hidden input
				wrapper.find('.overrides-json-data').val(window.JSON.stringify(overrides));

				// Check if we got overrides for all groups already - if so, hide the 'add override' button (or show it)
				var countOverrides = overrides.length;
				var countGroups = wrapper.find('.trigger-add-price-override').length;

				if (countOverrides >= countGroups) {
					wrapper.find('.trigger-show-group-picker').addClass('hidden');
				}
				else {
					wrapper.find('.trigger-show-group-picker').removeClass('hidden');
				}

			};

			cbj(document).on('keyup change', '.property-type-groupPrice .chosen-price', function() {
				var wrapper = cbj(this).closest('.property-type-groupPrice');
				updateOverrideJson(wrapper);
			});

			cbj(document).on('click', '.property-type-groupPrice .trigger-add-price-override', function() {
				var wrapper = cbj(this).closest('.property-type-groupPrice');
				var groupId = cbj(this).data('group-id');
				var html = cbj(wrapper).find('.price-override-blueprint .price-override').clone();

				html.attr('data-group-id', groupId);
				html.find('.group-title-field').text(cbj(this).text());

				wrapper.find('.price-overrides').append(html);
				cbj(this).addClass('used-already');
				wrapper.find('.trigger-cancel-group-picker').trigger('click');

				updateOverrideJson(wrapper);

			});

			cbj(document).on('click', '.property-type-groupPrice .trigger-remove-price-override', function() {
				var wrapper = cbj(this).closest('.property-type-groupPrice');
				var groupId = cbj(this).closest('.price-override').data('group-id');

				cbj(this).closest('.price-override').remove();
				wrapper.find('.group-picker .group-id-' + groupId).removeClass('used-already');

				updateOverrideJson(wrapper);

			});

		},

		initCalculationOverrideFunctionality: function() {

			cbj(document).on('click', '.property-type-calculationOverride .trigger-show-group-picker', function() {
				var wrapper = cbj(this).closest('.property-type-calculationOverride');

				wrapper.find('.group-picker').show();
				wrapper.find('.trigger-show-group-picker').hide();
				wrapper.find('.trigger-cancel-group-picker').show();
			});

			cbj(document).on('click', '.property-type-calculationOverride .trigger-cancel-group-picker', function() {
				var wrapper = cbj(this).closest('.property-type-calculationOverride');
				wrapper.find('.group-picker').hide();
				wrapper.find('.trigger-show-group-picker').show();
				wrapper.find('.trigger-cancel-group-picker').hide();
			});

			/**
			 * Price overrides ultimately get stored as a JSON string holding all overrides. This function gets called
			 * after any change made in the UI. It collects the overrides in the HTML and writes a the JSON in the
			 * hidden input (with class .overrides-json-data).
			 * It also hides the 'add override' button if there are overrides for all groups (and vice versa).
			 *
			 * @param {jQuery} wrapper jQuery object with the property
			 */
			var updateOverrideJson = function(wrapper) {

				// Prime the array to store, loop through all overrides to collect group ids and prices..
				var overrides = [];
				wrapper.find('.price-overrides .price-override').each(function(){
					overrides.push({
						'group_id': parseInt(cbj(this).data('group-id')),
						'calculation_id': parseInt(cbj(this).find('.calculation-select').val())
					});
				});

				// ..then store the array as JSON in the hidden input
				wrapper.find('.overrides-json-data').val(window.JSON.stringify(overrides));

				// Check if we got overrides for all groups already - if so, hide the 'add override' button (or show it)
				var countOverrides = overrides.length;
				var countGroups = wrapper.find('.trigger-add-price-override').length;

				if (countOverrides >= countGroups) {
					wrapper.find('.trigger-show-group-picker').addClass('hidden');
				}
				else {
					wrapper.find('.trigger-show-group-picker').removeClass('hidden');
				}

			};

			cbj(document).on('change', '.property-type-calculationOverride .calculation-select', function() {
				var wrapper = cbj(this).closest('.property-type-calculationOverride');
				updateOverrideJson(wrapper);
			});

			cbj(document).on('click', '.property-type-calculationOverride .trigger-add-price-override', function() {

				// Get stuff
				var wrapper = cbj(this).closest('.property-type-calculationOverride');
				var groupId = cbj(this).data('group-id');
				var html = cbj(wrapper).find('.price-override-blueprint .price-override').clone();

				// Set group ID and the label
				html.attr('data-group-id', groupId);
				html.find('.group-title-field').text(cbj(this).text());

				// Get a new ID and name for the select tag (cbj.chosen seems to need that)
				var randomId = 'dummy-id-for-chosen-' + Math.floor(Math.random() * 10000);

				var select = html.find('.calculation-select');
				select.attr('id', randomId).attr('name', randomId);

				var joinLink = html.find('.trigger-open-join-link-modal');
				joinLink.attr('data-name-form-control', joinLink.attr('data-name-form-control').replace('PLACEHOLDER_CALC_SELECT', randomId));

				// Put the thing in place
				wrapper.find('.price-overrides').append(html);

				// Make the new select chosen
				select.chosen({
					disable_search_threshold : 10,
					search_contains : true,
					inherit_select_classes : true,
					width:'100%'
				});

				// Mark the group as used
				cbj(this).addClass('used-already');

				// Close the picker on the cheap
				wrapper.find('.trigger-cancel-group-picker').trigger('click');

				// Finally update the JSON data for storage
				updateOverrideJson(wrapper);

			});

			cbj(document).on('click', '.property-type-calculationOverride .trigger-remove-price-override', function() {
				var wrapper = cbj(this).closest('.property-type-calculationOverride');
				var groupId = cbj(this).closest('.price-override').data('group-id');

				cbj(this).closest('.price-override').remove();
				wrapper.find('.group-picker .group-id-' + groupId).removeClass('used-already');

				updateOverrideJson(wrapper);

			});

		},

		initCalculationJoinLinks: function() {

			cbj(document).on('change', '.kenedo-details-form .calculation-select', function() {

				var select = cbj(this);
				var selectedId = parseInt(select.val());
				var joinLink = select.closest('.select-and-links').find('.trigger-open-join-link-modal');

				joinLink.data('selected-id', selectedId);

				if (selectedId === 0) {
					joinLink.text(joinLink.data('link-text-new'));
				}
				else {
					joinLink.text(joinLink.data('link-text-open'));
				}

			});

			cbj(document).on('click', '.trigger-open-join-link-modal', function() {

				var btn = cbj(this);

				if (btn.hasClass('disabled')) {
					return;
				}
				btn.addClass('disabled');

				var wrapper = btn.closest('.select-and-links');
				var parentForm = btn.closest('.kenedo-details-form');

				var modalParent = cbj('.view-admin .configbox-modals');
				var modal = modalParent.children('.join-link-modal');

				if (modal.length === 0) {

					modal = wrapper.find('.join-link-modal').appendTo(modalParent);

					var modalsToShowAfterHide;

					modal.on('show.bs.modal', function() {
						modalsToShowAfterHide = cbj(this).siblings('.modal:visible');
						modalsToShowAfterHide.modal('hide');
					});

					modal.on('hidden.bs.modal', function() {
						modalsToShowAfterHide.modal('show');
						// Reset 'modals to show' collection so they won't open again after next visit
						modalsToShowAfterHide = cbj('.some-div-that-does-not-exists');
					});

				}

				var requestData = btn.data('request-data');
				requestData.id = btn.data('selected-id');

				server.injectHtml(
					modal.find('.modal-content'),
					btn.data('controller'),
					btn.data('task'),
					btn.data('request-data'),
					function() {

						btn.removeClass('disabled');

						modal.modal({keyboard:false});

						cbj('html, body').animate({
							scrollTop: 0
						}, 100);

						var calcForm = modal.find('.kenedo-details-form');

						/**
						 * @listens event:cbFormTaskResponseReceived
						 */
						calcForm.on('cbFormTaskResponseReceived', function(event, xhr, taskInfo) {

							if (taskInfo.task !== 'store' && taskInfo.task !== 'apply') {
								return;
							}

							try {
								var response = JSON.parse(xhr.responseText);
							}
							catch(e) {
								console.warn('Could not parse JSON response. Exception message follows. ResponseText was: "' + xhr.responseText + '"');
								console.warn(e);
								return;
							}

							if (response.success === true && response.wasInsert === true) {

								// Insert the new calculation to any calculation-select dropdowns (and update chosen)
								parentForm.find('select.calculation-select').each(function() {
									cbj(this).append('<option value="'+response.data.id+'">'+response.data.name+'</option>');
									cbj(this).trigger('chosen:updated');
								});

								// Select the new calculation in the connected dropdown
								var nameFormControl = btn.data('name-form-control');
								if (nameFormControl) {
									var targetSelect = parentForm.find('select[name=' + nameFormControl + ']');
									targetSelect.val(response.data.id).trigger('chosen:updated').trigger('change');
								}
							}

						});
					}
				);

			});

		},

		initRulePropertyFunctionality: function() {

			cbj(document).on('click', '.trigger-delete-rule', function() {
				cbj(this).closest('.kenedo-property').find('.data-field').val('').trigger('change');
				cbj(this).closest('.kenedo-property').find('.rule-wrapper').removeClass('has-rule').addClass('has-no-rule');
			});

			cbj(document).on('click', '.trigger-copy-rule', function() {
				var wrapper = cbj(this).closest('.rule-wrapper');

				var clipboardData = {
					productId: wrapper.find('.data-field').data('product-id'),
					ruleJson: wrapper.find('.data-field').val(),
					ruleHtml: wrapper.find('.rule-html').html()
				};

				privateMethods.setClipboardRule(clipboardData);
				cbj('.trigger-paste-rule').show();

			});

			cbj(document).on('click', '.trigger-paste-rule', function() {

				if (privateMethods.hasClipboardRule() === false) {
					return;
				}

				var clipboardData = privateMethods.getClipboardRule();

				var wrapper = cbj(this).closest('.rule-wrapper');

				var productId = wrapper.find('.data-field').data('product-id');

				if (parseInt(clipboardData.productId) !== parseInt(productId)) {
					window.alert('Rule in clipboard is for another product');
					return;
				}

				wrapper.find('.data-field').val(clipboardData.ruleJson);
				wrapper.find('.rule-html').html(clipboardData.ruleHtml);
				wrapper.removeClass('has-no-rule').addClass('has-rule');

			});

			cbj(document).on('click', '.trigger-edit-rule', function() {

				var btn = cbj(this);
				var dataField = btn.closest('.kenedo-property').find('.data-field');
				var url = dataField.data('editor-url');

				var modalParent = cbj('.view-admin .configbox-modals');
				var modal = modalParent.children('.rule-editor-modal');

				if (modal.length === 0) {

					modal = btn.closest('.kenedo-property').find('.rule-editor-modal').appendTo(modalParent);
					var modalsToShowAfterHide;

					modal.on('show.bs.modal', function() {
						modalsToShowAfterHide = cbj(this).siblings('.modal:visible');
						modalsToShowAfterHide.modal('hide');
					});

					modal.on('hidden.bs.modal', function() {
						modalsToShowAfterHide.modal('show');
						// Reset 'modals to show' collection so they won't open again after next visit
						modalsToShowAfterHide = cbj('.asdfsadfsadf');
					});
				}

				var data = {
					usageIn: dataField.data('usage-in'),
					productId: dataField.data('product-id'),
					pageId: dataField.data('page-id'),
					rule: dataField.val()
				};

				modal.find('.modal-content').html('');

				modal.one('show.bs.modal', function() {
					modal.find('.modal-content').load(url, data, function() {
						modal.data('form-property', btn.closest('.kenedo-property'));
						cbj(document).trigger('cbViewInjected');

					});
				});

				modal.modal();


			});

		},

		registerLegacyReadyFunctions: function() {

			kenedo.registerSubviewReadyFunction('view-adminelement', function() {
				if (cbj('.view-adminelement .not-using-shapediver').length !== 0) {
					cbj('.property-group-shapediver_start').addClass('hidden');
				}
			});

			kenedo.registerSubviewReadyFunction('view-adminoptionassignment', function() {
				if (cbj('.view-adminoptionassignment .not-using-shapediver').length !== 0) {
					cbj('.property-group-shapediver_start').addClass('hidden');
				}
			});

			kenedo.registerSubviewReadyFunction('view-adminmainmenu', function() {

				// Tree toggles for the main menu
				cbj(document).on('click', '.view-adminmainmenu .trigger-toggle-sub-items', function() {
					cbj(this).toggleClass('opened');
					cbj(this).closest('.menu-list-item').children('.sub-items').toggleClass('opened');
				});

			});

			kenedo.registerSubviewReadyFunction('view-admintemplate', function(){

				// We load the stylesheet ahead of time because init goes bad if the file isn't loaded yet.
				cbrequire(['configbox/server'], function(server) {
					var url = server.config.urlSystemAssets + '/kenedo/external/codemirror-5.30.0/lib/codemirror.css?version=' + server.config.cacheVar;
					kenedo.addStylesheet(url);
				});

				cbrequire(['codemirror', 'codemirror/mode/htmlmixed/htmlmixed', 'codemirror/mode/php/php', 'codemirror/mode/javascript/javascript'], function(CodeMirror) {

					// Create the CodeMirror editor with content of template-code
					var codeMirrorEditor = CodeMirror.fromTextArea(document.getElementById("template-code"), {
						lineNumbers: true,
						matchBrackets: true,
						mode: "php",
						indentUnit: 4,
						indentWithTabs: true,
						viewportMargin: Infinity
					});

					// Make CodeMirror copy over the contents to the right form field on change
					codeMirrorEditor.on('change', function(cm){
						cbj('#template-code').val(cm.getValue());
					});



				});

			});

		},

		runLegacyReadyFunctions: function(view) {

			var viewId;

			var viewIdData = view.data('view-id');

			if (viewIdData) {
				viewId = 'view-' + viewIdData;
			}
			else {
				viewId = view.find('.kenedo-view').eq(0).attr('id');
			}

			if (viewId) {
				kenedo.runSubviewReadyFunctions(viewId);
			}

		}

	};

	return admin;

});