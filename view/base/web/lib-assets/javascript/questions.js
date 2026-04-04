/* global alert, confirm, alert, console, define, cbrequire: false */
/* jshint -W116 */

/**
 * @module configbox/questions
 */
define(['cbj', 'configbox/configurator'], function (cbj, configurator) {

	"use strict";

	let questionCalendar = {

		init: function () {

		},

		initEach: function () {

			if (cbj('.question.type-calendar').length === 0) {
				return;
			}

			cbrequire(['cbj.ui'], function () {

				cbj('.question.type-calendar').each(function () {

					let question = cbj(this);

					if (question.hasClass('initialized')) {
						return;
					}
					question.addClass('initialized');

					cbj.datepicker.setDefaults(question.data('locale'));

					let questionId = question.data('questionId');
					let pickerDiv = cbj('#input-' + questionId);

					let parameters = {
						showOn: 'button',
						dateFormat: 'yy-mm-dd',
						altField: '#input-display-' + questionId,
						altFormat: configurator.getConfiguratorData('dateFormat'),
						minDate: null,
						maxDate: null,

						onSelect: function (date) {

							pickerDiv.datepicker('destroy');
							// let formattedDate = cbj('#output-helper-' + questionId).val();
							// window.setTimeout(
							// 	function () {
							// 		question.find('.pseudo-text-field').text(formattedDate).val(formattedDate);
							// 	}, 200);

							configurator.sendSelectionToServer(questionId, date);

						}

					};

					switch (configurator.getQuestionPropValue(questionId, 'calendar_validation_type_min')) {
						case 'days':
							parameters.minDate = parseInt(configurator.getQuestionPropValue(questionId, 'calendar_days_min'));
					}
					switch (configurator.getQuestionPropValue(questionId, 'calendar_validation_type_max')) {
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

					// Set the click handler to show the calendar with the button
					cbj(this).find('.trigger-show-calendar').on('click', function () {

						if (question.hasClass('non-applying-question')) {
							return;
						}

						if (pickerDiv.hasClass('hasDatepicker')) {
							pickerDiv.datepicker('destroy');
						} else {
							pickerDiv.datepicker(parameters).datepicker('setDate', question.data('selection'));
						}

					});

				});

			});

		},

		onSystemSelectionChange: function (event, questionId, selection) {

			// Skip anything that isn't a calendar question
			if (cbj('#question-' + questionId).is('.type-calendar') === false) {
				return;
			}

			cbj('#input-' + questionId).datepicker('setDate', selection);
		},

		onQuestionActivation: function (event, questionId) {

		},

		onQuestionDeactivation: function (event, questionId) {

			cbj('#input-' + questionId).datepicker('setDate', null);
			cbj('#input-' + questionId).datepicker('refresh');

			window.setTimeout(
				function () {
					cbj('#input-display-' + questionId).val('');
				},
				200
			);
		},

		onAnswerActivation: function (event, questionId, answerId) {

		},

		onAnswerDeactivation: function (event, questionId, answerId) {

		},

		onValidationChange: function (event, questionId, minMax) {
			cbj('.input-' + questionId).datepicker('option', 'minDate', minMax.minval);
			cbj('.input-' + questionId).datepicker('option', 'maxDate', minMax.maxval);
			cbj('.input-' + questionId).datepicker('refresh');
		},

		onValidationMessageShown: function (event, questionId, message) {

			let question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-calendar') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function (event, questionId) {

			let question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-calendar') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();

		}

	};

	let questionRalColorpicker = {

		init: function () {

			cbj(document).on('click', '.ral-color-picker-output', function () {
				let question = cbj(this).closest('.question');
				question.find('.trigger-show-ralcolorpicker').trigger('click');
			});

			cbj(document).on('click', '.trigger-show-ralcolorpicker', function () {
				let question = cbj(this).closest('.question');
				let applying = question.hasClass('applying-question');
				if (applying) {
					cbrequire(['bootstrap'], function (bootstrap) {
						const modalEl = question.find('.modal').get(0);
						new bootstrap.Modal(modalEl).show();
					});
				}
			});

			cbj(document).on('click', '.close-modal', function () {
				let modalEl = cbj(this).closest('.modal').get(0);
				cbrequire(['bootstrap'], function (bootstrap) {
					bootstrap.Modal.getInstance(modalEl).hide();
				});
			});

			cbj(document).on('change', 'select.ral-color-group', function () {

				// Get the group ID carefully
				let colorGroupId = parseInt(cbj(this).val());
				if (isNaN(colorGroupId) === true) {
					colorGroupId = 0;
				}

				// Store the group ID for the next modal opening
				cbj(this).closest('.question').data('selection-group-id', colorGroupId);

				// Show the right group or all when ID is 0
				if (colorGroupId === 0) {
					cbj(this).closest('.question').find('.ral-color').show();
				} else {
					cbj(this).closest('.question').find('.ral-color').hide();
					cbj(this).closest('.question').find('.ral-color[data-group-id="' + colorGroupId + '"]').show();
				}

			});

			cbj(document).on('click', '.trigger-pick-ral-color', function () {

				let color = cbj(this);
				let colorId = 'RAL ' + color.data('color-id');
				let colorHex = color.data('hex');
				let colorGroupId = color.data('group-id');
				let colorIsDark = color.hasClass('is-dark');

				let question = cbj(this).closest('.question');
				let questionId = question.data('question-id');

				question.data('selection-group-id', colorGroupId);

				question.find('.ral-color-input').val(colorId);

				let output = question.find('.ral-color-picker-output');
				output.css('background-color', colorHex);
				if (colorIsDark) {
					output.addClass('is-dark');
				} else {
					output.removeClass('is-dark');
				}
				output.text(color.text());

				cbrequire(['bootstrap'], function (bootstrap) {
					let modalEl = question.find('.modal').get(0);
					bootstrap.Modal.getInstance(modalEl).hide();
				});

				configurator.sendSelectionToServer(questionId, colorId);
			});

		},

		initEach: function () {

		},

		onSystemSelectionChange: function (event, questionId, selection) {
			let question = cbj('#question-' + questionId);
			let type = question.data('question-type');
			if (type === 'ralcolorpicker') {
				let output = question.find('.ral-color-picker-output');
				if (selection) {
					let colorId = selection.split(" ")[1];
					let color = question.find('.modal .ral-color[data-color-id="' + colorId + '"]');
					let colorHex = color.data('hex');
					let colorText = color.text();
					let colorIsDark = color.hasClass('is-dark');
					output.css('background-color', colorHex);
					output.removeClass('is-dark');
					if (colorIsDark) output.addClass('is-dark');
					output.text(colorText);
				} else {
					output.css('background-color', 'transparent');
					output.text('');
				}
			}

		},

		onQuestionActivation: function (event, questionId) {

		},

		onQuestionDeactivation: function (event, questionId) {

		},

		onAnswerActivation: function (event, questionId, answerId) {

		},

		onAnswerDeactivation: function (event, questionId, answerId) {

		},

		onValidationChange: function (event, questionId, minMax) {

		},

		onValidationMessageShown: function (event, questionId, message) {

			let question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-ralcolorpicker') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function (event, questionId) {

			let question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-ralcolorpicker') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();

		}

	};

	let questionColorpicker = {

		init: function () {

			cbrequire(['kenedo', 'configbox/server'], function (kenedo, server) {
				let url = server.config.urlSystemAssets + '/kenedo/external/jquery.spectrum-2.0.10/spectrum.min.css';
				kenedo.addStylesheet(url);
			});

			cbrequire(['cbj.spectrum'], function () {

				// Opening/Closing the color picker
				cbj(document).on('click', '.question.type-colorpicker .trigger-show-colorpicker, .question.type-colorpicker .color-picker-output', function () {

					// Block if the question is disabled
					if (cbj(this).closest('.question.type-colorpicker').hasClass('non-applying-question') === true) {
						return;
					}

					cbj(this).closest('.question.type-colorpicker').find('.wrapper-flat-spectrum').slideToggle();

				});


				// Entering a hex code in spectrum makes an immediate change (once we got 7 chars)
				cbj(document).on('keyup', '.cb-spectrum .sp-input', function () {

					let selection = cbj(this).val();

					if (selection.length === 7) {
						cbj('.sp-active').closest('.question.type-colorpicker').find('.color-picker-input').spectrum('set', selection).trigger('change');
					}

				});

			});

		},

		initEach: function () {

			cbrequire(['cbj.spectrum'], function () {

				cbj('.question.type-colorpicker .spectrum-input').each(function () {

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
						showPalette: false,
						showPaletteOnly: false,
						togglePaletteOnly: false,
						showButtons: false,
						showSelectionPalette: true,
						clickoutFiresChange: false,
						cancelText: '',
						chooseText: '',
						containerClassName: 'cb-spectrum',
						replacerClassName: 'cb-replacer form-control',
						preferredFormat: 'hex',

						// A change triggers an immediate store
						change: function (color) {

							// Get values
							let questionId = cbj(this).closest('.question.type-colorpicker').data('questionId');
							let selection = color.toHexString();

							// Set the background color in the output bar
							cbj(this).closest('.question.type-colorpicker').find('.color-picker-output').css('background-color', selection);

							// Store the selection
							configurator.sendSelectionToServer(questionId, selection);

						},

						// Moving the picker needle triggers a delayed store
						move: function (color) {

							// Get a ref to the picker (so we can read from it in the timeout function)
							let that = cbj(this);

							// Prime the timeout if there isn't one already
							questionColorpicker.timeout = questionColorpicker.timeout || null;

							// We start storing with a delay in the next step - here we cancel any running JS timeout
							if (questionColorpicker.timeout) {
								window.clearTimeout(questionColorpicker.timeout);
							}

							// Set a timeout for storing the selection (delayed store)
							questionColorpicker.timeout = window.setTimeout(
								function () {

									// Set the color in the output div
									cbj(that).closest('.question.type-colorpicker').find('.color-picker-output').css('background-color', color.toHexString());
									// Store the selection
									let questionId = cbj(that).closest('.question.type-colorpicker').data('questionId');

									// Get the color in hex
									let selection = color.toHexString();

									configurator.sendSelectionToServer(questionId, selection);

								},
								400
							);

						}

					});

				});

			});

		},

		onSystemSelectionChange: function (event, questionId, selection) {

			cbj('#question-' + questionId).find('.spectrum-input').spectrum('set', selection);
			cbj('#question-' + questionId).find('.color-picker-output').css('background-color', selection);

		},

		onQuestionActivation: function (event, questionId) {

		},

		onQuestionDeactivation: function (event, questionId) {

			// Unset the current background color in the output bar
			cbj('#question-' + questionId).find('.color-picker-output').css('background-color', 'transparent');

			// Slide up the color picker (in case it's open)
			cbj('#question-' + questionId).find('.wrapper-flat-spectrum').slideUp();

		},

		onAnswerActivation: function (event, questionId, answerId) {

		},

		onAnswerDeactivation: function (event, questionId, answerId) {

		},

		onValidationChange: function (event, questionId, minMax) {

		},

		onValidationMessageShown: function (event, questionId, message) {

			let question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-colorpicker') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function (event, questionId) {

			let question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-colorpicker') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();

		}

	};

	let questionTextbox = {

		init: function () {

		},

		initEach: function () {

			cbj('.question.type-textbox').each(function () {

				if (cbj(this).hasClass('initialized')) {
					return;
				}
				cbj(this).addClass('initialized');

				let questionId = cbj(this).data('questionId');

				cbj('#input-question-' + questionId).on('keyup', function () {

					// Get what is currently in the text box
					let input = cbj(this);

					// Prime the timeout if there isn't one already
					questionTextbox.timeout = questionTextbox.timeout || null;

					// We start storing with a delay in the next step - here we cancel any running JS timeout
					if (questionTextbox.timeout) {
						window.clearTimeout(questionTextbox.timeout);
					}

					// Set a timeout for storing the text
					questionTextbox.timeout = window.setTimeout(
						function () {
							configurator.sendSelectionToServer(questionId, input.val());
						},
						400
					);

				});

			});

		},

		onSystemSelectionChange: function (event, questionId, selection) {
			cbj('#input-question-' + questionId).val(selection);
		},

		onQuestionActivation: function (event, questionId) {
			cbj('#input-question-' + questionId).prop('disabled', false);
		},

		onQuestionDeactivation: function (event, questionId) {
			cbj('#input-question-' + questionId).prop('disabled', true).val('');
		},

		onAnswerActivation: function (event, questionId) {

		},

		onAnswerDeactivation: function (event, questionId, answerId) {

		},

		onValidationChange: function (event, questionId, minMax) {

		},

		onValidationMessageShown: function (event, questionId, message) {

			let question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-textbox') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function (event, questionId) {

			let question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-textbox') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	let questionTextarea = {

		init: function () {

		},

		initEach: function () {

			cbj('.question.type-textarea').each(function () {

				if (cbj(this).hasClass('initialized')) {
					return;
				}
				cbj(this).addClass('initialized');

				let questionId = cbj(this).data('questionId');

				cbj('#input-question-' + questionId).on('keyup', function () {

					// Get what is currently in the text box
					let textarea = cbj(this);

					// Prime the timeout if there isn't one already
					questionTextarea.timeout = questionTextarea.timeout || null;

					// We start storing with a delay in the next step - here we cancel any running JS timeout
					if (questionTextarea.timeout) {
						window.clearTimeout(questionTextarea.timeout);
					}

					// Set a timeout for storing the text
					questionTextarea.timeout = window.setTimeout(
						function () {
							configurator.sendSelectionToServer(questionId, textarea.val());
						},
						400
					);

				});

			});

		},

		onSystemSelectionChange: function (event, questionId, selection) {
			cbj('#input-question-' + questionId).val(selection);
		},

		onQuestionActivation: function (event, questionId) {
			cbj('#input-question-' + questionId).prop('disabled', false);
		},

		onQuestionDeactivation: function (event, questionId) {
			cbj('#input-question-' + questionId).prop('disabled', true).val('');
		},

		onAnswerActivation: function (event, questionId) {

		},

		onAnswerDeactivation: function (event, questionId, answerId) {

		},

		onValidationChange: function (event, questionId, minMax) {

		},

		onValidationMessageShown: function (event, questionId, message) {

			let question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-textarea') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function (event, questionId) {

			let question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-textarea') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	let questionCheckbox = {

		init: function () {

			cbj(document).on('change', '.question.type-checkbox input[type=checkbox]', function () {

				let questionId = cbj(this).closest('.question').data('question-id');
				let answer = cbj(this).closest('.answer');
				let selection = (cbj(this).prop('checked') === true) ? cbj(this).val() : '';

				if (selection) {
					answer.addClass('selected');
				} else {
					answer.removeClass('selected');
				}

				configurator.sendSelectionToServer(questionId, selection);

			});

		},

		initEach: function () {

		},

		onSystemSelectionChange: function (event, questionId, selection) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't a checkbox question
			if (question.is('.type-checkbox') === false) {
				return;
			}

			let checked = !(selection === '' || selection === 0 || selection === null);
			cbj('#answer-input-' + selection).prop('checked', checked);

			if (checked) {
				question.trigger('cbValidationMessageCleared');
			}
		},

		onQuestionActivation: function (event, questionId) {
			cbj('#question-' + questionId + ' input[type=checkbox]').prop('disabled', false);
		},

		onQuestionDeactivation: function (event, questionId) {
			cbj('#question-' + questionId + ' input[type=checkbox]').prop('checked', true).prop('disabled', true);
		},

		onAnswerActivation: function (event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', false);
		},

		onAnswerDeactivation: function (event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', true).prop('checked', false);
		},

		onValidationChange: function (event, questionId, minMax) {

		},

		onValidationMessageShown: function (event, questionId, message) {

			let question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-checkbox') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function (event, questionId) {

			let question = cbj('#question-' + questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || cbj('#question-' + questionId).is('.type-checkbox') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	let questionRadiobuttons = {

		init: function () {

			cbj(document).on('change', '.question.type-radiobuttons input[type=radio]', function () {

				if (cbj(this).prop('checked') === false) {
					return;
				}

				let questionId = cbj(this).closest('.question').data('question-id');
				let answer = cbj(this).closest('.answer');
				let selection = parseInt(cbj(this).val());

				answer.closest('.question').find('.answer').removeClass('selected');
				answer.addClass('selected')

				configurator.sendSelectionToServer(questionId, selection);

			});

		},

		initEach: function () {

		},

		onSystemSelectionChange: function (event, questionId, selection) {

			if (cbj('#question-' + questionId).is('.type-radiobuttons')) {

				let question = configurator.getQuestionDiv(questionId);
				let answer = cbj('#answer-' + selection);
				answer.closest('.question').find('.answer').removeClass('selected');
				answer.addClass('selected')
				let checked = !(selection === '' || selection === 0 || selection === null);
				cbj('#answer-input-' + selection).prop('checked', checked);

				if (checked) {
					question.trigger('cbValidationMessageCleared');
				}

			}

		},

		onQuestionActivation: function (event, questionId) {
			cbj('#question-' + questionId + ' input[type=radio]').prop('disabled', false);
		},

		onQuestionDeactivation: function (event, questionId) {
			cbj('#question-' + questionId + ' input[type=radio]').prop('checked', false).prop('disabled', true);
		},

		onAnswerActivation: function (event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', false);
		},

		onAnswerDeactivation: function (event, questionId, answerId) {
			cbj('#answer-' + answerId).removeClass('selected');
			cbj('#answer-input-' + answerId).prop('disabled', true).prop('checked', false);
		},

		onValidationChange: function (event, questionId, minMax) {

		},

		onValidationMessageShown: function (event, questionId, message) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || configurator.getQuestionDiv(questionId).is('.type-radiobuttons') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function (event, questionId) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || question.is('.type-radiobuttons') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	let questionDropdown = {

		init: function () {

			// Dropdown open functionality
			cbj(document).on('click', '.configbox-dropdown-trigger', function () {
				cbj(this).toggle();
				cbj(this).closest('.question').find('.configbox-dropdown').toggle();
			});

			// Clicks outside the dropdown close the dropdown
			cbj(document).on('click', function (event) {

				// Safeguard in case the browser does not have an event.target property
				if (typeof (event.target) === 'undefined') {
					return;
				}

				// If the click comes from within the trigger, leave it be
				if (cbj(event.target).is('.configbox-dropdown-trigger') || cbj(event.target).closest('.configbox-dropdown-trigger').length !== 0) {
					return;
				}

				// Show any trigger from visible drop-downs
				cbj('.configbox-dropdown:visible').closest('.question').find('.configbox-dropdown-trigger').show();
				// Then hide any dropdowns
				cbj('.configbox-dropdown').hide();
			});

			// Set the change handler for selections
			cbj(document).on('change', '.question.type-dropdown .answer input', function () {

				let questionId = cbj(this).closest('.question').data('questionId');
				let answer = cbj(this).closest('.answer').clone();
				answer.find('input').remove();

				cbj(this).closest('.question').find('.configbox-dropdown-trigger').empty().append(answer.find('label')).append(answer.find('.answer-price-display'));
				cbj(this).closest('.configbox-dropdown').hide();
				cbj(this).closest('.question').find('.configbox-dropdown-trigger').show();

				let selection = cbj(this).val();
				cbj('#answer-' + selection).addClass('selected').siblings().removeClass('selected');

				configurator.sendSelectionToServer(questionId, selection);

			});

			cbj('.question.type-dropdown').each(function () {

				// Keep the dropdown trigger text for later
				cbj(this).data('triggerDefault', cbj(this).find('.configbox-dropdown-trigger').clone(false));

				// If the question got a selection already, put the part of the answer HTML into the trigger
				if (cbj(this).find('.selected').length) {
					let answer = cbj(this).find('.selected').clone();
					answer.find('input').remove();
					cbj(this).find('.configbox-dropdown-trigger').empty().append(answer.find('label')).append(answer.find('.answer-price-display'));
				}

			});

		},

		initEach: function () {

		},

		onSystemSelectionChange: function (event, questionId, selection) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't a dropdown
			if (question.is('.type-dropdown') === false) {
				return;
			}

			selection = parseInt(selection);

			if (selection) {

				cbj('#answer-input-' + selection).prop('checked', true);

				// Mark the answer wrapper with class 'selected' (and remove the class from any siblings)
				cbj('#answer-' + selection).addClass('selected').siblings().removeClass('selected');

				// Copy over the answer HTML to the trigger
				let answer = cbj('#answer-' + selection).clone();
				answer.find('input').remove();
				question.find('.configbox-dropdown-trigger')
					.empty()
					.append(answer.find('label'))
					.append(answer.find('.answer-price-display'));
				question.trigger('cbValidationMessageCleared');
			} else {
				// Remove the 'selected' class flag and put the default trigger text into the trigger
				cbj('#answer-' + selection).removeClass('selected');
				question.find('.configbox-dropdown-trigger').replaceWith(question.data('triggerDefault'));
			}

		},

		onQuestionActivation: function (event, questionId) {
			cbj('#question-' + questionId + ' input[type=radio]').prop('disabled', false);
		},

		onQuestionDeactivation: function (event, questionId) {
			cbj('#question-' + questionId + ' input[type=radio]').prop('checked', true).prop('disabled', true);
		},

		onAnswerActivation: function (event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', false);
		},

		onAnswerDeactivation: function (event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', true).prop('checked', false);
		},

		onValidationChange: function (event, questionId, minMax) {

		},

		onValidationMessageShown: function (event, questionId, message) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || configurator.getQuestionDiv(questionId).is('.type-dropdown') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function (event, questionId) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't the right type
			if (question.is('.type-dropdown') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	let questionImages = {

		init: function () {

			cbj(document).on('change', '.question.type-images input[type=radio]', function () {

				if (cbj(this).prop('checked') === false) {
					return;
				}

				let questionId = cbj(this).closest('.question').data('question-id');
				let answer = cbj(this).closest('.answer');
				let selection = parseInt(cbj(this).val());

				answer.closest('.question').find('.answer').removeClass('selected');
				answer.addClass('selected');

				configurator.sendSelectionToServer(questionId, selection);

			});

			cbj(document).on('change', '.question.type-images input[type=checkbox]', function () {

				let questionId = cbj(this).closest('.question').data('question-id');
				let answer = cbj(this).closest('.answer');
				let selection = (cbj(this).prop('checked') === true) ? cbj(this).val() : '';

				if (selection) {
					answer.addClass('selected');
				} else {
					answer.removeClass('selected');
				}

				configurator.sendSelectionToServer(questionId, selection);

			});

		},

		initEach: function () {

		},

		onSystemSelectionChange: function (event, questionId, selection) {

			// Skip anything that isn't an 'images' question
			if (configurator.getQuestionDiv(questionId).is('.type-images') === false) {
				return;
			}

			if (selection === null || selection === 0 || selection === '0') {
				configurator.getQuestionDiv(questionId).find('.answer').removeClass('selected');
				configurator.getQuestionDiv(questionId).find('.answer input[type=radio]').prop('checked', false);
				return;
			}

			selection = parseInt(selection);

			let answer = cbj('#answer-' + selection);
			answer.closest('.question').find('.answer').removeClass('selected');
			answer.addClass('selected');
			cbj('#answer-input-' + selection).prop('checked', true);
		},

		onQuestionActivation: function (event, questionId) {
			cbj('#question-' + questionId + ' input[type=radio]').prop('disabled', false);
		},

		onQuestionDeactivation: function (event, questionId) {
			cbj('#question-' + questionId + ' input[type=radio]').prop('checked', true).prop('disabled', true);
		},

		onAnswerActivation: function (event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', false);
		},

		onAnswerDeactivation: function (event, questionId, answerId) {
			cbj('#answer-input-' + answerId).prop('disabled', true).prop('checked', false);
		},

		onValidationChange: function (event, questionId, minMax) {

		},

		onValidationMessageShown: function (event, questionId, message) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || configurator.getQuestionDiv(questionId).is('.type-images') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function (event, questionId) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || configurator.getQuestionDiv(questionId).is('.type-images') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	let questionSlider = {

		init: function () {

		},

		initEach: function () {
			cbrequire(['bootstrap'], function () {
				cbj('.question.type-slider').each(function () {
					if (cbj(this).hasClass('initialized')) {
						return;
					}
					cbj(this).addClass('initialized');

					let question = cbj(this);
					let questionId = question.data('questionId');
					let slider = question.find('.form-range');
					let inputBox = question.find('.wrapper-input input');
					let currentStoreTimeout = null;

					// If the user changes the slider, the system updates the input box value
					slider.on('input', function () {
						inputBox.val(this.value);
					});

					// If the user edits in the text field, the system changes the slider and stores the selection
					inputBox.on('input', function () {
						let value = this.value;
						slider.val(value);
						if (currentStoreTimeout) {
							window.clearTimeout(currentStoreTimeout);
						}
						currentStoreTimeout = window.setTimeout(function () {
							console.log('sending');
							configurator.sendSelectionToServer(questionId, value);
						}, 700)
					});

					// If the user triggers a slider change, the system stores the value
					slider.on('change', function () {
						let selectionNow = cbj(this).val();
						let selectionLast = parseInt(question.data('selection'));
						if (selectionNow !== selectionLast) {
							configurator.sendSelectionToServer(questionId, selectionNow);
						}
					});

				});
			});
		},

		onSystemSelectionChange: function (event, questionId, selection) {

			let question = configurator.getQuestionDiv(questionId);
			if (!question.is('.type-slider')) {
				return;
			}
			let slider = question.find('input[type=range]');
			let inputBox = question.find('.wrapper-input input');
			slider.val(selection);
			inputBox.val(selection);

		},

		onQuestionActivation: function (event, questionId) {
			let question = configurator.getQuestionDiv(questionId);
			let slider = question.find('.form-range');
			let inputBox = question.find('.wrapper-input input');
			slider.prop('disabled', false);
			inputBox.prop('disabled', false);
		},

		onQuestionDeactivation: function (event, questionId) {
			let question = configurator.getQuestionDiv(questionId);
			let slider = question.find('.form-range');
			let inputBox = question.find('.wrapper-input input');
			slider.prop('disabled', true);
			inputBox.prop('disabled', true);
		},

		onAnswerActivation: function (event, questionId, answerId) {

		},

		onAnswerDeactivation: function (event, questionId, answerId) {

		},

		onValidationChange: function (event, questionId, minMax) {
			let question = configurator.getQuestionDiv(questionId);
			if (!question.is('.type-slider')) {
				return;
			}
			let slider = question.find('input[type=range]');
			if (minMax.minval !== null) {
				slider.attr('min', minMax.minval);
			}
			if (minMax.maxval !== null) {
				slider.attr('max', minMax.maxval);
			}
		},

		onValidationMessageShown: function (event, questionId, message) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || configurator.getQuestionDiv(questionId).is('.type-slider') === false) {
				return;
			}
			question.find('.wrapper-input input').addClass('is-invalid');
			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function (event, questionId) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || configurator.getQuestionDiv(questionId).is('.type-slider') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.wrapper-input input').removeClass('is-invalid');
			question.find('.validation-message-target').html('').hide();
		}

	};

	let questionUpload = {

		init: function () {

			// Clicks on the 'remove file' button
			cbj(document).on('click', '.question.type-upload .trigger-remove-file', function () {

				cbj(this).closest('.question').find('.upload-current-file').removeClass('has-file');
				cbj(this).closest('.question').find('.upload-current-file .file-name').text('');

				cbj(this).closest('.question').data('file-contents', '');
				cbj(this).closest('.question').data('file-url', '');

				let questionId = cbj(this).closest('.question').data('questionId');

				configurator.sendSelectionToServer(questionId, '');

			});

			// Clicks on the file browser button
			cbj(document).on('click', '.question.type-upload .trigger-show-file-browser', function () {
				cbj(this).closest('.question').find('input[type="file"]').click();
			});

			// Once the user picked a file using 'browse', trigger the drop event (is unified for both drop and browse)
			cbj(document).on('change', '.question.type-upload input[type=file]', function () {
				cbj(this).closest('.question').find('.upload-drop-zone').trigger('drop');
			});

			// Trigger system selection change method on user changes as well
			cbj(document).on('cbSelectionChange', questionUpload.onSystemSelectionChange);

		},

		initEach: function () {

			// We do the drag/drop/etc question by question because it reads easier
			cbj('.question.type-upload').each(function () {

				if (cbj(this).hasClass('initialized')) {
					return;
				}
				cbj(this).addClass('initialized');

				// Make a reference to the question element for later
				let question = cbj(this);

				// Get the current question ID for later
				let questionId = cbj(this).data('questionId');

				// Get a reference to the drop zone for later
				let dropZone = cbj('#question-' + questionId + ' .upload-drop-zone');

				// Start setting up the event handlers
				dropZone

					.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
						// In any case we prevent default behavior
						e.preventDefault();
						e.stopPropagation();
					})

					// When the file is dragged over, indicate it visually
					.on('dragover dragenter', function () {

						// In case the question isn't in use, don't show anything
						if (question.hasClass('non-applying-question') === false) {
							dropZone.addClass('is-dragover');
						}

					})

					// When dragged out, remove the visual indicator
					.on('dragleave dragend drop', function () {
						dropZone.removeClass('is-dragover');
					})

					// When the file got dropped, go for processing
					.on('drop', function (e) {

						// In case the question is disabled by rules, don't react on the drop
						if (question.hasClass('non-applying-question')) {
							return;
						}

						// This will carry the files
						let droppedFiles;

						// If we deal with a drop and get the files via dataTransfer.
						//noinspection JSUnresolvedVariable
						if (e.originalEvent && e.originalEvent.dataTransfer) {
							//noinspection JSUnresolvedVariable
							droppedFiles = e.originalEvent.dataTransfer.files;
						}
						// Otherwise the user must have used the browse button
						else {
							droppedFiles = cbj('#question-' + questionId + ' input[type=file]')[0].files;
						}

						// Give feedback if there's no file or more than one file
						if (droppedFiles.length !== 1) {
							questionUpload.onValidationMessageShown(null, questionId, 'Please upload one file only.');
							return;
						} else {
							questionUpload.onValidationMessageCleared(null, questionId);
						}

						// Get a file reader
						let reader = new window.FileReader();

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
						let formData = new FormData();

						// Prepare the regular POST data
						let requestData = {
							option: 'com_configbox',
							controller: 'configuratorpage',
							task: 'makeSelection',
							display_mode: 'view_only',
							questionId: questionId,
							selection: JSON.stringify({
								name: droppedFiles[0].name,
								size: droppedFiles[0].size,
								type: droppedFiles[0].type
							}),
							confirmed: false,
							cart_position_id: configurator.getCartPositionId(),
							productId: configurator.getProductId(),
							pageId: configurator.getPageId()
						};

						// Put the POST data into the formData
						for (let key in requestData) {
							if (requestData.hasOwnProperty(key)) {
								formData.append(key, requestData[key]);
							}
						}

						// Add the file to the form data
						formData.append('file', droppedFiles[0]);

						// Now get an XHR object
						let xhr = new XMLHttpRequest();

						// While progress is made, we update the progress bar
						xhr.addEventListener('progress', function (e) {

							let done = e.position || e.loaded;
							let percentage = Math.min(100, Math.floor(done / droppedFiles[0].size * 1000) / 10);
							dropZone.find('.drop-zone-percentage').text(percentage + '%');
							dropZone.find('.drop-zone-progress').css('width', percentage + '%');

						}, false);

						// When upload is done: Response is the same you get from configurator.sendSelectionToServer
						xhr.addEventListener('readystatechange', function () {

							if (xhr.readyState === XMLHttpRequest.DONE) {

								let data = JSON.parse(xhr.responseText);

								// Show the file name in the question
								if (typeof (data.error) === 'undefined' || data.error === '') {
									cbj('#question-' + questionId + ' .upload-current-file').addClass('has-file');
									cbj('#question-' + questionId + ' .upload-current-file .file-list').show().find('.file-name').text(droppedFiles[0].name);
								}

								// Get the response and trigger the typical event (makes all work like the other questions)
								cbj(document).trigger('serverResponseReceived', [data]);

							}

						});

						cbrequire(['configbox/server'], function (server) {
							// Open a connection and send the form data
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
		onSystemSelectionChange: function (event, questionId, selection) {

			// Skip anything that isn't an upload question
			if (configurator.getQuestionDiv(questionId).is('.type-upload') === false) {
				return;
			}

			if (!selection) {
				configurator.getQuestionDiv(questionId).data('file-contents', '');
				configurator.getQuestionDiv(questionId).data('file-url', '');
				configurator.getQuestionDiv(questionId).data('file', '');
				cbj('#question-' + questionId + ' .upload-current-file').removeClass('has-file');
				cbj('#question-' + questionId + ' .upload-current-file .file-name').text('');
			} else {
				configurator.getQuestionDiv(questionId).data('selection', JSON.parse(selection));
			}

		},

		onQuestionActivation: function (event, questionId) {
			cbj('#question-' + questionId + ' .trigger-show-file-browser').prop('disabled', false);
			cbj('#question-' + questionId + ' .upload-current-file').removeClass('has-file');
			cbj('#question-' + questionId + ' .upload-current-file .file-name').text('');
		},

		onQuestionDeactivation: function (event, questionId) {
			cbj('#question-' + questionId + ' .upload-current-file').removeClass('has-file');
			cbj('#question-' + questionId + ' .upload-current-file .file-name').text('');
			cbj('#question-' + questionId + ' .trigger-show-file-browser').prop('disabled', true);
		},

		onAnswerActivation: function (event, questionId) {

		},

		onAnswerDeactivation: function (event, questionId, answerId) {

		},

		onValidationChange: function (event, questionId, minMax) {

		},

		onValidationMessageShown: function (event, questionId, message) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || configurator.getQuestionDiv(questionId).is('.type-upload') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function (event, questionId) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || configurator.getQuestionDiv(questionId).is('.type-upload') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	let questionChoices = {

		init: function () {

			cbj('.question.type-choices').each(function () {

				if (cbj(this).hasClass('initialized')) {
					return;
				}
				cbj(this).addClass('initialized');

				let questionId = cbj(this).data('questionId');

				cbj(document).on('change', '#question-' + questionId + ' .configbox-choice-field', function () {
					let selection = cbj(this).val();

					if (cbj(this).prop('checked') === false) {
						return;
					}

					cbj(this).closest('.radio').addClass('selected').siblings().removeClass('selected');
					cbj('#question-' + questionId + ' .configbox-choice-custom-field').val('');

					configurator.sendSelectionToServer(questionId, selection);

				});

				cbj('#question-' + questionId + ' .configbox-choice-custom-field').data('lastVal', cbj('#question-' + questionId + ' .configbox-choice-custom-field').val());

				cbj(document).on('keyup', '#question-' + questionId + ' .configbox-choice-custom-field', function () {

					let lastVal = cbj('#question-' + questionId + ' .configbox-choice-custom-field').data('lastVal');
					let selection = cbj(this).val();

					if (selection === lastVal) {
						return;
					}

					cbj('#question-' + questionId + ' input[type=radio').prop('checked', false);

					if (selection) {
						cbj(this).closest('.radio').find('input[type=radio]').prop('checked', true);
					} else {
						cbj('#question-' + questionId + ' input[type=radio').prop('checked', false);
					}

					configurator.sendSelectionToServer(questionId, selection);

				});

			});

		},

		initEach: function () {

		},

		onSystemSelectionChange: function (event, questionId, selection) {

			// Skip anything that isn't a choice question
			if (configurator.getQuestionDiv(questionId).is('.type-choices') === false) {
				return;
			}

			let checked = !(selection === '' || selection === 0 || selection === null);

			if (checked) {
				if (cbj('#question-' + questionId + ' .configbox-choice-field[value="' + selection + '"]').length) {
					cbj('#question-' + questionId + ' .configbox-choice-field[value="' + selection + '"]').prop('checked', true);
					cbj('#question-' + questionId + ' .configbox-choice-custom-field').val('');
					cbj('#question-' + questionId + ' .configbox-choice-field[value="' + selection + '"]').closest('.radio').addClass('selected').siblings().removeClass('selected');
				} else {
					cbj('#question-' + questionId + ' .configbox-choice-field').prop('checked', false);
					cbj('#question-' + questionId + ' .configbox-choice-custom-field').val(selection);
					cbj('#question-' + questionId + ' .configbox-choice-custom-field').closest('.radio').find('input[type=radio]').prop('checked', true);
				}
			} else {
				cbj('#question-' + questionId + ' .configbox-choice-free-field').val('');
				cbj('#question-' + questionId + ' .input[type=radio]').prop('checked', false);
			}

		},

		onQuestionActivation: function (event, questionId) {
			cbj('#question-' + questionId + ' input').prop('disabled', false);
		},

		onQuestionDeactivation: function (event, questionId) {
			cbj('#question-' + questionId + ' input').prop('disabled', true);
			cbj('#question-' + questionId + ' input[type=text]').val('');
		},

		onAnswerActivation: function (event, questionId, answerId) {

		},

		onAnswerDeactivation: function (event, questionId, answerId) {

		},

		onValidationChange: function (event, questionId, minMax) {

			cbj('#question-' + questionId + ' .configbox-choice-field').each(function () {
				let value = cbj(this).val();
				if ((minMax.minval !== null && value < minMax.minval) || (minMax.maxval !== null && value > minMax.maxval)) {
					cbj(this).prop('disabled', true);
				} else {
					cbj(this).prop('disabled', false);
				}
			});

		},

		onValidationMessageShown: function (event, questionId, message) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || configurator.getQuestionDiv(questionId).is('.type-choices') === false) {
				return;
			}

			question.find('.form-group').addClass('has-error');
			question.find('.validation-message-target').html(message).show();

		},

		onValidationMessageCleared: function (event, questionId) {

			let question = configurator.getQuestionDiv(questionId);

			// Skip anything that isn't the right type
			if (question.length === 0 || configurator.getQuestionDiv(questionId).is('.type-choices') === false) {
				return;
			}

			question.find('.form-group').removeClass('has-error');
			question.find('.validation-message-target').html('').hide();
		}

	};

	configurator.registerQuestionType('calendar', questionCalendar);
	configurator.registerQuestionType('colorpicker', questionColorpicker);
	configurator.registerQuestionType('ralcolorpicker', questionRalColorpicker);
	configurator.registerQuestionType('checkbox', questionCheckbox);
	configurator.registerQuestionType('choices', questionChoices);
	configurator.registerQuestionType('dropdown', questionDropdown);
	configurator.registerQuestionType('images', questionImages);
	configurator.registerQuestionType('radiobuttons', questionRadiobuttons);
	configurator.registerQuestionType('slider', questionSlider);
	configurator.registerQuestionType('textbox', questionTextbox);
	configurator.registerQuestionType('textarea', questionTextarea);
	configurator.registerQuestionType('upload', questionUpload);

});