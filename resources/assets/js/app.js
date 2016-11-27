/**!
 * Yankee Blood Band JS
 */

//libs
var jQuery = window.jQuery = require("jquery");
var modernizr = window.Modernizr = require("browsernizr");

//throttle and debounce
var throttle = require('throttle-debounce/throttle');
var debounce = require('throttle-debounce/debounce');

//fitvids
var fitVids = require("fitvids");
var Instafeed = require("instafeed.js");

//additionall
var fresco = require("./modules/fresco");
var fresco_plugins = require("./modules/plugins");

//local
(function($, window, undefinded){

	//globals
	var ybb ={},
		header = $("header"),
		headerContainer = $('#container'),
		headerContainerHeight = ( headerContainer.outerHeight() - header.outerHeight() );

	//Scroll to container function
	ybb.scrollTo = function(e){
		e.preventDefault();

		var offset = header.outerHeight();

		if($('html').hasClass('nav')){
			$('html').removeClass('nav');
			offset = 0;
		}

		var hash = $(this).attr("href");

		var position = ( hash !== '#' ) ? $(hash).offset().top - offset : 0;

		return $("html, body").animate({
			scrollTop: position
		}, 800);
	}

	ybb.sizeEl = function(){
		headerContainerHeight = ( headerContainer.outerHeight() - header.outerHeight() );
	};

	//Fixed Navigation on scroll
	ybb.fixie = function(){
		$(window).scrollTop() >= headerContainerHeight ? header.addClass("floatable") : $("header").removeClass("floatable");
	};

	//init - called on doc ready
	ybb.init = function(){
		//mobile nav toggle
		$('#mobile-nav').click(ybb.nav);

		//scroll links
		$("nav a.scroll-to, .scrolltop").click(ybb.scrollTo);

		//fitvids
    	fitVids("#videos");
	}

	//mobile nav
	ybb.nav = function(){
		$('html').toggleClass('nav');
	}

	$(document)
		.ready(ybb.init)
		.ready(ybb.fixie)
        .ready(ybb.getInstagrams);

	$(window)
		.scroll( throttle( 50, ybb.fixie ) )
		.resize( throttle( 200, ybb.fixie ) )
		.resize( ybb.sizeEl );

})(jQuery, window);

/**
 * Instagram Feed
 */
var feed = new Instafeed({
    userId: 2000806203,
    get: 'user',
    clientId: 'c3d07e10164c4dd1a7d5ea028083fd34',
    accessToken: '2000806203.1677ed0.084a28d80a694649b48fa67773ebf371',
    limit: 12,
    resolution: 'low_resolution'
});

feed.run();
