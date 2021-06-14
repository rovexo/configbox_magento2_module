/**
 * @module configbox/reviews
 */
define(['cbj'], function(cbj) {

	"use strict";

	/**
	 * @exports configbox/reviews
	 */
	var module = {

		initReviewsPage: function() {

			// Clicks on the close modal button
			cbj(document).on('click', '.trigger-close-modal', function() {
				cbj(this).closest('.modal').modal('hide');
			});

			// Clicks on the 'toggle more' button
			cbj(document).on('click', '.trigger-toggle-all-reviews', function() {

				var button = cbj(this);

				// Switch around button text
				if (button.data('text-less') == button.text()) {
					button.text(button.data('text-more'));
				}
				else {
					button.data('text-more', button.text());
					button.text(button.data('text-less'));
				}

				// Toggle a css class on the reviews list to show more/less
				cbj(this).closest('.view-reviews').find('.review-list').toggleClass('show-all');

			});

			// Clicks on the 'add review' button
			cbj(document).on('click', '.trigger-show-review-form', function() {
				cbj(this).closest('.view-reviews').find('.wrapper-review-form').show();
				cbj(this).hide();
			});

		},

		initReviewForm: function() {

			// Clicks on the close modal button
			cbj(document).on('click', '.trigger-close-modal', function() {
				cbj(this).closest('.modal').modal('hide');
			});

			// Clicks on 'cancel review'
			cbj(document).on('click', '.trigger-cancel-review', function() {
				if (cbj(this).closest('.view-reviewform').parent('.modal-content').length !== 0) {
					cbj(this).closest('.modal').modal('hide');
				}
				cbj(this).closest('.view-reviews').find('.trigger-show-review-form').show();
				cbj(this).closest('.wrapper-review-form').hide();
			});

			// Sending review data
			cbj(document).on('click', '.trigger-send-review', function() {
				console.log('he');
				var wrapper = cbj(this).closest('.view-reviewform');
				var button = cbj(this);

				// Multiple click prevention
				if (button.hasClass('processing')) {
					return;
				}

				// Collect the data from the form
				var data = {
					name: wrapper.find('#review-name').val(),
					comment: wrapper.find('#review-comment').val(),
					rating: wrapper.find('.rating-stars').data('rating'),
					productId: wrapper.find('#review-product-id').val()
				};

				// Prime the validation ok flag prior checking
				var dataOk = true;

				// Check name
				if (data.name == '') {
					wrapper.find('#review-name').addClass('invalid');
					dataOk = false;
				}

				// Check comment
				if (data.comment == '') {
					wrapper.find('#review-comment').addClass('invalid');
					dataOk = false;
				}

				// Check rating
				if (data.rating == '') {
					wrapper.find('.wrapper-rating-stars').addClass('invalid');
					dataOk = false;
				}

				// Stop if data isn't ok, otherwise remove any invalid CSS classes
				if (dataOk === false) {
					return;
				}
				else {
					wrapper.find('.invalid').removeClass('invalid');
				}

				// 'Lock' the button
				button.addClass('processing');

				// Remove any prior feedback messages
				wrapper.find('.feedback-message').text('');

				// Get the server module
				cbrequire(['configbox/server'], function(server) {

					// Send the data
					server.makeRequest('reviews', 'storeReview', data)

						.done(function(response) {
							// Write the feedback message
							wrapper.find('.feedback-message').text(response.feedback);
							// Remove the form
							wrapper.find('.review-form').slideUp();
						})

						.always(function() {
							// Unlock the send button
							button.removeClass('processing');
						});

				});

			});

			// Review form: Clicks or hovers over the stars set the rating
			cbj(document).on('mouseenter click', '.review-form .rating-star', function() {

				var wrapper = cbj(this).closest('.rating-stars');
				var star = cbj(this);

				wrapper.find('.rating-star').removeClass('full-star half-star').addClass('empty-star');

				star.addClass('full-star').prevAll('.rating-star').addClass('full-star');

				wrapper.data('rating', star.index() + 1);

			});

		}

	};

	return module;

});