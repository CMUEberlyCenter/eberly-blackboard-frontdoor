// Copyright 2012 Carnegie Mellon University. All Rights Reserved.

/**
 * @fileoverview Style and interaction enhancements for the Blackboard
 * documentation site (http://www.cmu.edu/blackboard)
 * @author mouse@cmu.edu (Meg Richards)
 */


/**
 * Determines if the dashboard (home screen) is present and invokes appropriate
 * initialization function.
 */
$(document).ready( function() { 
    $('#dashboard').length ? prepare_dashboard() : prepare_content(); 
});


/**
 * Adjusts styles for the dashboard (home screen) view and displays
 * announcements if any exist.
 */
function prepare_dashboard() {
    $('#site_nav').addClass('dashboard');
    $('#contact_nav').addClass('dashboard');
    $('#site_search').addClass('dashboard');

    // Display the Additional Support Topics section in columns
    columnize_additional_support_topics();

    // Make the rotating tips cycle through
    $('#rotating_tips').jshowoff({ changeSpeed : 400, 
				   cssClass : 'rotating_tips', 
				   effect : 'fade', 
				   links : false, 
				   speed : 13000 });
    $('.jshowoff-prev').html('<img src="images/elements/left-arrow.gif" alt="Previous Tip" />');
    $('.jshowoff-next').html('<img src="images/elements/right-arrow.gif" alt="Next Tip" />');
    
    $('#announcements').slideDown('slow'); // Show announcements in dashboard

    /**
     * Columnize the Additional Support Topics section.
     */
    function columnize_additional_support_topics() {
	$('#additional_topics > ul > li > h1').addClass('dontend');
	$('#additional_topics > ul > li > ul > li').addClass('dontend');
	$('#additional_topics > ul').columnize({ columns : 4 });
    }
}


/**
 * Adjusts styles for the documentation content views (e.g. manage users, build
 * a course); adds and styles navigational aids within the content views.
 */
function prepare_content() {

    // Determine if site_sub_nav flagged for show now; URL subject to change
    var should_show_site_sub_nav = window.location.hash == '#site_sub_nav/show' ? true : false;

    // Normal section indeces should display the site sub nav regardless of flag
    if(( $.url( window.location ).fsegment().length == 1 )
       && (( content_section_via_url() == "manage" ) ||
	   ( content_section_via_url() == "build"  ) ||
	   ( content_section_via_url() == "communicate"  ) ||
	   ( content_section_via_url() == "evaluate"  ) ||
	   ( content_section_via_url() == "gettingstarted"  ))
      ) {
	should_show_site_sub_nav = true
    }
    
    prepare_documentation_menu();
    columnize_internal_content();
    
    /* Some content doesn't need article traversal, but should still get the
       link to the top of a page of long content 
    */
    if( $('#content').hasClass("no_content_traversal") ) {
	prepare_to_top_link();
    }
    else {
	prepare_content_traversal(); // calls prepare_to_top_link internally
    }

    /* Transition effects from an immediately shown site_sub_nav (e.g. 
       fading out the body) will not affect content rendered after the call to
       prepare_site_sub_nav, but future transition effects will affect it. 
    */
    prepare_site_sub_nav( should_show_site_sub_nav );

    // Add active class to course request link when on the page
    if( content_section_via_url() == 'courserequest') { 
	$('ul#application_menu > li.request_course a').addClass('active');
    }

    /**
     * Columnize specified content found in the internal pages.
     */
    function columnize_internal_content() {
	if ( $('#content.whatsnew').length ) {
	    $('#content.whatsnew #overview\\/contents > ul').addClass('dontsplit');
            $('#content.whatsnew #overview\\/contents').columnize({ columns : 2 });
	}
    }
    
}


/**
 * Styles the documentation menu and adds the event handlers to have it control
 * the appearance of the site's sub-navigation. Flags the initial active
 * documentation section.
 */
function prepare_documentation_menu() {
    $('#documentation_menu').show();  // Default style is hidden

    show_documentation_section( content_section_via_url() ); 
    
    // The documentation menu links should control the presence of the sub-nav
    $('#documentation_menu > li > a').click( function(event) {
	event.preventDefault();

	/* Hide the sub-nav if it's already visible and the user clicks the active
	   section. Otherwise show it/transition it to another tab's content.
	*/
	var sub_nav_visible = $('#site_sub_nav > ul:visible').length;
	if( sub_nav_visible && $(event.currentTarget).hasClass('active') ) {
	    hide_site_sub_nav();
	}
	else {
	    show_site_sub_nav( $(event.currentTarget).attr('href') );
	}
    });
}


