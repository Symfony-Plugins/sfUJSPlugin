/* Modified version of John Resig's testing framework for jQuery 
 * See original version at http://dev.jquery.com/browser/trunk/jquery/build/test/data/testrunner.js
 * Details on use available at http://dev.jquery.com/wiki/DevelopersGuide
 */

var _config = {
	fixture: null,
	Test: [],
	stats: {
		all: 0,
		bad: 0
	},
	queue: [],
	blocking: true,
	timeout: null,
	expected: null,
	currentModule: null,
	asyncTimeout: 2 // seconds for async timeout
};

/*
$(function() {
	$('#userAgent').html(navigator.userAgent);
	if($.browser.safari)
		$("h1").append("&nbsp;- Disabled for Safari");
	else
		runTest();	
});
*/

function synchronize(callback) {
	_config.queue[_config.queue.length] = callback;
	if(!_config.blocking) {
		process();
	}
}

function process() {
	while(_config.queue.length && !_config.blocking) {
		var call = _config.queue[0];
		_config.queue = _config.queue.slice(1);
		call();
	}
}

function stop(allowFailure) {
	_config.blocking = true;
	var handler = allowFailure ? start : function() {
		ok( false, "Test timed out" );
		start();
	};
	_config.timeout = setTimeout(handler, _config.asyncTimeout * 1000);
}
function start() {
	if(_config.timeout)
		clearTimeout(_config.timeout);
	_config.blocking = false;
	process();
}

function runTest() {
	_config.blocking = false;
	var time = new Date();
	_config.fixture = document.getElementById('main').innerHTML;
	synchronize(function() {
		time = new Date() - time;
		$("<div>").html(['<p class="result">Tests completed in ',
			time, ' milliseconds.<br/>',
			_config.stats.bad, ' tests of ', _config.stats.all, ' failed.</p>']
			.join(''))
			.appendTo("body");
		$("#banner").addClass(_config.stats.bad ? "fail" : "pass");
	});
}

function test(name, callback, nowait) {
	// safari seems to have some memory problems, so we need to slow it down
	if($.browser.safari && !nowait) {
		test("", function() {
			stop();
			setTimeout(start, 250);
		}, true);
	}

	if(_config.currentModule)
		name = _config.currentModule + " module: " + name;
		
	synchronize(function() {
		_config.Test = [];
		try {
			callback();
		} catch(e) {
			if( typeof console != "undefined" && console.error && console.warn ) {
				console.error("Test " + name + " died, exception and test follows");
				console.error(e);
				console.warn(callback.toString());
			}
			_config.Test.push( [ false, "Died on test #" + (_config.Test.length+1) + ": " + e ] );
		}
	});
	synchronize(function() {
		reset();
		
		// don't output pause tests
		if(nowait) return;
		
		if(_config.expected && _config.expected != _config.Test.length) {
			_config.Test.push( [ false, "Expected " + _config.expected + " assertions, but " + _config.Test.length + " were run" ] );
		}
		_config.expected = null;
		
		var good = 0, bad = 0;
		var ol = document.createElement("ol");
		ol.style.display = "none";
		var li = "", state = "pass";
		for ( var i = 0; i < _config.Test.length; i++ ) {
			var li = document.createElement("li");
			li.className = _config.Test[i][0] ? "pass" : "fail";
			li.innerHTML = _config.Test[i][1];
			ol.appendChild( li );
			
			_config.stats.all++;
			if ( !_config.Test[i][0] ) {
				state = "fail";
				bad++;
				_config.stats.bad++;
			} else good++;
		}
	
		var li = document.createElement("li");
		li.className = state;
	
		var b = document.createElement("b");
		b.innerHTML = name + " <b style='color:black;'>(<b class='fail'>" + bad + "</b>, <b class='pass'>" + good + "</b>, " + _config.Test.length + ")</b>";
		b.onclick = function(){
			var n = this.nextSibling;
			if ( jQuery.css( n, "display" ) == "none" )
				n.style.display = "block";
			else
				n.style.display = "none";
		};
		li.appendChild( b );
		li.appendChild( ol );
	
		document.getElementById("tests").appendChild( li );		
	});
}

// call on start of module test to prepend name to all tests
function module(moduleName) {
	_config.currentModule = moduleName;
}

/**
 * Specify the number of expected assertions to gurantee that failed test (no assertions are run at all) don't slip through.
 */
function expect(asserts) {
	_config.expected = asserts;
}

/**
 * Resets the test setup. Useful for tests that modify the DOM.
 */
function reset() {
	document.getElementById('main').innerHTML = _config.fixture;
}

/**
 * Asserts true.
 * @example ok( $("a").size() > 5, "There must be at least 5 anchors" );
 */
function ok(a, msg) {
	_config.Test.push( [ !!a, msg ] );
}

/**
 * Asserts that two arrays are the same
 */
