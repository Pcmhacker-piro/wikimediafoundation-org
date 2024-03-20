jQuery(document).bind('gmapBeforeMapInit', function(event, map){
	var controlToPosition =  {
		type_control_position: 'mapTypeControlOptions', zoom_control_position: 'zoomControlOptions', street_view_control_position: 'streetViewControlOptions',
		pan_control_position: 'panControlOptions'
	};
	for(var dbKey in controlToPosition) {
		var controlPosition = map.getParam( dbKey ) ? map.getParam( dbKey ) : jQuery('[name="map_opts['+dbKey+']"]').val();
		if(controlPosition && google.maps.ControlPosition[ controlPosition ]) {
			var mapControlOptions = map.getParam( controlToPosition[dbKey] ) || {};
			mapControlOptions.position = google.maps.ControlPosition[ controlPosition ];
			map.setParam(controlToPosition[dbKey], mapControlOptions);
		}
	}
	if(parseInt(map.getParam('center_on_cur_user_pos'))) {
		umsMapCenteredOnCurUserPos(map);
	}
	if(parseInt(map.getParam('enable_full_screen_btn'))) {
		map.setParam('fullscreenControl', false);
	}
});
jQuery(document).bind('umsAfterMapInit', function(event, map){
	if(parseInt(map.getParam('enable_trafic_layer'))) {
		if(!map.getLayer('trafic')) {
			map.createTraficLayer();
		}
		map.enbLayer('trafic');
	}
	if(parseInt(map.getParam('enable_transit_layer'))) {
		if(!map.getLayer('transit')) {
			map.createTransitLayer();
		}
		map.enbLayer('transit');
	}
	if(parseInt(map.getParam('enable_bicycling_layer'))) {
		if(!map.getLayer('bicycling')) {
			map.createBicyclingLayer();
		}
		map.enbLayer('bicycling');
	}
	if(parseInt(map.getParam('enable_full_screen_btn'))) {
		google.maps.event.addListenerOnce(map.getRawMapInstance(), 'tilesloaded', function(){
			var fullScreenControlDiv = document.getElementById('umsFullScreenBtn_' + map.getParam('view_id'));
			map.getRawMapInstance().controls[google.maps.ControlPosition.TOP_RIGHT].push( fullScreenControlDiv );
			jQuery(fullScreenControlDiv).show();
		});
	}
	umsStylesToggle(map, 'hide_poi');
	umsStylesToggle(map, 'hide_countries');
});
jQuery(document).bind('umsAfterMarkersRefresh', function(event, map){
	if(parseInt(map.getParam('enable_infownd_print_btn'))) {
		var viewId = map.getParam('view_id')
		,	mapMarkers = map.getAllMarkers()
		,	printBtnDiv = jQuery('#umsPrintInfoWndBtn_' + viewId);

		for(var i = 0; i < mapMarkers.length; i++){
			var markerId = map._markers[i]._markerParams.id
			,	curPrintBtnDiv = jQuery(printBtnDiv).clone(true);

			curPrintBtnDiv.attr('id', 'umsPrintInfoWndBtn_' + viewId + '_' + markerId);
			curPrintBtnDiv.attr('data-marker-id', markerId);
			curPrintBtnDiv.css('display', 'inline-block');
			if(!map._markers[i]._infoWindow)
				map._markers[i]._infoWndPrintBtn = curPrintBtnDiv;
		}
	}
});
umsGoogleMap.prototype.enbLayer = function(layer) {
	if(this._layers[ layer ]) {
		this._layers[ layer ].setMap( this.getRawMapInstance() );
	}
};
umsGoogleMap.prototype.dsblLayer = function(layer) {
	if(this._layers[ layer ]) {
		this._layers[ layer ].setMap( null );
	}
};
umsGoogleMap.prototype.getLayer = function(layer) {
	return this._layers[ layer ];
};
umsGoogleMap.prototype.createLayer = function(layer, object) {
	this._layers[ layer ] = object;
	return this;
};
umsGoogleMap.prototype.createTraficLayer = function() {
	this.createLayer('trafic', new google.maps.TrafficLayer());
	return this;
};
umsGoogleMap.prototype.createTransitLayer = function() {
	this.createLayer('transit', new google.maps.TransitLayer());
	return this;
};
umsGoogleMap.prototype.createBicyclingLayer = function() {
	this.createLayer('bicycling', new google.maps.BicyclingLayer());
	return this;
};
// Pro version of method
// see free version here - google-maps-easy/modules/gmap/js/core.gmap.js
umsGoogleMap.prototype._getBoundsHandler = function(){
	var bounds = new google.maps.LatLngBounds();

	bounds = this._getMapMarkersBounds(bounds);
	bounds = this._getMapShapesBounds(bounds);
	this._setMapBounds(bounds);
};
umsGoogleMap.prototype._getMapShapesBounds = function(bounds){
	var shapes = this.getAllShapes();

	for(var i = 0; i < shapes.length; i++) {
		switch(shapes[i].getType()) {
			case 'circle':
				bounds.union(shapes[i].getBounds());
				break;
			case 'polygon': case 'polyline':
			shapes[i].getPath().forEach(function(element, index) {
				bounds.extend(element);
			});
			break;
			default:
				break;
		}
	}
	return bounds;
};
var umsFullScreenMaps = {
	_maps: {}
	,	enableFullScreen: function(viewId, btn) {
			var mapCon = jQuery('#mapConElem_'+ viewId)
	,			detailsCon = jQuery('#umsMapDetailsContainer_'+ viewId)
	,			mapPrevCon = jQuery('#google_map_easy_'+ viewId);
			this._maps[ viewId ] = {
				mapConSize: {
					width: mapCon.width()
	,				height: mapCon.height()
				}
	,			mapConZindex: mapCon.css('z-index')
	,			detailsConSize: {
					width: detailsCon.width()
	,				height: detailsCon.height()
				}
	,			mapPrevConSize: {
					width: mapPrevCon.width()
	,				height: mapPrevCon.height()
				}
			};
			mapCon.css({
				'position': 'fixed'
	,			'left': '0'
	,			'top': '0'
	,			'width': '100%'
	,			'height': '100%'
	,			'z-index': '9999999'
			});
			detailsCon.css({
				'width': '100%'
	,			'height': '100%'
			});
			mapPrevCon.css({
				'width': '100%'
	,			'height': '100%'
			});
			jQuery(btn).addClass('umsActive').html( jQuery(btn).data('disabletxt') );
			this._refreshMap(viewId);
		}
	,	disableFullScreen: function(viewId, btn) {
			var mapCon = jQuery('#mapConElem_'+ viewId)
	,			detailsCon = jQuery('#umsMapDetailsContainer_'+ viewId)
	,			mapPrevCon = jQuery('#google_map_easy_'+ viewId);

			mapCon.css({
				'position': 'relative'
	,			'width': this._maps[ viewId ].mapConSize.width
	,			'height': this._maps[ viewId ].mapConSize.height
	,			'z-index': this._maps[ viewId ].mapConZindex
			});
			detailsCon.css({
				'width': this._maps[ viewId ].detailsConSize.width
	,			'height': this._maps[ viewId ].detailsConSize.height
			});
			mapPrevCon.css({
				'width': this._maps[ viewId ].mapPrevConSize.width
	,			'height': this._maps[ viewId ].mapPrevConSize.height
			});
			jQuery(btn).removeClass('umsActive').html( jQuery(btn).data('enabletxt') );
			this._refreshMap(viewId);
		}
	,	_refreshMap: function(viewId) {
			var map = umsGetMapByViewId(viewId)
	,			x = map.getZoom()
	,			c = map.getCenter();
			google.maps.event.trigger(map.getRawMapInstance(), 'resize');
			map.setZoom(x);
			map.setCenter(c);

	}
};
function umsSwitchFullscreenBtn(btn){
	var viewId = jQuery(btn).data('viewid');
	if(jQuery(btn).hasClass('umsActive')) {
		umsFullScreenMaps.disableFullScreen(viewId, btn);
	} else {
		umsFullScreenMaps.enableFullScreen(viewId, btn);
	}
}
function umsStylesToggle(map, param) {
	var val = parseInt(map.getParam(param));

	if(val) {
		umsSetMapStyle(map, param, 'off');
	} else {
		umsSetMapStyle(map, param, 'on');
	}
}
function umsSetMapStyle(map, param, action) {
	var currentMapStyle = map.get('styles')
	,	newMapStyle = {}
	,	enabledStyle = {};

	switch(param) {
		case 'hide_poi':
			enabledStyle = {
				umsHidePoiOption: true
			,	featureType: 'poi'
			,	elementType: 'labels'
			,	stylers: [{
					visibility: action
				}]
			};
			break;
		case 'hide_countries':
			enabledStyle = {
				umsHideCountriesOption: true
			,	featureType: 'administrative'
			,	stylers: [{
					visibility: action
				}]
			};
			break;
		default:
			break;
	}
	if(currentMapStyle) {
		newMapStyle = currentMapStyle;
		newMapStyle[newMapStyle.length] = enabledStyle;
	} else {
		newMapStyle = [ enabledStyle ];
	}
	map.getRawMapInstance().setOptions({styles: newMapStyle});
}
function umsMapCenteredOnCurUserPos(map) {
	if(!UMS_DATA.isAdmin) {
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				function (position) {
					var curUserPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
					,	params = {
						id: '-1'
					,	position: curUserPos
					,	icon: map.getParam('center_on_cur_user_pos_icon_path')
					,	title: 'You are here!'
					}
					,	marker = new umsGoogleMarker(map, params);

					if(parseInt(map.getParam('enable_directions_btn'))) {
						marker._infoWndDirectionsBtn = umsGetDirectionsBtn('-1', map);
					}
					map._markers[map._markers.length] = marker;
					map.setCenter(curUserPos);
				}
			,	function (failure) {
					console.log('Geolocation service error: ' + failure.message);
					return;
			});
		}
	}
}
function umsPrintInfoWndContent(btn) {
	jQuery(btn).parents('div:first').print({
		globalStyles: true,
		mediaPrint: false,
		iframe: false,
		timeout: 250,
		title: null,
		noPrintSelector : '.umsNoPrint',
		doctype: '<!doctype html>'
	});
}
