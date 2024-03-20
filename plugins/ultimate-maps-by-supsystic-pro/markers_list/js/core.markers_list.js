jQuery(document).bind('umsAfterMapInit', function(event, map) {
	var viewId = map.getViewId();
	if(window.umsGetMembershipGmeViewId) {
		viewId = umsGetMembershipGmeViewId(map, viewId);
	}
	jQuery('#umsMmlSimpleSlider_' + viewId).show();

});
jQuery(document).bind('umsAfterMarkersRefresh', function(event, map){
	umsBuildListHtml(map);
	var $sliderContent = jQuery('#' + map.getParam('simple_slider_id'))
	,	sliderType = $sliderContent.data('slider-type')
	,	slideClass = ''
	,	markerIdToShow = umsIsMarkerToShow()
	,	mapMarkers = map.getAllMarkers()
	,	mapMarkersIds = []
	,	removeGroup = false
	,	rebuild = false;

	for(var i = 0; i < mapMarkers.length; i++) {
		mapMarkersIds.push(parseInt(mapMarkers[i].getId()));
	}
	if(markerIdToShow && toeInArray(markerIdToShow, mapMarkersIds) == -1)
		markerIdToShow = false;
	if(markerIdToShow) {
		switch(sliderType) {
			case 'jssor':
				slideClass = '.umsMnlJssorSlide';
				rebuild = true;
				break;
			case 'table':
				slideClass = '.umsMmlSlideTableRow';
				removeGroup = true;
				break;
			default:
				break;
		}
		if(rebuild)
			$sliderContent.html(map.getParam('original_slider_html'));	// Reset current slider to it's original html
		$sliderContent.find(slideClass).each(function () {	// Remove unused in search html slides/rows
			if(jQuery(this).data('marker-id') != markerIdToShow)
				jQuery(this).remove();
		});
		if(removeGroup) {
			$sliderContent.find('.umsMmlSlidesTableScroll').each(function () {	// Remove unused in search html slides/rows
				if(!jQuery(this).find(slideClass).length)
					jQuery(this).prev().remove();
			});
		}
		if(rebuild)
			umsBuildListHtml(map);	// Build slider one more time with required number of slides
	}
	//umsMmlScaleSliders();
});
jQuery(document).bind('umsAfterMarkerClick', function(event, marker) {
	umsMmlScrollTo( marker );
});
jQuery(window).on('resize', function() {
    umsRebuildListHtml(umsGetAllMaps());
});
jQuery(window).on('orientationchange', function() {
    umsRebuildListHtml(umsGetAllMaps());
});
/*jQuery(window).bind('load', umsMmlScaleSliders);
jQuery(window).bind('resize', umsMmlScaleSliders);
jQuery(window).bind('orientationchange', umsMmlScaleSliders);*/

