"use strict";
var assign = require('lodash.assign');
var contentKey = '__ellipsis-original-content';
var canscroll = function (el, tolerance) {
	var scrollRoom = 0,
		ost = 0, // old scroll top
		nst, // new scroll top
		origScrolltop;
	// Determine if $el can be scrolled by modifying scrollTop and checking if the change has stuck
	// Note: browsers have different tolerances.
	origScrolltop = el.scrollTop;
	el.scrollTop = 0;
	el.scrollTop = 1;
	nst = el.scrollTop; // new scroll top
	while (ost !== nst) {
		ost = el.scrollTop;
		el.scrollTop = ost + 1;
		nst = el.scrollTop;
		++scrollRoom;
		if (scrollRoom > tolerance) { // break early if we can
			break;
		}
	}
	el.scrollTop = origScrolltop; // put it back so nobody suspects nothin'
	return scrollRoom > tolerance;
};
module.exports = function (el, config) {
    config = config || {};
    var _canscroll;
	var low = 0;
	var high;
	var test;
	var try_this;
	var truncated;
	var ellipsis;
	var after_ellipsis;
	var breakables;
	var content;
	config = assign({
		async: true,
		skip_slow_browsers: false,
		tolerance: 1, // maximum amount the element can scroll before triggering the truncation
		content: false, // if not supplied here, content will be scraped from the element itself using $.fn.html()
		ellipsis: " &hellip; " // will be concatenated to the end of the content if it is truncated
	}, config);
    _canscroll = canscroll.bind(null, el, config.tolerance);
	content = config.content;
	if (false === content) {
		content = el[contentKey];
		if (undefined === content) {
			content = el.innerHTML;
			el[content] = content;
		} else {
			el.innerHTML = content;
		}
	}
	if (!content) {
		return;
	}
	breakables = content.split(/\s/);
	if (!_canscroll()) {
		return;
	}
	el.innerHTML = "";
	breakables.push(" ");
	breakables.push(" ");
	low = 0;
	high = breakables.length;
	while (high > low + 1) { // binary search to find the scrolling point
		test = Math.floor((low + high) / 2);
		el.innerHTML = breakables.slice(0, test).join(" ") + " ";
		if (_canscroll()) {
			high = test;
		} else {
			low = test;
		}
	}
	var last = breakables.slice(0, high - 1).join(' ') + " ";
    after_ellipsis = document.createElement('span');
    after_ellipsis.style.display = 'none';
    after_ellipsis.classList.add('ellipsised-content');
    ellipsis = document.createElement('span');
    ellipsis.classList.add('ellipsis');
    ellipsis.innerHTML = config.ellipsis;
    truncated = document.createElement('span');
    truncated.classList.add('truncated-content');
    truncated.innerHTML = last;
    el.innerHTML = '';
    el.appendChild(truncated);
    el.appendChild(ellipsis);
    el.appendChild(after_ellipsis);
	try_this = last;
	// if the ellipsis has made the element scroll again, back off character by character until it doesnt
	while (try_this) {
		if (try_this.substr(-1).match(/\s/) && !_canscroll()) { // if we are at a space and cannot scroll
			break;
		}
		try_this = try_this.substr(0, try_this.length - 1);
		truncated.innerHTML = try_this;
	}
	if (try_this.length !== last.length) {
		after_ellipsis.innerHTML = last.substr(try_this.length - last.length);
	}
	after_ellipsis.innerHTML += breakables.slice(high - 1).join(" ");
	el.innerHTML = el.innerHTML.trim();
}
