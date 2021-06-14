/* jshint ignore:start */
var JsonResponses = {};

JsonResponses.fn.hasOwnProperty = function(i){};

JsonResponses.prototype.storeCustomerResponseData = {
	"success":false,
	"errors":[],
	"validationIssues":[
		{
			"fieldName": String,
			"errorCode": String,
			"message": String
		},
		{
			"fieldName": String,
			"errorCode": String,
			"message": String
		}
	]
};

JsonResponses.prototype.kenedoStoreResponse = {
	"success" : Boolean,
	"wasInsert" : Boolean,
	"data" : {},
	"messages" : Array,
	"errors" : Array,
	"redirectUrl" : String
};

JsonResponses.prototype.submitPasswordAndCode = {
	"success":Boolean,
	"errors":[
		{'fieldName':String, 'code':String, 'message':String }
	]
};

JsonResponses.prototype.requestPasswordChangeVerificationCode = {
	"success":Boolean,
	"errorMessage":String
};

JsonResponses.prototype.dashboardData = {
	"news":String,
	"softwareUpdate":{"patchLevel":String,"hotfix":String,"major":String,"url":"https://www.configbox.at/de/releases"},
	"js":""
};

JsonResponses.prototype.configuratorUpdates = {
	"error": String,
	"confirmationText": 'Optional blabla',
	"requestedChange": {"questionId": 22,"selection": "something", "outputValue": "Eine Tasche"},
	"originalValue": {"questionId": 1, "selection": "something", "outputValue": "Eine Tasche"},
	"cart_position_id": 200,
	"missingPageSelections": [
		{
			'id':1,
			'title':'Question Title',
			'productId': 1,
			'pageId':1,
			'message': 'Missing selection text'
		}
	],
	"missingProductSelections": [
		{
			'id':1,
			'title':'Question Title',
			'productId': 1,
			'pageId':1,
			'message': 'Missing selection text'
		}
	],
	"configurationChanges": {
		"add": {
			"8": {
				"outputValue":"something",
				"selection":"something",
				"questionId":1
			}
		},
		"remove": {
			"1":{
				"answerId":2
			}
		}
	},
	"validationValues": {"1":{"minval":1, "maxval":2}, "2":{"minval":1, "maxval":2}},
	"itemVisibility": {
		"questions": {
			"20": true,
			"21": true,
			"22": true,
			"23": true,
			"24": true,
			"25": true,
			"30": true,
			"26": true,
			"31": true,
			"27": true,
			"32": true,
			"28": true,
			"29": true
		},
		"answers": {
			"20": {"58": true, "59": true, "60": true},
			"21": {"62": true, "63": true, "64": true},
			"22": {"65": true, "66": true, "67": true},
			"23": {"68": true, "69": true, "70": true},
			"32": {"71": true, "72": true, "73": true}
		}
	},
	"cartPositionDetails": {
		"id": "200",
		"cart_id": "120",
		"prod_id": "12",
		"quantity": "1",
		"created": "2014-11-17 02:15:46",
		"finished": "0",
		"productData": {
			"id": "12",
			"sku": "",
			"prod_image": "12.png",
			"baseimage": "12.png",
			"baseweight": "0.000",
			"taxclass_id": "1",
			"taxclass_recurring_id": "1",
			"layoutname": "default",
			"ordering": "0",
			"published": "1",
			"pm_show_delivery_options": "0",
			"pm_show_payment_options": "0",
			"product_custom_1": "test felt 1",
			"product_custom_2": "",
			"product_custom_3": "",
			"product_custom_4": "",
			"enable_reviews": "1",
			"external_reviews_id": "",
			"charge_deposit": "0",
			"deposit_percentage": "0.000",
			"dispatch_time": "0",
			"pm_show_regular_first": "1",
			"pm_regular_show_overview": "2",
			"pm_regular_show_prices": "1",
			"pm_regular_show_categories": "0",
			"pm_regular_show_elements": "1",
			"pm_regular_show_elementprices": "1",
			"pm_regular_expand_categories": "2",
			"pm_recurring_show_overview": "0",
			"pm_recurring_show_prices": "1",
			"pm_recurring_show_categories": "1",
			"pm_recurring_show_elements": "1",
			"pm_recurring_show_elementprices": "1",
			"pm_recurring_expand_categories": "2",
			"page_nav_show_tabs": "2",
			"show_buy_button": "1",
			"was_price": "0.000",
			"was_price_recurring": "0.000",
			"pm_show_net_in_b2c": "0",
			"pm_regular_show_taxes": "0",
			"pm_regular_show_cart_button": "0",
			"pm_recurring_show_taxes": "0",
			"pm_recurring_show_cart_button": "0",
			"product_detail_panes_method": "tabs",
			"product_detail_panes_in_listings": "0",
			"product_detail_panes_in_product_pages": "1",
			"product_detail_panes_in_configurator_steps": "0",
			"listing_id": "1",
			"productImages": [],
			"title": "Hemden Konfigurator",
			"label": "hemden-konfigurator",
			"pricelabel": "",
			"custom_price_text": "",
			"pricelabel_recurring": "",
			"recurring_interval": "",
			"custom_price_text_recurring": "",
			"description": "<p>html<\/p>",
			"longdescription": "",
			"product_custom_5": "",
			"product_custom_6": "",
			"listing_title": "Demo Produkte",
			"listing_description": "<p>Diese Seite zeigt typische Produkte.<\/p>",
			"imagesrc": "components\/com_configbox\/data\/prod_images\/12.png",
			"priceLabel": "",
			"priceLabelRecurring": "Wiederkehrender Preis",
			"taxRate": 20,
			"taxRateRecurring": 20,
			"basePriceNet": 100,
			"basePriceGross": 120,
			"basePriceTax": 20,
			"basePriceRecurringNet": 0,
			"basePriceRecurringGross": 0,
			"basePriceRecurringTax": 0,
			"priceNet": 100,
			"priceGross": 120,
			"priceTax": 20,
			"priceRecurringNet": 0,
			"priceRecurringGross": 0,
			"priceRecurringTax": 0,
			"price": 120,
			"priceRecurring": 0,
			"wasPriceNet": 0,
			"wasPriceGross": 0,
			"wasPriceTax": 0,
			"wasPriceRecurringNet": 0,
			"wasPriceRecurringGross": 0,
			"wasPriceRecurringTax": 0,
			"wasPrice": 0,
			"wasPriceRecurring": 0,
			"showReviews": true,
			"seccount": 1,
			"firstCat": "8"
		},
		"isConfigurable": true,
		"productTitle": "Hemden Konfigurator",
		"baseProductBasePriceNet": 100,
		"baseProductBasePriceTax": 20,
		"baseProductBasePriceGross": 120,
		"baseProductBasePriceRecurringNet": 0,
		"baseProductBasePriceRecurringTax": 0,
		"baseProductBasePriceRecurringGross": 0,
		"baseTotalNet": 110,
		"baseTotalTax": 22,
		"baseTotalGross": 132,
		"baseTotalRecurringNet": 0,
		"baseTotalRecurringTax": 0,
		"baseTotalRecurringGross": 0,
		"weight": 0,
		"elements": {
			"20": {
				"displaySettings": {
					"showInPriceModule": true,
					"showInCart": true,
					"showInConfirmation": true,
					"showInQuotation": true,
					"showInOrderDetails": true,
					"showInInvoice": true
				},
				"type": "radio",
				"widget": "text",
				"option": null,
				"id": "20",
				"calcmodel": "0",
				"calcmodel_recurring": "0",
				"rules": "",
				"weight": 0,
				"text_calcmodel": "0",
				"title": "Kragen",
				"behavior_on_activation": "none",
				"behavior_on_changes": "silent",
				"show_in_overview": "1",
				"asproducttitle": "0",
				"element_css_classes": "",
				"display_while_disabled": "0",
				"unit": "",
				"default_value": "0",
				"calcmodel_id_min_val": "0",
				"calcmodel_id_max_val": "0",
				"minval": "0",
				"maxval": "0",
				"validate": "0",
				"upload_extensions": "png, jpg, jpeg, gif, tif",
				"upload_mime_types": "image\/pjpeg, image\/jpg, image\/jpeg, image\/gif, image\/tif, image\/bmp, image\/png, image\/x-png",
				"upload_size_mb": "1",
				"page_id": "8",
				"el_image": "",
				"required": "0",
				"multiplicator": "1",
				"published": "1",
				"ordering": "1",
				"element_custom_1": "",
				"element_custom_2": "",
				"element_custom_3": "",
				"element_custom_4": "",
				"internal_name": "Kragen",
				"as_textarea": "0",
				"slider_steps": "1",
				"calcmodel_weight": "0",
				"choices": "",
				"desc_display_method": "1",
				"product_id": "12",
				"description": "",
				"picker_table": "",
				"element_custom_translatable_1": "",
				"element_custom_translatable_2": "",
				"cssId": "elementwrapper-20",
				"selection": {
					"isXref": true,
					"option": {
						"id": "58",
						"title": "Standard",
						"description": "",
						"element_id": "20",
						"applies": true,
						"cssClasses": {
							"xref": "xref",
							"xrefwrapper": "xrefwrapper",
							"image-picker": "image-picker",
							"available": "available"
						},
						"extraAttributes": null,
						"rules": "",
						"checked": "",
						"disabled": "",
						"controlClasses": " configbox_control ",
						"option_picker_image": "58.png",
						"available": "1",
						"disable_non_available": "0",
						"availibility_date": null,
						"showReviews": null,
						"pickerPreloadCssClasses": null,
						"pickerImageSrc": null,
						"pickerPreloadAttributes": null,
						"isSelected": null,
						"calcmodel_weight": "0",
						"weight": 0,
						"sku": "COLLAR-STANDARD",
						"option_custom_1": "",
						"option_custom_2": "",
						"option_custom_3": "",
						"option_custom_4": "",
						"enable_reviews": "2",
						"external_reviews_id": "",
						"option_image": "",
						"was_price": "0.000",
						"was_price_recurring": "0.000",
						"basePriceStatic": "0.000",
						"basePriceRecurringStatic": "0.000",
						"option_id": "56",
						"default": "1",
						"visualization_image": "58-7100.png",
						"visualization_stacking": "0",
						"visualization_view": "",
						"display_while_disabled": "0",
						"calcmodel": "0",
						"calcmodel_recurring": "0",
						"ordering": "1",
						"published": "1",
						"assignment_custom_1": "",
						"assignment_custom_2": "",
						"assignment_custom_3": "",
						"assignment_custom_4": "",
						"page_id": "8",
						"product_id": "12",
						"option_custom_5": "",
						"option_custom_6": ""
					},
					"outputValue": "Standard",
					"value": "58",
					"basePriceNet": 0,
					"basePriceGross": 0,
					"basePriceTax": 0,
					"basePriceRecurringGross": 0,
					"basePriceRecurringNet": 0,
					"basePriceRecurringTax": 0,
					"priceNet": 0,
					"priceGross": 0,
					"priceTax": 0,
					"priceRecurringGross": 0,
					"priceRecurringNet": 0,
					"priceRecurringTax": 0
				}
			}
		},
		"usesRecurring": false,
		"productBasePriceNet": 100,
		"productBasePriceTax": 20,
		"productBasePriceGross": 120,
		"productBasePriceRecurringNet": 0,
		"productBasePriceRecurringTax": 0,
		"productBasePriceRecurringGross": 0,
		"totalNet": 110,
		"totalTax": 22,
		"totalGross": 132,
		"totalRecurringNet": 0,
		"totalRecurringTax": 0,
		"totalRecurringGross": 0
	},
	"pricing": {
		"quantity": "1",
		"questions": {
			"20": {
				"outputValue": "Standard",
				"showInOverview": "1",
				"showButHidden": true,
				"price": 0,
				"priceRecurring": 0,
				"priceFormatted": "\u20ac 0,00",
				"priceRecurringFormatted": "\u20ac 0,00",
				"cssClassesList": '',
				"cssClassesOutputValue": '',
				"cssClassesPrice": ''
			}

		},
		"xrefs": {
			"58": {
				"price": 0,
				"priceRecurring": 0,
				"elementId": 20,
				"priceFormatted": "\u20ac 0,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"59": {
				"price": 0,
				"priceRecurring": 0,
				"elementId": 20,
				"priceFormatted": "\u20ac 0,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"60": {
				"price": 0,
				"priceRecurring": 0,
				"elementId": 20,
				"priceFormatted": "\u20ac 0,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"62": {
				"price": 0,
				"priceRecurring": 0,
				"elementId": 21,
				"priceFormatted": "\u20ac 0,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"63": {
				"price": 24,
				"priceRecurring": 0,
				"elementId": 21,
				"priceFormatted": "\u20ac 24,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"64": {
				"price": 36,
				"priceRecurring": 0,
				"elementId": 21,
				"priceFormatted": "\u20ac 36,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"65": {
				"price": 0,
				"priceRecurring": 0,
				"elementId": 22,
				"priceFormatted": "\u20ac 0,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"66": {
				"price": 0,
				"priceRecurring": 0,
				"elementId": 22,
				"priceFormatted": "\u20ac 0,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"67": {
				"price": 0,
				"priceRecurring": 0,
				"elementId": 22,
				"priceFormatted": "\u20ac 0,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"68": {
				"price": 0,
				"priceRecurring": 0,
				"elementId": 23,
				"priceFormatted": "\u20ac 0,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"69": {
				"price": 12,
				"priceRecurring": 0,
				"elementId": 23,
				"priceFormatted": "\u20ac 12,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"70": {
				"price": 24,
				"priceRecurring": 0,
				"elementId": 23,
				"priceFormatted": "\u20ac 24,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"71": {
				"price": 0,
				"priceRecurring": 0,
				"elementId": 32,
				"priceFormatted": "\u20ac 0,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"72": {
				"price": 0,
				"priceRecurring": 0,
				"elementId": 32,
				"priceFormatted": "\u20ac 0,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			},
			"73": {
				"price": 0,
				"priceRecurring": 0,
				"elementId": 32,
				"priceFormatted": "\u20ac 0,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			}
		},
		"total": {
			"productPrice": 120,
			"productPriceNet": 120,
			"productPriceGross": 120,
			"productPriceRecurring": 0,
			"productPriceNetRecurring": 120,
			"productPriceGrossRecurring": 120,
			"price": 132,
			"priceRecurring": 0,
			"priceNet": 110,
			"priceGross": 132,
			"priceTax": 22,
			"priceRecurringNet": 0,
			"priceRecurringGross": 0,
			"priceRecurringTax": 0,
			"pricePerItem": 132,
			"pricePerItemRecurring": 0,
			"pricePerItemNet": 110,
			"pricePerItemTax": 22,
			"pricePerItemGross": 132,
			"pricePerItemRecurringNet": 0,
			"pricePerItemRecurringTax": 0,
			"pricePerItemRecurringGross": 0,
			"productTaxRate": 20,
			"productTaxRateRecurring": 20,
			"pricePerItemNetFormatted": "\u20ac 110,00",
			"pricePerItemTaxFormatted": "\u20ac 22,00",
			"pricePerItemGrossFormatted": "\u20ac 132,00",
			"pricePerItemRecurringNetFormatted": "\u20ac 0,00",
			"pricePerItemRecurringTaxFormatted": "\u20ac 0,00",
			"pricePerItemRecurringGrossFormatted": "\u20ac 0,00",
			"pricePerItemFormatted": "\u20ac 132,00",
			"pricePerItemRecurringFormatted": "\u20ac 0,00",
			"priceFormatted": "\u20ac 132,00",
			"priceRecurringFormatted": "\u20ac 0,00",
			"priceNetFormatted": "\u20ac 110,00",
			"priceTaxFormatted": "\u20ac 22,00",
			"priceGrossFormatted": "\u20ac 132,00",
			"priceRecurringNetFormatted": "\u20ac 0,00",
			"priceRecurringTaxFormatted": "\u20ac 0,00",
			"priceRecurringGrossFormatted": "\u20ac 0,00",
			"productPriceFormatted": "\u20ac 120,00",
			"productPriceNetFormatted": "\u20ac 120,00",
			"productPriceGrossFormatted": "\u20ac 120,00",
			"productPriceRecurringFormatted": "\u20ac 0,00",
			"productPriceNetRecurringFormatted": "\u20ac 0,00",
			"productPriceGrossRecurringFormatted": "\u20ac 0,00"
		},
		"pages": {
			"8": {
				"price": 12,
				"priceRecurring": 0,
				"priceFormatted": "\u20ac 12,00",
				"priceRecurringFormatted": "\u20ac 0,00"
			}
		},
		"totalPlusExtras": {
			"priceNet": 110,
			"priceTax": 22,
			"priceGross": 132,
			"priceNetFormatted": "\u20ac 110,00",
			"priceTaxFormatted": "\u20ac 22,00",
			"priceGrossFormatted": "\u20ac 132,00"
		},
		"taxes": {"20": 22},
		"delivery": null,
		"payment": null,
		"taxesFormatted": {"20": "\u20ac 22,00"}
	}
};

JsonResponses.prototype.customerform = {
	"getCounties" : [{
		"id" : Number,
		"county_name" : String
	}],

	"getCities" : [{
		"id" : Number,
		"city_name" : String
	}]
};

/* jshint ignore:end */
