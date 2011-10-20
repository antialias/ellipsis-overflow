jQuery(function($) {
	$(document.body).addClass('js');
	rotator_api = $("#main_content").tileRotator(
		(function () {
			var my_rotator_content = [];
			$("#mainmain").detach().find(".regiontopictab.homepage-featured .featured-content-area .featured-content").each(function (i,e) {
				var nc = {
					title: $(this).find("h3 a").html(),
					href: $(this).find("h3 a").attr('href'),
					deck: $(this).find(".deck").html(),
					img: $(this).find('.feature-rotator-image').attr('data-src'),
					byline: $(this).find(".attrib .author").html()
				};
				if ("by " !== nc.byline.substr(0, 3).toLowerCase()) {
					nc.byline = "By " + nc.byline;
				}
				nc.slug = $(this).find(".contentType").html();
				my_rotator_content.push(nc);
			});
			return my_rotator_content;
		})(),
		{
			auto_rotate_interval: 4000,
			transition_duration: transition_duration,
			autoslide_duration: autoslide_duration
		});
	$(document.body).addClass('js');
	$('.js .briefing a').ellipsis();
	$('.analysis a').ellipsis();
});