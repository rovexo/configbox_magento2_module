/**
 * @module configbox/ruleEditor
 */
define(['cbj', 'kenedo', 'configbox/server'], function(cbj, kenedo, server) {
	"use strict";

	/**
	 * @exports configbox/ruleEditor
	 */
	var module = {

		initRuleEditor: function() {

			// Create a jQuery function for making an HTML element a dropzone
			cbj.fn.makeDropZone = function() {

				if (typeof(arguments[0]) !== 'undefined') {
					var draggedItem = arguments[0];
				}

				this.droppable({

					hoverClass: 'drag-over',
					tolerance: 'pointer',
					drop: function( event, ui ) {

						// Get a clone of the draggable and remove draggable attributes
						var newItem = cbj(ui.helper).clone(true,true).removeClass('ui-draggable ui-draggable-dragging').removeAttr('style');

						// Remove the original item if moved inside the item
						if (typeof(draggedItem) !== 'undefined' && draggedItem.closest('.rule-area').length) {
							cbj(ui.draggable).draggable('option','revertDuration',0);
							draggedItem.remove();
						}

						// Make it a new draggable
						newItem.makeDraggableItem();

						// Replace the drop-area with the new item
						cbj(this).replaceWith(newItem);

					}

				});
			};

			cbj.fn.makeDraggableItem = function() {

				this.draggable({

					addClasses: false,
					revert: true,
					helper: 'clone',
					opacity: 0.8,

					start: function() {

						// If we drag an item that was in the rule area already, then hide the original
						if (cbj(this).closest('.rule-area').length) {
							cbj(this).hide();
						}

						var ruleArea = cbj(this).closest('.view-adminruleeditor').find('.rule-area');

						// Remove any pre-existing drop-areas (unless it's the initial area that shows when no
						// conditions are present)
						ruleArea.find('.drop-area:not(.initial)').remove();

						// Set revert duration to 100ms
						cbj(this).draggable('option','revertDuration',100);

						if (ruleArea.find('.drop-area').length === 0) {

							var dropZoneMarkup = '<span class="drop-area">&nbsp;</span>';

							// In case there are no conditions in the rule area yet, just add the drop-zone HTML
							if (ruleArea.find('.item').length === 0) {
								ruleArea.html(dropZoneMarkup);
							}
							else {

								var dropZoneSelectorBefore = '';
								var dropZoneSelectorAfter = '';

								// We figure out where to put drop zones by preparing CSS selectors, later using
								// jQuery before and after to insert them where needed.
								if (cbj(this).is('.condition') || cbj(this).is('.bracket')) {
									dropZoneSelectorBefore = '.combinator:first-child';
									dropZoneSelectorAfter = '.combinator';
								}

								if (cbj(this).is('.combinator')) {
									dropZoneSelectorBefore = '.condition + .condition, .bracket + .bracket, .condition + .bracket, .condition:first-child, .bracket:first-child';
									dropZoneSelectorAfter = '.condition:last-child, .bracket:last-child';
								}

								if (!dropZoneSelectorBefore || !dropZoneSelectorAfter) {
									throw('Could not figure out dropzone selectors.');
								}

								// Add drop zone markup
								ruleArea.find(dropZoneSelectorBefore).before(dropZoneMarkup);
								ruleArea.find(dropZoneSelectorAfter).after(dropZoneMarkup);
								ruleArea.find('.bracket:empty').html(dropZoneMarkup);

							}

							if (cbj(this).closest('.rule-area').length !== 0) {
								cbj(this).after(dropZoneMarkup);
							}

							// In the end, we put the droppable functionality on the drop-area HTML
							// .parameter-drop-area is for those function conditions
							ruleArea.find('.drop-area, .parameter-drop-area').makeDropZone( cbj(this) );

						}

					},

					stop: function() {

						var ruleArea = cbj(this).closest('.view-adminruleeditor').find('.rule-area');

						if (ruleArea.find('.item').length !== 0) {
							ruleArea.find('.drop-area').remove();
						}

						// Show the previously hidden original item
						cbj(this).show();
					}

				});

				return this;

			};

			// Make items in terms draggable
			cbj('.view-adminruleeditor .rule-area .item').makeDraggableItem();

			// Make combinators draggable
			cbj('.view-adminruleeditor #combinator-blueprints .item').makeDraggableItem();

			// Make items in the selected panel draggable
			cbj('.view-adminruleeditor .selected-panel .item').makeDraggableItem();

			// On selection of a new panel, make items in there draggable
			cbj('.view-adminruleeditor').on('panelSelected', function() {
				cbj('.view-adminruleeditor .selected-panel .item').makeDraggableItem();
			});

			// Add drop zone functionality to initial area
			cbj('.view-adminruleeditor .drop-area').makeDropZone();

			// Clicks on items make the item selected (and other items unselected, unless shift key is held)
			cbj('.view-adminruleeditor .rule-area').on('click', '.item', function( event ) {

				// Deselect anything, unless shift key is held
				if (!event.shiftKey) {
					cbj(this).closest('.rule-area').find('.selected').removeClass('selected');
				}

				// Clicks on .input make no selection
				if (cbj(event.target).is('.input')) {
					return;
				}

				// Add the 'selected' class to the item clicked on
				if (cbj(event.target).is('.item')) {
					cbj(event.target).addClass('selected');
					return;
				}

				if (cbj(event.target).closest('.item').length !== 0) {
					cbj(event.target).closest('.item').addClass('selected');
				}

			});

			// Clicks on the rule area (outside items) should deselect any item
			cbj('.view-adminruleeditor').on('click', function(event) {
				// Unless the click was made on an item, unselect anthing
				if (cbj(event.target).is('.item') === false && cbj(event.target).closest('.item').length === 0) {
					cbj(this).closest('.view-adminruleeditor').find('.rule-area .selected').removeClass('selected');
				}
			});

			// Trigger for item squeezer button
			cbj('.view-adminruleeditor').on('click', '.button-limit-condition-width', function() {
				cbj(this).closest('.view-adminruleeditor').find('.rule-area').toggleClass('squeeze');
			});

			// Trigger for removing items
			cbj('.view-adminruleeditor').on('click', '.button-remove-selected-items', module.removeSelectedItems);

			// Trigger for putting items in brackets
			cbj('.view-adminruleeditor').on('click', '.button-put-in-brackets', module.putInBrackets);

			// Key-press functionality
			cbj(document).keyup(function(event) {

				switch (event.which) {

					// Back-space for removing items
					case 46:
						module.removeSelectedItems.apply(this, arguments);
						break;

				}

				event.preventDefault();
			});

			// Store button
			cbj('.view-adminruleeditor').on('click', '.button-store', module.storeRule);

			// Cancel button
			cbj('.view-adminruleeditor').on('click', '.button-cancel', function() {
				cbj(this).closest('.modal').modal('hide').find('.modal-content').html('');
			});

			// Tab functionality for switching between condition types
			cbj('.view-adminruleeditor').on('click', '.picker-tab', function() {

				var view = cbj(this).closest('.view-adminruleeditor');
				var panelId = cbj(this).attr('id');
				cbj(this).addClass('selected-tab').siblings().removeClass('selected-tab');

				view.find('.picker-panels .' + panelId).addClass('selected-panel').siblings().removeClass('selected-panel');
				view.trigger('panelSelected', [panelId]);

			});

			// Adjust the text field widths in condition items on startup
			cbj('.view-adminruleeditor .condition input[type=text]').each(module.adjustTextFieldWidth);

			// Adjust the text field widths in condition items on change
			cbj('.view-adminruleeditor').on('keyup change click', '.condition input[type=text]', module.adjustTextFieldWidth);

			// Clicks on .condition-operator make the operator picker appear
			cbj('.view-adminruleeditor').on('click', '.condition-operator', function() {

				// Remove any existing pickers
				cbj('.condition .operator-picker').remove();

				var operatorNode;

				// Questions with predefined answers get the 'is' and 'is not' operator, rest the full lower than etc.
				if (cbj(this).closest('.condition').data('field') === 'selectedOption.id') {
					operatorNode = cbj('#operator-picker-blueprint .operator-picker-short');
				}
				else {
					operatorNode = cbj('#operator-picker-blueprint .operator-picker-full');
				}

				// Clone and copy the picker in place
				operatorNode.clone().appendTo(cbj(this));

			});

			// Remove the operator picker on clicks anywhere but the .condition-operator element (which is there to make it appear)
			cbj('.view-adminruleeditor').on('click', function(event) {

				if (cbj(event.target).is('.condition-operator')) {
					return;
				}

				cbj('.condition .operator-picker').remove();

			});

			// Functionality for choosing an operator for a condition
			cbj('.view-adminruleeditor').on('click', '.rule-area .operator, #condition-picker .operator', function() {
				var operator = cbj(this).data('operator');
				cbj(this).closest('.condition').data('operator', operator).attr('data-operator', operator);
				cbj(this).closest('.condition-operator').text(cbj(this).text() + ' ');
			});

			/* Questions panel - filtering functionality - START */

			// Page filter functionality
			cbj('.view-adminruleeditor').on('change', '.page-filter select', function() {

				// Get the selected page ID
				var pageId = parseInt(cbj(this).val());

				// Hide all questions
				cbj('.question-picker li').removeClass('shown').removeClass('selected');

				// Prepare the CSS selector for shown questions
				var selector;

				if (pageId === 0) {
					selector = '.question-picker .question-list li';
				}
				else {
					selector = '.question-picker .question-list li.page-' + pageId;
				}

				// Show them
				cbj( selector ).addClass('shown');

				// Reset the text filter
				cbj('#question-filter').val('');

				// Show anything that was hidden by the text filter
				cbj('.question-picker li.hidden-by-question-filter').removeClass('hidden-by-question-filter');

			});

			// Key up for the text filter
			cbj('#question-filter').keyup(function() {

				var filterText = cbj(this).val();
				filterText = filterText.trim();
				filterText = filterText.toLowerCase();

				if (filterText === '') {
					cbj('.question-picker li').removeClass('hidden-by-question-filter');
				}

				cbj('.question-picker li.shown').each(function() {

					var text = cbj(this).text();
					text = text.trim();
					text = text.toLowerCase();

					if ( text.indexOf(filterText) === -1) {
						cbj(this).addClass('hidden-by-question-filter');
					}
					else {
						cbj(this).removeClass('hidden-by-question-filter');
					}
				});

			});

			// Clicks on the left questions make the conditions for that question appear
			cbj('.view-adminruleeditor').on('click', '.question-list li', function() {

				var questionId = cbj(this).data('question-id');
				cbj('#answer-group-' + questionId).show().siblings().hide();

				// Make the shown items draggable
				cbj('#question-attributes #answer-group-' + questionId + ' .item').makeDraggableItem();

				cbj(this).addClass('picked').siblings().removeClass('picked');

				cbj('#question-attributes').show();

			});

		},

		storeRule : function() {

			var view = cbj(this).closest('.view-adminruleeditor');

			// Remove all drop areas (just in case there are any left)
			view.find('.rule-area .drop-area').remove();

			var property = view.closest('.rule-editor-modal').data('form-property');

			// Prepare the rule JSON
			var jsonRule = '';

			// Get the rule's conditions
			var ruleItems = module.getRuleItems(view.find('.rule-area'));

			// If we deal with a negated rule, we add a 'negation' item to the rule
			var isNegated = (view.find('.rule-is-negated').val() === '1');

			var ruleHtmlPrefix;

			if (isNegated === true && ruleItems.length > 0) {

				ruleHtmlPrefix = view.find('.rule-is-negated option[value=1]').data('prefix-rule-text');

				var ruleItem = {
					type: 'negation'
				};
				ruleItems.unshift(ruleItem);

			}
			else {
				ruleHtmlPrefix = view.find('.rule-is-negated option[value=0]').data('prefix-rule-text');
			}

			// Modify the parent's controls
			if (ruleItems.length) {
				// Hide the parent form's edit button (will show the rule instead)
				jsonRule = JSON.stringify(ruleItems).replace(/^"/g,'').replace(/"$/g,'');
			}

			// Write the rule json string to the input field of the form
			var dataField = property.find('.data-field');
			dataField.val(jsonRule).trigger('change');

			// Make the edit controls of the rule into display-only fields
			// Got to be done on the original in the rule editor, when copying the HTML the values of the inputs aren't updated.
			view.find('.rule-area input').each(function(){
				cbj(this).replaceWith('<span class="condition-value">' + cbj(this).val() + '</span>');
			});

			// Copy the rule HTML over to the display wrapper of the parent's form (To show the rule)
			var html = '';
			if (isNegated) {
				html += ruleHtmlPrefix + ' ';
			}
			html += view.find('.rule-area').html();

			// Copy the rule HTML over to the display wrapper of the parent's form (To show the rule)
			var ruleHtml = property.find('.rule-html');
			ruleHtml.html(html);

			if (jsonRule) {
				ruleHtml.closest('.rule-wrapper').addClass('has-rule').removeClass('has-no-rule');
			}
			else {
				ruleHtml.closest('.rule-wrapper').removeClass('has-rule').addClass('has-no-rule');
			}

			// Close the modal window
			cbj(this).closest('.modal').modal('hide').find('.modal-content').html('');

		},

		/**
		 *
		 * @param {jQuery} parentHtml jQuery that has the wrapper of the rule items selected
		 * @returns {Array} With objects for each item containing its metadata (or arrays for brackets containing the same)
		 */
		getRuleItems : function (parentHtml) {

			var items = [];
			var itemsHtml = parentHtml.children('.item');

			for (var i in itemsHtml) {
				if (itemsHtml.hasOwnProperty(i) === true) {

					// jQuery has things like lastObject in there which aren't what we need.
					if (isNaN(parseInt(i)) === true) {
						continue;
					}

					var itemData = module.getItemMetadata(cbj(itemsHtml[i]));

					switch(itemData.type) {

						// On brackets we recurse into the child html
						case 'bracket':
							items[i] = module.getRuleItems(cbj(itemsHtml[i]));
							break;

						// For functions we check for parameters and them in there are any
						case 'function':

							var parameters = cbj(itemsHtml[i]).find('.parameter');

							// Go into the function's parameter items (they got the same structure as regular conditions)
							itemData.parameters = [];
							for (var p in parameters) {
								if (parameters.hasOwnProperty(p)) {

									// jQuery has things like lastObject in there which aren't what we need.
									if (isNaN(parseInt(i)) === true) {
										continue;
									}

									// Get the items of the parameters..
									var parameterItems = module.getRuleItems(cbj(parameters[p]));
									// ..and push them into the meta data
									itemData.parameters.push(parameterItems);

								}
							}

							items[i] = itemData;
							break;

						// Here's the usual case, simply add the metadata
						default :
							items[i] = itemData;
							break;

					}
				}
			}
			return items;

		},

		/**
		 * Extracts all data attributes from the item
		 * @param {jQuery} item jQuery object with the item selected (the <span> of each item)
		 * @returns {{}}
		 */
		getItemMetadata: function(item) {

			var metaData = cbj(item).data();

			// This will contain all meta data for the item
			var returnData = {};

			// Loop through all data attributes and put them in the return var
			for (var i in metaData) {
				if (metaData.hasOwnProperty(i)) {

					// Skip jQueryUI's data attribute
					if (i === 'uiDraggable') {
						continue;
					}

					returnData[i] = metaData[i];
				}
			}

			// Get all input values and add them to the meta data
			cbj(item).find('.input').each(function() {

				// Get the meta data key
				var key = cbj(this).data('data-key');

				// Inputs that have no data-key must be some helper inputs - we skip them
				if (!key) {
					return;
				}

				// Get the value and normalize it to english number notation if it looks like a number
				var inputValue = cbj(this).val();
				var testValue = inputValue.replace(server.config.decimalSymbol, '.');
				var possibleNumber = Number(testValue);
				// Check if that made sense, if so, use the number version
				if (isNaN(possibleNumber) === false) {
					inputValue = possibleNumber;
				}

				returnData[key] = inputValue;

			});

			return returnData;

		},

		/**
		 * Takes the selected items (identified by the .selected class) and wrap them with bracket HTML
		 */
		putInBrackets : function() {

			var view = cbj(this).closest('.view-adminruleeditor');

			// Make some unique ID..
			var newId = Math.ceil(Math.random() * 20000);
			// ..and add it as ID attribute to the created bracket HTML
			view.find('.selected').wrapAll('<span class="item bracket" data-type="bracket" id="bracket-' + newId + '" />');
			// ..in order to reference to it for making it draggable
			cbj('#bracket-' + newId).makeDraggableItem().removeAttr('id');

			// Deselect any selected items
			view.find('.rule-area .selected').removeClass('selected');

		},

		/**
		 * Removes the selected items from the rule
		 */
		removeSelectedItems: function() {

			var view = cbj(this).closest('.view-adminruleeditor');

			// Loop through all .selected items in the terms
			view.find('.selected').each(function() {

				// If we deal with a bracket, its content stays. We detach, clone the bracket's children, then insert them after the bracket
				if (cbj(this).is('.bracket')) {
					cbj(this).children().detach().clone(true,true).insertAfter(cbj(this));
				}

				// The combinator after the item to remove gets removed too
				cbj(this).next('.combinator').remove();

				// In case it's the last item we remove, remove the combinator before it
				if (cbj(this).is(':last-child')) {
					cbj(this).prev('.combinator').remove();
				}

				// Finally remove the item
				cbj(this).remove();

			});

			// For any function parameters items that got removed, put a drop-area in their place
			view.find('.rule-editor .parameter').each(function() {
				var parameter = cbj(this);
				if (parameter.find('.item').length === 0) {
					var html = '<span class="parameter-drop-area">'+ parameter.data('parameter-name') +'</span>';
					parameter.html(html);
				}
			});

		},

		/**
		 * Adjusts the width of the text field (whatever we got with cbj(this)) to fit its content
		 */
		adjustTextFieldWidth: function() {

			// Get the entered text (or the placeholder text if empty)
			var text = (cbj(this).val() === '') ? cbj(this).attr('placeholder') : cbj(this).val();

			// Insert the text into the test span
			cbj('#width-tester').text(text);

			// Apply relevant styles
			cbj('#width-tester').css('font-size',cbj(this).css('font-size'));
			cbj('#width-tester').css('font-family',cbj(this).css('font-family'));

			// Get the width of the tester span
			var width = parseInt(cbj('#width-tester').css('width'));

			if (width < 10) {
				width = 10;
			}
			width += 10;

			// Apply the width (plus 10px) to the text-field
			cbj(this).css('width', width + 'px');
		}

	};

	return module;

});