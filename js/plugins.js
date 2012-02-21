/* ==|== JQuery Plugins =====================================================*/

/* ==|== JQuery URL Parser plugin ===========================================
   Mark Perkins, mark@allmarkedup.com
   https://github.com/allmarkedup/jQuery-URL-Parser
   ========================================================================== */
;(function($, undefined) {
    
    var tag2attr = {
        a       : 'href',
        img     : 'src',
        form    : 'action',
        base    : 'href',
        script  : 'src',
        iframe  : 'src',
        link    : 'href'
    },
    
    key = ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","fragment"], // keys available to query
        
    aliases = { "anchor" : "fragment" }, // aliases for backwards compatability

    parser = {
        strict  : /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,  //less intuitive, more accurate to the specs
        loose   :  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // more intuitive, fails on relative paths and deviates from specs
    },
        
    querystring_parser = /(?:^|&|;)([^&=;]*)=?([^&;]*)/g, // supports both ampersand and semicolon-delimted query string key/value pairs
        
    fragment_parser = /(?:^|&|;)([^&=;]*)=?([^&;]*)/g; // supports both ampersand and semicolon-delimted fragment key/value pairs
        
    function parseUri( url, strictMode )
    {
        var str = decodeURI( url ),
        res   = parser[ strictMode || false ? "strict" : "loose" ].exec( str ),
        uri = { attr : {}, param : {}, seg : {} },
        i   = 14;
                
        while ( i-- )
        {
            uri.attr[ key[i] ] = res[i] || "";
        }
                
                // build query and fragment parameters
                
        uri.param['query'] = {};
        uri.param['fragment'] = {};
                
        uri.attr['query'].replace( querystring_parser, function ( $0, $1, $2 ){
            if ($1)
            {
                uri.param['query'][$1] = $2;
            }
        });
                
        uri.attr['fragment'].replace( fragment_parser, function ( $0, $1, $2 ){
            if ($1)
            {
                uri.param['fragment'][$1] = $2;
            }
        });
                                
                // split path and fragement into segments
                
        uri.seg['path'] = uri.attr.path.replace(/^\/+|\/+$/g,'').split('/');
        
        uri.seg['fragment'] = uri.attr.fragment.replace(/^\/+|\/+$/g,'').split('/');
        
        // compile a 'base' domain attribute
        
        uri.attr['base'] = uri.attr.host ? uri.attr.protocol+"://"+uri.attr.host + (uri.attr.port ? ":"+uri.attr.port : '') : '';
        
        return uri;
    };
        
    function getAttrName( elm )
    {
        var tn = elm.tagName;
        if ( tn !== undefined ) return tag2attr[tn.toLowerCase()];
        return tn;
    }
        
    $.fn.url = function( strictMode )
    {
        var url = '';
            
        if ( this.length )
        {
            url = $(this).attr( getAttrName(this[0]) ) || '';
        }
            
        return $.url( url, strictMode );
    };
        
    $.url = function( url, strictMode )
    {
        if ( arguments.length === 1 && url === true )
        {
            strictMode = true;
            url = undefined;
        }
        
        strictMode = strictMode || false;
        url = url || window.location.toString();
                                    
        return {
            
            data : parseUri(url, strictMode),
            
            // get various attributes from the URI
            attr : function( attr )
            {
                attr = aliases[attr] || attr;
                return attr !== undefined ? this.data.attr[attr] : this.data.attr;
            },
            
            // return query string parameters
            param : function( param )
            {
                return param !== undefined ? this.data.param.query[param] : this.data.param.query;
            },
            
            // return fragment parameters
            fparam : function( param )
            {
                return param !== undefined ? this.data.param.fragment[param] : this.data.param.fragment;
            },
            
            // return path segments
            segment : function( seg )
            {
                if ( seg === undefined )
                {
                    return this.data.seg.path;                    
                }
                else
                {
                    seg = seg < 0 ? this.data.seg.path.length + seg : seg - 1; // negative segments count from the end
                    return this.data.seg.path[seg];                    
                }
            },
            
            // return fragment segments
            fsegment : function( seg )
            {
                if ( seg === undefined )
                {
                    return this.data.seg.fragment;                    
                }
                else
                {
                    seg = seg < 0 ? this.data.seg.fragment.length + seg : seg - 1; // negative segments count from the end
                    return this.data.seg.fragment[seg];                    
                }
            }
            
        };
        
    };
        
})(jQuery);


/* ==|== jQuery EasIng v1.1.2 ===============================================
   Copyright (c) 2007 George Smith
   Licensed under the MIT License:
   http://www.opensource.org/licenses/mit-license.php
   ========================================================================== */
// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.extend( jQuery.easing,
	       {
		   easeInQuad: function (x, t, b, c, d) {
                       return c*(t/=d)*t + b;
		   },
		   easeOutQuad: function (x, t, b, c, d) {
                       return -c *(t/=d)*(t-2) + b;
		   },
		   easeInOutQuad: function (x, t, b, c, d) {
                       if ((t/=d/2) < 1) return c/2*t*t + b;
                       return -c/2 * ((--t)*(t-2) - 1) + b;
		   },
		   easeInCubic: function (x, t, b, c, d) {
                       return c*(t/=d)*t*t + b;
		   },
		   easeOutCubic: function (x, t, b, c, d) {
                       return c*((t=t/d-1)*t*t + 1) + b;
		   },
		   easeInOutCubic: function (x, t, b, c, d) {
                       if ((t/=d/2) < 1) return c/2*t*t*t + b;
                       return c/2*((t-=2)*t*t + 2) + b;
		   },
		   easeInQuart: function (x, t, b, c, d) {
                       return c*(t/=d)*t*t*t + b;
		   },
		   easeOutQuart: function (x, t, b, c, d) {
                       return -c * ((t=t/d-1)*t*t*t - 1) + b;
		   },
		   easeInOutQuart: function (x, t, b, c, d) {
                       if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
                       return -c/2 * ((t-=2)*t*t*t - 2) + b;
		   },
		   easeInQuint: function (x, t, b, c, d) {
                       return c*(t/=d)*t*t*t*t + b;
		   },
		   easeOutQuint: function (x, t, b, c, d) {
                       return c*((t=t/d-1)*t*t*t*t + 1) + b;
		   },
		   easeInOutQuint: function (x, t, b, c, d) {
                       if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
                       return c/2*((t-=2)*t*t*t*t + 2) + b;
		   },
		   easeInSine: function (x, t, b, c, d) {
                       return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		   },
		   easeOutSine: function (x, t, b, c, d) {
                       return c * Math.sin(t/d * (Math.PI/2)) + b;
		   },
		   easeInOutSine: function (x, t, b, c, d) {
                       return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		   },
		   easeInExpo: function (x, t, b, c, d) {
                       return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
		   },
		   easeOutExpo: function (x, t, b, c, d) {
                       return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		   },
		   easeInOutExpo: function (x, t, b, c, d) {
                       if (t==0) return b;
                       if (t==d) return b+c;
                       if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
                       return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
		   },
		   easeInCirc: function (x, t, b, c, d) {
                       return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
		   },
		   easeOutCirc: function (x, t, b, c, d) {
                       return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		   },
		   easeInOutCirc: function (x, t, b, c, d) {
                       if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
                       return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
		   },
		   easeInElastic: function (x, t, b, c, d) {
                       var s=1.70158;var p=0;var a=c;
                       if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
                       if (a < Math.abs(c)) { a=c; var s=p/4; }
                       else var s = p/(2*Math.PI) * Math.asin (c/a);
                       return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		   },
		   easeOutElastic: function (x, t, b, c, d) {
                       var s=1.70158;var p=0;var a=c;
                       if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
                       if (a < Math.abs(c)) { a=c; var s=p/4; }
                       else var s = p/(2*Math.PI) * Math.asin (c/a);
                       return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
		   },
		   easeInOutElastic: function (x, t, b, c, d) {
                       var s=1.70158;var p=0;var a=c;
                       if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
                       if (a < Math.abs(c)) { a=c; var s=p/4; }
                       else var s = p/(2*Math.PI) * Math.asin (c/a);
                       if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
                       return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		   },
		   easeInBack: function (x, t, b, c, d, s) {
                       if (s == undefined) s = 1.70158;
                       return c*(t/=d)*t*((s+1)*t - s) + b;
		   },
		   easeOutBack: function (x, t, b, c, d, s) {
                       if (s == undefined) s = 1.70158;
                       return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		   },
		   easeInOutBack: function (x, t, b, c, d, s) {
                       if (s == undefined) s = 1.70158; 
                       if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
                       return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		   },
		   easeInBounce: function (x, t, b, c, d) {
                       return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
		   },
		   easeOutBounce: function (x, t, b, c, d) {
                       if ((t/=d) < (1/2.75)) {
                           return c*(7.5625*t*t) + b;
                       } else if (t < (2/2.75)) {
                           return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
                       } else if (t < (2.5/2.75)) {
                           return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
                       } else {
                           return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
                       }
		   },
		   easeInOutBounce: function (x, t, b, c, d) {
                       if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
                       return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
		   }
	       });


