// https://github.com/antialias/ellipsis.jquery.js
(function (root, factory) {
	"use strict";
	var m = {};
	if ("object" === typeof root.module) {
		factory(
			module,
			require('jquery')
		);
	} else {
		factory(
			m,
			window.jQuery
		);
	}
})(window, function (module, $) {
	"use strict";
// ellipsis
// re-fills in an element with a set height (or max-height) so that there is no overflow.
// If content was truncated, config.ellipsis is appended to the end in a way that does not cause further overflow.
// 
// usage: jQuery(element).ellipsis();
// 
	module.exports = jQuery;
	$.fn.ellipsis = function (_config) {
		var config = $.extend({}, {
			skip_slow_browsers: false,
			tolerance: 1, // maximum amount the element can scroll before triggering the truncation
			content: false, // if not supplied here, content will be scraped from the element itself using $.fn.html()
			ellipsis: " &hellip; " // will be concatenated to the end of the content if it is truncated
		}, _config);
		var canscroll = function ($el) {
			var scrollRoom = 0,
				ost = 0, // old scroll top
				nst, // new scroll top
				origScrolltop;
			// Determine if $el can be scrolled by modifying scrollTop and checking if the change has stuck
			// Note: browsers have different tolerances.
			origScrolltop = $el.scrollTop();
			$el.scrollTop(0);
			$el.scrollTop(1);
			nst = $el.scrollTop(); // new scroll top
			while (ost !== nst) {
				ost = $el.scrollTop();
				$el.scrollTop(ost + 1);
				nst = $el.scrollTop();
				++scrollRoom;
				if (scrollRoom > config.tolerance) { // break early if we can
					break;
				}
			}
			$el.scrollTop(origScrolltop); // put it back so nobody suspects nothin'
			return scrollRoom > config.tolerance;
		};
		if (config.skip_slow_browsers && $.browser.msie && $.browser.version < 8) {
			return this;
		}
		return $.when.apply($, this.map(function () {
			var D = new $.Deferred(),
				try_this,
				truncated,
				ellipsis,
				after_ellipsis,
				el,
				breakables,
				content,
				_this = this;
			setTimeout(function () {
				content = config.content;
				if (content === false) {
					content = $(_this).html();
				}
				if (!content) {
					return;
				}
				breakables = content.split(/\s/);
				el = $(_this);
				if (!canscroll(el)) {
					D.resolve();
					return;
				}
				$(_this).html("");
				breakables.push(" ");
				breakables.push(" ");
				var test, low = 0, high = $(breakables).length;
				while (high > low + 1) { // binary search to find the scrolling point
					test = Math.floor((low + high) / 2);
					el.html(breakables.slice(0, test).join(" ") + " ");
					if (canscroll(el)) {
						high = test;
					} else {
						low = test;
					}
				}
				var last = breakables.slice(0, high - 1).join(' ') + " ";
				after_ellipsis = $("<span>")
					.css('display', 'none')
					.addClass('ellipsised-content');
				ellipsis = $("<span>")
					.addClass('ellipsis')
					.html(config.ellipsis);
				truncated = $("<span>")
					.addClass('truncated-content')
					.html(last);
				el
					.html("")
					.append(truncated)
					.append(ellipsis)
					.append(after_ellipsis);
				try_this = last;
				// if the ellipsis has made the element scroll again, back off character by character until it doesnt
				while (try_this) {
					if (try_this.substr(-1).match(/\s/) && !canscroll(el)) { // if we are at a space and cannot scroll
						break;
					}
					try_this = try_this.substr(0, try_this.length - 1);
					truncated.html(try_this);
				}
				if (try_this.length !== last.length) {
					after_ellipsis.html(last.substr(try_this.length - last.length));
				}
				after_ellipsis.html(after_ellipsis.html() + breakables.slice(high - 1).join(" "));
				el.html($.trim(el.html()));
				D.resolve();
			});
			return D;
		}));
	};
});