function is_deeply(a, b, msg) {
	var ret = true;
	if ( a && b && a.length != undefined && a.length == b.length ) {
		for ( var i = 0; i < a.length; i++ )
			if ( a[i] != b[i] )
				ret = false;
	} else
		ret = false;
	if ( !ret )
		_config.Test.push( [ ret, msg + "<br/>&nbsp;&nbsp;&nbsp;expected: " + serialArray(b) + "<br/>&nbsp;&nbsp;&nbsp;result: " + serialArray(a) ] );
	else 
		_config.Test.push( [ ret, msg ] );
}

/**
 * Asserts that two objects are equivalent
 */
function isObj(a, b, msg) {
	var ret = true;
	
	if ( a && b ) {
		for ( var i in a )
			if ( a[i] != b[i] )
				ret = false;

		for ( i in b )
			if ( a[i] != b[i] )
				ret = false;
	} else
		ret = false;

    _config.Test.push( [ ret, msg ] );
}

function serialArray( a ) {
	var r = [];
	
	if ( a && a.length )
        for ( var i = 0; i < a.length; i++ ) {
            var str = a[i].nodeName;
            if ( str ) {
                str = str.toLowerCase();
                if ( a[i].id )
                    str += "#" + a[i].id;
            } else
                str = a[i];
            r.push( str );
        }

	return "[ " + r.join(", ") + " ]"
}

/**
 * Returns an array of elements with the given IDs, eg.
 * @example q("main", "foo", "bar")
 * @result [<div id="main">, <span id="foo">, <input id="bar">]
 */
function q() {
	var r = [];
	for ( var i = 0; i < arguments.length; i++ )
		r.push( document.getElementById( arguments[i] ) );
	return r;
}

/**
 * Asserts that a select matches the given IDs
 * @example t("Check for something", "//[a]", ["foo", "baar"]);
 * @result returns true if "//[a]" return two elements with the IDs 'foo' and 'baar'
 */
function element_found( sel, res, msg)
{
	var f = jQuery(sel);
	var s = "";
	for ( var i = 0; i < f.length; i++ )
		s += (s && ",") + '"' + f[i].id + '"';
	is_deeply(f, q.apply(q, res), msg + " (" + sel + ")");
}

/**
 * Add random number to url to stop IE from caching
 *
 * @example url("data/test.html")
 * @result "data/test.html?10538358428943"
 *
 * @example url("data/test.php?foo=bar")
 * @result "data/test.php?foo=bar&10538358345554"
 */
function url(value) {
	return value + (/\?/.test(value) ? "&" : "?") + new Date().getTime() + "" + parseInt(Math.random()*100000);
}

/**
 * Checks that the first two arguments are equal, with an optional message.
 * Prints out both expected and actual values on failure.
 *
 * Prefered to ok( expected == actual, message )
 *
 * @example is( "Expected 2 characters.", v.formatMessage("Expected {0} characters.", 2) );
 *
 * @param Object actual
 * @param Object expected
 * @param String message (optional)
 */
function is(actual, expected, message) {
	var result = expected == actual;
	message = message || (result ? "okay" : "failed");
	_config.Test.push( [ result, result ? message : message + "<br/>&nbsp;&nbsp;&nbsp;expected: " + expected + "<br/>&nbsp;&nbsp;&nbsp;actual: " + actual ] );
}

/**
 * Checks that the first two arguments are not equal, with an optional message.
 * Prints out expected value on failure.
 *
 * Prefered to ok( expected != actual, message )
 *
 * @example isnt( "Expected 3 characters.", v.formatMessage("Expected {0} characters.", 2) );
 *
 * @param Object actual
 * @param Object expected
 * @param String message (optional)
 */
function isnt(actual, expected, message) {
	var result = expected != actual;
	message = message || (result ? "okay" : "failed");
	_config.Test.push( [ result, result ? message : message + "<br/>&nbsp;&nbsp;&nbsp;both arguments are: " + expected ] );
}

/**
 * Trigger an event on an element.
 *
 * @example triggerEvent( document.body, "click" );
 *
 * @param DOMElement elem
 * @param String type
 */
function triggerEvent( elem, type, event ) {
	if ( jQuery.browser.mozilla || jQuery.browser.opera ) {
		event = document.createEvent("MouseEvents");
		event.initMouseEvent(type, true, true, elem.ownerDocument.defaultView,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		elem.dispatchEvent( event );
	} else if ( jQuery.browser.msie ) {
		elem.fireEvent("on"+type);
	}
}

function isArray(a)
{
  return isObject(a) && a.constructor == Array;
}

function isObject(a)
{
  return (typeof a == 'object' && !!a) || isFunction(a);
}

function isFunction(a)
{
  return typeof a == 'function';
}

function isEmpty(o)
{
  if (isObject(o))
  {
    for (var i in o)
    {
      return false;
    }
  }
  return true;
}

function isString(a) 
{
  if (typeof a == 'string')
  {
    return true;
  }
  else if (!a)
  {
    return false;
  }
  else if ((typeof a == 'object') && a.toLowerCase) 
  {
    return true;
  }
  return false;
}