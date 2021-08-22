/* global alert, confirm, alert, console, define, cbrequire: false */
/* jshint -W116 */

/**
 * @module configbox/questions
 */
define(['cbj', 'configbox/configurator'], function(cbj, configurator) {

	"use strict";

	var questionCalendar = {

		init: function() {

		},

		initEach: function() {

			if (cbj('.question.type-calendar').length === 0) {
				return;
			}

			cbrequire(['cbj.ui'], function() {

				cbj('.question.type-calendar').each(function() {

					var question = cbj(this);

					if (question.hasClass('initialized')) {
						return;
					}
					question.addClass('initialized');

					cbj.datepicker.setDefaults(question.data('locale'));

					var questionId = question.data('questionId');
					var pickerDiv = cbj('#input-' + questionId);

					var parameters = {
						showOn: 'button',
						dateFormat: 'yy-mm-dd',
						altField: '#output-helper-' + questionId,
						altFormat: configurator.getConfiguratorData('dateFormat'),
						minDate: null,
						maxDate: null,

						onSelect: function(date) {

							pickerDiv.datepicker('destroy');

							window.setTimeout(
								function() {
									question.find('.pseudo-text-field').text( cbj('#output-helper-'+questionId).val() );
								}, 200);

							configurator.sendSelectionToServer(questionId, date);

						}

					};

					switch( configurator.getQuestionPropValue(questionId, 'calendar_validation_type_min')) {
						case 'days':
							parameters.minDate = parseInt(configurator.getQuestionPropValue(questionId, 'calendar_days_min'));
					}
					switch( configurator.getQuestionPropValue(questionId, 'calendar_validation_type_max')) {
						case 'days':
							parameters.maxDate = parseInt(configurator.getQuestionPropValue(questionId, 'calendar_days_max'));
					}

					switch (configurator.getQuestionPropValue(questionId, 'calendar_first_day')) {

						case 'sunday':
							parameters.firstDay = 0;
							break;

						case 'monday':
							parameters.firstDay = 1;
							break;
					}

					// Set click handler to show the calendar with the button
					cbj(this).find('.trigger-show-calendar').on('click', function() {

						if (question.hasClass('non-applying-question')) {
							return;
						}

						if (pickerDiv.hasClass('hasDatepicker')) {
							pickerDiv.datepicker('destroy');
						}
						else {
							pickerDiv.datepicker(parameters).datepicker('setDate', question.data('selection'));
						}

					});

				});

			});

		},

		onSystemSelectionChange: function(event, questionId, selection) {

			// Skip anything that isn't a calendar question
			if (cbj('#question-' + questionId).is('.type-calendar') === false) {
				return;
			}

			cbj('#input-' + questionId).datepicker('setDate', selection);
		},

		onQuestionActivation: function(event, questionId) {

		},

		onQuestionDeactivation: function(event, questionId) {

			cbj('#input-' + questionId).datepicker('setDate', null);
			cbj('#input-' + questionId).datepicker('refresh');
			window.setTimeout(
				function() {
					cbj('#question-'+questionId).find('.form-control-static').text( cbj('#output-helper-'+questionId).val() );
				}, 200);
		},

		onAnswerActivation: function(event, questionId, answerId) {

		},

		onAnswerDeactivation: function(event, questionId, answerId) {

		},

		onValidationChange: function(event, questionId, minMax) {
			cbj('.input-' + questionId).datepicker('option', 'minDate', minMax.minval);
			cbj('.input-' + questionId).datepicker('option', 'maxDate', minMax.maxval);
			cbj('.input-' + questionId).datepicker('refresh');
		},

		onValidationMessageShown: function(event, questionId, message) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-calendar') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function(event, questionId) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-calendar') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();

		}

	};

	var questionRalColorpicker = {

		init: function() {

			cbj(document).on('click', '.ral-color-picker-output',  function () {
				var question =  cbj(this).closest('.question');
				question.find('.trigger-show-ralcolorpicker').trigger('click');
			});

			cbj(document).on('click', '.trigger-show-ralcolorpicker', function () {
				var question = cbj(this).closest('.question');
				var applying = question.hasClass('applying-question');
				if (applying) {
					cbrequire(['cbj.bootstrap'], function () {
						question.find('.modal').modal();
					});
				}
			});

			cbj(document).on('click', '.close-modal', function () {
				var question = cbj(this).closest('.question');
				cbrequire(['cbj.bootstrap'], function () {
					question.find('.modal').modal('hide');
				});
			});

			cbj(document).on('change', 'select.ral-color-group', function () {

				// Get the group ID carefully
				var colorGroupId = parseInt(cbj(this).val());
				if (isNaN(colorGroupId) === true) {
					colorGroupId = 0;
				}

				// Store the group ID for next modal opening
				cbj(this).closest('.question').data('selection-group-id', colorGroupId);

				// Show the right group or all when ID is 0
				if (colorGroupId === 0) {
					cbj(this).closest('.question').find('.ral-color').show();
				}
				else {
					cbj(this).closest('.question').find('.ral-color').hide();
					cbj(this).closest('.question').find('.ral-color[data-group-id="' + colorGroupId + '"]').show();
				}

			});

			cbj(document).on('click', '.trigger-pick-ral-color', function() {

				var color = cbj(this);
				var colorId = 'RAL ' + color.data('color-id');
				var colorHex = color.data('hex');
				var colorGroupId = color.data('group-id');
				var colorIsDark = color.hasClass('is-dark');

				var question = cbj(this).closest('.question');
				var questionId = question.data('question-id');

				question.data('selection-group-id', colorGroupId);

				question.find('.ral-color-input').val(colorId);

				var output = question.find('.ral-color-picker-output');
				output.css('background-color', colorHex);
				if (colorIsDark) {
					output.addClass('is-dark');
				}
				else {
					output.removeClass('is-dark');
				}
				output.text(color.text());

				cbrequire(['cbj.bootstrap'], function () {
					question.find('.modal').modal('hide');
				});

				configurator.sendSelectionToServer(questionId, colorId);
			});

		},

		initEach: function() {

		},

		onSystemSelectionChange: function(event, questionId, selection) {
			var question = cbj('#question-' + questionId);
			var type = question.data('question-type');
			if (type === 'ralcolorpicker') {
				var output = question.find('.ral-color-picker-output');
				if(selection) {
					var colorId = selection.split(" ")[1];
					var color = question.find('.modal .ral-color[data-color-id="'+colorId+'"]');
					var colorHex = color.data('hex');
					var colorText = color.text();
					var colorIsDark = color.hasClass('is-dark');
					output.css('background-color', colorHex);
					output.removeClass('is-dark');
					if(colorIsDark) output.addClass('is-dark');
					output.text(colorText);
				}
				else {
					output.css('background-color', 'transparent');
					output.text('');
				}
			}

		},

		onQuestionActivation: function(event, questionId) {

		},

		onQuestionDeactivation: function(event, questionId) {

		},

		onAnswerActivation: function(event, questionId, answerId) {

		},

		onAnswerDeactivation: function(event, questionId, answerId) {

		},

		onValidationChange: function(event, questionId, minMax) {

		},

		onValidationMessageShown: function(event, questionId, message) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-ralcolorpicker') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function(event, questionId) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-ralcolorpicker') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();

		}

	};

	var questionColorpicker = {

		init: function() {

			cbrequire(['kenedo', 'configbox/server'], function(kenedo, server) {
				let url = server.config.urlSystemAssets + '/kenedo/external/jquery.spectrum-1.8.0/spectrum.css';
				kenedo.addStylesheet(url);
			});

			cbrequire(['cbj.spectrum'], function() {

				// Opening/Closing the color picker
				cbj(document).on('click', '.question.type-colorpicker .trigger-show-colorpicker, .question.type-colorpicker .color-picker-output', function() {

					// Block if the question is disabled
					if (cbj(this).closest('.question.type-colorpicker').hasClass('non-applying-question') === true) {
						return;
					}

					cbj(this).closest('.question.type-colorpicker').find('.wrapper-flat-spectrum').slideToggle();

				});


				// Entering a hex code in spectrum makes an immediate change (once we got 7 chars)
				cbj(document).on('keyup', '.cb-spectrum .sp-input', function() {

					var selection = cbj(this).val();

					if (selection.length === 7) {
						cbj('.sp-active').closest('.question.type-colorpicker').find('.color-picker-input').spectrum('set', selection).trigger('change');
					}

				});

			});

		},

		initEach: function() {

			cbrequire(['cbj.spectrum'], function() {

				cbj('.question.type-colorpicker .spectrum-input').each(function() {

					if (cbj(this).hasClass('initialized')) {
						return;
					}
					cbj(this).addClass('initialized');

					// Init the spectrum pickers
					cbj(this).spectrum({
						flat: true,
						showInput: true,
						showInitial: false,
						allowEmpty: false,
						showAlpha: false,
						disabled: false,
						showPalette: true,
						showPaletteOnly: false,
						togglePaletteOnly: false,
						showSelectionPalette: true,
						clickoutFiresChange: false,
						cancelText: '',
						chooseText: '',
						containerClassName: 'cb-spectrum',
						replacerClassName: 'cb-replacer form-control',
						preferredFormat: 'hex',

						// A change triggers an immediate store
						change: function(color) {

							// Get values
							var questionId = cbj(this).closest('.question.type-colorpicker').data('questionId');
							var selection = color.toHexString();

							// Set the background color in the output bar
							cbj(this).closest('.question.type-colorpicker').find('.color-picker-output').css('background-color', selection);

							// Store the selection
							configurator.sendSelectionToServer(questionId, selection);

						},

						// Moving the picker needle triggers a delayed store
						move: function(color) {

							// Get a ref to the picker (so we can read from it in the timeout function)
							var that = cbj(this);

							// Prime the timeout if there isn't one already
							questionColorpicker.timeout = questionColorpicker.timeout || null;

							// We start storing with a delay in the next step - here we cancel any running JS timeout
							if (questionColorpicker.timeout) {
								window.clearTimeout(questionColorpicker.timeout);
							}

							// Set a timeout for storing the selection (delayed store)
							questionColorpicker.timeout = window.setTimeout(

								function() {

									// Set the color in the output div
									cbj(that).closest('.question.type-colorpicker').find('.color-picker-output').css('background-color', color.toHexString());
									// Store the selection
									var questionId = cbj(that).closest('.question.type-colorpicker').data('questionId');

									// Get the color in hex
									var selection = color.toHexString();

									configurator.sendSelectionToServer(questionId, selection);

								},
								400
							);

						}

					});

				});

			});

		},

		onSystemSelectionChange: function(event, questionId, selection) {

			cbj('#question-' + questionId).find('.spectrum-input').spectrum('set', selection);
			cbj('#question-' + questionId).find('.color-picker-output').css('background-color', selection);

		},

		onQuestionActivation: function(event, questionId) {

		},

		onQuestionDeactivation: function(event, questionId) {

			// Unset the current background color in the output bar
			cbj('#question-' + questionId).find('.color-picker-output').css('background-color', 'transparent');

			// Slide up the color picker (in case it's open)
			cbj('#question-' + questionId).find('.wrapper-flat-spectrum').slideUp();

		},

		onAnswerActivation: function(event, questionId, answerId) {

		},

		onAnswerDeactivation: function(event, questionId, answerId) {

		},

		onValidationChange: function(event, questionId, minMax) {

		},

		onValidationMessageShown: function(event, questionId, message) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-colorpicker') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function(event, questionId) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-colorpicker') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();

		}

	};

	var questionTextbox = {

		init: function() {

		},

		initEach: function() {

			cbj('.question.type-textbox').each(function() {

				if (cbj(this).hasClass('initialized')) {
					return;
				}
				cbj(this).addClass('initialized');

				var questionId = cbj(this).data('questionId');

				cbj('#input-question-' + questionId).on('keyup', function() {

					// Get what is currently in the text box
					var input = cbj(this);

					// Prime the timeout if there isn't one already
					questionTextbox.timeout = questionTextbox.timeout || null;

					// We start storing with a delay in the next step - here we cancel any running JS timeout
					if (questionTextbox.timeout) {
						window.clearTimeout(questionTextbox.timeout);
					}

					// Set a timeout for storing the text
					questionTextbox.timeout = window.setTimeout(
						function() {
							configurator.sendSelectionToServer(questionId, input.val());
						},
						400
					);

				});

			});

		},

		onSystemSelectionChange: function(event, questionId, selection) {
			cbj('#input-question-' + questionId).val(selection);
		},

		onQuestionActivation: function(event, questionId) {
			cbj('#input-question-' + questionId).prop('disabled', false);
		},

		onQuestionDeactivation: function(event, questionId) {
			cbj('#input-question-' + questionId).prop('disabled', true).val('');
		},

		onAnswerActivation: function(event, questionId) {

		},

		onAnswerDeactivation: function(event, questionId, answerId) {

		},

		onValidationChange: function(event, questionId, minMax) {

		},

		onValidationMessageShown: function(event, questionId, message) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-textbox') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function(event, questionId) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-textbox') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	var questionTextarea = {

		init: function() {

		},

		initEach: function() {

			cbj('.question.type-textarea').each(function() {

				if (cbj(this).hasClass('initialized')) {
					return;
				}
				cbj(this).addClass('initialized');

				var questionId = cbj(this).data('questionId');

				cbj('#input-question-' + questionId).on('keyup', function() {

					// Get what is currently in the text box
					var textarea = cbj(this);

					// Prime the timeout if there isn't one already
					questionTextarea.timeout = questionTextarea.timeout || null;

					// We start storing with a delay in the next step - here we cancel any running JS timeout
					if (questionTextarea.timeout) {
						window.clearTimeout(questionTextarea.timeout);
					}

					// Set a timeout for storing the text
					questionTextarea.timeout = window.setTimeout(
						function() {
							configurator.sendSelectionToServer(questionId, textarea.val());
						},
						400
					);

				});

			});

		},

		onSystemSelectionChange: function(event, questionId, selection) {
			cbj('#input-question-' + questionId).val(selection);
		},

		onQuestionActivation: function(event, questionId) {
			cbj('#input-question-' + questionId).prop('disabled', false);
		},

		onQuestionDeactivation: function(event, questionId) {
			cbj('#input-question-' + questionId).prop('disabled', true).val('');
		},

		onAnswerActivation: function(event, questionId) {

		},

		onAnswerDeactivation: function(event, questionId, answerId) {

		},

		onValidationChange: function(event, questionId, minMax) {

		},

		onValidationMessageShown: function(event, questionId, message) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-textarea') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function(event, questionId) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-textarea') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	var questionCheckbox = {

		init: function() {

			cbj(document).on('change', '.question.type-checkbox input[type=checkbox]', function() {

				var questionId = cbj(this).closest('.question').data('question-id');
				var answer = cbj(this).closest('.answer');
				var selection = (cbj(this).prop('checked') === true) ? cbj(this).val() : '';

				if (selection) {
					answer.addClass('selected');
				}
				else {
					answer.removeClass('selected');
				}

				configurator.sendSelectionToServer(questionId, selection);

			});

		},

		initEach: function() {

		},

		onSystemSelectionChange: function(event, questionId, selection) {

			// Skip anything that isn't a checkbox question
			if (cbj('#question-' + questionId).is('.type-checkbox') === false) {
				return;
			}

			var checked = !(selection === '' || selection === 0 || selection === null);
			cbj('#answer-input-' + selection).prop('checked', checked);
		},

		onQuestionActivation: function(event, questionId) {
			cbj('#question-' + questionId + ' input[type=checkbox]').prop('disabled', false);
		},

		onQuestionDeactivation: function(event, questionId) {
			cbj('#question-' + questionId + ' input[type=checkbox]').prop('checked', true).prop('disabled', true);
		},

		onAnswerActivation: function(event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', false);
		},

		onAnswerDeactivation: function(event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', true).prop('checked', false);
		},

		onValidationChange: function(event, questionId, minMax) {

		},

		onValidationMessageShown: function(event, questionId, message) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-checkbox') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function(event, questionId) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-checkbox') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	var questionRadiobuttons = {

		init: function() {

			cbj(document).on('change', '.question.type-radiobuttons input[type=radio]', function() {

				if (cbj(this).prop('checked') === false) {
					return;
				}

				var questionId = cbj(this).closest('.question').data('question-id');
				var answer = cbj(this).closest('.answer');
				var selection = parseInt(cbj(this).val());

				answer.addClass('selected').siblings().removeClass('selected');

				configurator.sendSelectionToServer(questionId, selection);

			});

		},

		initEach: function() {

		},

		onSystemSelectionChange: function(event, questionId, selection) {

			if (cbj('#question-' + questionId).is('.type-radiobuttons')) {
				cbj('#answer-' + selection).addClass('selected').siblings().removeClass('selected');
				var checked = !(selection === '' || selection === 0 || selection === null);
				cbj('#answer-input-' + selection).prop('checked', checked);
			}

		},

		onQuestionActivation: function(event, questionId) {
			cbj('#question-' + questionId + ' input[type=radio]').prop('disabled', false);
		},

		onQuestionDeactivation: function(event, questionId) {
			cbj('#question-' + questionId + ' input[type=radio]').prop('checked', false).prop('disabled', true);
		},

		onAnswerActivation: function(event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', false);
		},

		onAnswerDeactivation: function(event, questionId, answerId) {
			cbj('#answer-' + answerId).removeClass('selected');
			cbj('#answer-input-' + answerId).prop('disabled', true).prop('checked', false);
		},

		onValidationChange: function(event, questionId, minMax) {

		},

		onValidationMessageShown: function(event, questionId, message) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-radiobuttons') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function(event, questionId) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-radiobuttons') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	var questionDropdown = {

		init: function() {

			// Dropdown open functionality
			cbj(document).on('click', '.configbox-dropdown-trigger', function() {
				cbj(this).toggle();
				cbj(this).closest('.question').find('.configbox-dropdown').toggle();
			});

			// Clicks outside the dropdown close the dropdown
			cbj(document).on('click', function(event) {

				// Safeguard in case the browser does not have event.target
				if (typeof(event.target) === 'undefined') {
					return;
				}

				// If the click comes from within the trigger, leave it be
				if (cbj(event.target).is('.configbox-dropdown-trigger') || cbj(event.target).closest('.configbox-dropdown-trigger').length !== 0) {
					return;
				}

				// Show any trigger from visible dropdowns..
				cbj('.configbox-dropdown:visible').closest('.question').find('.configbox-dropdown-trigger').show();
				// ..and hide any dropdown
				cbj('.configbox-dropdown').hide();
			});

			// Finally the change handler for selections
			cbj(document).on('change', '.question.type-dropdown .answer input', function () {

				var questionId = cbj(this).closest('.question').data('questionId');

				var answer = cbj(this).closest('.answer').clone();
				answer.find('input').remove();
				cbj(this).closest('.question').find('.configbox-dropdown-trigger').empty().append(answer.find('label')).append(answer.find('.answer-price-display'));
				cbj(this).closest('.configbox-dropdown').hide();
				cbj(this).closest('.question').find('.configbox-dropdown-trigger').show();

				var selection = cbj(this).val();
				cbj('#answer-' + selection).addClass('selected').siblings().removeClass('selected');

				configurator.sendSelectionToServer(questionId, selection);

			});

			cbj('.question.type-dropdown').each(function() {

				// Keep the dropdown trigger text for later
				cbj(this).data('triggerDefault', cbj(this).find('.configbox-dropdown-trigger').clone(false));

				// If question got a selection already, put the part of the answer html into the trigger
				if (cbj(this).find('.selected').length) {
					var answer = cbj(this).find('.selected').clone();
					answer.find('input').remove();
					cbj(this).find('.configbox-dropdown-trigger').empty().append(answer.find('label')).append(answer.find('.answer-price-display'));
				}

			});

		},

		initEach: function() {

		},

		onSystemSelectionChange: function(event, questionId, selection) {

			// Skip anything that isn't a dropdown
			if (cbj('#question-' + questionId).is('.type-dropdown') === false) {
				return;
			}

			if (selection === null || selection === 0 || selection === '0') {
				cbj('#question-' + questionId).find('.answer').removeClass('selected');
				cbj('#question-' + questionId).find('.configbox-dropdown-trigger').replaceWith( cbj('#question-' + questionId).data('triggerDefault') );
				return;
			}

			selection = parseInt(selection);

			cbj('#answer-input-' + selection).prop('checked', true);

			if (selection) {

				// Mark the answer wrapper with class 'selected' (and remove the class from any siblings)
				cbj('#answer-' + selection).addClass('selected').siblings().removeClass('selected');

				// Copy over the answer html to the trigger
				var answer = cbj('#answer-' + selection).clone();
				answer.find('input').remove();
				cbj('#question-' + questionId).find('.configbox-dropdown-trigger').empty().append( answer.find('label')).append(answer.find('.answer-price-display') );
			}
			else {
				// Remove the 'selected' class flag and put the default trigger text into the trigger
				cbj('#answer-' + selection).removeClass('selected');
				cbj('#question-' + questionId).find('.configbox-dropdown-trigger').replaceWith( cbj('#question-' + questionId).data('triggerDefault') );
			}

		},

		onQuestionActivation: function(event, questionId) {
			cbj('#question-' + questionId + ' input[type=radio]').prop('disabled', false);
		},

		onQuestionDeactivation: function(event, questionId) {
			cbj('#question-' + questionId + ' input[type=radio]').prop('checked', true).prop('disabled', true);
		},

		onAnswerActivation: function(event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', false);
		},

		onAnswerDeactivation: function(event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', true).prop('checked', false);
		},

		onValidationChange: function(event, questionId, minMax) {

		},

		onValidationMessageShown: function(event, questionId, message) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-dropdown') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function(event, questionId) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-dropdown') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	var questionImages = {

		init: function() {

			cbj(document).on('change', '.question.type-images input[type=radio]', function() {

				if (cbj(this).prop('checked') === false) {
					return;
				}

				var questionId = cbj(this).closest('.question').data('question-id');
				var answer = cbj(this).closest('.answer');
				var selection = parseInt(cbj(this).val());

				answer.addClass('selected').siblings().removeClass('selected');

				configurator.sendSelectionToServer(questionId, selection);

			});

			cbj(document).on('change', '.question.type-images input[type=checkbox]', function() {

				var questionId = cbj(this).closest('.question').data('question-id');
				var answer = cbj(this).closest('.answer');
				var selection = (cbj(this).prop('checked') === true) ? cbj(this).val() : '';

				if (selection) {
					answer.addClass('selected');
				}
				else {
					answer.removeClass('selected');
				}

				configurator.sendSelectionToServer(questionId, selection);

			});

		},

		initEach: function() {

		},

		onSystemSelectionChange: function(event, questionId, selection) {

			// Skip anything that isn't a images question
			if (cbj('#question-' + questionId).is('.type-images') === false) {
				return;
			}

			if (selection === null || selection === 0 || selection === '0') {
				cbj('#question-' + questionId).find('.answer').removeClass('selected');
				cbj('#question-' + questionId).find('.answer input[type=radio]').prop('checked', false);
				return;
			}

			selection = parseInt(selection);

			cbj('#answer-' + selection).addClass('selected').siblings().removeClass('selected');
			cbj('#answer-input-' + selection).prop('checked', true);
		},

		onQuestionActivation: function(event, questionId) {
			cbj('#question-' + questionId + ' input[type=radio]').prop('disabled', false);
		},

		onQuestionDeactivation: function(event, questionId) {
			cbj('#question-' + questionId + ' input[type=radio]').prop('checked', true).prop('disabled', true);
		},

		onAnswerActivation: function(event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', false);
		},

		onAnswerDeactivation: function(event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', true).prop('checked', false);
		},

		onValidationChange: function(event, questionId, minMax) {

		},

		onValidationMessageShown: function(event, questionId, message) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-images') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function(event, questionId) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-images') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	var questionSlider = {

		init: function() {

		},

		initEach: function() {

			// No need to use a parameter in callback function - jQueryUI 'goes' into cbj during loading
			cbrequire(['cbj.ui'], function() {

				// We need to force having touch punch loaded after jQueryUI (doing it via requireJS config was a problem)
				cbrequire(['cbj.touchpunch'], function() {

					cbj('.question.type-slider').each(function() {

						if (cbj(this).hasClass('initialized')) {
							return;
						}
						cbj(this).addClass('initialized');

						var question = cbj(this);
						var questionId = question.data('questionId');
						var currentSelection = question.data('selection');

						// Get the parameters
						var parameters = {

							slide: function(event, ui) {
								cbj('#input-question-' + questionId).val(ui.value);
							},
							change: function(event, ui) {
								cbj('#input-question-' + questionId).val(ui.value);

								if (ui.value != question.data('selection')) {
									configurator.sendSelectionToServer(questionId, ui.value);
								}

							},
							animate: true,
							value: currentSelection

						};

						if (configurator.getQuestionPropValue(questionId, 'validate') == true) {

							var minVal = configurator.getQuestionPropValue(questionId, 'minval');
							var maxVal = configurator.getQuestionPropValue(questionId, 'maxval');

							if (minVal !== null) {
								parameters.min = parseFloat(minVal);
							}
							if (maxVal !== null) {
								parameters.max = parseFloat(maxVal);
							}

						}

						var steps = parseFloat(configurator.getQuestionPropValue(questionId, 'slider_steps'));

						if (typeof(steps) === 'number' && steps !== 0) {
							parameters.step = steps;
						}

						// Avoid a clash with MooTools sliders
						if (cbj(this).find('#cb-slider-' + questionId).length !== 0) {
							cbj(this).find('#cb-slider-' + questionId)[0].slide = null;
						}

						cbj(this).find('#cb-slider-' + questionId).slider(parameters);

						// Have changes in the textbox reflect on the slider
						cbj('#input-question-' + questionId).keyup(function() {

							var inputBox = cbj(this);
							var val = inputBox.val();
							var slider = cbj('#cb-slider-' + questionId);

							inputBox.removeClass('invalid');

							if (typeof(questionSlider.timeout) !== 'undefined') {
								window.clearTimeout(questionSlider.timeout);
							}

							// Set a timeout for storing the text
							questionSlider.timeout = window.setTimeout(
								function() {

									var minVal = configurator.getQuestionPropValue(questionId, 'minval');
									var maxVal = configurator.getQuestionPropValue(questionId, 'maxval');

									if (isNaN(parseFloat(val)) === true) {
										inputBox.addClass('invalid');
										return;
									}


									if (minVal !== null) {
										minVal = parseFloat(minVal);
									}

									if (maxVal !== null) {
										maxVal = parseFloat(maxVal);
									}

									val = parseFloat(val);

									if (minVal !== null && val < minVal) {
										inputBox.addClass('invalid');
										return;
									}

									if (maxVal !== null && val > maxVal) {
										inputBox.addClass('invalid');
										return;
									}

									slider.slider('value', parseFloat(val));

								},
								500);

						});

					});

				});

			});

		},

		onSystemSelectionChange: function(event, questionId, selection) {

			// Skip anything that isn't a slider question
			if (cbj('#question-' + questionId).is('.type-slider') === false) {
				return;
			}

			if (selection === null || selection === '') {
				selection = 0;
			}
			else {
				selection = Number(selection);
			}


			// If the slider gets disabled it still gets a change request, which would trigger a not-applying error
			// Avoiding it with this
			if (selection === 0 && configurator.getQuestionPropValue(questionId, 'applies') === false) {
				return;
			}

			var currentValue = Number(cbj('#cb-slider-' + questionId).slider('value'));

			if (selection !== currentValue) {
				cbj('#cb-slider-' + questionId).slider('value', selection);
			}

		},

		onQuestionActivation: function(event, questionId) {

		},

		onQuestionDeactivation: function(event, questionId) {

		},

		onAnswerActivation: function(event, questionId, answerId) {

		},

		onAnswerDeactivation: function(event, questionId, answerId) {

		},

		onValidationChange: function(event, questionId, minMax) {

		},

		onValidationMessageShown: function(event, questionId, message) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-slider') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function(event, questionId) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-slider') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	var questionUpload = {

		init: function() {

			// Clicks on the 'remove file' button
			cbj(document).on('click', '.question.type-upload .trigger-remove-file', function() {

				cbj(this).closest('.question').find('.upload-current-file').removeClass('has-file');
				cbj(this).closest('.question').find('.upload-current-file .file-name').text('');

				cbj(this).closest('.question').data('file-contents', '');
				cbj(this).closest('.question').data('file-url', '');

				var questionId = cbj(this).closest('.question').data('questionId');

				configurator.sendSelectionToServer(questionId, '');

			});

			// Clicks on the file browser button
			cbj(document).on('click', '.question.type-upload .trigger-show-file-browser', function() {
				cbj(this).closest('.question').find('input[type="file"]').click();
			});

			// Once the user picked a file using 'browse', trigger the drop event (is unified for both drop and browse)
			cbj(document).on('change', '.question.type-upload input[type=file]', function() {
				cbj(this).closest('.question').find('.upload-drop-zone').trigger('drop');
			});

			// Trigger system selection change method on user changes as well
			cbj(document).on('cbSelectionChange', questionUpload.onSystemSelectionChange);

		},

		initEach: function() {

			// We do the drag/drop/etc question by question because it reads easier
			cbj('.question.type-upload').each(function() {

				if (cbj(this).hasClass('initialized')) {
					return;
				}
				cbj(this).addClass('initialized');

				// Make a reference to the question element for later
				var question = cbj(this);

				// Get the current question ID for later
				var questionId = cbj(this).data('questionId');

				// Get a reference to the drop zone for later
				var dropZone = cbj('#question-' + questionId + ' .upload-drop-zone');

				// Start setting up the event handlers
				dropZone

					.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
						// In any case we prevent default behavior
						e.preventDefault();
						e.stopPropagation();
					})

					// When the file is dragged over, indicate it visually
					.on('dragover dragenter', function() {

						// In case the question isn't in use, don't show anything
						if (question.hasClass('non-applying-question') === false) {
							dropZone.addClass('is-dragover');
						}

					})

					// When dragged out, remove the visual indicator
					.on('dragleave dragend drop', function() {
						dropZone.removeClass('is-dragover');
					})

					// When the file got dropped, go for processing
					.on('drop', function(e) {

						// In case the question is disabled by rule, don't react on the drop
						if (question.hasClass('non-applying-question')) {
							return;
						}

						// This will carry the files
						var droppedFiles;

						// If we deal with a drop, get the files via dataTransfer..
						//noinspection JSUnresolvedVariable
						if (e.originalEvent && e.originalEvent.dataTransfer) {
							//noinspection JSUnresolvedVariable
							droppedFiles = e.originalEvent.dataTransfer.files;
						}
						// ..otherwise the user must have used the browse button
						else {
							droppedFiles = cbj('#question-' + questionId + ' input[type=file]')[0].files;
						}

						// Give feedback if there's no file or more than one file
						if (droppedFiles.length !== 1) {
							questionUpload.onValidationMessageShown(null, questionId, 'Please upload one file only.');
							return;
						}
						else {
							questionUpload.onValidationMessageCleared(null, questionId);
						}

						// Get a file reader
						var reader  = new window.FileReader();

						// Write down the file's contents in a data attribute (used in shapediver module)
						reader.addEventListener('load', function () {
							question.data('file-contents', reader.result);
							question.data('file-url', reader.result);
						}, false);

						// Start reading (see event handler above)
						reader.readAsDataURL(droppedFiles[0]);

						// Set the File for SD module to pick it up later
						question.data('file', droppedFiles[0]);

						// Get FormData object and collect all form data
						var formData = new FormData();

						// Prepare the regular POST data
						var requestData = {
							option: 	'com_configbox',
							controller: 'configuratorpage',
							task: 		'makeSelection',
							display_mode: 'view_only',
							questionId: questionId,
							selection: 	JSON.stringify( {name: droppedFiles[0].name, size: droppedFiles[0].size, type: droppedFiles[0].type} ),
							confirmed: 	false,
							cart_position_id: 	configurator.getCartPositionId(),
							productId: 			configurator.getProductId(),
							pageId: 			configurator.getPageId()
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

						// While progress is made we update the progress bar
						xhr.addEventListener('progress', function(e) {

							var done = e.position || e.loaded;
							var percentage = Math.min(100, Math.floor(done / droppedFiles[0].size * 1000) / 10);
							dropZone.find('.drop-zone-percentage').text(percentage + '%');
							dropZone.find('.drop-zone-progress').css('width', percentage + '%');

						}, false);

						// When upload is done: Response is the same you get from configurator.sendSelectionToServer
						xhr.addEventListener('readystatechange', function() {

							if (xhr.readyState === XMLHttpRequest.DONE) {

								var data = JSON.parse(xhr.responseText);

								// Show the file name in the question
								if (typeof(data.error) === 'undefined' || data.error === '') {
									cbj('#question-' + questionId + ' .upload-current-file').addClass('has-file');
									cbj('#question-' + questionId + ' .upload-current-file .file-list').show().find('.file-name').text(droppedFiles[0].name);
								}

								// Get the response and trigger the typical event (makes all work like the other questions)
								cbj(document).trigger('serverResponseReceived', [data]);

							}

						});

						cbrequire(['configbox/server'], function(server) {
							// Finally open a connection and send the form data
							xhr.open('post', server.config.urlXhr, true);
							xhr.send(formData);
						});

					});

			});

		},

		/**
		 * Will also fire on user changes, see init method
		 * @param {Event} event
		 * @param {int} questionId
		 * @param {null|string} selection
		 */
		onSystemSelectionChange: function(event, questionId, selection) {

			// Skip anything that isn't an upload question
			if (cbj('#question-' + questionId).is('.type-upload') === false) {
				return;
			}

			if (!selection) {
				cbj('#question-' + questionId).data('file-contents', '');
				cbj('#question-' + questionId).data('file-url', '');
				cbj('#question-' + questionId).data('file', '');
				cbj('#question-' + questionId + ' .upload-current-file').removeClass('has-file');
				cbj('#question-' + questionId + ' .upload-current-file .file-name').text('');
			}
			else {
				cbj('#question-' + questionId).data('selection', JSON.parse(selection));
			}

		},

		onQuestionActivation: function(event, questionId) {
			cbj('#question-' + questionId + ' .trigger-show-file-browser').prop('disabled', false);
			cbj('#question-' + questionId + ' .upload-current-file').removeClass('has-file');
			cbj('#question-' + questionId + ' .upload-current-file .file-name').text('');
		},

		onQuestionDeactivation: function(event, questionId) {
			cbj('#question-' + questionId + ' .upload-current-file').removeClass('has-file');
			cbj('#question-' + questionId + ' .upload-current-file .file-name').text('');
			cbj('#question-' + questionId + ' .trigger-show-file-browser').prop('disabled', true);
		},

		onAnswerActivation: function(event, questionId) {

		},

		onAnswerDeactivation: function(event, questionId, answerId) {

		},

		onValidationChange: function(event, questionId, minMax) {

		},

		onValidationMessageShown: function(event, questionId, message) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-upload') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function(event, questionId) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-upload') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	var questionChoices = {

		init: function() {

			cbj('.question.type-choices').each(function() {

				if (cbj(this).hasClass('initialized')) {
					return;
				}
				cbj(this).addClass('initialized');

				var questionId = cbj(this).data('questionId');

				cbj(document).on('change', '#question-' + questionId + ' .configbox-choice-field', function() {
					var selection = cbj(this).val();

					if( cbj(this).prop('checked') === false) {
						return;
					}

					cbj(this).closest('.radio').addClass('selected').siblings().removeClass('selected');
					cbj('#question-' + questionId + ' .configbox-choice-custom-field').val('');

					configurator.sendSelectionToServer(questionId, selection);

				});

				cbj('#question-' + questionId + ' .configbox-choice-custom-field').data('lastVal', cbj('#question-' + questionId + ' .configbox-choice-custom-field').val());

				cbj(document).on('keyup', '#question-' + questionId + ' .configbox-choice-custom-field', function() {

					var lastVal = cbj('#question-' + questionId + ' .configbox-choice-custom-field').data('lastVal');
					var selection = cbj(this).val();

					if (selection === lastVal) {
						return;
					}

					cbj('#question-' + questionId + ' input[type=radio').prop('checked', false).closest('radio');

					if (selection) {
						cbj(this).closest('.radio').find('input[type=radio]').prop('checked', true);
					}
					else {
						cbj('#question-' + questionId + ' input[type=radio').prop('checked', false);
					}

					configurator.sendSelectionToServer(questionId, selection);

				});

			});

		},

		initEach: function() {

		},

		onSystemSelectionChange: function(event, questionId, selection) {

			// Skip anything that isn't a choices question
			if (cbj('#question-' + questionId).is('.type-choices') === false) {
				return;
			}

			var checked = !(selection === '' || selection === 0 || selection === null);

			if (checked) {
				if (cbj('#question-' + questionId + ' .configbox-choice-field[value="' + selection + '"]').length) {
					cbj('#question-' + questionId + ' .configbox-choice-field[value="' + selection + '"]').prop('checked', true);
					cbj('#question-' + questionId + ' .configbox-choice-custom-field').val('');
					cbj('#question-' + questionId + ' .configbox-choice-field[value="' + selection + '"]').closest('.radio').addClass('selected').siblings().removeClass('selected');
				}
				else {
					cbj('#question-' + questionId + ' .configbox-choice-field').prop('checked', false);
					cbj('#question-' + questionId + ' .configbox-choice-custom-field').val(selection);
					cbj('#question-' + questionId + ' .configbox-choice-custom-field').closest('.radio').find('input[type=radio]').prop('checked', true);
				}
			}
			else {
				cbj('#question-' + questionId + ' .configbox-choice-free-field').val('');
				cbj('#question-' + questionId + ' .input[type=radio]').prop('checked', false);
			}

		},

		onQuestionActivation: function(event, questionId) {
			cbj('#question-' + questionId + ' input').prop('disabled', false);
		},

		onQuestionDeactivation: function(event, questionId) {
			cbj('#question-' + questionId + ' input').prop('disabled', true);
			cbj('#question-' + questionId + ' input[type=text]').val('');
		},

		onAnswerActivation: function(event, questionId, answerId) {

		},

		onAnswerDeactivation: function(event, questionId, answerId) {

		},

		onValidationChange: function(event, questionId, minMax) {

			cbj('#question-' + questionId + ' .configbox-choice-field').each(function() {
				var value = cbj(this).val();
				if ((minMax.minval !== null && value < minMax.minval) || (minMax.maxval !== null && value > minMax.maxval)) {
					cbj(this).prop('disabled', true);
				}
				else {
					cbj(this).prop('disabled', false);
				}
			});

		},

		onValidationMessageShown: function(event, questionId, message) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-choices') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function(event, questionId) {

			var question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-choices') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	configurator.registerQuestion('calendar', 		questionCalendar);
	configurator.registerQuestion('colorpicker', 		questionColorpicker);
	configurator.registerQuestion('ralcolorpicker', 	questionRalColorpicker);
	configurator.registerQuestion('checkbox', 		questionCheckbox);
	configurator.registerQuestion('choices', 			questionChoices);
	configurator.registerQuestion('dropdown', 		questionDropdown);
	configurator.registerQuestion('images', 			questionImages);
	configurator.registerQuestion('radiobuttons', 	questionRadiobuttons);
	configurator.registerQuestion('slider', 			questionSlider);
	configurator.registerQuestion('textbox', 			questionTextbox);
	configurator.registerQuestion('textarea', 		questionTextarea);
	configurator.registerQuestion('upload', 			questionUpload);

});