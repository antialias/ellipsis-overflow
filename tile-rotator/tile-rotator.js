jQuery(function($) {
$.fn.tileRotator = function (rotator_content, rotator_config) {
var api = {
	setTiming: function (new_config) {
		$.extend(rotator_config, new_config);
	}
	},
	rotator_config = $.extend({
			auto_rotate_interval: 4000,
			transition_duration: 200,
			autoslide_duration: 500
		}, rotator_config);
this.each(function() {
	var rotator_element = $(this),
		controls_initial_opacity = false;
	jQuery(function ($) { // main rotator
		rotator_element.hover(function() {
			if (controls_initial_opacity === false) {
				controls_initial_opacity = rotator_element.find(".rotator-controls, .windchime-container").css('opacity');
				if (!controls_initial_opacity) {
					controls_initial_opacity = 0.5;
				}
			}
			rotator_element.find(".rotator-controls, .windchime-container").animate({
				opacity:1
			}, {
				queue:false,
				duration:rotator_config.transition_duration,
				step: function(now, fx) {
					$(fx.elem).css('filter', 'alpha(opacity=' + Math.floor(now*100) + ')');
				}
			});
		},function() {
			rotator_element.find(".rotator-controls, .windchime-container").animate({
				opacity:controls_initial_opacity
			}, {
				queue:false,
				duration:rotator_config.transition_duration,
				step: function(now, fx) {
					$(fx.elem).css('filter', 'alpha(opacity=' + Math.floor(now*100) + ')');
				}
			});
		});
		var num_nav_panes_max = 4,
			num_nav_panes_min = 1,
			$rotator_position_indicator,
			$rotator_nav_holder,
			Rotator_pane_config,
			audio = false,
			nav_sliding = false,
			cur_rotator_pane,
			prev_rotator_pane,
			num_nav_panes,
			set_cur_rotator_pane,
			num_panes,
			select_rotator_pane,
			rotate_in,
			okay_to_rotate,
			nav_slide,
			call_navslide_complete = true,
			get_next_pane_starting_with,
			rotator_panes_linked_list,
			rotation_fairie,
			cur_nav_pane,
			i,
			auto_rotate_interval_handle = false,
			advance_timeout,
			start_auto_rotation,
			stop_auto_rotation,
			unobscured_image_measurer,
			overlay_measurer,
			rotator_controls;
			var VisibleImageMeasurer = function(obj_config) {
				obj_config = $.extend({
					align:'left',
					attach:'left',
					duration: false,
					title: false,
					click: false,
					subtract_from_bottom: false
				}, obj_config);
				var $text, $measurer = $("<div>")
					.attr('title', obj_config.title)
					.click(obj_config.click)
					.css('visibility', 'hidden')
					.addClass('vmeasure')
					.append($('<div>').addClass('vline-top'))
					.append($('<div>').addClass('vline-bottom'))
					.append($text = $('<div>').addClass('vline-text')).appendTo(document.body);
				this.measure = function(elem, config) {
					config = $.extend({}, obj_config, config);
					var offset,
						height = elem.height();
					if (config.subtract_from_bottom) {
						config.subtract_from_bottom.each(function(i, e) {
							height -= $(e).outerHeight();
						});
					}
					offset = elem.offset();
					$measurer.animate({
						height: height,
						top: offset.top,
						left: (config.align == 'left' ? offset.left - $measurer.width() : offset.left) + (config.attach == 'right' ? elem.width() : 0)
					},{
						duration: config.duration,
						complete: function() {
							$(this).css({visibility: 'visible'});
							$text.html("" + height + "px");
						},
						step: function(now, fx) {
							if ("height" === fx.prop) {
								$text.html("" + Math.floor(now) + "px");
							}
						}
					});
				};
				this.show = function(visible) {
					$measurer.css('visibility', visible ? 'visible' : 'hidden');
				}
			};
			overlay_measurer = false;
			if ($(document.body).is(".red_dot")) {
				overlay_measurer = new VisibleImageMeasurer({
					title:"Click to play with text in current rotator pane",
					align:'left',
					attach:'left',
					click:function() {
						cur_rotator_pane.get_slider_pane().find("*").attr('contenteditable', 'true').removeAttr('href').css({cursor:'text'});
					}});
			}

		set_cur_rotator_pane = function (new_rotator_pane) {
			prev_rotator_pane = cur_rotator_pane;
			cur_rotator_pane = new_rotator_pane;
		};
		$rotator_nav_holder = $("<div>").addClass("rotator-nav-holder");
		if ($.browser.msie && $.browser.version < 8) {
			$rotator_nav_holder.attr('unselectable', 'on');
		}
		rotator_element.append($rotator_nav_holder);
		rotator_element.prepend($("<div>").addClass("windchime-container"));
		rotate_in = function (pane_in_config, options) {
			if (!okay_to_rotate) {
				return false;
			}
			var finished, pane_out, pane_in, pane_out_width, defaults = {
				direction: 'left',
				duration: rotator_config.transition_duration,
				rotate_same: false,
				complete: false
			};
			options = $.extend(defaults, options);
			okay_to_rotate = false;
			pane_in = pane_in_config.get_slider_pane();
			var measure_pane_in = function() {
				if (overlay_measurer) {
					overlay_measurer.measure(pane_in, {
						subtract_from_bottom: pane_in.find(".pane-overlay"),// .add(pane_in.find(".overlay-featured-tag")),
						duration: defaults.duration
					});
				}
				pane_in.unbind('added-to-dom', measure_pane_in);
			};
			pane_in.bind('added-to-dom', measure_pane_in);
			$rotator_position_indicator.html(String() + (pane_in_config.index + 1) + " of " + num_panes);
			pane_out = rotator_element.find(".rotator-pane");
			$(".rotator-nav-holder .nav-pane").removeClass('nav-active');
			pane_in_config.get_nav_pane().addClass('nav-active');
			finished = function () {
				okay_to_rotate = true;
				if (pane_out) {
					if (pane_in.get(0) !== pane_out.get(0)) {
						pane_out.detach();
					}
					// since we may use the pane again, lets
					// unset the inline properties that may
					// have been set during the transition
					pane_out.css({
						zIndex: '',
						right: '',
						left: '',
						visibility: '',
						opacity: ''
					});
				}
				if (options.complete) {
					options.complete();
				}
			};
			if (pane_in.get(0) === pane_out.get(0)) {
				if (!options.rotate_same) {
					finished();
					return;
				}
				pane_out.replaceWith(pane_out = pane_out.clone());
			}
			pane_out_width = pane_out.width();
			if (pane_out.size()) {
				pane_out.css('z-index', 0);
				pane_in.css('visibility', 'hidden');
				rotator_element.append(pane_in);
				pane_in.trigger('added-to-dom');
				switch (options.direction) {
				// awesomer transitions can be added here if desired
				case 'instant':
					pane_in.css('left', pane_out_width).css('visibility', 'visible');
					pane_out.css('left', 'auto');
					pane_in.css({left: 0});
					pane_in.animate({left: 0}, {
						step: function (now, fx) {
							pane_out.css('right', pane_out_width - now);
						},
						queue: true,
						duration: options.duration,
						complete: finished
					});
					break;
				case 'fade':
					pane_in.css('opacity', 0).css('visibility', 'visible');
					pane_in.animate({opacity: 1}, {
						queue: true,
						duration: options.duration,
						complete: finished,
						step: function (now, fx) {
							$(fx.elem).css('filter', "alpha(opacity=" + Math.floor(100 * now) + ")");
						}
					});
					break;
				case 'left':
				case 'left-to-right':
					pane_in.css('right', pane_out_width).css('visibility', 'visible');
					pane_in.css('left', 'auto');
					pane_out.css('right', 'auto');
					pane_out.css('left', 'auto');
					pane_in.animate({right: ($.browser.msie && $.browser.version < 7) ? "-1px" : "0"}, {
						step: function (now, fx) {
							pane_out.css('left', pane_out_width - now);
						},
						queue: true,
						duration: options.duration,
						complete: finished
					});
					break;
				case 'right':
				case 'right-to-left':
				default:
					pane_in.css('left', pane_out_width).css('visibility', 'visible');
					pane_out.css('left', 'auto');
					pane_in.animate({left: 0}, {
						step: function (now, fx) {
							pane_out.css('right', pane_out_width - now);
						},
						queue: true,
						duration: options.duration,
						complete: finished
					});
					break;
				}
			} else {
				rotator_element.append(pane_in);
				pane_in.trigger('added-to-dom');
				finished();
			}
		};
		nav_slide = function ($sliding_in, config) {
			call_navslide_complete = true;
			if (nav_sliding) {
				// console.log("woah there cowboy");
				call_navslide_complete = false;
				$sliding_in.stop(true, true);
				return;
			}
			nav_sliding = true;
			config = $.extend({direction: 'left', duration: rotator_config.transition_duration, easing: 'swing', complete: false}, config);
			var $sliding_out,
				$sliding_out_clone = false,
				$the_one_to_animate,
				margin_right = $sliding_in.css('margin-right');
			if (null === margin_right || "auto" === margin_right || "" === margin_right) {
				margin_right = 1;
			} else {
				margin_right = parseInt(margin_right.replace('px', ''), 10);
			}
			switch (config.direction) {
			case 'right':
				$sliding_out = $(".nav-pane").last();
				if ($sliding_in.get(0) === $sliding_out.get(0)) {
					$sliding_out_clone = $sliding_out.clone();
					$sliding_out.after($sliding_out_clone);
				}
				$sliding_in.css('display', 'none');
				$(".rotator-nav-holder").prepend($sliding_in);
				$sliding_in.css('margin-left', -$sliding_in.outerWidth() - margin_right);
				$sliding_in.css('display', 'block');
				$sliding_in.trigger('added-to-dom');
				$sliding_in.animate(
					{marginLeft: 0},
					{
						duration: config.duration,
						easing: config.easing,
						complete: function () {
							if ($sliding_out_clone) {
								$sliding_out_clone.remove();
							} else {
								$sliding_out.detach();
							}
							$sliding_in.css('display', '');
							$sliding_in.css('margin-left', '');
							nav_sliding = false;
							if (config.complete) {
								if (call_navslide_complete) {
									config.complete();
								} else {
									select_rotator_pane(cur_rotator_pane);
									// console.log("programatically stopped completion function in this animation");
								}
							}
						}
					}
				);
				break;
			case 'left':
				$sliding_out = $(".nav-pane").first();
				if ($sliding_in.get(0) === $sliding_out.get(0)) {
					$sliding_out_clone = $sliding_out.clone();
					$sliding_out.after($sliding_out_clone);
				}
				$(".rotator-nav-holder").append($sliding_in);
				$sliding_in.trigger('added-to-dom');
				if ($sliding_out_clone) {
					$the_one_to_animate = $sliding_out_clone;
				} else {
					$the_one_to_animate = $sliding_out;
				}
				$the_one_to_animate.animate(
					{marginLeft: -$the_one_to_animate.outerWidth() - margin_right},
					{
						easing: config.easing,
						duration: config.duration,
						complete: function () {
							if ($sliding_out_clone) {
								$sliding_out_clone.remove();
							} else {
								$sliding_out.detach();
								$sliding_out.css('margin-left', '');
							}
							nav_sliding = false;
							if (config.complete) {
								config.complete();
							}
						}
					}
				);
				break;
			default:
				break;
			}
		};
		get_next_pane_starting_with = function (end_of_nav, direction) {
			var the_count = 0;
			while ($rotator_nav_holder.find(end_of_nav.get_nav_pane()).size() === 0) { // if it's not currently in the nav
				the_count += 1;
				if (the_count > num_panes) {
					if ('undefined' !== typeof console) {
						console.log("error: iterated over " + num_panes + " times while looking left for an on-screen nav pane");
					}
					return false;
				}
				if (direction === 'left') {
					end_of_nav = end_of_nav.next;
				} else {
					end_of_nav = end_of_nav.prev;
				}
			}
			while ($rotator_nav_holder.find(end_of_nav.get_nav_pane()).size() > 0) {
				the_count += 1;
				if (the_count > num_panes) {
					// console.log("error: iterated over " + num_panes + " times while looking left for a off-screen nav pane");
					break;
				}
				if (direction === 'right' && end_of_nav.get_nav_pane().get(0) === $rotator_nav_holder.children().first().get(0)) { // if it is the leftmost displayed element and we are looking left
					return end_of_nav.prev;
				}
				if (direction === 'left' && end_of_nav.get_nav_pane().get(0) === $rotator_nav_holder.children().last().get(0)) { // if it is the rightmost displayed element and we are looking right
					return end_of_nav.next;
				}
				if (direction === 'left') {
					end_of_nav = end_of_nav.next;
				} else {
					end_of_nav = end_of_nav.prev;
				}
			}
			return end_of_nav;
		};
		select_rotator_pane = function (pane_obj, config) {
			config = $.extend({durationNavSlide: rotator_config.transition_duration, easingNavSlide: 'linear'}, config);
			var select_rotator_pane_for_reals,
				rotate_in_config = $.extend({}, config);
			rotate_in_config.direction = 'fade';
			// rotate_in_config.direction = 'instant';
			rotate_in(pane_obj, rotate_in_config);
			config.complete = false;
			prev_rotator_pane.animate_windchime('collapse', config);
			cur_rotator_pane.animate_windchime('expand', config);
			config = $.extend(config, {duration: config.durationNavSlide, easing: config.easingNavSlide});
			select_rotator_pane_for_reals = function (pane_obj, config) {
				if ($rotator_nav_holder.children().get(0) !== pane_obj.get_nav_pane().get(0)) { // if current pane is not at the leftmost
					config = $.extend({direction: 'left', easing: 'swing'}, config);
					config.complete = function () {select_rotator_pane_for_reals(pane_obj, config); };
					nav_slide(get_next_pane_starting_with(pane_obj, config.direction).get_nav_pane(), config);
				}
			};
			select_rotator_pane_for_reals(pane_obj, config);
		};
		Rotator_pane_config = function () {
			// privatev vars
			this.last_windchime_transition = false;
			var dom_img = false,
				$np = false,
				$slider_pane = false;
			this.dom_img = function () {
				if (dom_img) {
					return dom_img;
				}
				// console.log("fetching image for index " + this.index);
				dom_img = $("<img />").addClass('rotator-img').attr('src', this.img);
				return dom_img;
			};
			this.get_nav_pane = function () {
				if ($np) {
					return $np;
				}
				var that = this,
					ellipsed_contents = false;
				$np = $("<a>").addClass('nav-pane')
					.html(this.title)
					.click(function (e) {
						var direction;
						direction = 'left';
						set_cur_rotator_pane(that);
						select_rotator_pane(
							cur_rotator_pane,
							{
								durationNavSlide: Math.floor(rotator_config.transition_duration * 4 / num_nav_panes),
								direction: direction
							}
						);
					})
					.bind('added-to-dom', function (e) {
						that.dom_img(); // now is a good time to load our image
						$np.html(that.title);
						$np.css({width: Math.max(10, ((rotator_element.width() + 2 - (num_nav_panes - 1)) / num_nav_panes) - ($np.outerWidth() - $np.width()))});
						if (!ellipsed_contents) {
							$np.RGEllipsis();
						}
					});
				if ($.browser.msie && $.browser.version < 7) {
					$np.attr('href', '').click(function (e) {e.preventDefault(); });
				}
				return $np;
			};
			this.get_slider_pane = function () {
				var _this = this,
					ellipsed_content = false,
					$byline = false,
					$deck = false,
					$title = false,
					$pane_overlay = false;
				if ($slider_pane) {
					return $slider_pane;
				}
				// get next and prior images so they don't load after the user rotates
				this.next.dom_img();
				this.prev.dom_img();

				$slider_pane = $("<div/>").addClass('rotator-pane')
					.append(this.dom_img())
					.append($pane_overlay = $("<div>").addClass('pane-overlay')
						.append($("<a>").addClass('pane-overlay-background').attr('href', this.href))
						.append($("<div>").addClass('overlay-featured-tag').html(this.slug))
						.append($("<a>")
							.attr('href', this.href)
							.addClass('pane-overlay-content')
							.append($title = $("<a>").addClass('overlay-title').html(this.title).attr('href', this.href))
							.append($deck = $("<a>").addClass('overlay-deck').html(this.deck).attr('href', this.href))
							.append($byline = $("<a>").addClass('overlay-byline').html(this.byline).attr('href', this.href))))
					.bind('added-to-dom', function (e) {
						if (!ellipsed_content) {
							ellipsed_content = true;
							$()
								.add($title)
								.add($deck)
								.add($byline)
								.RGEllipsis();
						}
					});
				return $slider_pane;
			};
		};
		// audio = $("<audio>").load(function () {console.log("loaded");}).attr('src', "http://thomas.office/roubini_chime_exports/roubini_chime.mp3");

		var test_active = $("<div>").addClass('rotator-windchime').css('display', 'hidden').addClass('windchime-active').appendTo(rotator_element.find(".windchime-container")),
			test_inactive = $("<div>").addClass('rotator-windchime').css('display', 'hidden').appendTo(rotator_element.find(".windchime-container")),
			test_inactive_height = test_inactive.height(),
			test_active_height = test_active.height();
		if ($.browser.msie && $.browser.version < 7) {
			test_inactive_height = test_inactive_height - 3; // I'll give a dollar to anyone who can tell me why IE thinks 10px == 13px.
		}
		
		test_inactive.remove();
		test_active.remove();
		rotator_panes_linked_list = new Rotator_pane_config();
		cur_rotator_pane = rotator_panes_linked_list;
		okay_to_rotate = true;
		num_panes = 0;
		if (rotator_content.length == 0) {
			return; // nothing to rotate
		}
		for (i in rotator_content) {
			$.extend(cur_rotator_pane,rotator_content[i]);

			/*var windchime_positions = [
				[1000,1823],
				[1823,2372],
				[2172,3482],
				[3482,4264],
				[4264,7319]
			];
			
			cur_rotator_pane.ring_windchime = function () {
				if (this.index > windchime_positions.length) {
					return;
				}
				audio.get(0).play();
				audio.get(0).currentTime = windchime_positions[this.index][0] / 1000;
				var that = this;
				setTimeout(function () {
					audio.get(0).pause()
				}, windchime_positions[this.index][1] - windchime_positions[this.index][0])
			};*/
			cur_rotator_pane.windchime = $("<div>").addClass('rotator-windchime').append($("<div>").addClass('windchime-overlay'));
			/* (function () { // gotta trap the current scope our event knows what is what
				var the_rotator_pane = cur_rotator_pane;
				cur_rotator_pane.windchime.mouseover(function () {
					the_rotator_pane.ring_windchime();
				});
			 })(); */
			rotator_element.find(".windchime-container").prepend(cur_rotator_pane.windchime);
			// http://thomas.office/roubini_chime_exports/roubini_chime.ogg
			
			cur_rotator_pane.animate_windchime = function (direction, config) {
				var that = this;
				config = $.extend({default_transition_if_no_last: false, transition: 'smooth', complete: false, duration: rotator_config.transition_duration, easing: 'linear'}, config);
				if (config.transition === 'last') {
					config.transition = this.last_windchime_transition;
					if (config.transition === 'last' && config.default_transition_if_no_last) {
						config.transition = config.default_transition_if_no_last;
					}
				}
				switch (config.transition) {
				case 'tim':
					this.windchime.animate( // using animate instead of setTimeout to call the callback so it will not be called if the next attempt to anumate this element doesn't request that the animation finish
						{},
						{
							easing: config.easing,
							complete: config.complete,
							duration: config.duration
						});
					if (direction !== 'expand' && this.last_windchime_transition !== config.transition) {
						this.windchime.children().first().css('height', test_active_height);
					}
					this.windchime.children().first()
						.stop(true, false)
						.css('opacity', 1)
						.animate(
							{height: 'expand' === direction ? test_active_height : 0},
							{
								complete: function () {
									$(this).css('height', '');
									if (direction === 'expand') {
										$(this).css('opacity', 1);
										that.windchime.addClass("windchime-active");
									} else {
										$(this).css('opacity', 0);
										that.windchime.removeClass("windchime-active");
									}
								},
								easing: config.easing,
								duration: config.duration
							}
						);
					break;
				case 'smooth':
				default:
					this.windchime
						.stop(true, false)
						.animate(
							{height: 'expand' === direction ? test_active_height : test_inactive_height},
							{
								complete: function () {
									if (direction === 'expand') {
										that.windchime.addClass("windchime-active");
									} else {
										that.windchime.removeClass("windchime-active");
									}
									if (config.complete) {
										config.complete();
									}
								},
								easing: config.easing,
								duration: config.duration
							}
						);
					this.windchime.children().first()
						.stop(true, true)
						.animate(
							{opacity: direction === 'expand' ? 1 : 0},
							{
								easing: config.easing,
								duration: config.duration,
								step: function (now, fx) {
									$(fx.elem).css('filter', "alpha(opacity=" + Math.floor(100 * now) + ")");
								}
							}
						);
					break;
				}
				this.last_windchime_transition = config.transition;
			};
			if ($.browser.msie && $.browser.version < 7) {
				cur_rotator_pane.animate_windchime('collapse', {duration: 0}); // so IE6 can understand the height
			}
			cur_rotator_pane.index = num_panes;
			num_panes += 1;
			cur_rotator_pane.next = new Rotator_pane_config();
			var this_prev_rotator_pane = cur_rotator_pane;
			cur_rotator_pane = cur_rotator_pane.next;
			cur_rotator_pane.prev = this_prev_rotator_pane;
		}
		num_nav_panes = Math.min(num_nav_panes_max, Math.max(num_nav_panes_min, num_panes));
		set_cur_rotator_pane(cur_rotator_pane.prev);
		cur_rotator_pane.next = rotator_panes_linked_list;
		rotator_panes_linked_list.prev = cur_rotator_pane;
		rotation_fairie = setInterval(function () { // check on the nav rotator since the active nav isn't always to the left
			if (!nav_sliding) {
				if ($rotator_nav_holder.children().get(0) !== cur_rotator_pane.get_nav_pane().get(0)) {
					select_rotator_pane(cur_rotator_pane);
					// console.log("nav rotation fairie saves the day!");
				}
			}
		}, 500);
		rotator_element.append(
			rotator_controls = $("<div>").addClass('rotator-controls')
				.append($("<div>").addClass('rotator-go-forward').addClass('rotator-button')
					.mousedown(function () {$(this).addClass('rotator-go-forward-mousedown'); })
					.bind('mouseup mouseout', function () {$(this).removeClass('rotator-go-forward-mousedown'); })
					.click(function () {
						if (!okay_to_rotate || nav_sliding) {
							return;
						}
						set_cur_rotator_pane(cur_rotator_pane.next);
						select_rotator_pane(cur_rotator_pane, {
							direction: 'left',
							duration: rotator_config.transition_duration,
							durationNavSlide: rotator_config.transition_duration,
							easingNavSlide: 'swing'
						});
					}))
				.append($("<div>").addClass('rotator-go-backward').addClass('rotator-button')
					.mousedown(function () {$(this).addClass('rotator-go-backward-mousedown'); })
					.bind('mouseup mouseout', function () {$(this).removeClass('rotator-go-backward-mousedown'); })
					.click(function () {
						if (!okay_to_rotate || nav_sliding) {
							return;
						}
						set_cur_rotator_pane(cur_rotator_pane.prev);
						select_rotator_pane(cur_rotator_pane, {
							direction: 'right',
							duration: rotator_config.transition_duration,
							durationNavSlide: rotator_config.transition_duration,
							easingNavSlide: 'swing'
						});
					}))
				.append($rotator_position_indicator = $("<div>").addClass('rotator-position-indicator').html('n of p'))
		);
		set_cur_rotator_pane(cur_rotator_pane.next);
		// put as many nav panes in the nav holder as will fit
		cur_nav_pane = cur_rotator_pane;
		i = 0;
		for (i = 0; i < num_nav_panes; i += 1) {
			$(".rotator-nav-holder").append(cur_nav_pane.get_nav_pane());
			cur_nav_pane.get_nav_pane().trigger('added-to-dom');
			cur_nav_pane = cur_nav_pane.next;
			if (cur_nav_pane === cur_rotator_pane) {
				// dont add the ones we have already added
				break;
			}
		}
		select_rotator_pane(cur_rotator_pane);
		start_auto_rotation = function () {
			if (auto_rotate_interval_handle) {
				return;
			}
			var ran_once = false,
				auto_rotate_function;
			auto_rotate_function = function () {
				if (advance_timeout) {
					clearTimeout(advance_timeout);
				}
				advance_timeout = setTimeout(function () {
					set_cur_rotator_pane(cur_rotator_pane.next);
					select_rotator_pane(cur_rotator_pane, {
						complete: function () {
							cur_rotator_pane.animate_windchime('collapse', {
								transition: 'tim',
								duration: rotator_config.auto_rotate_interval
							});
						},
						duration: rotator_config.autoslide_duration,
						durationNavSlide: rotator_config.autoslide_duration,
						easingNavSlide: 'swing'
					});
				}, rotator_config.auto_rotate_interval);
				if (!ran_once) {
					cur_rotator_pane.animate_windchime('collapse', {
						transition: 'tim',
						duration: rotator_config.auto_rotate_interval
					});
					ran_once = true;
				}
			};
			auto_rotate_interval_handle = setInterval(auto_rotate_function, rotator_config.auto_rotate_interval + rotator_config.autoslide_duration);
			auto_rotate_function();
		};
		stop_auto_rotation = function () {
			if (!auto_rotate_interval_handle) {
				return;
			}
			clearInterval(auto_rotate_interval_handle);
			auto_rotate_interval_handle = false;
			clearInterval(advance_timeout);
			advance_timeout = false;
			cur_rotator_pane.animate_windchime('expand', {duration: rotator_config.transition_duration, transition: 'last'});
		};
		rotator_element.mousemove(stop_auto_rotation);
		cur_rotator_pane.dom_img().load(function () {
			rotator_element.hover(stop_auto_rotation, start_auto_rotation);
			start_auto_rotation();
		});
		cur_rotator_pane.animate_windchime('expand', {duration: 0});
	});
});
return api;
}});