/* ==|== UItoTop jQuery Plugin 1.1 ==========================================
   http://www.mattvarone.com/web-design/uitotop-jquery-plugin/
   ========================================================================== */
(function($){
    $.fn.UItoTop = function(options) {

        var defaults = {
            text: 'To Top',
            min: 200,
            inDelay:600,
            outDelay:400,
            containerID: 'toTop',
            containerHoverID: 'toTopHover',
            scrollSpeed: 1200,
            easingType: 'linear'
        };

        var settings = $.extend(defaults, options);
        var containerIDhash = '#' + settings.containerID;
        var containerHoverIDHash = '#'+settings.containerHoverID;
                
        $('body').append('<a href="#" id="'+settings.containerID+'">'+settings.text+'</a>');
        $(containerIDhash).hide().click(function(){
            $('html, body').animate({scrollTop:0}, settings.scrollSpeed, settings.easingType);
            $('#'+settings.containerHoverID, this).stop().animate({'opacity': 0 }, settings.inDelay, settings.easingType);
            return false;
        })
            .prepend('<span id="'+settings.containerHoverID+'"></span>')
            .hover(function() {
                $(containerHoverIDHash, this).stop().animate({
                    'opacity': 1
                }, 600, 'linear');
            }, function() { 
                $(containerHoverIDHash, this).stop().animate({
                    'opacity': 0
                }, 700, 'linear');
            });
                                        
        $(window).scroll(function() {
            var sd = $(window).scrollTop();
            if(typeof document.body.style.maxHeight === "undefined") {
                $(containerIDhash).css({
                    'position': 'absolute',
                    'top': $(window).scrollTop() + $(window).height() - 50
                });
            }
            if ( sd > settings.min ) 
                $(containerIDhash).fadeIn(settings.inDelay);
                        else 
                            $(containerIDhash).fadeOut(settings.Outdelay);
        });

    };
})(jQuery);


/* ==|== jShowOff: a jQuery Content Rotator Plugin v0.1.2 ===================
   Erik Kallevig
   http://ekallevig.com/jshowoff
   Dual licensed under the MIT and GPL licenses.
   ========================================================================== */
