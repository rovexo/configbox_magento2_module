/**
 * @module configbox/saveorder
 */
define(['cbj', 'configbox/customerform', 'configbox/server'], function(cbj, customerForm, server) {

    "use strict";

    /**
     * @exports configbox/saveorder
     */
    var module = {

        initSaveOrderPage: function() {

            cbj(document).on('click', '.view-saveorder .trigger-save-order', module.onSaveOrder);

        },

        onSaveOrder: function() {

            var button = cbj(this);

            // Deal with multiple clicks
            if (button.hasClass('processing')) {
                return;
            }

            // Add the spinner to the button
            button.addClass('processing');

            // Get the form data
            var requestData = customerForm.getCustomerFormData();

            requestData.cartId = button.closest('.view-saveorder').data('cart-id');

            server.makeRequest('saveorder', 'saveOrder', requestData)

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

                    if (response.redirectUrl) {
                        window.location.href = response.redirectUrl;
                    }

                });

        }

    };

    return module;

});
