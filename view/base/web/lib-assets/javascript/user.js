/**
 * @module configbox/user
 */
define(['cbj', 'configbox/customerform', 'configbox/server'], function(cbj, customerForm, server) {

    "use strict";

    /**
     * @exports configbox/user
     */
    var module = {

        initUserPage: function() {

            cbj(document).on('click', '.view-user .trigger-store-customer-form', module.onSaveUserData);

        },

        onSaveUserData: function() {

            var button = cbj(this);

            // Deal with multiple clicks
            if (button.hasClass('processing')) {
                return;
            }

            // Add the spinner to the button
            button.addClass('processing');

            // Get the form data
            var data = customerForm.getCustomerFormData();

            server.makeRequest('user', 'store', data)

                .always(function() {
                    button.removeClass('processing');
                })

                .done(function(response) {

                    if (response.success === false) {

                        if (typeof(response.validationIssues) != 'undefined' && response.validationIssues.length) {
                            customerForm.displayValidationIssues(response.validationIssues);
                            return;
                        }
                        else {
                            window.alert(response.errors.join("\n"));
                            return;
                        }

                    }

                    // Remove any validation issues
                    customerForm.removeValidationIssues();

                    var url =  button.closest('.view-user').data('url-after-store');

                    if (!url) {
                        console.log('No redirect URL defined for after storing user data.');
                    }
                    else {
                        window.location.href = url;
                    }

                });

        }

    };

    return module;

});
