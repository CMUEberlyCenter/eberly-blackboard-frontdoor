
// Determine if the dashboard is present and adjust styles if so
$(document).ready(function() {
    if( $('#dashboard').length > 0 ) {
        $('#documentation_menu').addClass('dashboard');
        $('#contact_nav').addClass('dashboard');
        $('#site_search').addClass('dashboard');
    }
    else {
	$('#documentation_menu').show();
    }
});

$(document).ready(function() {
    $('#site_sub_nav').css({ 'display' : 'block' });
}); 

// Columnize the sub-nav then hide it
$(function(){
    $('#site_sub_nav > ul > li > h1').addClass("dontend");
    $('#site_sub_nav > ul > li > ul > li').addClass("dontend");
    
    $('#site_sub_nav').children('ul').map( function(){
        $('#site_sub_nav').data('needsHeightSet', $(this) );
	
        $(this).columnize({
	    columns : Math.min( $(this).children('li').children('ul').size(), 4),
	    doneFunc : function(){ // create columns with explicitly equal heights (for borders)

		// determine the height of the tallest column
		var maxColumnHeight = 0;
		$($('#site_sub_nav').data('needsHeightSet')).children('.column').each( function(index) {
		    maxColumnHeight = Math.max(maxColumnHeight, $(this).height());
		});

		// explicitly set each column height to be that height
		$($('#site_sub_nav ').data('needsHeightSet')).children('.column').css({ 'height' : maxColumnHeight });

		// hide each sub-nav item after the columns have been calculated
		$($('#site_sub_nav ').data('needsHeightSet')).hide();
	    }
        })
    })
    $('#site_sub_nav').removeData('needsHeightSet');
});

// Columnize the additional support topics
$(function(){
    $('#additional_topics > ul > li > h1').addClass("dontend");
    $('#additional_topics > ul > li > ul > li').addClass("dontend");
    
    $('#additional_topics > ul').columnize({
	columns : 3
    })
});



$('#documentation_menu > li').click( function() {
    if( $(this).hasClass('active') && $('#site_sub_nav > ul:visible').length > 0 ){
	$('#site_sub_nav > ul').hide();
	$("body > *").fadeTo('fast', 1);
    }
    else {
    
	$('#documentation_menu > li').removeClass('active');

	$('#site_sub_nav > ul').hide();
	$('#site_sub_nav > ul.' + $(this).attr('class')).slideDown("fast");
	$("body > *:not(#page_header)").fadeTo('normal', 0.15);
	$('#site_sub_nav > ul.' + $(this).attr('class')).append("<div class=\"close_button\"><a href=\"#\">close</a></div>");
	$(this).addClass("active");
    }
});

$(document).keyup(function(event) {
    var keycode_escape = 27;
    if (event.keyCode == keycode_escape && $('#site_sub_nav > ul:visible').length > 0 ) {
	event.preventDefault();
	$("body > *").fadeTo('fast', 1);
	$('#site_sub_nav > ul').hide();
    }
})



$('#site_sub_nav > ul > .close_button').click( function() {
//$("body > *:not(#page_header)").click( function() {
    alert("hi");
    //$("body > *").fadeTo();
    //$('#site_sub_nav > ul').hide();
});