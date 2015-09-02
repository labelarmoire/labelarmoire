;(function($, window) {
	/** Settings **/

	// List of background images to use, the default image will be the first one in the list
	var backgrounds = [
	    	],
	
	// Background options - see documentation
	backgroundOptions = {
		
	};
	
	/** End settings **/
	
	
	$(document).ready(function() {
		$.fullscreen(
			$.extend(backgroundOptions, {
				backgrounds: window.backgrounds || backgrounds,
				backgroundIndex: window.backgroundIndex
			})
		);

		
	// Create the gallery rollover effect
		$('li.one-portfolio-item a').append(
			$('<div class="portfolio-hover"></div>').css({ opacity: 0, display: 'block' })
		).hover(function() {
			$(this).find('.portfolio-hover').stop().fadeTo(400, 0.6);
		}, function() {
			$(this).find('.portfolio-hover').stop().fadeTo(400, 0.0);
		});
	}); // End (document).ready
	

})(jQuery, window);