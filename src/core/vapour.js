/*
 * @title WET-BOEW Vapour loader
 * @overview Helper methods for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
/*
 * Vapour Object that will store tombstone data for plugins to leverage
 */
(function( $, window, document, undef ) {
"use strict";

/*
 * @method getUrlParts
 * @params: {String} of URL to examine
 * @return {Object} of the parts of passed URL
 */
var getUrlParts = function( url ) {
		var a = document.createElement( "a" );
		a.href = url;
		return {
			href: a.href,
			absolute: a.href,
			host: a.host,
			hostname: a.hostname,
			port: a.port,
			pathname: a.pathname,
			protocol: a.protocol,
			hash: a.hash,
			search: a.search,

			// A collection of the parameters of the query string part of the URL.
			params: (function() {
				var key, strings, segment, _i,	_len,
					results = {};
				segment = a.search.replace( /^\?/, "" ).split( "&" );
				_len = segment.length;
				for ( _i = 0; _i !== _len; _i += 1 ) {
					key = segment[ _i ];
					if ( key ) {
						strings = key.split( "=" );
						results[ strings[ 0 ] ] = strings[ 1 ];
					}
				}
				return results;
			}())
		};
	},

	/*
	 * @variable $src
	 * @return {jQuery Element} of vapour script element
	 */
	$src = $( "script[src$='vapour.js'],script[src$='vapour.min.js']" )
		.last(),

	/*
	 * @variable i18n
	 * @return {string} of HTML document language
	 */
	lang = document.documentElement.lang,

	/*
	 * @variable $homepath
	 * @return {string} of version current path to JS directory
	 */
	$homepath = $src.prop( "src" )
		.split( "?" )[ 0 ].split( "/" )
		.slice( 0, -1 )
		.join( "/" ),

	/*
	 * @variable $homecss
	 * @return {string} of version current path to CSS directory
	 */
	$homecss = $homepath.substring( 0, $homepath.length - 2 ) + "css",

	/*
	 * @variable $mode
	 * @return {string} of version of JS [development or production]
	 */
	$mode = $src.prop( "src" )
		.indexOf( ".min" ) < 0 ? "" : ".min",

	/*
	 * @variable oldie
	 * @return {integer} of IE version
	 */
	oldie = (function() {
		var undef,
			v = 3,
			div = document.createElement( "div" ),
			all = div.getElementsByTagName( "i" );

		while (
			div.innerHTML = "<!--[if gt IE " + ( ++v ) + "]><i></i><![endif]-->",
			all[ 0 ]
		){}

		return v > 4 ? v : undef;
	}()),

	/*
	 * @variable currentpage
	 * @return {Object} of parts of the current page URL
	 */
	currentpage = getUrlParts( window.location.href ),

	/*
	 * @variable disabled
	 * @return {boolean} of state of disabled flag
	 */
	disabled = (function() {
		var disabled = currentpage.params.wbdisable;

		if ( disabled === undefined && localStorage && localStorage.getItem( "wbdisable" ) ) {
			disabled = localStorage.getItem( "wbdisable" );
		}
		return ( typeof disabled === "string" ) ? ( disabled.toLowerCase() === "true" ) : Boolean( disabled );
	}()),

	/*-----------------------------
	 * Vapour Core Object
	 *-----------------------------*/
	vapour = {
		"/": $homepath,
		"/assets": "" + $homepath + "/assets",
		"/templates": "" + $homepath + "/assets/templates",
		"/deps": "" + $homepath + "/deps",
		mode: $mode,
		doc: $( document ),
		win: $( window ),
		html: $( "html" ),
		sDisabled: "#wb-tphp",
		pageUrlParts: currentpage,
		getUrlParts: getUrlParts,
		isDisabled : disabled,

		getPath: function( property ) {
			return this.hasOwnProperty( property ) ? this[ property ] : undef;
		},

		getMode: function() {
			return this.mode;
		},

		// Lets load some variables into vapour for IE detection
		other:  !oldie,
		desktop: ( window.orientation === undefined ),
		ie:     !!oldie,
		ie6:    ( oldie === 6 ),
		ie7:    ( oldie === 7 ),
		ie8:    ( oldie === 8 ),
		ie9:    ( oldie === 9 ),
		ielt7:  ( oldie < 7 ),
		ielt8:  ( oldie < 8 ),
		ielt9:  ( oldie < 9 ),
		ielt10: ( oldie < 10 )
	},

	i18n = function( key, state, mixin ) {
		var truthiness,
			ind = window.i18nObj;

		truthiness = ( typeof key === "string" && key !== "" ) | // eg. 000 or 001 ie. 0 or 1
		( typeof state === "string" && state !== "" ) << 1 | // eg. 000 or 010 ie. 0 or 2
		( typeof mixin === "string" && mixin !== "" ) << 2; // eg. 000 or 100 ie. 0 or 4

		switch ( truthiness ) {
			case 1:
				// only key was provided
				return ind[ key ];
			case 3:
				// key and state were provided
				return ind[ key ][ state ];
			case 7:
				// key, state, and mixin were provided
				return ind[ key ][ state ].replace( "[MIXIN]", mixin );
			default:
				return "";
		}
	};

window.i18n = i18n;
window.vapour = vapour;

/*-----------------------------
 * Yepnope Prefixes
 *-----------------------------*/
/*
 * Establish the base path to be more flexible in terms of WCMS where JS can reside in theme folders and not in the root of sites
 * @TODO: For modularity the prefixes where written independently as we are flushing out some use cases on better grouping and optimization of polyfills.
 * Once this more hashed out, we could optimize the prefixes down to one or two prefixes "site" and "disabled" to thin out the codeblock a bit more
 * increase performance due to redundant chaining of the prefixes.
 */

/*
 * @prefix: site! - adds the root js directory of yepnope resources
 */
yepnope.addPrefix( "site", function( resourceObj ) {
	resourceObj.url = $homepath + "/" + resourceObj.url;
	return resourceObj;
});

/*
 * @prefix: plyfll! - builds the path for the polyfill resource
 */
yepnope.addPrefix( "plyfll", function( resourceObj ) {
	var path;

	if ( disabled ) {
		resourceObj.bypass = true;
	} else if ( !$mode ) {
		resourceObj.url = resourceObj.url.replace( ".min", "" );
	}

	if ( resourceObj.url.indexOf( ".css" ) !== -1 ) {
		resourceObj.forceCSS = true;
		path = $homecss;
	} else {
		path = $homepath;
	}
	resourceObj.url = path + "/polyfills/" + resourceObj.url;

	return resourceObj;
});

/*
 * @prefix: i18n! - adds the correct document language for our i18n library
 */
yepnope.addPrefix( "i18n", function( resourceObj ) {
	resourceObj.url = $homepath + "/" + resourceObj.url + lang + $mode + ".js";
	return resourceObj;
});

/*-----------------------------
 * Base Timer
 *-----------------------------*/
window._timer = {
	_elms: [],

	add: function( _selector ) {

		// lets ensure we are not running if things are disabled
		if ( vapour.isDisabled && _selector !== vapour.sDisabled ) {
			return 0;
		}

		var _obj = vapour.doc.find( _selector );
		if ( _obj.length > 0 ) {
			this._elms.push( _obj );
		}
	},

	remove: function( _selector ) {
		var elms = this._elms,
			len = elms.length,
			$elm, i;
		for ( i = 0; i !== len; i += 1 ) {
			$elm = elms[ i ];
			if ( $elm && $elm.selector === _selector ) {
				this._elms.splice( i, 1 );
				break;
			}
		}
	},

	start: function() {

		/* Lets start our clock right away. We we need to test to ensure that there will not be any
		 * instances on Mobile were the DOM is not ready before the timer starts. That is why 0.5 seconds
		 * was used a buffer.
		 */
		window._timer.touch();

		// lets keep it ticking after
		setInterval(function() {
			window._timer.touch();
		}, 500 );

	},

	touch: function() {

		var elms = this._elms,
			len = elms.length,
			$elm, i;
		for ( i = 0; i !== len; i += 1 ) {
			$elm = elms[ i ];
			if ( $elm ) {
				$elm.trigger( "timerpoke.wb" );
			}
		}

	}
};

/*-----------------------------
 * Modernizr Polyfill Loading
 *-----------------------------*/
Modernizr.load([
	{
		test: Modernizr.details,
		nope: [
			"plyfll!details.min.js",
			"plyfll!details.min.css"
		]
	}, {
		test: Modernizr.input.list,
		nope: [
			"plyfll!datalist.min.js",
			"plyfll!datalist.min.css"
		]
	}, {
		test: Modernizr.inputtypes.date,
		nope: [
			"plyfll!datepicker.min.js",
			"plyfll!datepicker.min.css"
		]
	}, {
		test: Modernizr.inputtypes.range,
		nope: [
			"plyfll!slider.min.js",
			"plyfll!slider.min.css"
		]
	}, {
		test: Modernizr.progress,
		nope: [
			"plyfll!progress.min.js",
			"plyfll!progress.min.css"
		]
	}, {
		test: Modernizr.meter,
		nope: [
			"plyfll!meter.min.js",
			"plyfll!meter.min.css"
		]
	}, {
		test: Modernizr.touch,
		yep: "plyfll!mobile.min.js",
	/* TODO: Determine if this should be kept or not
	 * Commented out for now to make it easy for people to enable it and to test it.
	 * Will be deleted outright if decision is to not keep it.
	}, {
		test: vapour.ie && vapour.desktop,
		yep: "plyfll!jawsariafixes.min.js",
	*/
	}, {
		load: "i18n!i18n/",
		complete: function() {
			window._timer.start();
		}
	}
]);

})( jQuery, window, document );