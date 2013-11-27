(function ($) {
// ellipsis
// re-fills in an element with a set height (or max-height) so that there is no overflow.
// If content was truncated, config.ellipsis is appended to the end in a way that does not cause further overflow.
// 
// usage: jQuery(element).ellipsis();
// 
	$.fn.ellipsis = function (_config) {
		var config = $.extend({}, {
			skip_slow_browsers: false,
			tolerance: 1, // maximum amount the element can scroll before triggering the truncation
			content: false, // if not supplied here, content will be scraped from the element itself using $.fn.html()
			ellipsis: " &hellip; " // will be concatenated to the end of the content if it is truncated
		}, _config);
		var canscroll = function ($el) {
			var ost, nst, scrollRoom, origScrolltop;
			// calculate the number of pixels we can scroll down at the moment.
			// keep in mind that different browsers have different tolerances.

			origScrolltop = $el.scrollTop();
			$el.scrollTop(0);
			scrollRoom = 0;
			ost = 0; // old scroll top
			$el.scrollTop(1);
			nst = el.scrollTop(); // new scroll top
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
		return this.each(function () {
			var try_this, truncated, ellipsis, after_ellipsis, last, i, el, breakables, content,
				ellipsed = false
			;
			content = config.content;
			if (content === false) {
				content = $(this).html();
			}
			breakables = content.split(/\s/);
			$(this).html("");
			last = "";
			i = 0;
			el = $(this);
			breakables.push(" ");
			breakables.push(" ");

			for (i in breakables) {
				if (breakables.hasOwnProperty(i)) {
					if (!ellipsed && canscroll(el)) {
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
						after_ellipsis.html(after_ellipsis.html() + breakables[i - 1] + " ");
						ellipsed = true;
						el = after_ellipsis;
					}
					last = el.html();
					el.html(el.html() + breakables[i] + " ");
					++i;
				}
			}
			el.html($.trim(el.html()));
		});
	};
}(jQuery));