/**
 * Populates and styles all navigation aids for content articles. Adds
 * handlers for links and keypress-based navigation.
 */
function prepare_content_traversal() {

    // Determine and present a documentation article (based on URL)
    var article;
    if( window.location.hash == ''  ||
	window.location.hash == '#' ||
	window.location.hash == '#site_sub_nav/show' ) {
	
	// Article will be the default (first) available
	article = $('#content > article').first().attr('id');
	
	/* For site_sub_nav, remove the placeholder anchor and replace it with
	   a value. It must be another anchor to prevent the page reloading and
	   hiding site_sub_nav. Replace also keeps the history clean.
	*/
	if( window.location.hash == '#site_sub_nav/show' ) {
	    window.location.replace('#' + article);
	}
    }
    else {

	// Article will be the one specified in the first segment of the url hash
	// TODO: check for valid segment instead of displaying nothing
	article = $.url( window.location ).fsegment(1);
    }
    
    prepare_to_top_link();
	
    // Draw the content navigation links for article traversal
    $('#content').after('\
      <nav id="content_nav" role="navigation">\
        <ul class="' + content_section_via_url() + '">\
          <li><a class="previous" href="#">Previous Topic</a></li>\
          <li><a class="next"     href="#">Next Topic</a></li>\
        </ul>\
      </nav>\
    ');

    // Display the article
    show_section_article( article );
    
    /* Configure hashchange behavior to switch to the new article */
    $(window).bind('hashchange', function(event) {
	show_section_article( $.url( window.location ).fsegment(1) )
    });

    /* Configure click behavior for navigation links. Delegating the event
       instead of binding it directly alters the propagation order and allows
       the handlers directly bound to links to take priority and prevent
       propagation, e.g. disabling links when the site's sub-nav is present.
    */
    $('#content_nav').on('click', 'a', function(event) {
	event.preventDefault();

	// Change to the next article
	var direction = $(this).is('.previous') ? 'previous' : 'next';
	do_article_transition( direction );
    });

    // Configure keypress-based navigation behavior
    $('#content_nav a.next').attr('title', 'Tip: The \'n\' or \'j\' key will progress forward');
    $('#content_nav a.previous').attr('title', 'Tip: The \'p\' or \'k\' key will progress backwards');
    $(document).bind('keyup.keypress_nav', function(event) { do_keypress_navigation(event); });
    $('input').focusin( function() { $(document).unbind('.keypress_nav'); });
    $('input').focusout( function(event) { $(document).bind('keyup.keypress_nav', function(event) { do_keypress_navigation(event); }) });

    /**
     * Displays the correct article for a section based on the parameter.
     * Navigates to the top for a generic article or to a subsection based
     * on the URL. Updates the content navigation link states (enabled or
     * disabled) and then updates the page's breadcrumbs.
     * @param {string} article The article to display
     */
    function show_section_article( article ) {

	// Explicitly show the article to be displayed and hide all others
	$('#content > article').hide();
	$('#content > article#' + article).show();

	// Scroll to the specific section if one is given, else go to the top
	if( $.url( window.location ).fsegment().length > 1 ) {
	    location.href = document.location;
	}
	else {
	    $('html, body').stop(true,true);
	    $('html, body').animate( {scrollTop:0}, 'slow', 'easeOutQuart'); 
	}
	set_content_nav_state();
	populate_article_breadcrumbs();

	/**
	 * Disables or enables links within the content navigation.
	 */
	function set_content_nav_state() {
	    $('#content_nav a').stop( true, true );
	    
	    var article = $('#content > article:visible');
	    if( !$(article).prev('article').length ) {
		$('#content_nav a.previous').fadeTo('slow', .5);
		$('#content_nav a.previous').on('click.disable_previous', false);
	    }
	    else {
		$('#content_nav a.previous').fadeTo('fast', 1);
		$('#content_nav a.previous').off('.disable_previous');
	    }
	    if( !$(article).next('article').length ) {
		$('#content_nav a.next').fadeTo('slow', .5);
		$('#content_nav a.next').on('click.disable_next', false);
	    }
	    else {
		$('#content_nav a.next').fadeTo('fast', 1);
		$('#content_nav a.next').off('.disable_next');
	    }
	}
	
	/**
	 * Sets the navigation breadcrumbs based on the visible article
	 * and its header.
	 */
	function populate_article_breadcrumbs() {
	    
	    // The breadcrumb text is the first h1 inside the article
	    var article_heading = $('#content > article:visible > h1:first').text();
	    if( article_heading != '' ) {
		var article_id = $('#content > article:visible').attr('id');
		
		if( $('#breadcrumbs > ul').has('.article').length ) {
		    $('#breadcrumbs > ul > li > a.article').attr('href', article_id);
		    $('#breadcrumbs > ul > li > a.article').html( article_heading );
		}
		else {
		    var breadcrumb = '<li><a class="article" href="#'+article_id+'">' + article_heading + '</a></li>';
		    $('#breadcrumbs > ul').append( breadcrumb );
		}
	    }
	}
    }

    /**
     * Handle keypress-based navigation behavior.
     */
    function do_keypress_navigation(event) {
        var keycode_n = 78;
	var keycode_p = 80;
        var keycode_j = 74;
        var keycode_k = 75;

        if( event.keyCode == keycode_n || event.keyCode == keycode_j ) {
            event.preventDefault();
	    $('#content_nav a.next').trigger('click');
        }
	else if( event.keyCode == keycode_p || event.keyCode == keycode_k ) {
            event.preventDefault();
	    $('#content_nav a.previous').trigger('click');
        }
    }

    /**
     * Determines appropriate article to display and transitions to it if
     * appropriate.
     * @param {string} direction Either 'next' or 'previous', the direction
     *     of content traversal.
     */
    function do_article_transition( direction ) {
	var article = $('#content > article:visible');
	var destination;
	if( direction == 'previous' ) { destination = $(article).prev('article'); }
	else { destination = $(article).next('article'); }
	
	if( $(destination).length ) {
	    window.location.hash = $(destination).attr('id');
	}
    }
}


