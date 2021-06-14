/**
 * @module configbox/calcmatrix
 */
define(['cbj', 'kenedo', 'configbox/server', 'cbj.ui', 'cbj.dragtable'], function(cbj, kenedo, server) {
	"use strict";

	/**
	 * @exports configbox/calcmatrix
	 */
	var module = {

		initMatrixViewEach: function() {

			// Go through each matrix view that wasn't done yet
			cbj('.view-admincalcmatrix:not(.each-processing-done)').each(function() {

				var view = cbj(this);

				// Make columns sortable (using dragtable)
				view.find('.calc-matrix').dragtable({
					items: '.column-parameter .column-sort-handle',
					boundary: ':not(.column-parameter)'
				});

				// Make rows sortable (using jQueryUI sortable)
				view.find('.calc-matrix tbody').sortable({
					appendTo	: 'parent',
					items		: 'tr:not(.column-parameters)',
					helper		: 'clone',
					handle		: '.row-sort-handle',
					placeholder	: 'ui-state-highlight',
					axis		: 'y',
					start		: function(event, ui) {
						cbj(ui.helper).find('td').each(function(){
							var index = cbj(this).index();
							var width = cbj(this).closest('.calc-matrix').find('.column-parameters th').eq(index).outerWidth();
							cbj(this).outerWidth(width);
						});
					}
				});

				// Mark the view to avoid multiple processing (for edge-cases)
				view.addClass('each-processing-done');

			});

		},

		initMatrixViewOnce: function() {

			// Clicks on the gear symbol show things like the remove and reorder buttons
			cbj(document).on('click', '.view-admincalcmatrix .toggle-matrix-tools', module.onShowMatrixTools);

			cbj(document).on('click', '.view-admincalcmatrix .trigger-show-file-browser', module.onShowFileBrowser);

			// For the upload button (it reads a spreadsheet server-side and inserts its matrix values)
			cbj(document).on('change', '.spreadsheet-upload-input', module.onUploadSpreadsheet);

			// Tab clicks in the axis picker popup
			cbj(document).on('click', '.axis-parameter-picker .tab', module.onAxisPickerTabClick);

			// We tinker with the KenedoPopup (for axis parameter picking): Clicks on the trigger make the popup disappear
			cbj(document).on('click', '.view-admincalcmatrix .cell-axis-parameter .kenedo-popup-trigger-content', module.onAxisPickerOpenerClick);

			// Handlers for picking a question or calculation in the axis parameter picker
			cbj(document).on('change', '.axis-parameter-picker .question-picker', module.onQuestionPicked);
			cbj(document).on('change', '.axis-parameter-picker .calculation-picker', module.onCalculationPicked);

			// In the axis parameter picker you can disable an axis completely
			cbj(document).on('click', '.axis-parameter-picker .trigger-disable-axis', module.onDisableAxis);

			// Add a row in the matrix
			cbj(document).on('click', '.view-admincalcmatrix .trigger-add-row', module.addRow);

			// Add a column in the matrix
			cbj(document).on('click', '.view-admincalcmatrix .trigger-add-column', module.addColumn);

			// Removing a row or a column in the matrix
			cbj(document).on('click', '.view-admincalcmatrix .trigger-remove', module.onColumnOrRowRemove);

		},

		onShowMatrixTools: function() {
			cbj(this).toggleClass('active').closest('.matrix-wrapper-table').toggleClass('show-matrix-tools');
		},

		onAxisPickerTabClick: function() {
			cbj(this).addClass('tab-open').siblings().removeClass('tab-open');
			var id = cbj(this).attr('id').replace('tab-', '');
			cbj(this).closest('.axis-parameter-picker').find('#pane-' + id).addClass('pane-open').siblings().removeClass('pane-open');
		},

		onAxisPickerOpenerClick: function() {
			cbj(this).closest('.kenedo-popup-trigger').find('.kenedo-popup').fadeOut(200, function() { cbj(this).css('visible','hidden'); });
			cbj(this).closest('.kenedo-popup-trigger').trigger('popup-close');
		},

		onColumnOrRowRemove: function() {
			if (cbj(this).closest('.column-parameter').length) {

				var num = cbj(this).closest('th').index();

				cbj('.calc-matrix tr').each(function(){
					cbj(this).find('th:nth-child(' + (num + 1) + ')').remove();
					cbj(this).find('td:nth-child(' + (num + 1) + ')').remove();
				});

			}
			else {
				cbj(this).closest('tr').remove();
			}
		},

		onCalculationPicked: function() {

			var calculationId = cbj(this).val();
			var title = cbj(this).find('option[value=' + calculationId + ']').text();
			var picker = cbj(this);

			// First we need to figure out if we deal with the input for rows or columns
			// The picker is either within a div of class .column-parameter-picker or .row-parameter-picker
			var axis = (picker.closest('.column-parameter-picker').length === 0) ? 'row' : 'column';

			// There are hidden Kenedo props in the form where we store the type and ID of question or calculation
			// We set them now so they get stored once the user clicks on 'store'
			if (axis === 'column') {
				cbj('#column_type').val('calculation');
				cbj('#column_element_id').val('0').trigger('chosen:updated').trigger('change');
				cbj('#column_calc_id').val(calculationId).trigger('chosen:updated').trigger('change');

				cbj('.trigger-add-column').show();
			}
			else {
				cbj('#row_type').val('calculation');
				cbj('#row_element_id').val('0').trigger('chosen:updated').trigger('change');
				cbj('#row_calc_id').val(calculationId).trigger('chosen:updated').trigger('change');

				cbj('.trigger-add-row').show();
			}

			// Hide the label for questions and set the title of the calculation in the axis label
			if (axis === 'column') {
				cbj('.cell-column-parameter').find('.axis-label').hide();
				cbj('.cell-column-parameter').find('.label-calculation').show().find('.parameter-title').text(title);
			}
			else {
				cbj('.cell-row-parameter').find('.axis-label').hide();
				cbj('.cell-row-parameter').find('.label-calculation').show().find('.parameter-title').text(title);
			}

			// Prepare the HTML that goes in each input cell
			var inputHtml = '<i class="dragtable-drag-handle row-sort-handle fa fa-bars"></i>';
			inputHtml += '<input class="input-value" type="text" value="" />';
			inputHtml += '<span class="trigger-remove fa fa-times"></span>';

			// Prepare a selector to get all row or column parameter cells
			var inputTargetSelector = (axis === 'row') ? '.row-parameter' : '.column-parameter';

			// Fill each parameter cell (if they're not text already to preserve data entered already)
			cbj(inputTargetSelector).each(function() {
				if (cbj(this).find('input[type=text]').length === 0) {
					cbj(this).html(inputHtml);
				}
			});

			cbj(this).closest('.kenedo-popup').hide();

		},

		onQuestionPicked: function() {

			var questionId = cbj(this).val();
			var picker = cbj(this);

			// For questions as axis parameter, we need to get additional info about the question from the server
			server.makeRequest('ajaxapi', 'getAnswerDropdownData', {question_id: questionId})

				.done(function(answers) {

					// First we need to figure out if we deal with the input for rows or columns
					// The picker is either within a div of class .column-parameter-picker or .row-parameter-picker
					var axis = (picker.closest('.column-parameter-picker').length === 0) ? 'row' : 'column';

					// There are hidden Kenedo props in the form where we store the type and ID of question or calculation
					// We set them now so they get stored once the user clicks on 'store'
					if (axis === 'column') {
						cbj('#column_type').val('question');
						cbj('#column_calc_id').val('0').trigger('chosen:updated').trigger('change');
						cbj('#column_element_id').val(questionId).trigger('chosen:updated').trigger('change');

						cbj('.trigger-add-column').show();
					}
					else {
						cbj('#row_type').val('question');
						cbj('#row_calc_id').val('0').trigger('chosen:updated').trigger('change');
						cbj('#row_element_id').val(questionId).trigger('chosen:updated').trigger('change');

						cbj('.trigger-add-row').show();
					}

					// Get the selected question's id and title
					var questionTitle = picker.find('option[value=' + questionId + ']').text();

					// Prepare the axis parameter input HTML
					var inputHtml = '';

					// Add drag table handle, hide all the axis labels, later the right label get's unhidden
					if (axis === 'column') {
						cbj('.cell-column-parameter').find('.axis-label').hide();
						inputHtml += '<i class="dragtable-drag-handle column-sort-handle fa fa-bars"></i>';
					}
					else {
						cbj('.cell-row-parameter').find('.axis-label').hide();
						inputHtml += '<i class="dragtable-drag-handle row-sort-handle fa fa-bars"></i>';
					}

					// See how many dropdown answers we get (1 means no answers, there'll be just the 'no selection' item
					var answerCount = 0;
					cbj.each(answers, function() {
						answerCount++;
					});

					// If the question we use has answers, we add dropdowns
					if (answerCount > 1) {

						// Show and fill the axis label with the questions's title
						if (axis === 'column') {
							cbj('.cell-column-parameter').find('.axis-label').hide();
							cbj('.cell-column-parameter').find('.label-answers').show().find('.parameter-title').text(questionTitle);
						}
						else {
							cbj('.cell-row-parameter').find('.axis-label').hide();
							cbj('.cell-row-parameter').find('.label-answers').show().find('.parameter-title').text(questionTitle);
						}

						// Prepare the dropdown HTML
						inputHtml += '<select>';

						// Add each option to it
						cbj.each(answers, function(id, title) {
							inputHtml += '<option value="'+ id + '">'+ title +'</option>';
						});

						// And finish up
						inputHtml += '</select>';

					}
					// If the question we use has no answers, we add textboxes
					else {

						// Show and fill the label for non-answer questions
						if (axis === 'column') {
							cbj('.cell-column-parameter').find('.axis-label').hide();
							cbj('.cell-column-parameter').find('.label-textfield').show().find('.parameter-title').text(questionTitle);
						}
						else {
							cbj('.cell-row-parameter').find('.axis-label').hide();
							cbj('.cell-row-parameter').find('.label-textfield').show().find('.parameter-title').text(questionTitle);
						}

						// Make the input HTML
						inputHtml += '<input class="input-value" type="text" value="" />';
					}

					// In any case, add the removal trigger HTML
					inputHtml += '<span class="trigger-remove fa fa-times"></span>';

					// Increment var to make pre-selections for each dropdown axis parameter
					var nthOption = 1;

					var inputTargetSelector = (axis === 'row') ? '.row-parameter' : '.column-parameter';

					// Insert the inputs for axis parameters one by one
					cbj(inputTargetSelector).each(function(){

						// Replace the parameter input (if we do dropdowns in any case, if textbox only if there are dropdowns currently)
						if (answerCount > 1) {
							cbj(this).html(inputHtml);
						}
						else {
							if (cbj(this).find('input[type=text]').length === 0) {
								cbj(this).html(inputHtml);
							}
						}

						// If we added a dropdown, then preselect 'the next one'
						if (cbj(this).find('select').length !== 0) {
							cbj(this).find('select option:nth-child(' + nthOption + ')').prop('selected', true);
							// Bump up the increment var
							nthOption++;
						}

					});

					// Now close the picker popup
					picker.closest('.kenedo-popup').hide();

				});
		},

		addRow: function() {
			cbj('.calc-matrix tr:last').clone().appendTo('.calc-matrix');
			cbj('.calc-matrix tr:last .input-value').val('');
			cbj('.calc-matrix tr:last .price').val('');
		},

		addColumn: function() {
			cbj('.calc-matrix thead tr:first-child').first().find('th').last().clone().appendTo( cbj('.calc-matrix thead tr').first() ).find('input').val('');

			cbj('.calc-matrix tbody tr').each(function(){
				cbj(this).find('td').last().clone().appendTo(cbj(this)).find('input').val('');
			});
		},

		onDisableAxis: function() {

			var picker = cbj(this);

			// First we need to figure out if we deal with the input for rows or columns
			// The picker is either within a div of class .column-parameter-picker or .row-parameter-picker
			var axis = (picker.closest('.column-parameter-picker').length === 0) ? 'row' : 'column';

			// There are hidden Kenedo props in the form where we store the type and ID of question or calculation
			// We set them now so they get stored once the user clicks on 'store'
			if (axis === 'column') {
				cbj('#column_type').val('none');
				cbj('#column_calc_id').val('0').trigger('chosen:updated').trigger('change');
				cbj('#column_element_id').val('0').trigger('chosen:updated').trigger('change');

				cbj('.cell-column-parameter .label-none').show().siblings('.axis-label').hide();
			}
			else {
				cbj('#row_type').val('none');
				cbj('#row_calc_id').val('0').trigger('chosen:updated').trigger('change');
				cbj('#row_element_id').val('0').trigger('chosen:updated').trigger('change');

				cbj('.cell-row-parameter .label-none').show().siblings('.axis-label').hide();
			}

			// Remove excess rows or columns
			if (axis === 'column') {
				cbj('.calc-matrix td, .calc-matrix th').each(function(){
					if (cbj(this).index() > 1) {
						cbj(this).remove();
					}
				});
			}
			else {
				cbj('.calc-matrix tbody tr').each(function(){
					if (cbj(this).index() > 0) {
						cbj(this).remove();
					}
				});
			}

			// Make the input control empty
			if (axis === 'column') {
				cbj('.column-parameter').html('<input class="input-value" type="hidden" value="0" />');
				cbj('.trigger-add-column').hide();
			}
			else {
				cbj('.row-parameter').html('<input class="input-value" type="hidden" value="0" />');
				cbj('.trigger-add-row').hide();
			}

		},

		onShowFileBrowser: function() {
			cbj(this).closest('.view-admincalcmatrix').find('.spreadsheet-upload-input').click();
		},

		onUploadSpreadsheet: function (e) {

			e.preventDefault();
			e.stopPropagation();

			var inputField = cbj(this);

			// the user must have used the browse button
			var droppedFiles = inputField[0].files;

			// Give feedback if there's no file or more than one file
			if (droppedFiles.length !== 1 || !droppedFiles.length ) {
				window.alert('Please upload at least one file only.');
				return;
			}

			// Get FormData object and collect all form data
			var formData = new FormData();

			// Prepare the regular POST data
			var requestData = {
				option: 	'com_configbox',
				controller: 'admincalcmatrices',
				task: 		'getMatrixDataFromSpreadsheet',
				output_mode:'view_only'
			};

			// Put the POST data into the formData
			for (var key in requestData) {
				if (requestData.hasOwnProperty(key)) {
					formData.append(key, requestData[key]);
				}
			}

			// Add the file to the form data
			formData.append('file', droppedFiles[0]);

			// Now get an XHR object
			var xhr = new XMLHttpRequest();

			// When upload is done: Response is the same you get from configurator.sendSelectionToServer
			xhr.addEventListener('readystatechange', function() {

				// Set the file input empty so that change event fires on repeated uploads
				inputField.val('');

				if (xhr.readyState === XMLHttpRequest.DONE) {
					// Get the response and trigger the typical event (makes all work like the other questions)
					var response = JSON.parse(xhr.responseText);
					// Process the response data
					if(response.success === true) {
						module.updateMatrix(response.data);
					}
					else{
						window.alert(response.message);
					}
				}

			});

			var url = server.config.urlXhr;

			// Finally open a connection and send the form data
			xhr.open('post', url, true);
			xhr.send(formData);

		},

		/**
		 *
		 * @param data Array - two dimensional array. Keys are 'coordinates' (not input parameter values), first key is row number starting with 0
		 */
		updateMatrix: function(data) {

			var matrix = cbj('.calc-matrix');
			var i;

			// adjust rows count
			var currentRowsCount = matrix.find('tbody tr').length + 1;
			var dataRowsCount = data.length;
			var differenceRowsCount;

			if(!dataRowsCount) {
				return;
			}

			if (currentRowsCount > dataRowsCount) {
				differenceRowsCount = currentRowsCount - dataRowsCount;
				for (i = 0; i < differenceRowsCount; i++) {
					matrix.find('tbody tr:last-child th .trigger-remove').trigger('click');
				}
			}
			else if (currentRowsCount < dataRowsCount) {
				differenceRowsCount = dataRowsCount - currentRowsCount;
				for (i = 0; i < differenceRowsCount; i++) {
					module.addRow();
				}
			}

			// adjust column count
			var currentColumnsCount = matrix.find('thead th').length;
			var dataColumnsCount = data[0].length;
			var differenceColumnsCount;

			if (currentColumnsCount > dataColumnsCount) {
				differenceColumnsCount = currentColumnsCount - dataColumnsCount;
				for (i = 0; i < differenceColumnsCount; i++) {
					matrix.find('thead th:last-child .trigger-remove').trigger('click');
				}
			}
			else if (currentColumnsCount < dataColumnsCount) {
				differenceColumnsCount = dataColumnsCount - currentColumnsCount;
				for (i = 0; i < differenceColumnsCount; i++) {
					module.addColumn();
				}
			}

			// Go through each row and column of the matrix data and replace the right cell
			cbj.each(data, function(y, row) {
				cbj.each(row, function(x, value) {

					// Change the value into the localized number format
					if (typeof(value) === 'number' || typeof(value) === 'string') {
						value = String(value);
						value = value.replace(',', '');
						value = value.replace('.', server.config.decimalSymbol);
					}

					if (y == 0) {
						matrix.find('thead th:nth-child(' + (x+1) + ') input[type=text]').val(value);
					}
					else {
						if (x == 0) {
							matrix.find('tbody tr:nth-child(' + y + ') th input[type=text]').val(value);
						}
						else {
							matrix.find('tbody tr:nth-child(' + y + ') td:nth-child(' + (x + 1) + ') input[type=text]').val(value);
						}
					}

				});
			});

			// Make a flash on the cells so users feel a response
			window.setTimeout(function(){
				matrix.find('td').addClass('flash');
				matrix.find('.input-value').addClass('flash');
			}, 100);

			window.setTimeout(function(){
				matrix.find('td').removeClass('flash');
				matrix.find('.input-value').removeClass('flash');
			}, 1600);

		},

		onStoreMatrix: function(event) {

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

			var matrixView = form.find('.view-admincalcmatrix');
			var matrixJson = module.getMatrixJson(matrixView);

			if (matrixJson === false) {
				return;
			}

			form.find('input[name=matrix]').val(matrixJson);

			/**
			 * @event cbFormTaskTriggered
			 */
			form.trigger('cbFormTaskTriggered', taskInfo);

		},

		/**
		 *
		 * @param {jQuery} matrixView jQuery holding the matrix view
		 * @return {string|boolean} Matrix data JSON or false if data is not right
		 */
		getMatrixJson: function(matrixView) {

			matrixView.find('.calc-matrix .missing-value, .calc-matrix .invalid')
				.removeClass('missing-value')
				.removeClass('invalid');

			var columnParameters = [];
			var rowParameters = [];
			var valuesMissing = false;
			var duplicateValues = false;

			matrixView.find('.calc-matrix .column-parameter').each(function() {

				var value = '';

				if (cbj(this).find('select').length) {
					value = cbj(this).find('select').val();
				}
				if (cbj(this).find('input').length) {
					value = cbj(this).find('input').val();
				}

				if (value) {

					if (columnParameters.indexOf(value) === -1) {
						columnParameters.push(value);
					}
					else {
						cbj(this).addClass('duplicate-value');
						duplicateValues = true;
					}

				}
				else {

					cbj(this).addClass('missing-value');
					valuesMissing = true;

				}

			});

			matrixView.find('.calc-matrix .row-parameter').each(function(){

				var value = '';

				if (cbj(this).find('select').length) {
					value = cbj(this).find('select').val();
				}
				if (cbj(this).find('input').length) {
					value = cbj(this).find('input').val();
				}

				if (value) {

					if (rowParameters.indexOf(value) === -1) {
						rowParameters.push(value);
					}
					else {
						cbj(this).addClass('duplicate-value');
						duplicateValues = true;
					}

				}
				else {
					cbj(this).addClass('missing-value');
					valuesMissing = true;
				}

			});

			if (duplicateValues) {
				window.alert('You have some duplicate parameter values, please check your row and column headers');
				return false;
			}

			if (valuesMissing) {
				return false;
			}

			var matrixItems = [];
			var rowCount = 0;
			var ordering = 1;

			var valuesValid = true;

			matrixView.find('.calc-matrix tr:not(.column-parameters)').each(function() {
				var columnCount = 0;
				cbj(this).find('.price').each(function() {

					var value = cbj(this).val();

					if (value) {

						// Replace the localized decimal symbol with a dot and remove the thousands separator.
						value = value.replace(server.config.thousandsSeparator, '');
						value = value.replace(server.config.decimalSymbol, '.');

						// If a value does seem like a valid number, mark it
						if (isNaN(parseFloat(value)) === true) {
							cbj(this).addClass('invalid');
							valuesValid = false;
						}

					}
					else {
						value = 0;
					}

					var matrixItem = {
						x 		: columnParameters[columnCount],
						y 		: rowParameters[rowCount],
						value 	: value,
						ordering: ordering
					};
					matrixItems.push(matrixItem);
					columnCount++;
					ordering++;
				});
				rowCount++;
			});

			if (valuesValid === false) {
				window.alert('One or more values appear like invalid numbers. Please check');
				return false;
			}

			return JSON.stringify(matrixItems);

		}

	};

	return module;

});