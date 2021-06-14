/**
 * @module configbox/productTree
 */
define(['configbox/server','kenedo', 'cbj', 'cbj.ui', 'cbj.chosen'], function(server, kenedo, cbj) {
	"use strict";

	/**
	 * @exports configbox/productTree
	 */
	var module = {

		initProductTreeOnce: function () {

			// Product listing filter: Changes reload the
			cbj(document).on('change', '.view-adminproducttree #product_tree_list_id', function() {

				var listId = cbj(this).val();
				var url = cbj(this).closest('.view-adminproducttree').find('.product-list').data('update-url');

				cbj(this).closest('.product-tree-wrapper').load(url, {list_id: listId}, function(msg, textStatus) {

					if (textStatus === 'error') {
						window.alert('System Error!');
						return;
					}

					cbj(document).trigger('cbViewInjected');

				});

			});

			cbj(document).on('keyup', '.view-adminproducttree #product-tree-title', function() {

				var searchText = cbj(this).val().toLowerCase();

				cbj('.product-edit-link').each(function() {

					var title = cbj(this).text().toLowerCase();

					if (title.indexOf(searchText) === -1) {
						cbj(this).closest('.product-item').hide();
					}
					else {
						cbj(this).closest('.product-item').show();
					}

				});

			});

			// Tree toggles for the product tree
			cbj(document).on('click', '.view-adminproducttree .sub-list-trigger', function() {

				if (cbj(this).is('.trigger-opened')) {
					cbj(this).removeClass('trigger-opened');
					cbj(this).siblings('.sub-list').removeClass('list-opened');
				}
				else {
					cbj(this).addClass('trigger-opened');
					cbj(this).siblings('.sub-list').addClass('list-opened');
				}

			});

			// Mark the last product tree item that has been clicked
			cbj(document).on('click', '.view-adminproducttree .edit-link, .view-adminproducttree .add-link', function() {
				cbj(this).closest('.view-adminproducttree').find('.active').removeClass('active');
				cbj(this).closest('li').addClass('active');
			});

			// Toggle the tree edit button display
			cbj(document).on('click', '.view-adminproducttree .toggle-tree-edit',function(){
				cbj(this).toggleClass('active');
				cbj(this).closest('.product-tree-wrapper').toggleClass('shows-edit-buttons');
			});

			cbj(document).on('click', '.view-adminproducttree .trigger-copy', function() {

				var controller = cbj(this).data('controller');
				var id = cbj(this).data('id');
				var shortName = cbj(this).data('short-name');

				cbrequire(['configbox/server'], function(server) {

					server.makeRequest(controller, 'copy', {id: id})

						.done(function(response) {

							if (response.success === false) {
								window.alert(response.errors.join("\n"));
								return;
							}

							if (response.redirectUrl) {
								kenedo.loadSubview(response.redirectUrl);
							}

							// Get the URL for product tree updates
							var url = cbj('.view-adminproducttree .product-list').data('update-url');

							// Get the currently opened nodes in the tree and make it query string ready json
							var treeIds = encodeURIComponent(JSON.stringify( module.getOpenProductTreeBranchIds() ));

							// Add the info to the url (only_product_id is there to get only the tree data of a single product)
							url += '&open_branch_ids=' + treeIds;

							cbj('.product-tree-wrapper').load(url, function() {

								cbj(document).trigger('cbViewInjected');

								// Mark the new recorded as active one
								cbj(this).closest('.view-adminproducttree').find('.active').removeClass('active');
								var selector = '#' + shortName + '-' + response.newId;
								cbj(this).closest('.view-adminproducttree').find(selector).addClass('active');

							});


						});

				});

			});

			cbj(document).on('click', '.view-adminproducttree .trigger-remove', function() {

				var btn = cbj(this);

				if (btn.hasClass('processing')) {
					return;
				}

				btn.addClass('processing');

				var removalListItem = cbj(this).closest('li');

				// Do the XHR request
				cbj.ajax({

					url: btn.data('url'),
					dataType: 'json',

					success: function(data) {
						btn.removeClass('processing');

						if (data.success === false) {
							window.alert(data.errors.join("\n"));
						}
						else {
							removalListItem.remove();
						}
					},

					error: function(XMLHttpRequest, textStatus, errorThrown) {
						console.log(textStatus);
						console.log(errorThrown);
					},

					always: function() {
						btn.removeClass('processing');
					}

				});

			});

			cbj(document).on('cbFormTaskResponseReceivedGlobal', function(event, xhr, taskInfo) {

				try {
					var response = JSON.parse(xhr.responseText);
				}
				catch(e) {
					console.warn('Could not parse JSON response. Response text was: "' + xhr.responseText + '"');
					console.warn('Error message follows:');
					console.warn(e);
					return;
				}

				if (response.success !== true) {
					return;
				}

				if (!response.data) {
					return;
				}

				var productId;
				var recordId = response.data.id;
				var recordType = taskInfo.viewName.replace('admin', '');
				var isProductInsert = false;

				if (taskInfo.viewName === 'adminproduct') {
					productId = response.data.id;
					recordId = productId;
					isProductInsert = response.wasInsert;
				}
				if (taskInfo.viewName === 'adminpage') {
					productId = response.data.product_id;
				}

				if (taskInfo.viewName === 'adminelement') {
					var pageId = response.data.page_id;
					productId = cbj('.view-adminproducttree').find('#page-' + pageId).closest('.product-item').attr('id').replace('product-','');
				}

				module.refreshProductTree(recordId, recordType, productId, isProductInsert);


			});

		},

		initProductTreeEach: function () {

			cbj('#product_tree_list_id').chosen();

			module.makeTreeSortable();
		},


		makeTreeSortable : function () {
			// For performance reasons we initialise the sortables only after the user opens a branch
			var settings = {

				placeholder: "ui-state-highlight",
				items: ">li:not(.add-item)",
				update: function () {

					var list = cbj(this);
					var items = list.sortable('toArray');

					list.sortable('disable');

					var controller = '';
					var key = '';

					if (list.is('.page-list')) {
						controller = 'adminpages';
						key = 'page-';
					}
					if (list.is('.question-list')) {
						controller = 'adminelements';
						key = 'question-';
					}
					if (list.is('.answer-list')) {
						controller = 'adminoptionassignments';
						key = 'answer-';
					}

					var position = 10;

					var updates = {};
					for (var i in items) {
						if (items.hasOwnProperty(i)) {
							if (items[i].indexOf(key) !== -1) {
								var recordId = items[i].replace(key, '');
								updates[recordId] = position;
								position += 10;
							}
						}
					}

					var data = {
						updates: JSON.stringify(updates)
					};

					server.makeRequest(controller, 'storeOrdering', data)
						.done(function() {
							list.sortable('enable');
						});

				}
			};

			cbj('.sub-list-trigger.product-title').one('click', function() {
				var list = cbj(this).closest('li').find('.page-list');
				window.setTimeout(function() {
					list.sortable(settings).disableSelection();
				}, 100);
			});

			cbj('.sub-list-trigger.configurator-page-title').one('click', function() {
				var list = cbj(this).closest('li').find('.question-list');
				window.setTimeout(function() {
					list.sortable(settings).disableSelection();
				}, 100);
			});

			// When the user saves a product/page/question, part of the tree gets refreshed. Here we init the
			// lists in the opened branches
			cbj('.view-adminproducttree .list-opened').sortable(settings).disableSelection();

		},


		/**
		 * Make the product tree (product tree structure in the backend) refresh. Careful - refreshes a part of the tree,
		 * namely the product node that had a change.
		 * The method expects a kenedo-form with the usual data on the page.
		 */
		refreshProductTree: function(recordId, recordType, productId, isProductInsert) {

			// No product tree, no refresh
			if (cbj('.view-adminproducttree').length === 0) {
				return;
			}

			// Get the URL for product tree updates
			var url = cbj('.view-adminproducttree .product-list').data('update-url');

			// Get the currently opened nodes in the tree and make it query string ready json
			var treeIds = encodeURIComponent(JSON.stringify( this.getOpenProductTreeBranchIds() ));

			if (server.config.platformName === 'magento') {
				// Add the info to the url (only_product_id is there to get only the tree data of a single product)
				url += 'open_branch_ids/'+treeIds+'/only_product_id/'+productId;
			}
			else {
				// Append & or ? and the params later because we take it easy
				url += (url.indexOf('?') === -1) ? '?' : '&';

				// Add the info to the url (only_product_id is there to get only the tree data of a single product)
				url += 'open_branch_ids='+treeIds+'&only_product_id='+productId;
			}

			// On new products, add a list item so that reloading later is less complicated
			if (isProductInsert) {
				cbj('.view-adminproducttree .product-list .product-item.add-item').before('<li class="product-item" id="product-'+productId+'"></li>');
			}

			// Now load the view (insert only part of it)
			cbj('#product-' + productId).load(url + ' #product-' + productId + '>div', function() {

				// Run ready functions on the whole view (works out great luckily)
				// kenedo.runSubviewReadyFunctions('view-adminproducttree');

				// Remove any 'active' CSS classes (they mark the currently selected item in the tree)
				cbj('.view-adminproducttree .active').removeClass('active');

				// recordType derives from KenedoController's response data.viewName (which is still adminelement)
				// Here we just spot-fix it to question till it's all normalized in the Controller
				if (recordType === 'element') {
					recordType = 'question';
				}

				// Mark the right item
				cbj('#'+recordType+'-' + recordId).addClass('active');

				module.makeTreeSortable();

			});

		},

		/**
		 * Returns an object with the ids of currently open nodes in the product tree (admin area left side at 'Products')
		 *
		 * @returns {{products: Array, pages: Array, questions: Array}}
		 */
		getOpenProductTreeBranchIds: function() {

			var treeData = {
				products 	: [],
				pages		: [],
				questions	: []
			};

			cbj('.sub-list-trigger').each(function(i,item){
				if (cbj(item).is('.trigger-opened')) {

					var id = cbj(this).attr('id');

					if (id) {
						if (id.indexOf('product-trigger') !== -1) {
							treeData.products.push(id.replace('product-trigger-',''));
						}
						if (id.indexOf('page-trigger') !== -1) {
							treeData.pages.push(id.replace('page-trigger-',''));
						}
						if (id.indexOf('question-trigger') !== -1) {
							treeData.questions.push(id.replace('question-trigger-',''));
						}
					}
				}
			});

			return treeData;

		}

	};

	return module;

});
