/**
 * @module configbox/adminLicense
 */
define(['cbj'], function(cbj) {

	"use strict";

	/**
	 * @exports configbox/adminLicense
	 */
	var module = {

		initLicenseViewOnce: function() {

			cbj(document).on('click', '.view-adminlicense .trigger-store-license-key', function(){
				cbj(this).closest('form').submit();
			});

		}

	};

	return module;

});