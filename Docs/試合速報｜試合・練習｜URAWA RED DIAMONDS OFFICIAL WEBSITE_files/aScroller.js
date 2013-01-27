/* * aScroller js *  * Copyright (C) 2005-2006 * by Davide S. Casali * www.digitalhymn.com
 *
 * Last release: 2005-11-27
 *
 * Released under CC by-nc-sa 2.5
 * http://creativecommons.org/licenses/by-nc-sa/2.5/ *
 */

/*
 * This is a simple JavaScript vertical scroller that is crossbrowser and also validates
 * as XHTML Strict.
 *
 * Usage:
 * (1) Define a <div> tag with a specified ID, containing the scrolling text. One <div> for each line.
 * (2) Define an INLINE CSS width and height (important, MUST be inline)
 * (3) Execute the divScroller function, passing id, mode (h or v),  speed (higher number means
 *     slower) and delay (in ms).
 * */

/****************************************************************************************************
 * Cross browser getElementByID.
 * From: www.quirksmode.org
 *
 * @param	id
 */
function getObj(name)
{
	if (document.getElementById)
	{
		this.obj = document.getElementById(name);
		this.style = document.getElementById(name).style;
	}
	else if (document.all)
	{
		this.obj = document.all[name];
		this.style = document.all[name].style;
	}
	else if (document.layers)
	{
		this.obj = document.layers[name];
		this.style = document.layers[name];
	}
}

/****************************************************************************************************
 * Enables the scrolling for the specified div (matching id).
 *
 * @param	string id of the tag
 * @param	speed
 * @param	delay
 */
function divScroller(id, direction, speed, delay)
{
	if (document.getElementById)
	{
		// DOM3 = IE5+, NS6+, FF0.7+
		// *** Scroller
		var scroller = new getObj(id);
		
		// *** Debug force vars
		//scroller.style.height = "30px";
		//scroller.style.backgroundColor = "#FFEEEE";
		
		// *** Computed Styles
		//alert(scroller.obj.currentStyle.height);
		/*if (!scroller.style.height)
			if (scroller.obj.currentStyle)
				scroller.style.height = scroller.obj.currentStyle.height;
			else
				scroller.style.height = document.defaultView.getComputedStyle(scroller.obj, null).getPropertyValue("height");*/
		
		// *** Needed vars
		scroller.style.position = "relative";
		scroller.style.overflow = "hidden";
		
		// *** Generate scrolling inner <div>
		scroller.obj.innerHTML = "<div id=\"" + id + "_inner\">" + scroller.obj.innerHTML + "</div>";
		
		// *** Inner
		var inner = new getObj(id + "_inner");
		inner.style.position = "absolute";
		inner.style.left = parseInt(scroller.style.width) + "px";
		inner.style.top = parseInt(scroller.style.height) + "px";
		
		// *** Apply sub-styles
		//divScrollItemsStyler(id, direction);
		
		// *** Worker
		if (direction == "h" || direction == "horizontal")
		{
			// ****** HORIZONTAL
			// MouseOver: pauses the ticker
			scroller.obj.onmouseover = function() { divScroll_onMouseOver(id); };
			scroller.obj.onmouseout = function() { divScroll_onMouseOut(id); };
			
			// Create a temp element to evaluate the size (awful, but no better way to do this)
			fxpatch = navigator.userAgent.indexOf("Firefox") > -1 ? " left: -9000px;" : ""; // Firefox different CSS (on every other browser since IE5+ isn't needed)
			spanContent = "<span id=\"" + id + "_widthEval\" style=\"visibility: hidden; position: absolute; top: -100px; left: -1px; z-index: -10; white-space: nowrap;" + fxpatch + "\"><nobr>" + inner.obj.innerHTML + "</nobr></span>";
			if (document.createElement)
			{
				var span = document.createElement('span');
				span.innerHTML = spanContent;
				scroller.obj.appendChild(span);
			}
			else
			{
				document.write(spanContent);
			}
			var widthEval = new getObj(id + "_widthEval");
			
			// Setup the scrolling inner drawer
			inner.style.top = "0px";
			inner.style.whiteSpace = "nowrap";
			inner.style.width = widthEval.obj.offsetWidth + "px";
			limit = parseInt(inner.style.width);
			
			// Execute
			setTimeout("divScrollHelperH(\"" + id + "\", " + limit + ", " + speed + ", " + delay + ")", parseInt(speed));
		}
		else if (direction == "v" || direction == "vertical")
		{
			// ****** VERTICAL
			// Setup the scrolling inner drawer
			inner.style.left = "0px";
			inner.style.width = parseInt(scroller.style.width) + "px";
			limit = inner.obj.getElementsByTagName('div').length * parseInt(scroller.style.height);
			
			// Execute
			setTimeout("divScrollHelperV(\"" + id + "\", " + limit + ", " + speed + ", " + delay + ")", parseInt(speed));
		}
	}
}

