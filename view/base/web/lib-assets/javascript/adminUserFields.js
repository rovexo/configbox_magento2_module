/**
 * @module configbox/adminUserFields
 */
define(['cbj', 'configbox/server'], function(cbj, server) {

	"use strict";

	/**
	 * @exports configbox/adminUserFields
	 */
	var module = {

		initUserFieldsEach: function() {

			var disabledValidation		  = ['salutation_id','country','email','language','billingsalutation_id','billingcountry','billingemail','billinglanguage'];
			var disabledCheckoutDisplay   = ['salutation_id','firstname','lastname','country','email','billingsalutation_id','billingfirstname','billinglastname','billingcountry','billingemail'];
			var disabledCheckoutRequire   = ['salutation_id','firstname','lastname','country','email','billingsalutation_id','billingfirstname','billinglastname','billingcountry','billingemail'];

			var disabledQuotationDisplay  = ['billingsalutation_id','billingfirstname','billinglastname','billingcountry','billingemail'];
			var disabledQuotationRequire  = ['billingsalutation_id','billingfirstname','billinglastname','billingcountry','billingemail'];

			cbj.each(disabledValidation, function(key,value) {
				cbj('.userfield-' + value + ' .browser-validation input, .userfield-' + value + ' .server-validation input').prop('disabled',true);
			});

			cbj.each(disabledCheckoutDisplay, function(key,value) {

				cbj('.userfield-' + value + ' .show-checkout input').click(function(event) {
					if (!cbj(this).prop('checked')) {
						event.stopPropagation();
						event.preventDefault();
						window.alert('This field is needed by the system and cannot be hidden');
					}
				});

			});

			cbj.each(disabledCheckoutRequire, function(key,value) {

				cbj('.userfield-' + value + ' .require-checkout input').click(function(event) {
					if (!cbj(this).prop('checked')) {
						event.stopPropagation();
						event.preventDefault();
						window.alert('This field is needed by the system and cannot be made optional');
					}
				});

			});

			cbj.each(disabledQuotationDisplay, function(key,value) {

				cbj('.userfield-' + value + ' .show-quotation input').click(function(event) {
					if (!cbj(this).prop('checked')) {
						event.stopPropagation();
						event.preventDefault();
						window.alert('This field is needed by the system and cannot be hidden');
					}
				});

			});

			cbj.each(disabledQuotationRequire, function(key,value) {

				cbj('.userfield-' + value + ' .require-quotation input').click(function(event) {
					if (!cbj(this).prop('checked')) {
						event.stopPropagation();
						event.preventDefault();
						window.alert('This field is needed by the system and cannot be made optional');
					}
				});

			});


		}

	};

	return module;

});