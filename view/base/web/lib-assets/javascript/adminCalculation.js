/**
 * @module configbox/adminCalculation
 */
define(['cbj', 'configbox/server', 'kenedo', 'configbox/calcEditor', 'configbox/calcmatrix', 'configbox/calcCode'], function(cbj, server, kenedo, calcFormula, calcMatrix, calcCode) {

	"use strict";

	/**
	 * @exports configbox/adminCalculation
	 */
	var module = {

		initCalcViewOnce: function(view) {

			// When the user picks a product, then the system shows type and related props
			cbj(document).on('change', '.view-admincalculation .property-name-product_id select', function() {

				if (!cbj(this).val()) {
					return;
				}

				var view = cbj(this).closest('.view-admincalculation');
				view.find('.property-name-type').show();
				view.find('.property-name-type input:checked').change();

			});

			// When the user switches the calculation type, this handler loads the right view for the type
			// Also it sets the handler for the store/apply button
			cbj(document).on('change', '.view-admincalculation .property-name-type input', function() {

				var selectedType = cbj(this).val();

				// Set the store handler
				module.setRecordStoreHandler(selectedType);

				var view = cbj(this).closest('.view-admincalculation');
				var controller = view.find('.calc-type-subview').data('controller-' + selectedType);

				if (!controller) {
					throw('Could not determine controller for calc type "' + selectedType + '"');
				}

				var recordId = view.find('input[name=id]').val();
				var productId = view.find('.property-name-product_id select[name=product_id]').val();
				if (!productId) {
					productId = view.find('.property-name-product_id input[name=product_id]').val();
				}
				var targetWrapper = view.find('.calc-type-subview');

				targetWrapper.empty().html('<i class="fa fa-spinner fa-spin"></i>');

				var data = {
					id: recordId,
					productId: productId
				};

				server.injectHtml(targetWrapper, controller, 'edit', data);

			});

		},

		initCalcViewEach(view) {

			var form = view.find('.kenedo-details-form');
			var selectedType = cbj('.view-admincalculation .property-name-type input:checked').val();
			if (form.hasClass('default-handlers-attached') === true) {
				// Set the record store handler
				module.setRecordStoreHandler(selectedType);
			}
			else {
				form.on('cbDefaultHandlersAttached', function() {
					module.setRecordStoreHandler(selectedType);
				});
			}

		},

		setRecordStoreHandler(type) {

			var wrapper = cbj('.view-admincalculation');

			var applyBtn = wrapper.find('.trigger-kenedo-form-task[data-task=apply]');
			var storeBtn = wrapper.find('.trigger-kenedo-form-task[data-task=store]');

			applyBtn.off('click');
			storeBtn.off('click');

			switch (type) {
				case 'matrix':
					applyBtn.on('click', calcMatrix.onStoreMatrix);
					storeBtn.on('click', calcMatrix.onStoreMatrix);
					break;
				case 'formula':
					applyBtn.on('click', calcFormula.onStoreCalculation);
					storeBtn.on('click', calcFormula.onStoreCalculation);
					break;
				case 'code':
					applyBtn.on('click', kenedo.onFormTaskButtonClicked);
					storeBtn.on('click', kenedo.onFormTaskButtonClicked);
					break;

			}

		}

	};

	return module;

});