/* global alert, confirm, alert, console, define, cbrequire: false */
/* jshint -W116 */
/**
 * @module configbox/configurator
 */
define(['cbj', 'configbox/server', 'cbj.bootstrap'], function(cbj, server) {

	"use strict";

	var configurator = {};

	/**
	 * Assigns event handlers for configurator pages and does any initialization of stuff on the configurator page.
	 */
	configurator.initConfiguratorPage = function() {

		// Handler for when we got the response from a configurator selection update
		cbj(document).on('serverResponseReceived', this.processServerResponse);

		// Handler for when required questions on whole product don't have a selection
		cbj(document).on('cbRequiredProductSelectionsMissing', this.onRequiredProductSelectionsMissing);

		// Handler for when all required questions whole product have a selection
		cbj(document).on('cbRequiredProductSelectionsMade', this.onRequiredProductSelectionsMade);

		// Handler for when required questions on page don't have a selection
		cbj(document).on('cbRequiredPageSelectionsMissing', this.onRequiredPageSelectionsMissing);

		// Handler for when all required questions on page have a selection
		cbj(document).on('cbRequiredPageSelectionsMade', this.onRequiredPageSelectionsMade);

		// Handler to send the form when the user changes the currency dropdown in the currency block
		cbj(document).on('change', '#currency_id', this.onChangeCurrency);

		// Handler to change the selection overview block when a selection changes
		cbj(document).on('cbSelectionChange', this.blockPricing.updateSelection);

		// Handler to change the visualization when a selection changes
		cbj(document).on('cbSelectionChange', this.blockVisualization.updateVisualization);

		// Handler to update prices in selection block when the pricing changes
		cbj(document).on('cbPricingChange', this.blockPricing.updatePricing);

		// Handler to update answer prices when pricing changes
		cbj(document).on('cbPricingChange', this.updateAnswerPrices);

		// Handler to update pricing data in configurator page data
		cbj(document).on('cbPricingChange', this.updatePricingInConfiguratorData);

		// Handler to toggle page selection display when the user clicks on a page title in the selections block
		cbj(document).on('click', '.configurator-page-title', this.blockPricing.toggleSelectionsVisibility);

		// Handler for add to cart - validates selections etc
		cbj(document).on('click', '.trigger-add-to-cart', this.onAddToCart);

		// Handles clicks on nav tabs and next/prev buttons
		cbj(document).on('click', '.trigger-switch-page', this.onPageNavClick);

		// Handlers for configurator page edit popover
		cbj(document).on('click', '.trigger-show-page-edit-buttons', this.showPageEditButtons);
		cbj(document).on('click', '.trigger-hide-page-edit-buttons', this.hidePageEditButtons);

		// Handlers for question/answer activation/deactivation
		cbj(document).on('cbQuestionActivation', 		this.onQuestionActivation);
		cbj(document).on('cbQuestionDeactivation', 		this.onQuestionDeactivation);
		cbj(document).on('cbAnswerActivation', 			this.onAnswerActivation);
		cbj(document).on('cbAnswerDeactivation', 		this.onAnswerDeactivation);

		cbj(document).on('serverRequestSent', function() {
			configurator.requestInProgress = true;
		});

		cbj(document).on('serverResponseReceived', function() {
			configurator.requestInProgress = false;
		});

		// Deals with History back/forward and setting the right page
		window.addEventListener('popstate', function(event) {
			if (event && event.state && event.state.cbPageId) {
				configurator.switchPage(event.state.cbPageId);
			}
		});

		this.initDeferredPageNav();
		this.initSelectionImageSwitcher();

	};

	configurator.requestInProgress = false;

	configurator.initConfiguratorPageEach = function() {
		this.initQuestions();
		this.initImagePreloading();
		this.initStickyBlock();
		this.initBsPopovers();
		this.initBsModals();
	};

	configurator.onAddToCart = function(event) {

		// For backwards compatibility, add-to-cart buttons were regular links before
		event.preventDefault();
		event.stopPropagation();

		let btn = cbj(this);

		if (configurator.getBtnState(btn) === 'processing') {
			return;
		}

		configurator.setBtnState(btn, 'processing');

		configurator.queueRequest(function() {

			var data = {
				cartPositionId: configurator.getCartPositionId()
			};

			server.makeRequest('configuratorpage', 'getMissingSelectionsProduct', data)

				.done(function(missingSelections) {

					if (missingSelections.length !== 0) {

						configurator.noScroll = true;

						configurator.switchPage(missingSelections[0].pageId, function() {
							delete configurator.noScroll;
							configurator.addValidationErrors(missingSelections);
							configurator.setBtnState(btn, 'normal');
							configurator.scrollToIfNeeded('#question-' + missingSelections[0].id);
						});

						configurator.setBtnState(btn, 'normal');
						return;

					}

					server.makeRequest('configuratorpage', 'addConfigurationToCart', data)

						.always(function() {
							configurator.setBtnState(btn, 'normal');
						})

						.done(function(response) {

							if (response.success === true) {
								window.location.href = response.redirectUrl;
							}
							else {
								configurator.setBtnState(btn, 'normal');
								alert(response.feedback);
							}

						});

				});

		});

	};

	configurator.onPageNavClick = function(event) {

		event.preventDefault();
		event.stopPropagation();

		let btn = cbj(this);

		let pageId = btn.data('page-id') || configurator.getPageIdFromBtn(btn);
		let currentPageId = configurator.getPageId();

		if (pageId == currentPageId) {
			return;
		}

		if (configurator.getBtnState(btn) == 'processing') {
			return;
		}

		configurator.setBtnState(btn, 'processing');

		configurator.queueRequest(function() {

			let pageId = btn.data('page-id') || configurator.getPageIdFromBtn(btn);
			let currentPageId = configurator.getPageId();

			let pageSequence = configurator.getConfiguratorData('pageSequence');
			let navGoesForward = pageSequence.indexOf(pageId) > pageSequence.indexOf(currentPageId);

			if (!navGoesForward || configurator.getConfiguratorData('blockNavigationOnMissing') == false) {
				configurator.switchPage(pageId);

				if (btn.attr('href') && configurator.getConfiguratorData('changeUrlsOnNav') === true) {

					let state = {
						cbPageId: pageId
					};

					window.history.pushState(state, '', btn.attr('href'));

				}

				return;

			}

			let data = {
				cartPositionId: configurator.getCartPositionId(),
				pageId: configurator.getPageId(),
			};

			server.makeRequest('configuratorpage', 'getMissingSelectionsPage', data)

				.done(function(missingSelections) {

					if (missingSelections.length !== 0) {
						configurator.addValidationErrors(missingSelections);
						configurator.setBtnState(btn, 'normal');
						configurator.scrollToIfNeeded('#question-' + missingSelections[0].id);
					}
					else {
						configurator.switchPage(pageId);
						if (btn.attr('href') && configurator.getConfiguratorData('changeUrlsOnNav') === true) {
							let state = {
								cbPageId: pageId
							};
							window.history.pushState(state, '', btn.attr('href'));
						}
					}
				});
		});

	};

	/**
	 * Scrolls to an element if its top is not currently visible in the viewport.
	 *
	 * @param {string} selector - Selector to the desired element.
	 * @returns {void}
	 */
	configurator.scrollToIfNeeded = function(selector) {

		const element = document.querySelector(selector);

		if (!element) {
			return;
		}

		const rect = element.getBoundingClientRect();
		const headerHeight = window.stickyHeaderHeight ?? 0;
		const padding = 20;

		// Check if element's top is visible in viewport
		const isTopVisible = rect.top >= headerHeight && rect.top <= window.innerHeight;

		if (!isTopVisible) {
			const elementTop = window.scrollY + rect.top;
			const scrollPosition = elementTop - headerHeight - padding;

			window.scrollTo({
				top: scrollPosition,
				behavior: 'smooth'
			});
		}

	}


	/**
	 * Runs fn immediately or after selection request went through
	 * @param {function} fn
	 */
	configurator.queueRequest = function(fn) {
		if (configurator.requestInProgress) {
			cbj(document).one('serverResponseReceived', fn);
		}
		else {
			fn();
		}
	};

	/**
	 *
	 * @param {jQuery} btn
	 * @param {string} state - 'normal', 'processing'
	 */
	configurator.setBtnState = function(btn, state) {

		btn.data('state', state);

		switch (state) {
			case 'normal':

				if (btn.data('btn-text-state-normal') !== undefined) {
					btn.html(btn.data('btn-text-state-normal'));
				}
				btn.removeClass('processing');
				btn.width('auto');
				break;

			case 'processing':
				btn.width(btn.width());
				btn.data('btn-text-state-normal', btn.html());
				btn.addClass('processing');
				btn.html( btn.data('btn-text-state-processing') || '<i class="fas fa-spin fa-spinner"></i>');
				break;

		}

	};

	/**
	 * Tells the given button's current state (normal or processing)
	 * @param {jQuery} btn
	 * @returns {string}
	 */
	configurator.getBtnState = function(btn) {
		return btn.data('state') || 'normal';
	};

	/**
	 *
	 * @param {jQuery} btn
	 * @returns {Number}
	 */
	configurator.getPageIdFromBtn = function(btn) {

		var pageId;

		var classAttr = btn.attr('class') || '';
		var classes = classAttr.split(' ');
		for (var i in classes) {
			if (classes.hasOwnProperty(i) === true) {
				if (classes[i].indexOf('page-id-') !== -1) {
					pageId = classes[i].replace('page-id-', '');
					pageId = parseInt(pageId);
				}
			}
		}

		if (!pageId) {
			console.warn('Tried legacy page ID determination, but failed.');
		}

		return pageId;

	};

	/**
	 * Takes in missingSelections array as from ConfigboxControllerConfiguratorpage::getMissingSelections
	 * and displays the messages on any questions present on the current page
	 * @param {JsonResponses.configuratorUpdates.missingProductSelections} missingSelections
	 */
	configurator.addValidationErrors = function(missingSelections) {
		cbj.each(missingSelections, function(i, missingSelection) {
			configurator.showValidationError(missingSelection.id, missingSelection.message);
		});
	};

	/**
	 * Refreshes the configurator page view, showing the page as requested by param pageId.
	 *
	 * @param {Number} pageId
	 * @param {Function=} callback
	 */
	configurator.switchPage = function(pageId, callback) {

		if (cbj('.configurator-page-wrapper').length === 0) {
			cbj('.kenedo-view.view-configuratorpage').wrap('<div class="configurator-page-wrapper"></div>');
		}

		cbj(document).trigger('cbPageSwitchStart', [pageId]);

		server.injectHtml(
			'.configurator-page-wrapper',
			'configuratorpage',
			'getPageHtml',
			{pageId: pageId},
			function() {
				cbj(document).trigger('cbPageSwitchEnd', [pageId]);
				if (!configurator.noScroll) {
					configurator.scrollToIfNeeded('.kenedo-view.view-configuratorpage');
				}

				let interval = window.setInterval(function() {
					let view = cbj('.kenedo-view.view-configuratorpage');
					if (view.hasClass('view-processed')) {
						window.clearInterval(interval);
						if (typeof(callback) == 'function') {
							callback();
						}
					}
				}, 10);

			});

	};

	configurator.showPageEditButtons = function() {
		cbj('.trigger-show-page-edit-buttons').hide();
		cbj('.page-edit-buttons').show();
	};

	configurator.hidePageEditButtons = function() {
		cbj('.trigger-show-page-edit-buttons').show();
		cbj('.page-edit-buttons').hide();
	};

	/**
	 * @listens Event:cbPricingChange
	 * @param {Event} event
	 * @param {JsonResponses.configuratorUpdates.pricing} pricing
	 */
	configurator.updatePricingInConfiguratorData = function(event, pricing) {
		configurator.setConfiguratorDataItem('pricing', pricing);
	};

	/**
	 * @listens Event:cbQuestionActivation
	 * @param {Event}	event
	 * @param {Number} 	questionId
	 */
	configurator.onQuestionActivation = function(event, questionId) {
		configurator.getQuestionDiv(questionId).removeClass('non-applying-question').addClass('applying-question');
	};

	/**
	 * @listens Event:onQuestionDeactivation
	 * @param {Event}	event
	 * @param {Number} 	questionId
	 */
	configurator.onQuestionDeactivation = function(event, questionId) {
		configurator.getQuestionDiv(questionId).addClass('non-applying-question').removeClass('applying-question');
	};

	/**
	 * @listens Event:cbAnswerActivation
	 * @param {Event}	event
	 * @param {Number} 	questionId
	 * @param {Number} 	answerId
	 */
	configurator.onAnswerActivation = function(event, questionId, answerId) {
		cbj('#answer-' + answerId).removeClass('non-applying-answer').addClass('applying-answer');
	};

	/**
	 * @listens Event:cbAnswerDeactivation
	 * @param {Event}	event
	 * @param {Number} 	questionId
	 * @param {Number} 	answerId
	 */
	configurator.onAnswerDeactivation = function(event, questionId, answerId) {
		cbj('#answer-' + answerId).addClass('non-applying-answer').removeClass('applying-answer');
	};


	/**
	 * @listens Event:cbRequiredProductSelectionsMissing
	 */
	configurator.onRequiredProductSelectionsMissing = function() {

	};

	/**
	 * @listens Event:cbRequiredProductSelectionsMade
	 */
	configurator.onRequiredProductSelectionsMade = function() {

	};


	/**
	 * @listens Event:cbRequiredPageSelectionsMissing
	 */
	configurator.onRequiredPageSelectionsMissing = function() {
		if (configurator.getConfiguratorData('blockNavigationOnMissing') === true) {
			cbj('.add-to-cart-button, .cb-page-nav-next').addClass('configbox-disabled');
		}
	};

	/**
	 * @listens Event:cbRequiredPageSelectionsMade
	 */
	configurator.onRequiredPageSelectionsMade = function() {
		cbj('.add-to-cart-button, .cb-page-nav-next').removeClass('configbox-disabled');
	};

	/**
	 * Handler for dropdown changes in the currency block. Simply submits the parent form
	 */
	configurator.onChangeCurrency = function() {
		cbj(this).closest('form').submit();
	};

	/**
	 * This here holds all registered question types
	 * @see registerQuestion
	 * @type {{}}
	 */
	configurator.registeredQuestionTypes = {};

	/**
	 * @deprecated Use registerQuestionType instead
	 * @param {string} type
	 * @param {string} questionObject
	 */
	configurator.registerQuestion = function(type, questionObject) {
		configurator.registerQuestionType(type, questionObject);
	};

	/**
	 * Registers a question type for initialization later.
	 * @see initQuestions
	 * @param {string} type 		Name of the question type in lower case (built-in ones are named
	 * 								checkbox, radio-buttons, etc)
	 * @param {object} question		Object holding its init function and event handlers (compare with built-in objects)
	 */
	configurator.registerQuestionType = function(type, questionObject) {

		// This method checks if the questionType got the needed functions
		// Prepare the list with functions the question objects needs to have
		var requiredMethods = [
			'init',
			'onQuestionActivation',
			'onQuestionDeactivation',
			'onAnswerActivation',
			'onAnswerDeactivation',
			'onSystemSelectionChange',
			'onValidationChange',
			'onValidationMessageShown',
			'onValidationMessageCleared'
		];

		// Prepare the array with missing functions
		var missingMethods = [];

		// Loop through them and check the provided question object for the methods
		for (var i in requiredMethods) {
			if (requiredMethods.hasOwnProperty(i)) {
				if (typeof(questionObject[requiredMethods[i]]) !== 'function') {
					missingMethods.push(requiredMethods[i]);
				}
			}
		}

		// If anything is missing, throw an error
		if (missingMethods.length) {
			throw 'Your question type "' + type + '" is missing these methods: ' + missingMethods.join(', ') + '. Add them and try again, even if you do not need those. Look up what they do in the built-in question types.';
		}

		// Otherwise, register the question
		configurator.registeredQuestionTypes[type] = questionObject;

	};

	/**
	 *
	 * @param {string} type
	 * @returns {{}}
	 */
	configurator.getQuestionType = function(type) {
		return this.registeredQuestionTypes[type];
	};

	/**
	 * Holds an array of question types, for remembering which questions have already been initialized
	 * @type {Array}
	 */
	configurator.initializedQuestionTypes = [];

	/**
	 * Loads both built-in and custom question js, then loops through the current page's questions and inits the needed
	 * question types.
	 */
	configurator.initQuestions = function() {

		cbrequire(['configbox/server'], function(server) {

			var dependencies = ['configbox/questions'];

			if (server.config.requireCustomQuestionJs === true) {
				dependencies.push('configbox/custom/custom_questions');
			}

			cbrequire(dependencies, function() {

				cbj('.kenedo-view.view-configuratorpage .question').each(function() {

					var type = cbj(this).data('questionType');

					if (!type) {
						throw 'The configurator page contains a question without a data-question-type attribute. Compare with the built-in question type templates and add it. The question with the problem has the ID "' + cbj(this).attr('id') + '"';
					}

					var questionType = configurator.getQuestionType(type);

					if (!questionType) {
						throw 'The configurator page contains a question of type "' + type + '", but type object is not registered. Make sure you make and register it in custom_questions.js';
					}

					// If there is an initEach function, run it
					if (questionType.initEach) {
						questionType.initEach();
					}

					cbj(this).on('cbQuestionActivation', 		questionType.onQuestionActivation);
					cbj(this).on('cbQuestionDeactivation', 		questionType.onQuestionDeactivation);
					cbj(this).on('cbAnswerActivation', 			questionType.onAnswerActivation);
					cbj(this).on('cbAnswerDeactivation', 		questionType.onAnswerDeactivation);
					cbj(this).on('cbSystemSelectionChange', 	questionType.onSystemSelectionChange);
					cbj(this).on('cbValidationChange', 			questionType.onValidationChange);
					cbj(this).on('cbValidationMessageShown',	questionType.onValidationMessageShown);
					cbj(this).on('cbValidationMessageCleared',	questionType.onValidationMessageCleared);

					// The rest runs only once per page load
					if (configurator.initializedQuestionTypes.indexOf(type) !== -1) {
						return;
					}
					configurator.initializedQuestionTypes.push(type);

					questionType.init();

				});

			});

		});

	};

	configurator.initBsModals = function() {
		let modalTriggers = cbj('*[data-toggle="modal"], *[data-bs-toggle="modal"]');
		if (modalTriggers.length > 0) {
			cbrequire(['cbj', 'bootstrap']);
		}

	};

	/**
	 * This inits Bootstrap pop-overs.
	 */
	configurator.initBsPopovers = function() {
		if (cbj('.cb-popover').length === 0) {
			return;
		}

		cbj(document).on('hidden.bs.modal', function () {
			cbj('.modal-backdrop').blur().remove();
		});

		cbrequire(['cbj', 'cbj.bootstrap'], function(cbj) {

			cbj('.cb-popover').each(function () {

				const customPopover = cbj(this);

				let customClass = cbj(this).data('customClass');
				if (typeof(customClass) !== 'undefined') {
					customClass += ' cb-popover-actual';
					cbj(this).data('customClass', customClass);
				}
				else {
					cbj(this).data('customClass', 'cb-popover-actual');
				}

				if (customPopover.data('trigger') === 'hover') {

					customPopover.popover({
						html: true,
						trigger: 'manual',
						sanitize: true,
						container: 'body',
						boundary: 'window',
						animation: false,
						delay: {show: 100, hide: 100}
					}).on('mouseenter', function () {
						const self = this;
						cbj(self).popover('show');
						cbj('.popover').off('.hoverfix')
							.on('mouseenter.hoverfix', () => clearTimeout(cbj(self).data('hideTimer')))
							.on('mouseleave.hoverfix', () => cbj(self).popover('hide'));
					}).on('mouseleave', function () {
						const self = this;
						const t = setTimeout(() => {
							if (!cbj('.popover:hover').length) cbj(self).popover('hide');
						}, 120);
						cbj(self).data('hideTimer', t);
					})

				}
				else {
					customPopover.popover({
						html: true,
						sanitize: true,
						container: 'body',
						boundary: 'window',
						animation: false,
						delay: {show: 100, hide: 100}
					});
				}

				customPopover.get(0).addEventListener('shown.bs.popover', function() {
					const $t = cbj(this);
					let content = $t.data('content');
					let isHtml = false;
					try {
						const tpl = document.createElement("template");
						tpl.innerHTML = content.trim();
						isHtml = (tpl.content.children.length > 0);
					}
					catch {

					}
					if (!isHtml) {
						cbj('.cb-popover-actual').css('visibility', 'visible');
						return;
					}

					const $pop = cbj($t.data('content'));

					if ($pop.find('img').length === 0) {
						cbj('.cb-popover-actual').css('visibility', 'visible');
						return;
					}

					$pop.find('img').one('load', function () {
						const inst = $t.data('bs.popover');
						if (inst && inst._popper && inst._popper.forceUpdate) {
							inst._popper.forceUpdate();
							cbj('.cb-popover-actual').css('visibility', 'visible');
						}
					}).each(function () {
						if (this.complete) cbj(this).trigger('load');
					});
				});

				customPopover.on('shown.bs.popover', function () {
					const $t = cbj(this);
					const $pop = cbj($t.data('content'));

					if ($pop.find('img').length === 0) {
						cbj('.cb-popover-actual').css('visibility', 'visible');
						return;
					}

					$pop.find('img').one('load', function () {
						const inst = $t.data('bs.popover');
						if (inst && inst._popper && inst._popper.scheduleUpdate) {
							inst._popper.scheduleUpdate();
							cbj('.cb-popover-actual').css('visibility', 'visible');
						}
					}).each(function () {
						if (this.complete) cbj(this).trigger('load');
					});
				});

			});
		});
	};

	configurator.initSelectionImageSwitcher = function() {
		cbj(document).on('click', '.trigger-show-visualization', function() {
			cbj('.overviews').addClass('show-visualization').removeClass('show-selections');
		});

		cbj(document).on('click', '.trigger-show-selections', function() {
			cbj('.overviews').addClass('show-selections').removeClass('show-visualization');
		});
	};

	configurator.initStickyBlock = function() {

		// No sticky block, no initialization.. :)
		if (cbj('.sticky-block').length === 0) {
			return;
		}

		configurator.floater = cbj('.sticky-block');

		let floaterOffset	= configurator.floater.offset();
		let floaterHeight 	= configurator.floater.height();
		let highestCol		= 0;
		let topPadding		= 20;
		let colsHaveCollapsed = false;

		if (configurator.stickyBlockHandlersAttached === true) {
			return;
		}

		configurator.stickyBlockHandlersAttached = true;

		// This checks regularly if the columns have collapsed and which is the higher one
		window.setInterval(function(){

			floaterHeight = configurator.floater.height();
			floaterOffset = configurator.floater.offset();

			let lastTopOffset = null;

			configurator.floater.closest('.row').children().each(function(){

				if (lastTopOffset !== null && lastTopOffset !== cbj(this).offset().top) {
					colsHaveCollapsed = true;
				}

				lastTopOffset = cbj(this).offset().top;

				if (cbj(this).innerHeight() > highestCol) {
					if (cbj(this).find('.overviews').length) {
						return;
					}
					highestCol = cbj(this).innerHeight();
				}
			});

		}, 200);

		// This applies padding to the sticky block so it stays in sight
		cbj(window).scroll(function() {

			if (configurator.floater.length === 0) {
				return;
			}

			if (colsHaveCollapsed === true) {
				configurator.floater.css('padding-top', 0);
				return;
			}

			let windowTop = cbj(window).scrollTop();

			if (windowTop + topPadding  > floaterOffset.top) {
				let delta = windowTop - floaterOffset.top + topPadding;
				if (delta + floaterHeight < highestCol - topPadding) {
					configurator.floater.css('padding-top', delta);
				}

			} else {
				configurator.floater.css('padding-top', 0);
			}

		});

	};

	configurator.initDeferredPageNav = function() {

		var requestInProgress;
		var redirectUrl;
		var submittingForm;

		// Clicks on links until xhrs finished
		cbj(document).on('click', '.wait-for-xhr', function(event) {
			configurator.redirectUrl = '';
			// If a XHR is in progress, prevent redirection, store the URL, on ajaxStop the redirection will happen.
			if (requestInProgress === true) {
				event.preventDefault();
				event.stopImmediatePropagation();
				redirectUrl = cbj(this).attr('href');
			}
		});

		// In M2, the configurator is within M2's 'add to cart' form. This delays submission to after xhr calls are done
		cbj('.view-configuratorpage').closest('form').on('submit', function(event) {

			if (requestInProgress === true) {
				event.preventDefault();
				event.stopImmediatePropagation();
				submittingForm = cbj(this);
			}

		});

		cbj(document).on('ajaxStart', function() {
			requestInProgress = true;
		});

		cbj(document).on('ajaxStop', function() {

			requestInProgress = false;

			if (redirectUrl) {
				window.location.href = redirectUrl;
				return;
			}

			if (submittingForm) {
				if (submittingForm.find('button[type=submit]').length !== 0) {
					submittingForm.find('button[type=submit]').trigger('click');
				}
				else {
					submittingForm.trigger('submit');
				}

				submittingForm = null;
			}

		});

	};

	configurator.initImagePreloading = function() {

		var preloadVisualizationDelay = 500;

		/**
		 * Searches for .preload-image elements and makes them use the right url as src
		 */
		var preloadVisualization = function(parent) {

			if (!parent) {
				parent = cbj('.cb-content');
			}

			parent.find('.preload-image').each(function(i, item) {
				var src = cbj(item).data('src');
				if (item.src !== src) {
					item.src = src;
				}
			});
		};

		// Start a timeout that will start making images preload
		var preloadTimeout = window.setTimeout(preloadVisualization, preloadVisualizationDelay);

		// Pause preloading when a xhr starts..
		cbj(document).on('ajaxStart', function() {
			window.clearTimeout(preloadTimeout);
		});

		// ..and resume when it stops
		cbj(document).on('ajaxStop', function() {
			preloadTimeout = window.setTimeout(preloadVisualization, preloadVisualizationDelay);
		});

		// Postpone preloading (clear any current timeout and set another) when a 'normal' image finishes loading
		cbj('img:not(.preload-image)').on('load',function(){
			window.clearTimeout(preloadTimeout);
			preloadTimeout = window.setTimeout(preloadVisualization, preloadVisualizationDelay);
		});

		cbj('.question').one('cbQuestionActivation cbAnswerActivation', function(event, questionId) {
			var question = configurator.getQuestionDiv(questionId);
			preloadVisualization(question);
		});

	};

	/**
	 * Does the actual server-side selection change.
	 *
	 * @param {int} 		questionId - The ID of the question to make a selection for
	 * @param {string, int} selection - The selection selection (answer ID or text entry)
	 * @param {boolean=} 	confirmed - If the user confirmed resolution of inconsistencies
	 *
	 * @fires serverResponseReceived
	 */
	configurator.sendSelectionToServer = function(questionId, selection, confirmed) {

		cbj(document).trigger('serverRequestSent');

		// Update the visualization immediately for better responsiveness
		configurator.blockVisualization.updateVisualization(null, questionId, parseInt(selection));

		cbrequire(['configbox/server'], function(server) {

			var data = {
				languageTag:		server.config.languageTag,
				questionId: 		questionId,
				selection: 			selection,
				confirmed: 			(confirmed) ? '1':'0',
				cart_position_id: 	configurator.getCartPositionId(),
				productId: 			configurator.getProductId(),
				pageId: 			configurator.getPageId()
			};

			server.makeRequest('configuratorpage', 'makeSelection', data)

				.done(function(response) {
					/**
					 * @event serverResponseReceived
					 * @property {JsonResponses.configuratorUpdates} response
					 */
					cbj(document).trigger('serverResponseReceived', [response]);
				});

		});

	};

	/**
	 * Handler for event 'serverResponseReceived'. Processes the response from a selection change.
	 *
	 * @param {Event} event - jQuery event object
	 * @param {JsonResponses.configuratorUpdates} data
	 *
	 * @see JsonResponses.configuratorUpdates
	 *
	 * @listens Event:serverResponseReceived
	 *
	 * @fires cbRequiredPageSelectionsMissing When required questions on current page are not answered
	 * @fires cbRequiredPageSelectionsMade When all required questions on current page are answered
	 * @fires cbRequiredProductSelectionsMissing When required questions in whole product are not answered
	 * @fires cbRequiredProductSelectionsMade When all required questions in whole are answered
	 * @fires cbPricingChange To get the selection made by the function visible
	 */
	configurator.processServerResponse = function(event, data) {

		if (typeof(data.error) !== 'undefined') {
			configurator.showValidationError(data.requestedChange.questionId, data.error);
			return;
		}
		else {
			configurator.clearValidationError(data.requestedChange.questionId);
		}

		// In case the server asks for confirmation for conflict resolution, ask the user
		if (data.confirmationText) {

			// Get confirmation from the user
			var confirmed = window.confirm(data.confirmationText);

			// Either do another run with 'confirmed' on or restore to the original selection
			if (confirmed) {
				configurator.sendSelectionToServer(data.requestedChange.questionId, data.requestedChange.selection, true);
			}
			else {
				configurator.updateSelection(data.originalValue.questionId, data.originalValue.selection, data.originalValue.outputValue, 'system');
			}
			return;
		}

		// Have the system do changes for the requested change
		if (data.requestedChange) {
			configurator.updateSelection(data.requestedChange.questionId, data.requestedChange.selection, data.requestedChange.outputValue, 'user');
		}

		// Apply new validation values
		if (data.validationValues) {
			configurator.processValidationUpdate(data.validationValues);
		}

		// Item visibility (hide/show questions and answers)
		if(data.itemVisibility) {
			configurator.processItemVisibility(data.itemVisibility);
		}

		// Do all automatic selections
		if (data.configurationChanges) {
			configurator.processAutomaticSelections(data.configurationChanges);
		}

		// Update pricing
		if (data.pricing) {
			/**
			 * @event cbPricingChange
			 * @property {JsonResponses.configuratorUpdates.pricing}
			 */
			cbj(document).trigger('cbPricingChange', [data.pricing]);
		}

		configurator.setConfiguratorDataItem('missingPageSelections', data.missingPageSelections);

		// Deal with required questions and the page blocker
		if (data.missingPageSelections.length) {
			/**
			 * @event cbRequiredPageSelectionsMissing
			 * @property {array}
			 */
			cbj(document).trigger('cbRequiredPageSelectionsMissing', [data.missingPageSelections]);
		}
		else {
			/**
			 * @event cbRequiredPageSelectionsMade
			 */
			cbj(document).trigger('cbRequiredPageSelectionsMade');
		}

		configurator.setConfiguratorDataItem('missingProductSelections', data.missingProductSelections);

		if (data.missingProductSelections.length) {
			/**
			 * @event cbRequiredProductSelectionsMissing
			 * @property {array}
			 */
			cbj(document).trigger('cbRequiredProductSelectionsMissing', [data.missingProductSelections]);
		}
		else {
			/**
			 * @event cbRequiredProductSelectionsMade
			 */
			cbj(document).trigger('cbRequiredProductSelectionsMade');
		}

	};


	/**
	 * Fills and displays the validation error div for question selections
	 * @fires cbValidationMessageShown
	 */
	configurator.showValidationError = function(questionId, text) {
		/**
		 * @event cbValidationMessageShown
		 * @property {Number} questionId
		 * @property {String} text
		 */
		window.setTimeout(function() { // A bit of timeout to make sure the question handlers are actually attached
			configurator.getQuestionDiv(questionId).trigger('cbValidationMessageShown', [questionId, text]);
		}, 200);
	};

	/**
	 * Hides and empties validation error div for question selections
	 * @fires cbValidationMessageCleared
	 */
	configurator.clearValidationError = function(questionId) {
		/**
		 * @event cbValidationMessageCleared
		 * @property {Number} questionId
		 */
		configurator.getQuestionDiv(questionId).trigger('cbValidationMessageCleared', [questionId]);
	};

	/**
	 * This method is called for automated selection changes and updates anything that deals with the regarding
	 * question's selection.
	 *
	 * It delegates that work by firing the event.
	 * Listeners for these events are supposed to reflect that selection visually (select the right radio button, update
	 * the overview etc). It sends data about the selection along with the event.
	 *
	 * @param {number} 			questionId 	- The question ID
	 * @param {null|string=} 	selection 	- The machine readable selection
	 * @param {null|string=} 	outputValue - The human readable selection
	 * @param {string=}			selectedBy  - Indicates if the user or the system made the selection (values are 'system' or 'user'), defaults to 'user'
	 *
	 * @fires cbSystemSelectionChange
	 * @fires cbSelectionChange
	 */
	configurator.updateSelection = function(questionId, selection, outputValue, selectedBy) {

		if (typeof(selectedBy) === 'undefined') {
			selectedBy = 'user';
		}

		if (selectedBy !== 'user' && selectedBy !== 'system') {
			throw('selectedBy parameter is neither \'user\' nor \'system\'. Was \'' + selectedBy + '\'');
		}

		var question = configurator.getQuestionDiv(questionId);

		// Set the changed selection and output value in the question's wrapping div
		question.data('selection', selection);
		question.data('outputValue', outputValue);

		let triggerElement = (question.length > 0) ? question : cbj(document);

		if (selectedBy === 'system') {

			/**
			 * @event cbSystemSelectionChange - Fired when the system changes a selection
			 * @property {number} questionId - ID of question that gets a new selection
			 * @property {string} selection - The machine-readable selection
			 * @property {string} outputValue - The human-readable selection
			 */
			triggerElement.trigger('cbSystemSelectionChange', [questionId, selection, outputValue]);

		}

		/**
		 * @event cbSelectionChange - Fired whenever a selection has changed (by the system or the user)
		 * @property {int} questionId - ID of question that gets a new selection
		 * @property {string} selection - The machine-readable selection
		 * @property {string} outputValue - The human-readable selection
		 */
		triggerElement.trigger('cbSelectionChange', [questionId, selection, outputValue]);

	};

	/**
	 * Called by processServerResponse when validation values have changed
	 * @param {JsonResponses.configuratorUpdates.validationValues} validationValues - validation values
	 * @fires cbValidationChange
	 */
	configurator.processValidationUpdate = function(validationValues) {

		cbj.each(validationValues, function (questionId, validationValue) {
			/**
			 * @event cbValidationChange
			 */
			configurator.getQuestionDiv(questionId).trigger('cbValidationChange', [questionId, validationValue]);
		});

	};

	/**
	 * Called by processServerResponse when questions or answers get activated/deactivated
	 * Triggers events on the questions' wrapper HTML element, handlers do the work
	 * @param {object} itemVisibility - validation values (array of arrays containing a min and max val)
	 * @see JsonResponses.configuratorUpdates.itemVisibility
	 * @fires cbQuestionActivation
	 * @fires cbQuestionDeactivation
	 * @fires cbAnswerActivation
	 * @fires cbAnswerDeactivation
	 */
	configurator.processItemVisibility = function(itemVisibility) {

		var questions = configurator.getConfiguratorData('questions');

		cbj.each(itemVisibility.questions, function (questionId, applies){

			// Check whether visibility has changed
			if (questions[questionId].applies !== applies) {

				// Update value in configurator page data
				questions[questionId].applies = applies;

				if (applies) {
					/**
					 * @event cbQuestionActivation
					 */
					configurator.getQuestionDiv(questionId).trigger('cbQuestionActivation', [questionId]);
				}
				else {
					/**
					 * @event cbQuestionDeactivation
					 */
					configurator.getQuestionDiv(questionId).trigger('cbQuestionDeactivation', [questionId]);
				}

			}

		});

		cbj.each(itemVisibility.answers, function(questionId, answerIds) {

			cbj.each(answerIds, function(answerId, applies) {

				if (questions[questionId].answers[answerId].applies !== applies) {

					// Update value in configurator page data
					questions[questionId].answers[answerId].applies = applies;

					if (applies) {
						/**
						 * @event cbAnswerActivation
						 */

						configurator.getQuestionDiv(questionId).trigger('cbAnswerActivation', [questionId, answerId]);

					}
					else {
						/**
						 * @event cbAnswerDeactivation
						 */
						configurator.getQuestionDiv(questionId).trigger('cbAnswerDeactivation', [questionId, answerId]);
					}


				}

			});

		});

	};

	/**
	 * Called by processServerResponse when automatic selection changes occured on the server. It calls
	 * updateSelection which delegates the job of changing all controls, overviews etc.
	 *
	 * @param {object} changes - Instructions on what to add/change/remove
	 * @see JsonResponses.configuratorUpdates.configurationChanges
	 */
	configurator.processAutomaticSelections = function(changes) {

		if (changes.remove) {
			cbj.each(changes.remove, function(questionId) {
				configurator.updateSelection(questionId, null, null, 'system');
			});
		}

		if (changes.add) {
			cbj.each(changes.add, function(questionId, item) {
				configurator.updateSelection(questionId, item.selection, item.outputValue, 'system');
			});
		}

	};

	/**
	 * Handler to update question and answer prices in the configurator.
	 *
	 * @param {object} event - jQuery event object
	 * @param {object} pricing - All prices, taxes
	 * @see JsonResponses.configuratorUpdates.pricing
	 *
	 * @listens Event:cbPricingChange
	 */
	configurator.updateAnswerPrices = function(event, pricing) {

		cbj.each(pricing.questions, function(questionId, question){

			cbj('.question-price-' + questionId).html(question.priceFormatted);

			if (question.price === 0) {
				cbj('.question-price-' + questionId).closest('.question-price-wrapper').hide();
			}
			else {
				cbj('.question-price-' + questionId).closest('.question-price-wrapper').show();
			}


			cbj('.question-price-recurring-' + questionId).html(question.priceRecurringFormatted);

			if (question.priceRecurring === 0) {
				cbj('.question-price-recurring-' + questionId).closest('.question-price-recurring-wrapper').hide();
			}
			else {
				cbj('.question-price-recurring-' + questionId).closest('.question-price-recurring-wrapper').show();
			}

		});

		cbj.each(pricing.answers, function(answerId, answer) {

			cbj('.answer-price-' + answerId).html(answer.priceFormatted);

			if (answer.price === 0) {
				cbj('.answer-price-' + answerId).closest('.answer-price-wrapper').hide();
			}
			else {
				cbj('.answer-price-' + answerId).closest('.answer-price-wrapper').show();
			}

			cbj('.answer-price-recurring-' + answerId).html(answer.priceRecurringFormatted);

			if (answer.priceRecurring === 0) {
				cbj('.answer-price-recurring-' + answerId).closest('.answer-price-recurring-wrapper-recurring').hide();
			}
			else {
				cbj('.answer-price-recurring-' + answerId).closest('.answer-price-recurring-wrapper').show();
			}

		});

	};

	/**
	 * Gets you the current selection for a question
	 * @param {int} questionId - ID of the question
	 * @returns {null|string}
	 */
	configurator.getCurrentSelection = function(questionId) {
		return configurator.getQuestionDiv(questionId).data('selection');
	};

	/**
	 * Gets you the cart position ID used on the configurator page
	 * @returns {int} Cart position ID
	 */
	configurator.getCartPositionId = function() {
		return parseInt(configurator.getConfiguratorData('cartPositionId'));
	};

	/**
	 * Gets you the ID of the product used on the configurator page
	 * @returns {Number} CB product ID
	 */
	configurator.getProductId = function() {
		return parseInt(configurator.getConfiguratorData('productId'));
	};

	/**
	 * Gets you the ID of the configurator page
	 * @returns {Number} CB page ID
	 */
	configurator.getPageId = function() {
		return parseInt(configurator.getConfiguratorData('pageId'));
	};

	/**
	 * Gets you the wrapper div of the given question
	 * @param {Number} questionId CB Question ID
	 * @returns {jQuery} jQuery collection with question wrapper
	 */
	configurator.getQuestionDiv = function(questionId) {
		return cbj('.question[data-question-id=' + questionId + ']');
	};

	/**
	 *
	 * @param key
	 * @returns {*}
	 */
	configurator.getConfiguratorData = function(key) {
		var data = cbj('#configurator-data').data('json');
		if (key) {
			if (typeof(data[key]) === 'undefined') {
				throw 'Could not find key "' + key + '" in configurator data.';
			}
			return data[key];
		}
		else {
			return data;
		}
	};

	/**
	 * Replaces the configurator data with the object provided.
	 * @param {Object} data
	 */
	configurator.replaceConfiguratorData = function(data) {
		cbj('#configurator-data').data('json', data);
	};

	/**
	 *
	 * @param key
	 * @param data
	 */
	configurator.setConfiguratorDataItem = function(key, data) {
		var originalData = cbj('#configurator-data').data('json');
		originalData[key] = data;
	};

	/**
	 * Tells if questions have the given propName
	 * @param {number} questionId
	 * @param {string} propName
	 * @returns {Boolean}
	 */
	configurator.questionHasProperty = function (questionId, propName) {
		var questions = configurator.getConfiguratorData('questions');
		return (typeof(questions[questionId][propName]) !== 'undefined');
	};

	/**
	 * Gets you the value of the requested questions property
	 * @param {number} questionId
	 * @param {string} propName
	 * @returns {*} The value requested
	 */
	configurator.getQuestionPropValue = function (questionId, propName) {

		var questions = configurator.getConfiguratorData('questions');

		if (typeof(questions[questionId]) === 'undefined') {
			throw 'Question ID "' + questionId + '" does not exist';
		}

		if (typeof(questions[questionId][propName]) === 'undefined') {
			throw 'Questions do not have property "' + propName + '"';
		}

		return questions[questionId][propName];

	};

	configurator.blockPricing = {

		/**
		 * Toggles visibility of the list of selections.
		 * @listens click on configurator pages
		 */
		toggleSelectionsVisibility : function() {

			// If page is empty don't proceed
			if (cbj(this).closest('.no-questions').length) {
				return;
			}

			// Toggle the page pricing
			cbj(this).find('.pricing-configurator-page').slideToggle(100);

			// Toggle the question list
			cbj(this).closest('.configurator-page').find('.question-list').slideToggle(100,function(){
				cbj(this).closest('.configurator-page').toggleClass('configurator-page-expanded');
			});
		},

		/**
		 * Handler to update prices in the overview block.
		 * @listens Event:cbPricingChange
		 * @param {object} event - jQuery event object
		 * @param {object} pricing
		 * @see JsonResponses.configuratorUpdates.pricing
		 */
		updatePricing: function (event, pricing) {

			cbj('.pricing-regular .item-quantity').html(pricing.quantity);
			cbj('.pricing-recurring .item-quantity').html(pricing.quantity);

			cbj('.pricing-regular .pricing-per-item-total').html(pricing.total.pricePerItemFormatted);
			cbj('.pricing-recurring .pricing-per-item-total').html(pricing.total.pricePerItemRecurringFormatted);

			cbj('.pricing-regular .pricing-total').html(pricing.total.priceFormatted);
			cbj('.pricing-recurring .pricing-total').html(pricing.total.priceRecurringFormatted);

			// Deal with pricing updates in pages
			cbj.each(pricing.pages, function(pageId, page) {
				var pagePrice = (page.price !== 0) ? page.priceFormatted : '';
				cbj('.pricing-regular .pricing-configurator-page-' + pageId).html(pagePrice);
				var pagePriceRecurring = (page.priceRecurring) ? page.priceRecurringFormatted : '';
				cbj('.pricing-recurring .pricing-configurator-page-' + pageId).html(pagePriceRecurring);
			});

			// Deal with pricing updates in questions
			cbj.each(pricing.questions, function(questionId, question) {
				var questionPrice = (question.price !== 0) ? question.priceFormatted : '';
				cbj('.pricing-regular .pricing-question-' + questionId).html(questionPrice);
				var questionPriceRecurring = (question.priceRecurring !== 0) ? question.priceRecurringFormatted : '';
				cbj('.pricing-recurring .pricing-question-' + questionId).html(questionPriceRecurring);
			});

			// Update price per item regular
			cbj('.pricing-regular .pricing-per-item-net').html(pricing.total.pricePerItemNetFormatted);
			cbj('.pricing-regular .pricing-per-item-tax').html(pricing.total.pricePerItemTaxFormatted);
			cbj('.pricing-regular .pricing-per-item-gross').html(pricing.total.pricePerItemGrossFormatted);

			// Update price per item recurring
			cbj('.pricing-recurring .pricing-per-item-net').html(pricing.total.pricePerItemRecurringNetFormatted);
			cbj('.pricing-recurring .pricing-per-item-tax').html(pricing.total.pricePerItemRecurringTaxFormatted);
			cbj('.pricing-recurring .pricing-per-item-gross').html(pricing.total.pricePerItemRecurringGrossFormatted);

			// Update regular product totals
			cbj('.pricing-regular .pricing-total-net').html(pricing.total.priceNetFormatted);
			cbj('.pricing-regular .pricing-total-tax').html(pricing.total.priceTaxFormatted);
			cbj('.pricing-regular .pricing-total-gross').html(pricing.total.priceGrossFormatted);

			// Update recurring product totals
			cbj('.pricing-recurring .pricing-total-net').html(pricing.total.priceRecurringNetFormatted);
			cbj('.pricing-recurring .pricing-total-tax').html(pricing.total.priceRecurringTaxFormatted);
			cbj('.pricing-recurring .pricing-total-gross').html(pricing.total.priceRecurringGrossFormatted);

			// Update total plus shipping and delivery
			cbj('.pricing-total-plus-extras-net').html(pricing.totalPlusExtras.priceTaxFormatted);
			cbj('.pricing-total-plus-extras-tax').html(pricing.totalPlusExtras.priceNetFormatted);
			cbj('.pricing-total-plus-extras-gross').html(pricing.totalPlusExtras.priceGrossFormatted);

			// Update taxes
			if (pricing.taxesFormatted) {
				cbj.each(pricing.taxesFormatted,function(taxRate,taxAmount){
					var strTaxRate = String(taxRate);
					cbj('.pricing-regular .pricing-taxrate-' + strTaxRate.replace('.','-')).html(taxAmount);
				});
			}

			// Update delivery data
			if (pricing.delivery) {
				cbj('.best-delivery-title').text(pricing.delivery.title);
				cbj('.pricing-total-delivery-net').html(pricing.delivery.priceNetFormatted);
				cbj('.pricing-total-delivery-tax').html(pricing.delivery.priceTaxFormatted);
				cbj('.pricing-total-delivery-gross').html(pricing.delivery.priceGrossFormatted);
				cbj('.delivery-cost').each(function(){
					if (pricing.delivery.priceGross === 0) {
						cbj(this).slideUp();
					}
					else {
						cbj(this).slideDown();
					}
				});
			}

			// Update payment option data
			if (pricing.payment) {
				cbj('.best-payment-title').text(pricing.payment.title);
				cbj('.pricing-total-payment-net').html(pricing.payment.priceNetFormatted);
				cbj('.pricing-total-payment-tax').html(pricing.payment.priceTaxFormatted);
				cbj('.pricing-total-payment-gross').html(pricing.payment.priceGrossFormatted);
				cbj('.payment-cost').each(function(){
					if (pricing.payment.priceGross === 0) {
						cbj(this).slideUp();
					}
					else {
						cbj(this).slideDown();
					}
				});
			}

			cbj('.pricing-quantity').text(pricing.quantity);

			// Show/hide the total per item lines
			if (pricing.quantity > 1) {

				cbj('.total-per-item').each(function(){
					if (cbj(this).css('display') === 'none') {
						cbj(this).slideDown(100);
					}
				});

				cbj('.quantity-display').each(function(){
					if (cbj(this).css('display') === 'none') {
						cbj(this).slideDown(100);
					}
				});

			}
			else {

				cbj('.total-per-item').each(function(){
					if (cbj(this).css('display') !== 'none') {
						cbj(this).slideUp(100);
					}
				});

				cbj('.quantity-display').each(function(){
					if (cbj(this).css('display') !== 'none') {
						cbj(this).slideUp(100);
					}
				});

			}

		},

		/**
		 * Handler for the event below. Changes the price module content when the system changed a question.
		 * @listens Event:cbSelectionChange
		 */
		updateSelection: function (event, questionId, selection, outputValue) {

			// Removal
			if (!selection) {
				// Hide the item
				cbj('.question-item-' + questionId ).slideUp(100, function(){
					cbj(this).addClass('hidden-item');
				});
			}
			// Change
			else {
				// Change the output value
				cbj('.question-item-outputvalue-' + questionId ).html(outputValue);
				// Show in case item is hidden
				cbj('.hidden-item.question-item-' + questionId ).slideDown(100, function(){
					cbj(this).removeClass('hidden-item');
				});
			}

		}

	};

	configurator.blockVisualization = {

		/**
		 * Changes the visualization content when a question has changed in the configuration.
		 * @listens Event:cbSelectionChange
		 */
		updateVisualization: function(event, questionId, selection) {

			if (!selection) {
				configurator.blockVisualization.removeImage(questionId);
			}
			else {
				configurator.blockVisualization.changeImage(questionId, selection);
			}

		},

		removeImage: function(questionId) {
			cbj('.image-question-id-' + questionId).fadeOut(200);
		},

		changeImage: function(questionId, selection) {
			selection = parseInt(selection);
			cbj('.image-answer-id-' + selection).show();
			cbj('.image-question-id-' + questionId + ':not(.image-answer-id-'+ selection +')').hide();
		}

	};

	return configurator;

});