(function($){$.fn.jshowoff=function(settings){var config={animatePause:true,autoPlay:true,changeSpeed:600,controls:true,controlText:{play:'Play',pause:'Pause',next:'Next',previous:'Previous'},effect:'fade',hoverPause:true,links:true,speed:3000};if(settings)$.extend(true,config,settings);if(config.speed<(config.changeSpeed+20)){alert('jShowOff: Make speed at least 20ms longer than changeSpeed; the fades aren\'t always right on time.');return this;};this.each(function(i){var $cont=$(this);var gallery=$(this).children().remove();var timer='';var counter=0;var preloadedImg=[];var howManyInstances=$('.jshowoff').length+1;var uniqueClass='jshowoff-'+howManyInstances;var cssClass=config.cssClass!=undefined?config.cssClass:'';$cont.css('position','relative').wrap('<div class="jshowoff '+uniqueClass+'" />');var $wrap=$('.'+uniqueClass);$wrap.css('position','relative').addClass(cssClass);$(gallery[0]).clone().appendTo($cont);preloadImg();if(config.controls){addControls();if(config.autoPlay==false){$('.'+uniqueClass+'-play').addClass(uniqueClass+'-paused jshowoff-paused').text(config.controlText.play);};};if(config.links){addSlideLinks();$('.'+uniqueClass+'-slidelinks a').eq(0).addClass(uniqueClass+'-active jshowoff-active');};if(config.hoverPause){$cont.hover(function(){if(isPlaying())pause('hover');},function(){if(isPlaying())play('hover');});};if(config.autoPlay&&gallery.length>1){timer=setInterval(function(){play();},config.speed);};if(gallery.length<1){$('.'+uniqueClass).append('<p>For jShowOff to work, the container element must have child elements.</p>');};function transitionTo(gallery,index){var oldCounter=counter;if((counter>=gallery.length)||(index>=gallery.length)){counter=0;var e2b=true;}
else if((counter<0)||(index<0)){counter=gallery.length-1;var b2e=true;}
else{counter=index;}
if(config.effect=='slideLeft'){var newSlideDir,oldSlideDir;function slideDir(dir){newSlideDir=dir=='right'?'left':'right';oldSlideDir=dir=='left'?'left':'right';};counter>=oldCounter?slideDir('left'):slideDir('right');$(gallery[counter]).clone().appendTo($cont).slideIt({direction:newSlideDir,changeSpeed:config.changeSpeed});if($cont.children().length>1){$cont.children().eq(0).css('position','absolute').slideIt({direction:oldSlideDir,showHide:'hide',changeSpeed:config.changeSpeed},function(){$(this).remove();});};}else if(config.effect=='fade'){$(gallery[counter]).clone().appendTo($cont).hide().fadeIn(config.changeSpeed,function(){if($.browser.msie)this.style.removeAttribute('filter');});if($cont.children().length>1){$cont.children().eq(0).css('position','absolute').fadeOut(config.changeSpeed,function(){$(this).remove();});};}else if(config.effect=='none'){$(gallery[counter]).clone().appendTo($cont);if($cont.children().length>1){$cont.children().eq(0).css('position','absolute').remove();};};if(config.links){$('.'+uniqueClass+'-active').removeClass(uniqueClass+'-active jshowoff-active');$('.'+uniqueClass+'-slidelinks a').eq(counter).addClass(uniqueClass+'-active jshowoff-active');};};function isPlaying(){return $('.'+uniqueClass+'-play').hasClass('jshowoff-paused')?false:true;};function play(src){if(!isBusy()){counter++;transitionTo(gallery,counter);if(src=='hover'||!isPlaying()){timer=setInterval(function(){play();},config.speed);}
if(!isPlaying()){$('.'+uniqueClass+'-play').text(config.controlText.pause).removeClass('jshowoff-paused '+uniqueClass+'-paused');}};};function pause(src){clearInterval(timer);if(!src||src=='playBtn')$('.'+uniqueClass+'-play').text(config.controlText.play).addClass('jshowoff-paused '+uniqueClass+'-paused');if(config.animatePause&&src=='playBtn'){$('<p class="'+uniqueClass+'-pausetext jshowoff-pausetext">'+config.controlText.pause+'</p>').css({fontSize:'62%',textAlign:'center',position:'absolute',top:'40%',lineHeight:'100%',width:'100%'}).appendTo($wrap).addClass(uniqueClass+'pauseText').animate({fontSize:'600%',top:'30%',opacity:0},{duration:500,complete:function(){$(this).remove();}});}};function next(){goToAndPause(counter+1);};function previous(){goToAndPause(counter-1);};function isBusy(){return $cont.children().length>1?true:false;};function goToAndPause(index){$cont.children().stop(true,true);if((counter!=index)||((counter==index)&&isBusy())){if(isBusy())$cont.children().eq(0).remove();transitionTo(gallery,index);pause();};};function preloadImg(){$(gallery).each(function(i){$(this).find('img').each(function(i){preloadedImg[i]=$('<img>').attr('src',$(this).attr('src'));});});};function addControls(){$wrap.append('<p class="jshowoff-controls '+uniqueClass+'-controls"><a class="jshowoff-play '+uniqueClass+'-play" href="#null">'+config.controlText.pause+'</a> <a class="jshowoff-prev '+uniqueClass+'-prev" href="#null">'+config.controlText.previous+'</a> <a class="jshowoff-next '+uniqueClass+'-next" href="#null">'+config.controlText.next+'</a></p>');$('.'+uniqueClass+'-controls a').each(function(){if($(this).hasClass('jshowoff-play'))$(this).click(function(){isPlaying()?pause('playBtn'):play();return false;});if($(this).hasClass('jshowoff-prev'))$(this).click(function(){previous();return false;});if($(this).hasClass('jshowoff-next'))$(this).click(function(){next();return false;});});};function addSlideLinks(){$wrap.append('<p class="jshowoff-slidelinks '+uniqueClass+'-slidelinks"></p>');$.each(gallery,function(i,val){var linktext=$(this).attr('title')!=''?$(this).attr('title'):i+1;$('<a class="jshowoff-slidelink-'+i+' '+uniqueClass+'-slidelink-'+i+'" href="#null">'+linktext+'</a>').bind('click',{index:i},function(e){goToAndPause(e.data.index);return false;}).appendTo('.'+uniqueClass+'-slidelinks');});};});return this;};})(jQuery);(function($){$.fn.slideIt=function(settings,callback){var config={direction:'left',showHide:'show',changeSpeed:600};if(settings)$.extend(config,settings);this.each(function(i){$(this).css({left:'auto',right:'auto',top:'auto',bottom:'auto'});var measurement=(config.direction=='left')||(config.direction=='right')?$(this).outerWidth():$(this).outerHeight();var startStyle={};startStyle['position']=$(this).css('position')=='static'?'relative':$(this).css('position');startStyle[config.direction]=(config.showHide=='show')?'-'+measurement+'px':0;var endStyle={};endStyle[config.direction]=config.showHide=='show'?0:'-'+measurement+'px';$(this).css(startStyle).animate(endStyle,config.changeSpeed,callback);});return this;};})(jQuery);