function umsBuildListHtml(map) {
	var markers = map.getAllMarkers();
	if(markers && markers.length) {
		var markerListParams = map.getParam('marker_list_params');

		if(!markerListParams)
			return;
		// check for membership integration
		var viewHtmlMbsId = map.getParam('view_html_mbs_id')
		,	viewId = map.getViewId()
		,	viewHtmlId = map.getViewHtmlId();
		if(viewHtmlMbsId && window.umsGetMembershipGmeViewId) {
			viewHtmlId = viewHtmlMbsId;
			viewId = umsGetMembershipGmeViewId(map, viewId);
		}

		var autoplaySlider = map.getParam('autoplay_slider') == '1' ? true : false;
		var slideDuration = map.getParam('slide_duration') !== '' ? map.getParam('slide_duration') : '500';

		slidesCount == 1 ? 2 : slidesCount;

		var listShellId = 'umsMmlSimpleSlider_'+ viewId
		,	sliderInitialize = map.getParam('original_slider_html');

		switch(markerListParams.eng) {
			case 'jssor':
				var parentWidth = 0
				,	parentHeight = 0;
				// membership integration
				if(!viewHtmlMbsId) {
					parentWidth = jQuery('#'+ viewHtmlId).width();
					parentHeight = jQuery('#'+ viewHtmlId).height();
				} else {
					parentWidth = jQuery(viewHtmlId).width();
					parentHeight = jQuery(viewHtmlId).height();
				}

				var orientation = markerListParams.or
				,	display = markerListParams.d
				,	sliderContainer = jQuery('#'+ listShellId)
				,	slideWidth = markerListParams.slide_width
				,	slideHeight = markerListParams.slide_height
				,	slideSpacing = 10
				,	listSteps = 1
				,	slidesCount = 4;

				if(sliderContainer.width()
					&& orientation == 'h'
					&& toeInArray('desc', display) != -1
				) {
					slidesCount = Math.ceil(sliderContainer.width() / 400);
					slidesCount = slidesCount == 1 ? 2 : slidesCount;
					slideWidth = sliderContainer.width() / slidesCount - (slideSpacing * (slidesCount - 1) / slidesCount) - 0.5; // -0.5 for shadow space
				} else {
					// For live site only
					//if(!markerListParams.two_cols)
						//slideHeight = slideHeight * 0.95;
				}

				var paramsForRebuildOrientation = {
					slideWidth: slideWidth
				,	listShellId: listShellId
				,	viewId: viewId
				,	parentHeight: parentHeight
				};

				if(!sliderInitialize) {
					map.setParam('original_slider_html', jQuery('#'+ listShellId).html());
					map.setParam('simple_slider_id', listShellId);

					if (orientation == 'v') {
						_umsRebuildVerticalOrientation(map, paramsForRebuildOrientation);
					}
				}

				if (orientation == 'h') {
					_umsRebuildHorizontalOrientation(map, paramsForRebuildOrientation);
					if(parentWidth <= slideWidth * 2) {
						slideWidth = parentWidth / 2;
					}
				}

				if(orientation == 'v') {
					jQuery('#'+ listShellId).css({
						'height': parentHeight
					,	'width': jQuery('#'+ listShellId).width() + 5
					}).find('.umsMnlJssorSlides').css({
						'max-height': parentHeight
					,	'height': parentHeight
					});
				} else {
					jQuery('#'+ listShellId).height( slideHeight + 5 )
						.find('.umsMnlJssorSlides').height( slideHeight );
				}

				if(orientation == 'v') {
					listSteps = Math.ceil( parentHeight / slideHeight );
				} else {
					listSteps = Math.floor( parentWidth / slideWidth );
				}

				//console.log(parentWidth, parentHeight, jQuery('#'+ listShellId).width(), slideWidth, listSteps);
				var	sliderOpts = {
						$AutoPlay: autoplaySlider,                                 	//[Optional] Whether to auto play, to enable slideshow, this option must be set to true, default value is false

						$ArrowKeyNavigation: true,   			          	//[Optional] Allows keyboard (arrow key) navigation or not, default value is false
						$SlideDuration: slideDuration,                             	//[Optional] Specifies default duration (swipe) for slide in milliseconds, default value is 500
						$MinDragOffsetToSlide: 20,                        	//[Optional] Minimum drag offset to trigger slide , default value is 20
						$SlideWidth: slideWidth,                          	//[Optional] Width of every slide in pixels, default value is width of 'slides' container
						$SlideHeight: slideHeight,                        	//[Optional] Height of every slide in pixels, default value is height of 'slides' container
						$SlideSpacing: slideSpacing, 					  	//[Optional] Space between each slide in pixels, default value is 0
						$DisplayPieces: listSteps,                        	//[Optional] Number of pieces to display (the slideshow would be disabled if the value is set to greater than 1), the default value is 1
						$ParkingPosition: 0,                             	//[Optional] The offset position to park slide (this options applys only when slideshow disabled), default value is 0.
						$UISearchMode: 1,                                   //[Optional] The way (0 parellel, 1 recursive, default value is 1) to search UI components (slides container, loading screen, navigator container, arrow navigator container, thumbnail navigator container etc).
						$PlayOrientation: orientation == 'v' ? 2 : 1, 		//[Optional] Orientation to play slide (for auto play, navigation), 1 horizental, 2 vertical, 5 horizental reverse, 6 vertical reverse, default value is 1
						$DragOrientation: orientation == 'v' ? 2 : 1, 		//[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $DisplayPieces is greater than 1, or parking position is not 0)
						$HWA: false, 										//[Optional] Hardware Acceleration - adds transform styles for slider elements. Set to false, because affects the quality of pictures in the slide.

						$BulletNavigatorOptions: {                          //[Optional] Options to specify and enable navigator or not
							$Class: $JssorBulletNavigator$,                 //[Required] Class to create navigator instance
							$ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always
							$AutoCenter: 0,                                 //[Optional] Auto center navigator in parent container, 0 None, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
							$Steps: listSteps,                              //[Optional] Steps to go for each navigation request, default value is 1
							$Lanes: 1,                                      //[Optional] Specify lanes to arrange items, default value is 1
							$SpacingX: 0,                                   //[Optional] Horizontal space between each item in pixel, default value is 0
							$SpacingY: 0,                                   //[Optional] Vertical space between each item in pixel, default value is 0
							$Orientation: orientation == 'v' ? 2 : 1        //[Optional] The orientation of the navigator, 1 horizontal, 2 vertical, default value is 1
						},

						$ArrowNavigatorOptions: {
							$Class: $JssorArrowNavigator$,              	//[Requried] Class to create arrow navigator instance
							$ChanceToShow: 1,                               //[Required] 0 Never, 1 Mouse Over, 2 Always
							$AutoCenter: orientation == 'v' ? 1 : 2,        //[Optional] Auto center navigator in parent container, 0 None, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
							$Steps: listSteps                               //[Optional] Steps to go for each navigation request, default value is 1
						}
					};

				var $sliderContainer = jQuery('#' + listShellId);
				if($sliderContainer.find('.umsMnlJssorSlide').length) {
					$sliderContainer.show();
					map.setParam('simple_slider', new $JssorSlider$(listShellId, sliderOpts));
				} else {
					$sliderContainer.hide();
				}

				// Additional width improvements - maybe this was wrong...
				if(orientation == 'v') {
					jQuery('#'+ listShellId).width( slideWidth ).children('div:first').width( slideWidth );
				} else {
					jQuery('#'+ listShellId).width( parentWidth ).children('div:first').width( parentWidth );
				}
				break;
			case 'table':
				if(!sliderInitialize) {
					map.setParam('original_slider_html', jQuery('#'+ listShellId).html());
					map.setParam('simple_slider_id', listShellId);
				}
				map.setParam('simple_slider', 'simple_slider_table');
				break;
		}
	}
}
var umsRebuildListHtmlTimeout = null;
function umsRebuildListHtml(maps) {
	if(umsRebuildListHtmlTimeout) {
		clearTimeout(umsRebuildListHtmlTimeout);
	}
	umsRebuildListHtmlTimeout = setTimeout(function() {
		for(var i = 0; i < maps.length; i++) {
			if(maps[i].getParam('markers_list_type').length) {
				var $sliderContent = jQuery('#' + maps[i].getParam('simple_slider_id'))
				,	$findBtn = $sliderContent.closest('.ums_map_opts').find('.umsImproveSearchFindBtn')
				;
				$sliderContent.html(maps[i].getParam('original_slider_html'));
				if($findBtn.length && window.umsCustomControlsPro && window.umsCustomControlsPro.isSearched == true) {
					$findBtn.trigger('click');
				} else {
					umsBuildListHtml(maps[i]);
				}
				if(parseInt(maps[i].getParam('enable_directions_btn'))) {
					umsAddDirectionsBtnToMarkersList(maps[i]);
				}
			}
		}
		umsRebuildListHtmlTimeout = null;
	}, 50);
}
function umsMmlShowPopupById(mapid, markerid) {
	var map = umsGetMapByViewId(mapid);
	if (map) {
		var markerId = map.getParam('membershipEnable') == 1 ? markerid : parseInt(markerid);
		var marker = map.getMarkerById(markerId);
	}
	//debugger;
	if (marker) {
		var position = marker.getPosition();
		if (map.getClasterer()) {
			map.setZoom(15);
			marker._map.setCenter(position['lat'], position['lng']);
			//map.markersRefresh();
			setTimeout(function() {
				marker._map.setCenter(position['lat'], position['lng']);
				marker.directOpenInfoWnd();
		  	}, 1000	);
		} else {
			marker._map.setCenter(position['lat'], position['lng']);
			marker.directOpenInfoWnd();
		}
	}
	// window.marker = marker;
	// window.map = map;
}
function umsMmlGoToSlideSimpleSliderClk(clkBtn) {
	var btn = jQuery(clkBtn)
	,	slide;

	switch(btn.data('slider-type')) {
		case 'jssor':
			slide = jQuery(btn.parents('.umsMnlJssorSlide:first'));
			break;
		case 'table':
			slide = jQuery(btn.parents('.umsMmlSlideTableRow:first'));
			break;
		default:
			break;
	}
	var mapViewId = slide.data('map-view-id')
	,	map = umsGetMapByViewId(mapViewId);
//	console.log(map);
	if(map) {
		var markerId = map.getParam('membershipEnable') == 1 ? slide.data('marker-id') : parseInt(slide.data('marker-id'))
		,	marker = map.getMarkerById(markerId)
		,	elemToScroll = jQuery(btn.attr('href'));



//console.log(markerId, marker);

		if (marker) {
			var position = marker.getPosition();
			if (map.getClasterer()) {
				map.setZoom(15);
				marker._map.setCenter(position['lat'], position['lng']);
				//map.markersRefresh();
				setTimeout(function() {
					marker._map.setCenter(position['lat'], position['lng']);
					marker.directOpenInfoWnd();
				}, 1000	);
			} else {
				marker._map.setCenter(position['lat'], position['lng']);
				marker.directOpenInfoWnd();
			}
		}
		if (elemToScroll.length) {
			jQuery('html, body').animate({scrollTop: elemToScroll.offset().top - 40}, 500);
		}
		return false;
	}
}
function umsMmlOpenMarkerGroupContainer(elem) {
	var tableElem = jQuery(elem)
	,	viewId = tableElem.data('map-view-id')
	,	sliderShell = jQuery('#umsMmlSimpleSlider_' + viewId)
	,	tableDiv = tableElem.next('.umsMarkerGroupWrapper');

	if(tableDiv.hasClass('active')) {
		tableDiv.removeClass('active').slideUp();
	} else {
		tableDiv.find('.umsMarkerGroupWrapper').removeClass('active').slideUp();
		tableDiv.addClass('active').slideDown();
	}
}
function umsMmlScrollTo(marker) {
	var map = marker.getMap();
	if(map) {
		var simpleSlider = map.getParam('simple_slider')
		,	simpleSliderId = map.getParam('simple_slider_id')
		,	markerId = marker.getId();
		if(simpleSlider && simpleSliderId) {
			var slideIndex = parseInt(jQuery('#'+ simpleSliderId).find('.umsMnlJssorSlide[data-marker-id="'+ markerId+ '"]').data('slide-id'));
			if(!isNaN(slideIndex)) {
				simpleSlider.$PlayTo( slideIndex );
			}
		}
	}
}
function umsMmlScaleSliders() {
	var allMaps = umsGetAllMaps();
	if(allMaps && allMaps.length) {
		for(var i = 0; i < allMaps.length; i++) {
			var simpleSlider = allMaps[i].getParam('simple_slider');
			if(simpleSlider) {
				// TODO: finish this
				var parentWidth = jQuery('#'+ allMaps[i].getViewHtmlId()).width();
				/*if(parentWidth <= slideWidth * 2) {
					slideWidth = parentWidth / 2;
				}*/
			}
		}
	}
}
function _umsRebuildVerticalOrientation(map, params) {
	jQuery(window).on('resize', function() {
		var mapShellSelector = '#'+ map.getViewHtmlId()
			,	viewHtmlMbsId = map.getParam('view_html_mbs_id');
		//membership integration
		if(viewHtmlMbsId) {
			mapShellSelector = viewHtmlMbsId;
		}

		var mapShell = jQuery(mapShellSelector).parents('.umsMapDetailsContainer:first')
			,	sliderShell = jQuery('#'+ params.listShellId).parents('.umsMapProControlsCon:first')
			,	slideWidth = params.slideWidth
			,	arrows = sliderShell.find('[data-type="arrow"]')
			,	navigator = sliderShell.find('[data-type="navigator"]')
			,   container = mapShell.parent();

		mapShell.css({
			'float': 'left'
			,	'width': container.width() - slideWidth - 5 + 'px'
		});

		sliderShell.css({
			'float': 'right'
			,	'width': slideWidth
		});

		if(!arrows.data('rotated')) {
			arrows.rotate(90).data('rotated', 1);
		}
		if(!navigator.data('moved')) {
			navigator.data('moved');
		}
	});
	var mapShellSelector = '#'+ map.getViewHtmlId()
	,	viewHtmlMbsId = map.getParam('view_html_mbs_id');
	//membership integration
	if(viewHtmlMbsId) {
		mapShellSelector = viewHtmlMbsId;
	}

	var mapShell = jQuery(mapShellSelector).parents('.umsMapDetailsContainer:first')
	,	sliderShell = jQuery('#'+ params.listShellId).parents('.umsMapProControlsCon:first')
	,	slideWidth = params.slideWidth
	,	arrows = sliderShell.find('[data-type="arrow"]')
	,	navigator = sliderShell.find('[data-type="navigator"]');

	mapShell.css({
		'float': 'left'
	,	'width': mapShell.width() - slideWidth - 5//'calc(100% - '+ (slideWidth + 5)+'px)'
	});
	sliderShell.css({
		'float': 'right'
	,	'width': slideWidth
	});
	if(!arrows.data('rotated')) {
		arrows.rotate(90).data('rotated', 1);
	}
	if(!navigator.data('moved')) {
		navigator.data('moved');
	}
}
function _umsRebuildHorizontalOrientation(map, params) {
	jQuery('#'+ params.listShellId).css({
		'margin-top': '5px',
		'margin-bottom': '35px'	// For navigation buttons with absolute position
	});
}
