/**
 * Abel Javascript plugins
 *
 * 1. hoverIntent
 * 2. Full screen background
 */


;(function($){
	/* hoverIntent by Brian Cherne */
	$.fn.hoverIntent = function(f,g) {
		// default configuration options
		var cfg = {
			sensitivity: 7,
			interval: 100,
			timeout: 0
		};
		// override configuration options with user supplied object
		cfg = $.extend(cfg, g ? { over: f, out: g } : f );

		// instantiate variables
		// cX, cY = current X and Y position of mouse, updated by mousemove event
		// pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
		var cX, cY, pX, pY;

		// A private function for getting mouse position
		var track = function(ev) {
			cX = ev.pageX;
			cY = ev.pageY;
		};

		// A private function for comparing current and previous mouse position
		var compare = function(ev,ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			// compare mouse positions to see if they've crossed the threshold
			if ( ( Math.abs(pX-cX) + Math.abs(pY-cY) ) < cfg.sensitivity ) {
				$(ob).unbind("mousemove",track);
				// set hoverIntent state to true (so mouseOut can be called)
				ob.hoverIntent_s = 1;
				return cfg.over.apply(ob,[ev]);
			} else {
				// set previous coordinates for next time
				pX = cX; pY = cY;
				// use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
				ob.hoverIntent_t = setTimeout( function(){compare(ev, ob);} , cfg.interval );
			}
		};

		// A private function for delaying the mouseOut function
		var delay = function(ev,ob) {
			ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
			ob.hoverIntent_s = 0;
			return cfg.out.apply(ob,[ev]);
		};

		// A private function for handling mouse 'hovering'
		var handleHover = function(e) {
			// next three lines copied from jQuery.hover, ignore children onMouseOver/onMouseOut
			var p = (e.type == "mouseover" ? e.fromElement : e.toElement) || e.relatedTarget;
			while ( p && p != this ) { try { p = p.parentNode; } catch(e) { p = this; } }
			if ( p == this ) { return false; }

			// copy objects to be passed into t (required for event object to be passed in IE)
			var ev = jQuery.extend({},e);
			var ob = this;

			// cancel hoverIntent timer if it exists
			if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); }

			// else e.type == "onmouseover"
			if (e.type == "mouseover") {
				// set "previous" X and Y position based on initial entry point
				pX = ev.pageX; pY = ev.pageY;
				// update "current" X and Y position based on mousemove
				$(ob).bind("mousemove",track);
				// start polling interval (self-calling timeout) to compare mouse coordinates over time
				if (ob.hoverIntent_s != 1) { ob.hoverIntent_t = setTimeout( function(){compare(ev,ob);} , cfg.interval );}

			// else e.type == "onmouseout"
			} else {
				// unbind expensive mousemove event
				$(ob).unbind("mousemove",track);
				// if hoverIntent state is true, then call the mouseOut function after the specified delay
				if (ob.hoverIntent_s == 1) { ob.hoverIntent_t = setTimeout( function(){delay(ev,ob);} , cfg.timeout );}
			}
		};

		// bind the function to the two event listeners
		return this.mouseover(handleHover).mouseout(handleHover);
	};
	
})(jQuery);

/*
 * Full screen background plugin
 * 
 * Copyright 2011 ThemeCatcher.net
 * All rights reserved
 * 
 */
