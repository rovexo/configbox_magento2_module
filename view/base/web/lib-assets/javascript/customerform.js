/**
 * @module configbox/customerform
 */
define(['cbj', 'bootstrap', 'cbj.chosen'], function(cbj, bootstrap) {

	"use strict";

	/**
	 * @exports configbox/customerform
	 */
	let module = {

		initCustomerFormEach: function() {

			cbj('.view-customerform .cb-popover').each(function() {
				new bootstrap.Popover(this, {});
			})


			cbj('.view-customerform .chosen-dropdown').chosen({
				disable_search_threshold: 10
			});
		},

		initCustomerForm: function() {

			// Hide or show the delivery address section
			cbj(document).on('change', '.view-customerform .trigger-toggle-same-delivery', function() {

				if (cbj(this).prop('checked') === true) {
					// Hide the delivery fields
					cbj(this).closest('.customer-form-sections').removeClass('show-delivery-fields');
				}
				else {

					// Copy over billing to delivery (but only if user didn't toggle before)
					if (cbj(this).data('got-toggled') === 'undefined') {

						cbj(this).data('got-toggled', true);

						let customerFields = cbj(this).closest('.view-customerform').data('customer-fields');
						let formType = cbj(this).closest('.view-customerform').find('#form_type').val();

						// Copy info over from billing
						for (let key in customerFields) {
							if (customerFields.hasOwnProperty(key)) {
								let obj = customerFields[key];
								if (obj['show_' + formType] == '1') {
									if (cbj('#'+obj.field_name).length && cbj('#billing'+obj.field_name).length) {
										let billingFieldValue = cbj('#billing'+obj.field_name).val();
										cbj('input[name='+obj.field_name+']').val(billingFieldValue);
									}
								}
							}
						}

					}

					// Make the delivery fields show up
					cbj(this).closest('.customer-form-sections').addClass('show-delivery-fields');

				}

			});

			// Checking the box 'I have an account' makes the login box appear (and vice versa)
			cbj(document).on('change', '.recurring-customer-login #show-login', function() {
				let loginBox = cbj(this).closest('.recurring-customer-login').find('.login-wrapper').show();
				if (cbj(this).prop('checked') === true) {
					loginBox.show();
				}
				else {
					loginBox.hide();
				}
			});

			// Clicks on the customer form login button make a call to the user controller and then the customer form reloads
			cbj(document).on('click', '.recurring-customer-login .trigger-login', function() {

				// Deal with multiple mouse clicks
				if (cbj(this).hasClass('processing')) {
					return;
				}

				// Add the spinner to the button
				cbj(this).addClass('processing');

				let wrapper = cbj(this).closest('.recurring-customer-login');

				// Reset any feedback
				wrapper.find('.feedback').text('');

				let username = wrapper.find('.input-username').val();
				let password = wrapper.find('.input-password').val();

				cbrequire(['configbox/server'], function (server) {

					server.requestLogin(username, password)

						.done(function(response){
							if (response.success === false) {
								if (wrapper.find('.login-box .feedback').length !== 0) {
									wrapper.find('.login-box .feedback').text(response.errorMessage);
								}
								else {
									window.alert(response.errorMessage);
								}
							}
							else {
								cbj(document).trigger('cbLogin');
								let refreshUrl = wrapper.closest('.view-customerform').data('view-url');
								wrapper.closest('.view-customerform').load(refreshUrl, function() {
									cbj(document).trigger('cbViewInjected');
								});
							}
						})
						.always(function(){
							wrapper.find('.login-box .processing').removeClass('processing');
						});

				});

			});

			// Clicking on 'Recover Password' makes the right box appear
			cbj(document).on('click', '.recurring-customer-login .trigger-recover-password', function() {

				// Copy the email address from login-box over to recover box
				let email = cbj(this).closest('.login-wrapper').find('.input-username').val();
				if (email) {
					cbj(this).closest('.recurring-customer-login').find('.recover-box .input-username').val(email);
				}

				cbj(this).closest('.recurring-customer-login').find('.login-box').hide();
				cbj(this).closest('.recurring-customer-login').find('.recover-box').show();
				cbj(this).closest('.recurring-customer-login').find('.change-password-box').hide();
			});

			// Clicking on 'Cancel' brings back the login box
			cbj(document).on('click', '.recurring-customer-login .trigger-cancel-recovery', function() {
				cbj(this).closest('.recurring-customer-login').find('.login-box').show();
				cbj(this).closest('.recurring-customer-login').find('.recover-box').hide();
				cbj(this).closest('.recurring-customer-login').find('.change-password-box').hide();
			});

			// Keystrokes in text fields remove the invalid-flag
			cbj(document).on('keyup', '.view-customerform .customer-field .form-control', function() {
				cbj(this).closest('.customer-field').removeClass('invalid');
			});

			// Changes in dropdowns remove the invalid-flag
			cbj(document).on('change', '.view-customerform .customer-field select', function() {
				cbj(this).closest('.customer-field').removeClass('invalid');
			});

			// Clicks on 'Recover Password' make the server send out an email with a code and the next panel appears
			cbj(document).on('click', '.recurring-customer-login .trigger-request-verification-code', function() {

				// Deal with multiple mouse clicks
				if (cbj(this).hasClass('processing')) {
					return;
				}

				// Add the spinner to the button
				cbj(this).addClass('processing');

				// Get the email address from the form
				let email = cbj(this).closest('.recover-box').find('.input-username').val();

				// Get a reference to the box wrapper
				let wrapper = cbj(this).closest('.recurring-customer-login');

				// Reset any feedback
				wrapper.find('.feedback').text('');

				cbrequire(['configbox/server'], function (server) {

					// Get the verification email sent
					server.requestPasswordChangeVerificationCode(email)

						.done(function(response){
							if (response.success === false) {
								if (wrapper.find('.recover-box .feedback').length !== 0) {
									wrapper.find('.recover-box .feedback').text(response.errorMessage);
								}
								else {
									window.alert(response.errorMessage);
								}
							}
							else {
								wrapper.find('.recover-box').hide();
								wrapper.find('.change-password-box').show();
							}
						})
						.always(function(){
							wrapper.find('.recover-box .processing').removeClass('processing');
						});

				});

			});

			// Clicking on 'Change Password' sends code and new password to the server. If all goes well, the customer
			// gets logged in and the customer form reloads.
			cbj(document).on('click', '.recurring-customer-login .trigger-change-password', function() {

				// Deal with multiple mouse clicks
				if (cbj(this).hasClass('processing')) {
					return;
				}

				// Add the spinner to the button
				cbj(this).addClass('processing');

				// Get the email address from the form
				let code = cbj(this).closest('.change-password-box').find('.input-verification').val();
				let password = cbj(this).closest('.change-password-box').find('.input-new-password').val();

				// Get a reference to the box wrapper
				let wrapper = cbj(this).closest('.recurring-customer-login');

				// Reset any feedback
				wrapper.find('.feedback').text('');

				cbrequire(['configbox/server'], function (server) {

					// Send the email for the verification code
					server.requestPasswordChange(code, password, true)

						/**
						 * @param {JsonResponses.submitPasswordAndCode} response
						 */
						.done(function(response) {

							if (response.success === false) {
								cbj.each(response.errors, function(i, error){
									wrapper.find('.change-password-box .feedback').append('<div>'+error.message+'</div>');
								});
							}
							else {
								let refreshUrl = wrapper.closest('.view-customerform').data('view-url');
								cbj(document).trigger('cbLogin');
								wrapper.closest('.view-customerform').load(refreshUrl, function() {
									cbj(document).trigger('cbViewInjected');
								});
							}
						})
						.always(function(){
							wrapper.find('.processing').removeClass('processing');
						});


				});

			});

			// Hitting the enter key on the customer form login form triggers a click on the respective primary button
			cbj(document).on('keyup', '.recurring-customer-login', function(event) {

				// We're only interested in 'Enter'
				if(event.which !== 13) {
					return;
				}

				// Prepare the wrapper for convenience
				let wrapper = cbj(this).closest('.recurring-customer-login');

				// See what's the origin, afterwards check in which box we're in
				let origin = cbj(event.target);

				if (origin.closest('.login-box').length !== 0) {
					wrapper.find('.trigger-login').trigger('click');
				}

				if (origin.closest('.recover-box').length !== 0) {
					wrapper.find('.trigger-request-verification-code').trigger('click');
				}
				if (origin.closest('.change-password-box').length !== 0) {
					wrapper.find('.trigger-change-password').trigger('click');
				}

			});

			// From here on it's all about things that appear in many different views:
			// We put that here instead of in a separate module to avoid another request to speed things up.

			// CUSTOMER FORM: If a country dropdown changes, it updates the state dropdown
			cbj(document).on('change', 'select.updates-states', function() {

				// In case the change was triggered by the browser's address auto-fill, update the chosen dropdown
				cbj(this).trigger('chosen:updated');

				// Get the selected ID
				let countryId = parseInt(cbj(this).val());

				// Get the ID of the state dropdown
				let stateSelectId = cbj(this).data('state-select-id');

				// Get the connected state dropdown
				let stateDropdown = cbj('#' + stateSelectId);

				// If there is no state dropdown, stop doing things
				if (stateDropdown.length === 0) {
					return;
				}

				// No country ID means we we remove all options from the state dropdown
				if (countryId === 0) {
					stateDropdown.html('<option value="0" selected="selected"></option>');
					stateDropdown.prop('disabled', true);
					stateDropdown.trigger('chosen:updated').trigger('change');
					return;
				}

				cbrequire(['configbox/server'], function(configbox) {

					configbox.makeRequest('customerform', 'getStates', {country_id : countryId})

						.done(function(states) {

							// Remove any existing options and un-disable it
							stateDropdown.html('').prop('disabled', false);

							// Mark the field in case we got no options for it
							if (states.length === 0) {
								stateDropdown.closest('.customer-field').addClass('has-no-data');
							}
							else {
								stateDropdown.closest('.customer-field').removeClass('has-no-data');
							}

							// Loop and add the options
							cbj.each(states, function(i, item) {
								stateDropdown.append('<option value="'+item.id+'">'+item.name+'</option>');
							});

							// Dispatch the events for chosen:updated/change
							stateDropdown.trigger('chosen:updated').trigger('change');

						});

				});

			});

			// CUSTOMER FORM: If a state dropdown changes, it updates the county dropdown
			cbj(document).on('change', '.view-customerform select.updates-counties', function() {

				// In case the change was triggered by the browser's address auto-fill, update the chosen dropdown
				cbj(this).trigger('chosen:updated');

				// Get the selected ID
				let stateId = parseInt(cbj(this).val());

				// Get the ID of the state dropdown
				let countySelectId = cbj(this).data('county-select-id');

				// Get the connected county dropdown
				let countyDropdown = cbj('#' + countySelectId);

				// If there is none, stop doing things
				if (countyDropdown.length === 0) {
					return;
				}

				// If the user selected no state, clear the county dropdown
				if (stateId === 0) {
					countyDropdown.html('<option value="0" selected="selected"></option>');
					countyDropdown.prop('disabled', true);
					countyDropdown.trigger('chosen:updated').trigger('change');
					return;
				}

				cbrequire(['configbox/server'], function(configbox) {

					configbox.makeRequest('customerform', 'getCounties', {state_id : stateId})

						.done(function(counties) {

							// Remove any existing options and un-disable it
							countyDropdown.html('').prop('disabled', false);

							// Mark the field in case we got no options for it
							if (counties.length === 0) {
								countyDropdown.closest('.customer-field').addClass('has-no-data');
							}
							else {
								countyDropdown.closest('.customer-field').removeClass('has-no-data');
							}

							// Loop and add the options
							cbj.each(counties, function(i, county) {
								countyDropdown.append('<option value="'+county.id+'">'+county.county_name+'</option>');
							});

							// Dispatch the events for chosen:updated/change
							countyDropdown.trigger('chosen:updated').trigger('change');

						});
				});

			});

			// CUSTOMER FORM: If a county dropdown changes, it updates the connected city dropdown
			cbj(document).on('change', '.view-customerform select.updates-cities', function() {

				// In case the change was triggered by the browser's address auto-fill, update the chosen dropdown
				cbj(this).trigger('chosen:updated');

				// Get the selected ID
				let countyId = parseInt(cbj(this).val());

				// Get the ID of the state dropdown
				let citySelectId = cbj(this).data('city-select-id');

				// Get the city dropdown
				let cityDropdown = cbj('#' + citySelectId);

				if (cityDropdown.length === 0) {
					return;
				}

				if (countyId === 0) {
					// Unselect a possible value in the city dropdown
					cityDropdown.val('0').trigger('chosen:updated').trigger('change');
					// Mark it as not used
					cityDropdown.closest('.customer-field').addClass('uses-textfield-instead');
					// Get the CSS class part for the city text field
					let textField = citySelectId.replace('_id', '');
					// Remove the unused mark - this should make the city text field input appear
					cityDropdown.closest('.view-customerform').find('.customer-field-'+textField).removeClass('uses-dropdown-instead');
					return;
				}

				cbrequire(['configbox/server'], function(configbox) {

					configbox.makeRequest('customerform', 'getCities', {county_id: countyId})

						.done(function (cities) {

							// Remove any existing options and un-disable it
							cityDropdown.html('').prop('disabled', false);

							// If there are no cities for that county, remove any existing city options and show the city textfield
							if (cities.length === 0) {
								// Unselect a possible value in the city dropdown
								cityDropdown.val('0').trigger('chosen:updated').trigger('change');
								// Mark it as not used
								cityDropdown.closest('.customer-field').addClass('uses-textfield-instead');
								// Get the CSS class part for the city text field
								let textField = citySelectId.replace('_id', '');
								// Remove the unused mark - this should make the city text field input appear
								cityDropdown.closest('.view-customerform').find('.customer-field-' + textField).removeClass('uses-dropdown-instead');
								return;
							}

							// Hide the city textfield (just in case it's currently shown)
							cityDropdown.closest('.customer-field').removeClass('has-no-data uses-textfield-instead');

							// Get the CSS class part for the city text field..
							let cityFieldName = citySelectId.replace('_id', '');
							// .. empty the value in city text field
							cbj('#' + cityFieldName).val('');
							// ..and hide the text field block
							cityDropdown.closest('.view-customerform').find('.customer-field-' + cityFieldName).addClass('uses-dropdown-instead');

							// Loop and add the options
							cbj.each(cities, function(i, city) {
								cityDropdown.append('<option value="'+city.id+'">'+city.city_name+'</option>');
							});

							// Dispatch the events for chosen:updated/change
							cityDropdown.trigger('change').trigger('chosen:updated');

						});

				});

			});

		},

		getCustomerFormData: function() {

			let customerData = {};

			// Loop through all inputs and collect customer data
			cbj('.kenedo-view.view-customerform :input').each(function(i, item) {

				let name = cbj(item).attr('name');
				let val;

				if (!cbj(item).attr('name')) {
					return;
				}
				else if (cbj(item).is('input[type=radio]')) {
					if (cbj(item).prop('checked') === true) {
						val = cbj(item).val();
					}
				}
				else if (cbj(item).is('input[type=checkbox]')) {
					val = (cbj(item).prop('checked') === true) ? '1' : '0';
				}
				else {
					val = cbj(item).val();
				}

				if (name && val !== undefined) {
					customerData[name] = val;
				}

			});

			// If delivery is same, replace any delivery values with their billing counterparts
			if (customerData.samedelivery === '1') {
				cbj.each(customerData, function(fieldName, value) {
					if (fieldName.indexOf('billing') === 0) {
						let pendant = fieldName.substr(7);

						if (typeof(customerData[pendant]) !== 'undefined') {
							customerData[pendant] = value;
						}
					}
				});
			}

			return customerData;

		},

		/**
		 * Shows validation issues in customer form
		 * @param {(Array|JsonResponses.storeCustomerResponseData.validationIssues)} issues
		 * @see ConfigboxViewCustomerform
		 */
		displayValidationIssues : function(issues) {

			// Remove any css flags for invalid fields
			cbj('.view-customerform .customer-field:visible').removeClass('invalid').addClass('valid');

			// Set flags for fields with issues, set the issue message
			for (let i in issues) {
				if (issues.hasOwnProperty(i)) {
					cbj('.customer-field-'+issues[i].fieldName).removeClass('valid').addClass('invalid');
					cbj('.customer-field-'+issues[i].fieldName).find('.validation-tooltip').data('message', issues[i].message);
				}
			}

			// Set up the tooltips
			module.initValidationTooltips();

		},

		/**
		 * Removes any shown validation issues
		 */
		removeValidationIssues : function() {
			// Remove any css flags for invalid fields
			cbj('.view-customerform .customer-field:visible').removeClass('invalid').removeClass('valid');
			cbj('.view-customerform .validation-tooltip').data('message', '');
			module.initValidationTooltips();
		},

		/**
		 * Initializes tooltips on the customer data form
		 */
		initValidationTooltips : function() {

			cbj('.validation-tooltip').each(function() {
				// ..and init the popovers (doing some settings unless instructed otherwise in data attributes)
				let settings = {
					customClass: 'cb-content validation-tooltip',
					animation: false,
					trigger: 'hover',
					html: (typeof (cbj(this).data('html')) !== 'undefined') ? cbj(this).data('html') : true,
					content: cbj(this).data('message') || '',
				};

				new bootstrap.Popover(cbj(this).get(0), settings);

			});

		}

	};

	return module;

});