(function() {

	var srcBase = '';
	var pos = 0;

	var scripts = document.getElementsByTagName('script');

	var classicPaths = [
		'/js/varien/',
		'/js/mage/',
		'/js/scriptaculous/',
		'/js/prototype',
		'/js/lib'
	];

	// Loop through existing script tags and search their sources for typical Magento paths.
	// Then extract their base path to use for our little custom js file.
	for (var i in scripts) {
		if (scripts.hasOwnProperty(i)) {

			if (typeof(scripts[i].src) === 'undefined') {
				continue;
			}

			var testSrc = scripts[i].src;

			for (var j in classicPaths) {
				if (classicPaths.hasOwnProperty(j)) {

					if (testSrc.indexOf(classicPaths[j]) !== -1) {
						pos = testSrc.indexOf(classicPaths[j]);
						srcBase = testSrc.substr(0, pos);
						break;
					}

				}
			}
		}
	}

	// When in luck, add our script GA style
	if (srcBase) {
		var src = srcBase + '/media/elovaris/configbox/customization/assets/javascript/custom.js';

		var cs = document.createElement('script');
		cs.type = 'text/javascript';
		cs.async = true;
		cs.src = src;
		var firstScript = document.getElementsByTagName('script')[0];
		firstScript.parentNode.insertBefore(cs, firstScript);

	}

})();