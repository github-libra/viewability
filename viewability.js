var view = (function($) {
	var api = {};
	var CONSTANT = {
		percent: 0.5,
		duration: 2000,
		throttle: 100
	};
	var config = {
		adSelector: ['.ad']
	};

	var effectiveAds = [];
	var _allAds = [];
	var _extractInfoHandler = null;


	function init() {
		checkConfig();
		_allAds = getAllAds(config.adSelector);
		track(_allAds);
	}

	function checkConfig() {
		if(window.toString.call(config.adSelector) !== '[object Array]') {
			throw Error('adSelector should be an array');
		}
		if(!config.adSelector.length) {
			throw Error('empty addSelector given');
		}
		if(_extractInfoHandler === null) {
			throw Error('extractInfoHandler should be given')
		} 

	}

	/**
	 * @param  {Array} array of ads selectors
	 * @return {Array} array of ads elements
	 */
	function getAllAds(selectors) {
		var ads = [];
		selectors.forEach(function(selector) {
			var elements = document.querySelectorAll(selector);
			if(elements) {
				ads = ads.concat([].slice.call(elements));
			}
		})
		return ads;
	}

	/**
	 * check if element is in view port by given percent of element width/height.
	 * 	
	 * @param {DOM} el 
	 * @param {Integer} percent percent of element size is in view then it return true.
	 *
	 * @return {Boolean} 
	 */
	function isElementInViewport (el, percent) {
		// first check if browser tab is active
		if(document.hidden) {
			return false;
		}

		percent = percent || CONSTANT.percent;

	    var rect = el.getBoundingClientRect();

	    var effectiveWidth = rect.width * (1 - percent);
	    var effectiveHeight = rect.height * (1 - percent);

	    var winH = window.innerHeight || document.documentElement.clientHeight;
	    var winW = window.innerWidth || document.documentElement.clientWidth;

	    return (
	        rect.top + effectiveHeight  >= 0 &&
	        rect.left + effectiveWidth >= 0 &&
	        rect.bottom - effectiveHeight <= winH &&
	        rect.right - effectiveWidth <= winW
	    );
	}

	/**
	 * track browser events to capture effective ad display.
	 *
	 * @param {Array} ads array of elements to track
	 *
	 */
	function track(ads) {
		// store index and its timer;
		var context = {};

		ads.forEach(function(ad, index) {
			// init timer to be -1;
			context[index] = -1;
		});

		$(window).on('blur', windowBlurHandler);
		$(window).on('DOMContentLoaded load resize scroll focus', throttle(handler, CONSTANT.throttle)); 

		function windowBlurHandler(e) {
			for(var key in context) {
				if(context[key] !== -1 && context[key] !== null) {
					clearTimeout(context[key]);
					context[key] = -1;
				}
			}
		}
		
		function handler(e) {
			for (var i = 0; i < ads.length; i++) {
				if(isElementInViewport(ads[i])) {

					// first time in view
					if(context[i] === -1) {
						
						(function(i) {
							var timer = setTimeout(function() {
								// effective ad display

								context[i] = null;
								_extractInfoHandler(ads[i]);

							}, CONSTANT.duration);

							context[i] = timer;
						})(i)
					}

				} else {
					// go out of view
					if(context[i]!== -1 && context[i] !== null) {
						clearTimeout(context[i]);
						// not effective, set back to -1;
						context[i] = -1;
					}
				}
			}
		}

	}

	function throttle(fn, threshhold, scope) {
	    threshhold || (threshhold = 250);
	    var last,
	        deferTimer;
	    return function() {
	        var context = scope || this;

	        var now = +new Date,
	            args = arguments;
	        if (last && now < last + threshhold) {
	            // hold on to it
	            clearTimeout(deferTimer);
	            deferTimer = setTimeout(function() {
	                last = now;
	                fn.apply(context, args);
	            }, threshhold);
	        } else {
	            last = now;
	            fn.apply(context, args);
	        }
	    };
	}

	/**
	 * extract info from ad DOM
	 *
	 * @param {DOM} ele 
	 *
	 * @return {Object} info obj
	 */
	// function extractInfo(ele) {

	// }

	api.init = init;
	api.setHandler = function(fn) {
		_extractInfoHandler = fn;
	}
	api.setSelectors = function(arr) {
		config.adSelector = arr;
	}

	return api;

})(jQuery);