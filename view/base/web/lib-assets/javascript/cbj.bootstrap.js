/* global alert, console, define, cbrequire: false */
/* jshint -W116 */
/**
 * jQuery plugins for Bootstrap 5 components
 * Provides backward compatibility with Bootstrap 4 syntax for all major components
 */
define(['cbj', 'bootstrap'], function(cbj, bootstrap) {
	'use strict';

	// ==================== POPOVER ====================
	cbj.fn.popover = function(options) {
		return this.each(function() {
			const element = this;
			const $element = cbj(this);

			// Handle method calls
			if (typeof options === 'string') {
				const instance = bootstrap.Popover.getInstance(element);

				switch(options) {
					case 'show':
						instance?.show();
						break;
					case 'hide':
						instance?.hide();
						break;
					case 'toggle':
						instance?.toggle();
						break;
					case 'dispose':
					case 'destroy':
						instance?.dispose();
						break;
					case 'update':
						instance?.update();
						break;
				}
				return;
			}

			// Get data attributes from element
			const dataOptions = {
				animation: $element.data('animation'),
				container: $element.data('container'),
				content: $element.data('content'),
				delay: $element.data('delay'),
				html: $element.data('html'),
				placement: $element.data('placement'),
				selector: $element.data('selector'),
				template: $element.data('template'),
				title: $element.data('title'),
				trigger: $element.data('trigger'),
				offset: $element.data('offset'),
				fallbackPlacements: $element.data('fallbackPlacements'),
				boundary: $element.data('boundary'),
				customClass: $element.data('customClass'),
				sanitize: $element.data('sanitize'),
				allowList: $element.data('allowList'),
				sanitizeFn: $element.data('sanitizeFn')
			};

			// Remove undefined values
			Object.keys(dataOptions).forEach(key =>
				dataOptions[key] === undefined && delete dataOptions[key]
			);

			// Merge options with data attributes
			const config = cbj.extend({}, options, dataOptions);

			// Create Bootstrap 5 popover instance
			const popover = new bootstrap.Popover(element, config);

			// Store instance reference
			$element.data('bs.popover', popover);

			// Handle BS4-style _popper reference
			if (popover._popper) {
				$element.data('bs.popover')._popper = popover._popper;
			}
		});
	};

	// ==================== TOOLTIP ====================
	cbj.fn.tooltip = function(options) {
		return this.each(function() {
			const element = this;
			const $element = cbj(this);

			// Handle method calls
			if (typeof options === 'string') {
				const instance = bootstrap.Tooltip.getInstance(element);

				switch(options) {
					case 'show':
						instance?.show();
						break;
					case 'hide':
						instance?.hide();
						break;
					case 'toggle':
						instance?.toggle();
						break;
					case 'dispose':
					case 'destroy':
						instance?.dispose();
						break;
					case 'update':
						instance?.update();
						break;
					case 'enable':
						instance?.enable();
						break;
					case 'disable':
						instance?.disable();
						break;
					case 'toggleEnabled':
						instance?.toggleEnabled();
						break;
				}
				return;
			}

			// Get data attributes from element
			const dataOptions = {
				animation: $element.data('animation'),
				container: $element.data('container'),
				delay: $element.data('delay'),
				html: $element.data('html'),
				placement: $element.data('placement'),
				selector: $element.data('selector'),
				template: $element.data('template'),
				title: $element.data('title'),
				trigger: $element.data('trigger'),
				offset: $element.data('offset'),
				fallbackPlacements: $element.data('fallbackPlacements'),
				boundary: $element.data('boundary'),
				customClass: $element.data('customClass'),
				sanitize: $element.data('sanitize'),
				allowList: $element.data('allowList'),
				sanitizeFn: $element.data('sanitizeFn')
			};

			// Remove undefined values
			Object.keys(dataOptions).forEach(key =>
				dataOptions[key] === undefined && delete dataOptions[key]
			);

			// Merge options with data attributes
			const config = cbj.extend({}, options, dataOptions);

			// Create Bootstrap 5 tooltip instance
			const tooltip = new bootstrap.Tooltip(element, config);

			// Store instance reference
			$element.data('bs.tooltip', tooltip);

			// Handle BS4-style _popper reference
			if (tooltip._popper) {
				$element.data('bs.tooltip')._popper = tooltip._popper;
			}
		});
	};

	// ==================== MODAL ====================
	cbj.fn.modal = function(options) {
		return this.each(function() {
			const element = this;
			const $element = cbj(this);

			// Handle method calls
			if (typeof options === 'string') {
				let instance = bootstrap.Modal.getInstance(element);

				switch(options) {
					case 'show':
						if (!instance) {
							instance = new bootstrap.Modal(element);
						}
						instance.show();
						break;
					case 'hide':
						instance?.hide();
						break;
					case 'toggle':
						if (!instance) {
							instance = new bootstrap.Modal(element);
						}
						instance.toggle();
						break;
					case 'dispose':
					case 'destroy':
						instance?.dispose();
						break;
					case 'handleUpdate':
						instance?.handleUpdate();
						break;
				}
				return;
			}

			// Get data attributes from element
			const dataOptions = {
				backdrop: $element.data('backdrop'),
				keyboard: $element.data('keyboard'),
				focus: $element.data('focus')
			};

			// Remove undefined values
			Object.keys(dataOptions).forEach(key =>
				dataOptions[key] === undefined && delete dataOptions[key]
			);

			// Merge options with data attributes
			const config = cbj.extend({}, options, dataOptions);

			// Create Bootstrap 5 modal instance
			const modal = bootstrap.Modal.getOrCreateInstance(element, config);

			// Store instance reference
			$element.data('bs.modal', modal);
		});
	};

	// ==================== COLLAPSE ====================
	cbj.fn.collapse = function(options) {
		return this.each(function() {
			const element = this;
			const $element = cbj(this);

			// Handle method calls
			if (typeof options === 'string') {
				const instance = bootstrap.Collapse.getInstance(element);

				switch(options) {
					case 'show':
						instance?.show();
						break;
					case 'hide':
						instance?.hide();
						break;
					case 'toggle':
						instance?.toggle();
						break;
					case 'dispose':
					case 'destroy':
						instance?.dispose();
						break;
				}
				return;
			}

			// Get data attributes from element
			const dataOptions = {
				parent: $element.data('parent'),
				toggle: $element.data('toggle')
			};

			// Remove undefined values
			Object.keys(dataOptions).forEach(key =>
				dataOptions[key] === undefined && delete dataOptions[key]
			);

			// Merge options with data attributes
			const config = cbj.extend({}, options, dataOptions);

			// Create Bootstrap 5 collapse instance
			const collapse = new bootstrap.Collapse(element, config);

			// Store instance reference
			$element.data('bs.collapse', collapse);
		});
	};

	// ==================== DROPDOWN ====================
	cbj.fn.dropdown = function(options) {
		return this.each(function() {
			const element = this;
			const $element = cbj(this);

			// Handle method calls
			if (typeof options === 'string') {
				const instance = bootstrap.Dropdown.getInstance(element);

				switch(options) {
					case 'show':
						instance?.show();
						break;
					case 'hide':
						instance?.hide();
						break;
					case 'toggle':
						instance?.toggle();
						break;
					case 'dispose':
					case 'destroy':
						instance?.dispose();
						break;
					case 'update':
						instance?.update();
						break;
				}
				return;
			}

			// Get data attributes from element
			const dataOptions = {
				offset: $element.data('offset'),
				boundary: $element.data('boundary'),
				reference: $element.data('reference'),
				display: $element.data('display'),
				popperConfig: $element.data('popperConfig'),
				autoClose: $element.data('autoClose')
			};

			// Remove undefined values
			Object.keys(dataOptions).forEach(key =>
				dataOptions[key] === undefined && delete dataOptions[key]
			);

			// Merge options with data attributes
			const config = cbj.extend({}, options, dataOptions);

			// Create Bootstrap 5 dropdown instance
			const dropdown = new bootstrap.Dropdown(element, config);

			// Store instance reference
			$element.data('bs.dropdown', dropdown);
		});
	};

	// ==================== TAB ====================
	cbj.fn.tab = function(options) {
		return this.each(function() {
			const element = this;
			const $element = cbj(this);

			// Handle method calls
			if (typeof options === 'string') {
				const instance = bootstrap.Tab.getInstance(element);

				switch(options) {
					case 'show':
						if (!instance) {
							const tab = new bootstrap.Tab(element);
							tab.show();
						} else {
							instance.show();
						}
						break;
					case 'dispose':
					case 'destroy':
						instance?.dispose();
						break;
				}
				return;
			}

			// Create Bootstrap 5 tab instance
			const tab = new bootstrap.Tab(element, options);

			// Store instance reference
			$element.data('bs.tab', tab);
		});
	};

	// ==================== ALERT ====================
	cbj.fn.alert = function(options) {
		return this.each(function() {
			const element = this;
			const $element = cbj(this);

			// Handle method calls
			if (typeof options === 'string') {
				const instance = bootstrap.Alert.getInstance(element);

				switch(options) {
					case 'close':
						instance?.close();
						break;
					case 'dispose':
					case 'destroy':
						instance?.dispose();
						break;
				}
				return;
			}

			// Create Bootstrap 5 alert instance
			const alert = new bootstrap.Alert(element, options);

			// Store instance reference
			$element.data('bs.alert', alert);
		});
	};

	// ==================== TOAST ====================
	cbj.fn.toast = function(options) {
		return this.each(function() {
			const element = this;
			const $element = cbj(this);

			// Handle method calls
			if (typeof options === 'string') {
				const instance = bootstrap.Toast.getInstance(element);

				switch(options) {
					case 'show':
						instance?.show();
						break;
					case 'hide':
						instance?.hide();
						break;
					case 'dispose':
					case 'destroy':
						instance?.dispose();
						break;
				}
				return;
			}

			// Get data attributes from element
			const dataOptions = {
				animation: $element.data('animation'),
				autohide: $element.data('autohide'),
				delay: $element.data('delay')
			};

			// Remove undefined values
			Object.keys(dataOptions).forEach(key =>
				dataOptions[key] === undefined && delete dataOptions[key]
			);

			// Merge options with data attributes
			const config = cbj.extend({}, options, dataOptions);

			// Create Bootstrap 5 toast instance
			const toast = new bootstrap.Toast(element, config);

			// Store instance reference
			$element.data('bs.toast', toast);
		});
	};

	// ==================== OFFCANVAS ====================
	cbj.fn.offcanvas = function(options) {
		return this.each(function() {
			const element = this;
			const $element = cbj(this);

			// Handle method calls
			if (typeof options === 'string') {
				const instance = bootstrap.Offcanvas.getInstance(element);

				switch(options) {
					case 'show':
						if (!instance) {
							const offcanvas = new bootstrap.Offcanvas(element);
							offcanvas.show();
						} else {
							instance.show();
						}
						break;
					case 'hide':
						instance?.hide();
						break;
					case 'toggle':
						if (!instance) {
							const offcanvas = new bootstrap.Offcanvas(element);
							offcanvas.toggle();
						} else {
							instance.toggle();
						}
						break;
					case 'dispose':
					case 'destroy':
						instance?.dispose();
						break;
				}
				return;
			}

			// Get data attributes from element
			const dataOptions = {
				backdrop: $element.data('backdrop'),
				keyboard: $element.data('keyboard'),
				scroll: $element.data('scroll')
			};

			// Remove undefined values
			Object.keys(dataOptions).forEach(key =>
				dataOptions[key] === undefined && delete dataOptions[key]
			);

			// Merge options with data attributes
			const config = cbj.extend({}, options, dataOptions);

			// Create Bootstrap 5 offcanvas instance
			const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(element, config);

			// Store instance reference
			$element.data('bs.offcanvas', offcanvas);
		});
	};

	// Return cbj for chaining
	return cbj;
});
