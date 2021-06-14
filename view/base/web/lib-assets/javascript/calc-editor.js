/**
 * @module configbox/calcEditor
 */
define(['cbj', 'kenedo', 'configbox/server'], function(cbj, kenedo, server) {

	var calcEditor = {

		/**
		 *
		 * @returns {string}
		 */
		getCalculationJson: function() {

			// Remove all drop areas (just in case there are any left)
			cbj('.view-admincalcformula #terms .drop-area').remove();

			// Parse the HTML into the rule object
			var calcObjects = calcEditor.getCalcItems(cbj('.view-admincalcformula #terms'));
			return JSON.stringify(calcObjects);

		},

		/**
		 *
		 * @param {jQuery} parentHtml jQuery that has the wrapper of the calc items selected
		 * @returns {Array} With objects for each item containing its metadata (or arrays for brackets containing the same)
		 */
		getCalcItems : function (parentHtml) {

			var items = [];

			parentHtml.children('.item').each(function() {

				var item = cbj(this);

				var itemMetaData = calcEditor.getItemMetadata(item);

				switch(itemMetaData.type) {

					// On brackets we recurse into the child html
					case 'bracket':
						items.push(calcEditor.getCalcItems(item));
						break;

					// For functions we check for parameters and them in there are any
					case 'function':

						itemMetaData.parameters = [];

						// Go into the function's parameter items (they got the same structure as regular terms)
						cbj(item).find('.parameter').each(function() {
							var parameter = cbj(this);
							// Get the items of the parameters..
							var parameterItems = calcEditor.getCalcItems(parameter);
							// ..and push them into the meta data
							itemMetaData.parameters.push(parameterItems);

						});

						items.push(itemMetaData);

						break;

					// Here's the usual case, simply add the metadata
					default :
						items.push(itemMetaData);
						break;

				}

			});

			return items;

		},

		/**
		 * Extracts all data attributes from the item
		 * @param {jQuery} item jQuery object with the item selected (the <span> of each item)
		 * @returns {{}}
		 */
		getItemMetadata: function(item) {

			var metaData = cbj(item).data();

			// Get rid of uiDraggable. Can't simply delete it, that would remove it from the element since it is referenced
			var returnData = {};
			for (var i in metaData) {
				if (metaData.hasOwnProperty(i)) {
					if (i !== 'uiDraggable') {
						returnData[i] = metaData[i];
					}
				}
			}

			// Get all input values and add them to the meta data
			cbj(item).find('.input').each(function() {

				// Replace localized decimal symbol and check if the number is valid
				var input = cbj(this).val();
				var testValue = input.replace(server.config.decimalSymbol, '.');
				var possibleNumber = Number(testValue);
				// Check if that made sense, if so, use the number version
				if (isNaN(possibleNumber) === false) {
					input = possibleNumber;
				}
				// Get the meta data key
				var key = cbj(this).data('data-key');
				returnData[key] = input;

			});

			return returnData;

		},

		/**
		 * Takes the selected items (identified by the .selected class) and wrap them with bracket HTML
		 */
		putInBrackets : function() {

			// Make some unique ID..
			var newId = Math.ceil(Math.random() * 20000);
			// ..and add it as ID attribute to the created bracket HTML
			cbj('.view-admincalcformula .selected').wrapAll('<span class="item bracket" data-type="bracket" id="bracket-' + newId + '" />');
			// ..in order to reference to it for making it draggable
			cbj('#bracket-' + newId).makeDraggableItem().removeAttr('id');

			// Unselect any selected items
			cbj('#rule .selected').removeClass('selected');

		},

		/**
		 * Removes the selected items from the calculation
		 */
		removeSelectedItems : function() {

			// Loop through all .selected items in the terms
			cbj('.view-admincalcformula #terms .selected').each(function(){

				// If we deal with a bracket, its content stays. We detach, clone the bracket's children, then insert them after the bracket
				if (cbj(this).is('.bracket')) {
					cbj(this).children().detach().clone(true,true).insertAfter(cbj(this));
				}

				// The operator after the item to remove gets removed too
				cbj(this).next('.operator').remove();

				// In case it's the last item we remove, remove the operator before it
				if (cbj(this).is(':last-child')) {
					cbj(this).prev('.operator').remove();
				}

				// Finally remove the item
				cbj(this).remove();

			});

			// For any function parameters that got removed, replace the void with the parameter drop area
			cbj('.view-admincalcformula #terms .parameter').each(function() {
				if (cbj(this).find('.item').length === 0) {
					var html = '<span class="parameter-drop-area">'+ cbj(this).data('parameter-name') +'</span>';
					cbj(this).html(html);
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

	/**
	 * @exports configbox/calcEditor
	 */
	var module = {

		initCalcEditorEach: function() {

			// Make items in terms draggable
			cbj('.view-admincalcformula #terms .item').makeDraggableItem();

			// Make operators, numbers etc draggable
			cbj('#operator-blueprints .item, #custom-term-blueprints .item').makeDraggableItem();

			// Make items in the selected panel draggable
			cbj('.view-admincalcformula .selected-panel .item').makeDraggableItem();

			// On selection of a new panel, make items in there draggable
			cbj('.view-admincalcformula').on('panelSelected', function() {
				cbj('.view-admincalcformula .selected-panel .item').makeDraggableItem();
			});

			// Add drop zone functionality to initial area
			cbj('.view-admincalcformula .drop-area').makeDropZone();

			// Clicks on items make the item selected (and other items unselected, unless shift key is held)
			cbj('.view-admincalcformula #terms').on('click', '.item', function( event ) {

				// Unselect anything, unless shift key is held
				if (!event.shiftKey) {
					cbj('.view-admincalcformula #terms .selected').removeClass('selected');
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

			// Clicks on the terms area (outside items) should unselect any item
			cbj('.view-admincalcformula #terms').on('click', function(event) {
				// Unless the click was made on an item, unselect anthing
				if (cbj(event.target).is('.item') === false && cbj(event.target).closest('.item').length === 0) {
					cbj('.view-admincalcformula #terms .selected').removeClass('selected');
				}
			});

			// Trigger for item squeezer button
			cbj('.view-admincalcformula').on('click', '.button-limit-term-width', function() {
				cbj('.view-admincalcformula #rule').toggleClass('squeeze');
			});

			// Trigger for removing items
			cbj('.view-admincalcformula').on('click', '.button-remove-selected-items', function() {
				calcEditor.removeSelectedItems();
			});

			// Trigger for putting items in brackets
			cbj('.view-admincalcformula').on('click', '.button-put-in-brackets', function() {
				calcEditor.putInBrackets();
			});

			// Key-press functionality
			cbj(document).keyup(function(event){

				switch (event.which) {

					// Back-space for removing items
					case 46:
						calcEditor.removeSelectedItems();
						break;

				}

				event.preventDefault();
			});

			// Tab functionality for switching between term types
			cbj('.view-admincalcformula').on('click', '.picker-tab', function() {
				var panelId = cbj(this).attr('id');
				cbj(this).addClass('selected-tab').siblings().removeClass('selected-tab');
				cbj('.picker-panels .' + panelId).addClass('selected-panel').siblings().removeClass('selected-panel');
				cbj('.view-admincalcformula').trigger('panelSelected', [panelId]);
			});

			// Adjust the text field widths on startup
			cbj('.view-admincalcformula .term input[type=text]').each(calcEditor.adjustTextFieldWidth);

			// Adjust the text field widths on change
			cbj('.view-admincalcformula').on('keyup change click', '.term input[type=text]', calcEditor.adjustTextFieldWidth);

			/* Element panel - filtering functionality - START */

			// Product filter functionality
			cbj('body').on('change', '.view-admincalcformula .product-filter select', function() {

				var productId = cbj(this).val();

				cbj('.page-filter-' + productId).show().siblings().hide();

				cbj('#element-picker li').removeClass('shown').removeClass('selected');

				var selector = '#element-picker .product-' + productId;

				cbj( selector ).addClass('shown');

				cbj('#element-picker li.hidden-by-element-filter').removeClass('hidden-by-element-filter');
				cbj('#element-filter').val('');

			});

			// Page filter functionality
			cbj('body').on('change', '.view-admincalcformula select.page-filter', function() {

				var productId = cbj('#product-filter').val();
				var pageId = parseInt(cbj(this).val());

				cbj('#element-picker li').removeClass('shown').removeClass('selected');

				var selector;

				if (pageId === 0) {
					selector = '#element-picker .product-' + productId;
				}
				else {
					selector = '#element-picker .page-' + pageId + '.product-' + productId;
				}

				cbj(selector).addClass('shown');

				cbj('#element-picker li.hidden-by-element-filter').removeClass('hidden-by-element-filter');
				cbj('#element-filter').val('');

			});

			cbj('.view-admincalcformula #element-filter').keyup(function(){

				var filterText = cbj(this).val();
				filterText = filterText.trim();
				filterText = filterText.toLowerCase();

				if (filterText === '') {
					cbj('#element-picker li').removeClass('hidden-by-element-filter');
				}

				cbj('#element-picker li.shown').each(function(){
					var elementText = cbj(this).text();
					elementText = elementText.trim();
					elementText = elementText.toLowerCase();
					if (elementText.indexOf(filterText) === -1) {
						cbj(this).addClass('hidden-by-element-filter');
					}
					else {
						cbj(this).removeClass('hidden-by-element-filter');
					}
				});

			});

			// Functionality to pick an element from the element picker
			cbj('.view-admincalcformula #element-picker .element-list li').click(function(){

				var id = cbj(this).attr('id').replace('element-','');
				cbj('#xref-group-' + id).show().siblings().hide();

				// Make the shown items draggable
				cbj('#element-attributes #xref-group-' + id + ' .item').makeDraggableItem();

				cbj(this).addClass('picked').siblings().removeClass('picked');

				cbj('#element-attributes').show();

			});

			/* Element panel - filtering functionality - END */


		},

		initCalcEditorOnce: function() {

			// jQuery function for making an HTML element a drop zone
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
						if (typeof(draggedItem) !== 'undefined' && draggedItem.closest('#terms').length) {
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

			// jQuery function for making an HTML element draggable the way we want it
			cbj.fn.makeDraggableItem = function() {

				this.draggable({

					addClasses: false,
					revert: true,
					helper: 'clone',
					opacity: 0.8,

					start: function() {

						// Hide original if in terms
						if (cbj(this).closest('#terms').length) {
							cbj(this).hide();
						}

						// Remove pre-existing drop-areas
						cbj('#terms .drop-area').not('.initial').remove();

						// Set revert duration to 100ms
						cbj(this).draggable('option','revertDuration',100);

						var dropZoneSelectorBefore = '';
						var dropZoneSelectorAfter = '';

						// Figure out where to put drop zones
						if (cbj(this).is('.term') || cbj(this).is('.bracket')) {
							dropZoneSelectorBefore = '.operator:first-child';
							dropZoneSelectorAfter = '.operator';
						}

						if (cbj(this).is('.operator')) {
							dropZoneSelectorBefore = '.term + .term, .bracket + .bracket, .term + .bracket, .term:first-child, .bracket:first-child';
							dropZoneSelectorAfter = '.term:last-child, .bracket:last-child';
						}

						if (!dropZoneSelectorBefore || !dropZoneSelectorAfter) {
							throw('Could not figure out dropzone selectors.');
						}

						if (cbj('#terms .drop-area').length === 0) {
							var dropZoneMarkup = '<div class="drop-area">&nbsp;</div>';

							// Add drop zone markup
							cbj('#terms').find(dropZoneSelectorBefore).before(dropZoneMarkup);
							cbj('#terms').find(dropZoneSelectorAfter).after(dropZoneMarkup);
							cbj('#rule').find('.bracket:empty').html(dropZoneMarkup);

							if (cbj('#terms .term').length === 0) {
								cbj('#terms').html(dropZoneMarkup);
							}

							if (cbj(this).closest('#terms').length) {
								cbj(this).after( dropZoneMarkup );
							}

							// Add drop zone functionality
							cbj('#terms .drop-area').makeDropZone( cbj(this) );
							cbj('#terms .parameter-drop-area').makeDropZone( cbj(this) );

						}

					},

					stop: function() {

						// Remove drop-zones
						if ( cbj('#terms .item').length !== 0) {
							cbj('#terms .drop-area').remove();
						}

						// Show the previously hidden original item
						cbj(this).show();
					}

				});

				return this;

			};

		},

		onStoreCalculation: function(event) {

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

			kenedo.setFormParameter(form, 'task', task);

			var calculationJson = calcEditor.getCalculationJson();

			if (calculationJson === false) {
				return;
			}

			form.find('input[name=calc]').val(calculationJson);

			/**
			 * @event cbFormTaskTriggered
			 */
			form.trigger('cbFormTaskTriggered', taskInfo);
			
		}

	};

	return module;


});