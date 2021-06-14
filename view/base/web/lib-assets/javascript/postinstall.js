/**
 * @module configbox/postinstall
 */
define(['cbj', 'configbox/server','cbj.chosen'], function(cbj, server) {
	"use strict";

	/**
	 * @exports configbox/postinstall
	 */
	var module = {

		goToStep: function(step) {

			var url = window.location.href;
			var mark = (url.indexOf('?') === -1) ? '?' : '&';

			if (url.indexOf('step=') === -1) {
				url = window.location.href + mark + 'step=' + step;
			}
			else {
				url = url.replace(/step=([^&]*)/, 'step=' + step);
			}

			window.history.pushState({step:step}, window.document.title, url);

			cbj('.cube').attr('id', 'step-' + step);

		},

		initPostInstall: function() {

			// Set state data for current step
			window.history.replaceState({step: cbj('.cube').attr('id').replace('step-', '')}, window.document.title, window.location.href);

			cbj('.chosen-select').chosen({
				width:'100%'
			});

			window.addEventListener('popstate', function(event) {
				if (typeof(event.state) !== 'undefined' && event.state.step) {
					cbj('.cube').attr('id', 'step-' + event.state.step);
				}
			});


			cbj(document).on('click', '.trigger-store-license-key', function() {

				var step = cbj(this).closest('.cube-step');
				var currentStep = step.data('step');

				var data = {
					licenseKey: step.find('#licenseKey').val()
				};

				var dataOk = true;
				cbj.each(data, function(id, item) {
					if (item.trim() === '') {
						dataOk = false;
						step.find('#' + id).closest('.form-group').addClass('has-error');
					}
				});

				if (dataOk === false) {
					return;
				}

				step.find('.has-error').removeClass('has-error');

				module.goToStep(cbj(this).data('next-step'));

				server.makeRequest('adminpostinstall', 'storeLicenseKey', data)

					.fail(function() {
						window.alert('An error has occurred. Please contact Rovexo to sort this out.');
					})

					.done(function(response) {

						step.find('.has-error').removeClass('has-error');
						step.find('.validation-placeholder').each(function() {
							cbj(this).text('');
						});

						if (response.success === false) {

							module.goToStep(currentStep);

							if (response.validationIssues.length !== 0) {

								cbj.each(response.validationIssues, function(id, text) {
									step.find('#' + id).closest('.form-group').addClass('has-error');
									step.find('#' + id).closest('.form-group').find('.validation-placeholder').text(text);
								});

							}

							if (response.errors.length !== 0) {
								window.alert(response.errors.join("\n"));
							}

						}

					});

			});


			cbj(document).on('click', '.trigger-store-shop-data', function() {

				var step = cbj(this).closest('.cube-step');
				var currentStep = step.data('step');

				var data = {
					shopName: step.find('#shopName').val(),
					shopWebsite: step.find('#shopWebsite').val(),
					email: step.find('#email').val()
				};

				var dataOk = true;
				cbj.each(data, function(id, item) {
					if (item.trim() === '') {
						dataOk = false;
						step.find('#' + id).closest('.form-group').addClass('has-error');
					}
				});

				if (dataOk === false) {
					return;
				}

				step.find('.has-error').removeClass('has-error');

				module.goToStep(cbj(this).data('next-step'));

				server.makeRequest('adminpostinstall', 'storeShopData', data)

					.fail(function() {
						window.alert('An error has occurred. Please contact Rovexo to sort this out.');
					})

					.done(function(response) {

						step.find('.has-error').removeClass('has-error');
						step.find('.validation-placeholder').each(function() {
							cbj(this).text('');
						});

						if (response.success === false) {

							module.goToStep(currentStep);

							if (response.validationIssues.length !== 0) {

								cbj.each(response.validationIssues, function(id, text) {
									step.find('#' + id).closest('.form-group').addClass('has-error');
									step.find('#' + id).closest('.form-group').find('.validation-placeholder').text(text);
								});

							}

							if (response.errors.length !== 0) {
								window.alert(response.errors.join("\n"));
							}

						}

					});

			});

			cbj(document).on('click', '.trigger-store-vat-data', function() {

				var step = cbj(this).closest('.cube-step');
				var currentStep = step.data('step');

				var data = {
					taxRate: step.find('#taxRate').val(),
					countryId: step.find('#countryId').val(),
					taxMode: step.find('#taxMode').val()
				};

				step.find('.has-error').removeClass('has-error');

				module.goToStep(cbj(this).data('next-step'));

				server.makeRequest('adminpostinstall', 'storeTaxData', data)

					.fail(function() {
						window.alert('An error has occurred. Please contact Rovexo to sort this out.');
					})

					.done(function(response) {

						step.find('.has-error').removeClass('has-error');
						step.find('.validation-placeholder').each(function() {
							cbj(this).text('');
						});

						if (response.success === false) {

							module.goToStep(currentStep);

							if (response.validationIssues.length !== 0) {

								cbj.each(response.validationIssues, function(id, text) {
									step.find('#' + id).closest('.form-group').addClass('has-error');
									step.find('#' + id).closest('.form-group').find('.validation-placeholder').text(text);
								});

							}

							if (response.errors.length !== 0) {
								window.alert(response.errors.join("\n"));
							}

						}

					});

			});


			cbj(document).on('click', '.trigger-store-languages', function() {

				var step = cbj(this).closest('.cube-step');
				var currentStep = step.data('step');

				var data = {
					languageTags: step.find('#languageTags').val()
				};

				step.find('.has-error').removeClass('has-error');

				module.goToStep(cbj(this).data('next-step'));

				server.makeRequest('adminpostinstall', 'storeLanguageTags', data)

					.fail(function() {
						window.alert('An error has occurred. Please contact Rovexo to sort this out.');
					})

					.done(function(response) {

						step.find('.has-error').removeClass('has-error');
						step.find('.validation-placeholder').each(function() {
							cbj(this).text('');
						});

						if (response.success === false) {

							module.goToStep(currentStep);

							if (response.validationIssues.length !== 0) {

								cbj.each(response.validationIssues, function(id, text) {
									step.find('#' + id).closest('.form-group').addClass('has-error');
									step.find('#' + id).closest('.form-group').find('.validation-placeholder').text(text);
								});

							}

							if (response.errors.length !== 0) {
								window.alert(response.errors.join("\n"));
							}

						}

					});

			});

			cbj(document).on('click', '.trigger-store-currencies', function() {


				var step = cbj(this).closest('.cube-step');
				var currentStep = step.data('step');

				var data = {
					baseCurrencyTitle: step.find('#baseCurrencyTitle').val(),
					baseCurrencySymbol: step.find('#baseCurrencySymbol').val(),
					baseCurrencyCode: step.find('#baseCurrencyCode').val(),
					currencies: []
				};

				step.find('.currencies .row').each(function() {
					var currency = {
						id: cbj(this).data('currency-id'),
						title: cbj(this).find('.currency-title').val(),
						symbol: cbj(this).find('.currency-symbol').val(),
						code: cbj(this).find('.currency-code').val(),
						multiplier: cbj(this).find('.currency-multiplier').val()
					};
					data.currencies.push(currency);
				});

				step.find('.has-error').removeClass('has-error');

				module.goToStep(cbj(this).data('next-step'));

				server.makeRequest('adminpostinstall', 'storeCurrencies', data)

					.fail(function() {
						window.alert('An error has occurred. Please contact Rovexo to sort this out.');
					})

					.done(function(response) {

						step.find('.has-error').removeClass('has-error');
						step.find('.validation-placeholder').each(function() {
							cbj(this).text('');
						});

						if (response.success === false) {

							module.goToStep(currentStep);

							if (response.validationIssues.length !== 0) {
								cbj.each(response.validationIssues, function(id, errorMsg) {
									step.find('.validation-placeholder').append('<div>' + errorMsg + '</div>');
								});
							}

							if (response.errors.length !== 0) {
								cbj.each(response.errors, function(id, errorMsg) {
									step.find('.validation-placeholder').append('<div>' + errorMsg + '</div>');
								});
							}

						}

					});


			});

			cbj(document).on('click', '.trigger-finish-postinstall', function() {

				var urlDashboard = cbj(this).closest('.view-adminpostinstall').data('url-dashboard');

				cbj('.cube').addClass('fallen');

				window.setTimeout(function() {
					cbj('.view-adminpostinstall').remove();
					window.location.href = urlDashboard;
				}, 1000);


			});

			cbj(document).on('click', '.trigger-add-currency', function() {

				var html = cbj('.blueprint-currency').html();

				cbj('.currencies').append(html);
				cbj('.currencies .row').last().find('.currency-name').focus();

			});


			cbj(document).on('click', '.trigger-remove-currency', function() {
				cbj(this).closest('.row').remove();
			});
			
		}

	};

	return module;

});