/**
 * Adds a link to return to the top of a page for long content.
 */
function prepare_to_top_link() {
    $().UItoTop({ containerID: 'content_top_link',
		  containerHoverID: 'content_top_link_hover', 
		  easingType: 'easeOutQuart' 
		});
    $(window).bind('resize.adjust_top_link_position', function() {
	$('#content_top_link').css({ 'left' : $('#content').position().left + 10 });
    });
    $(window).trigger('resize.adjust_top_link_position');
}


/**
 * Styles the site's sub-navigation and shows it if it's flagged for immediate
 * display.
 * @param {bool} should_show_site_sub_nav Whether the site's sub-nav should be
 *     shown.
 */
function prepare_site_sub_nav( should_show_site_sub_nav ) {

    // Display the site's sub-navigation as columns
    columnize_site_sub_nav();

    // Display the site's sub-nav if appropriate
    if( should_show_site_sub_nav ) { 
	self.scrollTo(0, 0); 
	show_site_sub_nav();
    }
    
    /**
     * Columnize the site's sub-navigation menus.
     */
    function columnize_site_sub_nav() {
	$('#site_sub_nav').css({ 'display' : 'block' });
	$('#site_sub_nav > ul > li > h1').addClass('dontend');
	$('#site_sub_nav > ul > li').addClass('dontsplit');
	$('#site_sub_nav').children('ul').map( function(){
            $('#site_sub_nav').data('needsHeightSet', $(this));
	    
            $(this).columnize({
		columns : Math.min( $(this).children('li').children('ul').size(), 4 ),
		doneFunc : function() { // create columns with explicitly equal heights (for borders)
		    
		    // determine the height of the tallest column
		    var maxColumnHeight = 0;
		    $($('#site_sub_nav').data('needsHeightSet')).
			children('.column').each( function( index ) {
			    maxColumnHeight = Math.max(maxColumnHeight, $(this).height());
			});

		    // explicitly set each column height to be that height
		    $($('#site_sub_nav ').data('needsHeightSet')).
			children('.column').css({ 'height' : maxColumnHeight });

		    // hide each sub-nav item after the columns have been calculated
		    $($('#site_sub_nav ').data('needsHeightSet')).hide();
		}
            })
	})
	$('#site_sub_nav').removeData('needsHeightSet');
    }
}


/**
 * Presents a given documentation section as active and removes all pre-existing
 * references to the former active documentation section.
 * @param {string} section The documentation section to become active.
 */
function show_documentation_section( section ) {
    if( section == 'courserequest') {
	$('#documentation_menu > li > a').removeClass('active');
	$('ul#application_menu > li.request_course a').addClass('active');
    }
    else {
      $('#documentation_menu > li > a[href=' + section + ']').addClass('active');
      $('#documentation_menu > li > a:not([href=' + section + '])').removeClass('active');
      $('ul#application_menu > li.request_course a').removeClass('active');
    }
}