/****************************************************************************************************
 * Helper for the HORIZONTAL scrolling for the specified div (matching id).
 * This is the real "ticker" function, executed to move the div.
 *
 * @param	string id of the tag
 * @param	pre-calculated height limit (to speed up execution)
 * @param	speed
 * @param	delay
 */
function divScrollHelperH(id, limit, speed, delay)
{
	if (document.getElementById)
	{
		// DOM3 = IE5+, NS6+, FF0.7+
		var scroller = new getObj(id);
		var inner = new getObj(id + "_inner");
		
		// *** Tick duration
		nextTick = speed;
		
		// *** Avoiding some errors
		if (!inner.style.left) inner.style.left = "0px";
		
		// *** Moving the inner div. At the end, restart.
		if (parseInt(inner.style.left) < -limit)
		{
			inner.style.left = parseInt(scroller.style.width) + "px";
		}
		else if (!scroller.obj.pause || scroller.obj.pause == false)
		{
			inner.style.left = (parseInt(inner.style.left) - 1) + "px";
			
			// Deceiving Opera8 stupidity
			//inner.style.width = parseInt(scroller.style.width) - (parseInt(inner.style.left) - 4) + "px";
		}
		
		// *** Bigger delay on item found
		// Skips borders to make transition without delays on loop
		/*if (!(parseInt(inner.style.left) == parseInt(scroller.style.width)) &&
			!(parseInt(inner.style.left) == -limit) &&
			(parseInt(inner.style.left) % parseInt(scroller.style.width)) == 0)
		{
			nextTick = delay;
		}*/
		
		// *** Tick!
		setTimeout("divScrollHelperH(\"" + id + "\", " + limit + ", " + speed + ", " + delay + ")", parseInt(nextTick));
	}
}

/****************************************************************************************************
 * Helper for the VERTICAL scrolling for the specified div (matching id).
 * This is the real "ticker" function, executed to move the div.
 *
 * @param	string id of the tag
 * @param	pre-calculated height limit (to speed up execution)
 * @param	speed
 * @param	delay
 */
function divScrollHelperV(id, limit, speed, delay)
{
	// DOM3 = IE5+, NS6+, FF0.7+
	var scroller = new getObj(id);
	var inner = new getObj(id + "_inner");
	
	// *** Tick duration
	nextTick = speed;
	
	// *** Avoiding some errors
	if (!inner.style.top) inner.style.top = "0px";
	
	// *** Moving the inner div. At the end, restart.
	if (parseInt(inner.style.top) < -limit)
	{
		inner.style.top = parseInt(scroller.style.height) + "px";
	}
	else
	{
		inner.style.top = (parseInt(inner.style.top) - 1) + "px";
	}
	
	// *** Bigger delay on item found
	// Skips borders to make transition without delays on loop
	if (!(parseInt(inner.style.top) == parseInt(scroller.style.height)) &&
		!(parseInt(inner.style.top) == -limit) &&
		(parseInt(inner.style.top) % parseInt(scroller.style.height)) == 0)
	{
		nextTick = delay;
	}
	
	// *** Tick!
	setTimeout("divScrollHelperV(\"" + id + "\", " + limit + ", " + speed + ", " + delay + ")", parseInt(nextTick));
}

/****************************************************************************************************
 * OnMouseOver helper for the HORIZONTAL scrolling for the specified div (matching id).
 *
 * @param	string id of the tag
 */
function divScroll_onMouseOver(id)
{
	var scroller = new getObj(id);
	scroller.obj.pause = true;
}

function divScroll_onMouseOut(id)
{
	var scroller = new getObj(id);
	scroller.obj.pause = false;
}

/****************************************************************************************************
 * Apply essential working styles to each <div> inside the scroller.
 *
 * @param	string id of the inner div
 */
function divScrollItemsStyler(id, direction)
{
	// DOM3 = IE5+, NS6+, FF0.7+
	var scroller = new getObj(id);
	var inner = new getObj(id + "_inner");
	
	elements = inner.obj.getElementsByTagName('div');
	
	for (var i = 0; i < elements.length; i++)
	{
		var item = elements.item(i);
		
		item.style.width = scroller.style.width;
	}
}