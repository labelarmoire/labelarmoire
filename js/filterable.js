function filterableGallery() {
	$('.selecter').mobilyselect({
		collection: 'all',
		animation: 'absolute',
		duration: 500,
		listClass: 'selecterContent',
		btnsClass: 'selecterBtns',
		btnActiveClass: 'active',
		elements: 'li',
		onChange: function(){},
		onComplete: function(){}
	});
}


$(document).ready(function () {

	// Easing style
	jQuery.easing.def = "easeInOutQuart";
	// Calling Functions
	filterableGallery();
	


});