;(function ($, window) {
	// Full screen background default settings
	var defaults = {
		speedIn: 3000,			// Speed of the "fade in" transition between background images, in milliseconds 1000 = 1 second
		speedOut: 3000,			// Speed of the "fade out" transition between background images
		sync: true,			    // If true, both fade animations occur simultaneously, otherwise "fade in" waits for "fade out" to complete
		minimiseSpeedIn: 1000,	// Speed that the website fades in, in full screen mode, in milliseconds
		minimiseSpeedOut: 1000, // Speed that the website fades out, in full screen mode, in milliseconds
		controlSpeedIn: 500,	// Speed that the controls fades in, in full screen mode, in milliseconds
		fadeIE: false,			// Whether or not to fade the website in IE 7,8
		preload: true,			// Whether or not to preload images
		save: true,				// Whether or not to save the current background across pages
		slideshow: true,		// Whether or not to use the slideshow functionality
		slideshowAuto: true,	// Whether or not to start the slideshow automatically
		slideshowSpeed: 7000,   // How long the slideshow stays on one image, in milliseconds
		random: false,			// Whether the images should be displayed in random order, forces save = false
		keyboard: true,			// Whether or not to use the keyboard controls, left arrow, right arrow and esc key
		onLoad: false,			// Callback when the current image starts loading
		onComplete: false		// Callback when the current image has completely loaded
	},
	

	// Current image & window
	$image,
	$window = $(window),
	
	// Misc
	isIE = $.browser.msie && !$.support.opacity,
	backgrounds,
	total,
	imageCache = [],
	imageRatio,
	bodyOverflow,
	index = 0,
	active = false,
	settings,
	fullscreen;
	
	// Cache the images with given indices
	function cache()
	{
		$.each(arguments, function (i, cacheIndex) {
			if (typeof imageCache[cacheIndex] === 'undefined') {
				imageCache[cacheIndex] = document.createElement('img');
				imageCache[cacheIndex].src = backgrounds[cacheIndex];
			}
		});
	}
	

    
    function trigger(event, callback) {
    	if (callback && typeof callback === 'function') {
    		callback.call();
    	}
    	
    	$.event.trigger(event);
    }
	
	// Initialisation
	function init() {
				
		$window.resize(windowResize);
				
		// Fade in the first image, then cache one next image and one previous image
		load(function () {
			if (settings.preload) {
				cache((index == (total - 1)) ? 0 : index + 1, (index == 0) ? total - 1 : index - 1);
			}
		});
	};
	
	// Load the current image
	function load(callback) {
		var image = document.createElement('img'),
		loadingTimeout;
		$image = $(image).css('position', 'fixed');
		$image.load(function () {
			$image.unbind('load');
			setTimeout(function () { // Chrome will sometimes report a 0 by 0 size if there isn't pause in execution
				imageRatio = image.height / image.width;
				var $current = $stage.find('img');
				$stage.append($image);
				windowResize(function () {
					clearTimeout(loadingTimeout);
					$loadingWrap.add($stormLoading).hide();
					var fn = function () {
						$image.animate({ opacity: 'show' }, {
							duration: settings.speedIn,
							complete: function () {
								active = false;
								
								trigger('fullscreenComplete', settings.onComplete);
								
															}
						});
					};
					
					if ($current.length) {
						$current.animate({ opacity: 'hide' }, {
							duration: settings.speedOut,
							complete: function () {
								if (!settings.sync) {
									fn();
								}
								$current.remove();
							}
						});
						
						if (settings.sync) {
							fn();
						}
					} else {
						fn();
					}
				});
			}, 1);
		});
		
		loadingTimeout = setTimeout(function () { $loadingWrap.add($stormLoading).fadeIn(); }, 200);
		trigger('fullscreenLoad', settings.onLoad);
		active = true;
		setTimeout(function () { // Opera 10.6+ will sometimes load the src before the onload function is set, so wait 1ms
			$image.attr('src', backgrounds[index]);
		}, 1);
	}
	
	// Resize the current image to set dimensions on window resize
	function windowResize(callback)
	{
		if ($image) {
			var windowWidth = $window.width(),
			windowHeight = $window.height();
						
			if ((windowHeight / windowWidth) > imageRatio) {
				$image.height(windowHeight).width(windowHeight / imageRatio);
			} else {
				$image.width(windowWidth).height(windowWidth * imageRatio);
			}
			
			$image.css({
				left: ((windowWidth - $image.width()) / 2) + 'px',
				top: ((windowHeight - $image.height()) / 2) + 'px'
			});
			
			
		}
	}
	
	
	fullscreen = $.fullscreen = function (options) {
		settings = $.extend({}, defaults, options || {});
		
		backgrounds = settings.backgrounds;
		total = backgrounds.length;
		
		if (settings.random) {
			backgrounds = shuffle(backgrounds);
			settings.save = false;
		}

		if (typeof settings.backgroundIndex === 'number') {
			index = settings.backgroundIndex;
			settings.save = false;
		}
		
		if (isIE && !settings.fadeIE) {
			settings.minimiseSpeedOut = 0;
			settings.minimiseSpeedIn = 0;
			settings.controlSpeedIn = 0;
		}
		
		init();
	};
		

	
})(jQuery, window);