/**
 * Parses the URL and returns the active document section. The document section
 * is always the last segment of the file path. Expected results are one of
 * manage, build, communicate, evaluate, or getting_started.
 */
function content_section_via_url() { 
    return $.url( window.location ).segment(-1); 
}


/**
 * Hides the site's sub-navigation and removes related handlers and pending 
 * effects; restores pre-existing active documentation section.
 */
function hide_site_sub_nav() {
    $('#site_sub_nav .close_button').remove();  // Remove the site_sub_nav close button
    $('#site_sub_nav > ul').hide();             // Hide each menu within site_sub_nav

    /* Eliminate pending effects; fade in everything that was faded out when
       the menu appeared.
    */
    $('body').children().not('#page_header, #content_top_link').stop( true, true );
    $('body').children().not('#page_header, #content_top_link').fadeTo( 'fast', 1 );  

    // Remove all pre-existing handlers scoped to show_site_sub_nav
    $(document).unbind('.show_site_sub_nav');
    $(document).find('*').unbind('.show_site_sub_nav');
   
    // Revert the active documentation section to the one based on displayed content
    show_documentation_section( content_section_via_url() );
}

/**
 * Shows the site's sub-navigation, styles accordingly, and binds appropriate
 * new event handlers to close it. All handlers to close the nav are namespaced
 * to show_site_sub_nav for blanket unbinding.
 * @param {string} section The documentation section that should have its menu
 *     displayed. Defaults to active document section.
 */
function show_site_sub_nav( section ) {

    // When no section is provided, assume the menu is for the active section
    section = typeof(section) != 'undefined' ? section : content_section_via_url();

    /* Remove all pre-existing handlers scoped to show_site_sub_nav. Prevents
       redundant bindings when going from show_site_nav(a)->show_site_nav(b).
    */
    $(document).unbind('.show_site_sub_nav');
    $(document).find('*').unbind('.show_site_sub_nav');

    /* Eliminate pending slide effects; hide all documentation section menus
       except for the incoming active one. Show the new active menu.
    */
    $('#site_sub_nav > ul').stop( true, true );
    $('#site_sub_nav > ul.' + section ).slideDown( 'fast' );
    $('#site_sub_nav > ul:not(.' + section + ')').hide();
    
    /* Eliminate pending fade effects; fade out everything that isn't the page
       header or the link to the top of the content.
     */
    $('body').children().not('#page_header, #content_top_link').stop( true, true );
    $('body').children().not('#page_header, #content_top_link').fadeTo( 'normal', 0.15 );
    
    /* Add a close button to the site's sub-navigation and add a click handler
       to hide it when clicked. 
    */
    $('#site_sub_nav > ul.' + section ).append('<div class="close_button"><a href="#">close</a></div>');
    $('#site_sub_nav .close_button > a').bind('click.show_site_sub_nav', function(event) { hide_after_event( event, true, false ); }
    );

    /* Close site's sub-nav when clicking on any part of the document except for
       the page header (done by preventing the event propagation to the document).
    */
    $(document).bind('click.show_site_sub_nav', function() { hide_after_event( null, false, false ); });
    $('#page_header').bind('click.show_site_sub_nav', function(event) { event.stopPropagation(); });

    // Page header links outside the documentation menu should close the nav and go/propagate
    $('#page_header').find('a:not(#documentation_menu *)').bind('click.show_site_sub_nav', function() { hide_after_event( null, false, false ); });

    // Links outside the page header should just close the nav
    $('body').find('a:not(#page_header *)').bind('click.show_site_sub_nav', function(event) { hide_after_event( event, true, true ); });

    // Close the site's sub-nav when the escape key is pressed
    $(document).bind('keyup.show_site_sub_nav', function(event) {
	var escape = 27;
	if( event.keyCode == escape ) { hide_after_event( event, true, false );	}
    });

    // Show the documentation section belonging to the displayed sub-nav menu as active
    show_documentation_section( section );

    /**
     * Handles an event that should cause the site's sub-navigation to close.
     * @param {Event} event
     * @param {bool} prevent_default Whether the default event behavior should
     *     occur.
     * @param {bool} stop_propagation Whether the event should propagate to
     *     other handlers. Does not affect propagation to other handlers bound
     *     directly to the element, only parent element handlers.
     */
    function hide_after_event( event, prevent_default, stop_propagation ) {
	if( prevent_default )  { event.preventDefault(); }
	if( stop_propagation ) { event.stopPropagation(); }
	hide_site_sub_nav();
    }
}
