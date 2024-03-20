// Shapes
function umsBaseShape(map, params) {
	this._map = map;
	this._shapeObj = null;
	if(!params.path && params.coords) {
		params.path = this._getShapePath(params.coords);
	}
	if(!params.center && params.coords) {
		params.center = this._getShapeCenter(params.coords);
	}
	if(!params.radius) {
		params.radius = this._getShapeRadius(params.coords);
	}
	this._shapeParams = jQuery.extend({}, params);
	//this._shapeParams.map = this._map.getRawMapInstance();
	this._infoWindow = null;
	this._infoWndOpened = false;
	this._infoWndWasInited = false;
	this._infoWndPosition = false;
	this._createdFromCenter = false;
	this._mapDragScroll = {
		scrollwheel: null
	};
	this.init();
}
umsBaseShape.prototype._getShapePath = function(coords) {
	var path = [];
	for(var i in coords) {
		path.push({
			lat: coords[i].coord_x ? coords[i].coord_x : coords[i].lat
		,	lng: coords[i].coord_y ? coords[i].coord_y : coords[i].lng
		});
	}
	return path;
};
umsBaseShape.prototype._getShapeCenter = function(coords) {
	var pointPos = {};

	for(var i in coords) {
		pointPos = {
			lat: coords[i].coord_x ? coords[i].coord_x : coords[i].lat
		,	lng: coords[i].coord_y ? coords[i].coord_y : coords[i].lng
		};
		break;	// We need only first value bun we do not know its index
	}
	return pointPos;
};
umsBaseShape.prototype._getShapeRadius = function(coords) {
	var radius = 0;

	for(var i in coords) {
		radius = coords[i].radius && isNumber(coords[i].radius) ? parseInt(coords[i].radius) : radius;
		break;	// We need only first value bun we do not know its index
	}
	return radius;
};
umsBaseShape.prototype.init = function() {
	this._shapeObj = this._createShapeObj();
	this.addEventListener('click', jQuery.proxy(function (e) {
		this._infoWndPosition = this._getEventCoords(e);
		this.showInfoWnd();
		jQuery(document).trigger('umsAfterShapeClick', this);
	}, this));
	// Init info wnd
	if(this._shapeParams.created_from_center)
		this._createdFromCenter = true;
};
// Retrieve cords in required format from click event for example. Need to be re-defined
umsBaseShape.prototype._getEventCoords = function(e) {
	this._methodRedefineNotice('umsBaseShape.prototype._getEventCoords');
};
umsBaseShape.prototype.getType = function() {
	return this._shapeParams.type;
};
umsBaseShape.prototype._createShapeObj = function() {
	this._methodRedefineNotice('umsBaseShape.prototype._createShapeObj');
};
umsBaseShape.prototype.addEventListener = function(event, callback) {
	this._methodRedefineNotice('umsBaseShape.prototype.addEventListener');
};
umsBaseShape.prototype.setRadius = function(radius) {
	this._shapeParams.radius = radius;
};
umsBaseShape.prototype.setCenter = function(center) {
	this._shapeParams.center = center;
};
umsBaseShape.prototype.setPath = function(path) {
	this._shapeParams.path = path;
};
umsBaseShape.prototype.setId = function(id) {
	this._shapeParams.id = id;
};
umsBaseShape.prototype.getId = function() {
	return this._shapeParams.id;
};
umsBaseShape.prototype._methodRedefineNotice = function(methodName) {
	console.log('['+ methodName+ '] should be re-defined!');
};
umsBaseShape.prototype.setStrokeOpacity = function(val) {

};
umsBaseShape.prototype.setStrokeWeight = function(val) {

};
umsBaseShape.prototype.setFillOpacity = function(val) {

};
umsBaseShape.prototype.setStrokeColor = function(val) {

};
umsBaseShape.prototype.setFillColor = function(val) {

};
umsBaseShape.prototype.getRawShapeInstance = function() {
	return this._shapeObj;
};
umsBaseShape.prototype.getRawShapeParams = function() {
	return this._shapeParams;
};
umsBaseShape.prototype.setMap = function() {
	this._methodRedefineNotice('umsBaseShape.prototype.setMap');
};
umsBaseShape.prototype.showInfoWnd = function() {
	/*var allMarkers = this._map.getAllMarkers();
	if(allMarkers && allMarkers.length) {
		for(var i = 0; i < allMarkers.length; i++) {
			if(allMarkers[i]._infoWndOpened) allMarkers[i].hideInfoWnd();
		}
	}*/
	if(!this._infoWndWasInited) {
		this._updateInfoWndContent();
		this._infoWndWasInited = true;
	} else {
		this._updateInfoWndPosition();
		if(this._infoWndOpened)
			this.hideInfoWnd();
	}
	if(this._infoWindow && !this._infoWndOpened) {
		/*var allMapShapes = this._map.getAllShapes();
		if(allMapShapes && allMapShapes.length > 1) {
			// Google Maps Javascript API v3 allows to open several infowindows on map
			for(var i = 0; i < allMapShapes.length; i++) {
				allMapShapes[i].hideInfoWnd();
			}
		}*/
		this._openInfoWnd();
		//this._infoWindow.open(this._map.getRawMapInstance(), this.getRawShapeInstance());
		this._infoWndOpened = true;
	}
};
umsBaseShape.prototype._updateInfoWndContent = function() {
	this._methodRedefineNotice('umsBaseShape.prototype._updateInfoWndContent');
};
umsBaseShape.prototype._openInfoWnd = function() {
	this._methodRedefineNotice('umsBaseShape.prototype._updateInfoWndContent');
};
umsBaseShape.prototype.hideInfoWnd = function() {
	this._closeInfoWnd();
	this._infoWndOpened = false;
};
umsBaseShape.prototype._closeInfoWnd = function() {
	this._methodRedefineNotice('umsBaseShape.prototype._closeInfoWnd');
};
umsBaseShape.prototype._updateInfoWndPosition = function() {
	// Don't know what to do now
};
umsBaseShape.prototype.setPointOnClick = function(coords) {
	switch(this.getType()) {
		case 'circle':
			this.setCenter(coords);
			break;
		default:
			// It will be added in g_umsShapesEditor.addPointRow
			break;
	}
};
umsBaseShape.prototype.setTitle = function(title, noRefresh) {
	this._shapeParams.title = title;
	if(!noRefresh)
		this._updateInfoWndContent();
};
umsBaseShape.prototype.setDescription = function (description, noRefresh) {
	this._shapeParams.description = description;
	if(!noRefresh)
		this._updateInfoWndContent();
};
var umsShapeLoader = {
	initShape: function(map, params) {
		var engine = umsGetMapsEngine(map);
		return new window['ums'+ toeStrFirstUp(engine)+ 'Shape'](map, params);
	}
};
/*function umsGoogleShape(map, params) {
	this._map = map;
	this._shapeObj = null;
	var defaults = {
		// Empty for now
	};
	if(!params.path && params.coords) {
		params.path = umsGetShapePath(params.coords);
	}
	if(!params.center && params.coords) {
		params.center = umsGetShapeCenter(params.coords);
	}
	if(!params.radius) {
		params.radius = umsGetShapeRadius(params.coords);
	}
	this._shapeParams = jQuery.extend({}, defaults, params);
	this._shapeParams.map = this._map.getRawMapInstance();
	this._infoWindow = null;
	this._infoWndOpened = false;
	this._infoWndWasInited = false;
	this._infoWndPosition = false;
	this._createdFromCenter = false;
	this._mapDragScroll = {
		scrollwheel: null
	};
	this.init();
}
umsGoogleShape.prototype.init = function() {
	switch(this._shapeParams.type) {
		case 'circle':
			this._shapeObj = new google.maps.Circle( this._shapeParams );
			this._shapeObj.addListener('click', jQuery.proxy(function (e) {
				this._infoWndPosition = e.latLng;
				this.showInfoWnd();
				jQuery(document).trigger('umsAfterShapeClick', this);
			}, this));
			break;
		case 'polygon':
			this._shapeObj = new google.maps.Polygon( this._shapeParams );
			this._shapeObj.addListener('click', jQuery.proxy(function (e) {
				this._infoWndPosition = e.latLng;
				this.showInfoWnd();
				jQuery(document).trigger('umsAfterShapeClick', this);
			}, this));
			break;
		case 'polyline': default:
			this._shapeObj = new google.maps.Polyline( this._shapeParams );
			break;
	}
	if(this._shapeParams.created_from_center)
		this._createdFromCenter = true;
};
umsGoogleShape.prototype.infoWndOpened = function() {
	return this._infoWndOpened;
};
umsGoogleShape.prototype.showInfoWnd = function() {
	var allMarkers = this._map.getAllMarkers();
	if(allMarkers && allMarkers.length) {
		for(var i = 0; i < allMarkers.length; i++) {
			if(allMarkers[i]._infoWndOpened) allMarkers[i].hideInfoWnd();
		}
	}
	if(!this._infoWndWasInited) {
		this._updateInfoWndContent();
		this._infoWndWasInited = true;
	} else {
		this._updateInfoWndPosition();
		if(this._infoWndOpened)
			this.hideInfoWnd();
	}
	if(this._infoWindow && !this._infoWndOpened) {
		var allMapShapes = this._map.getAllShapes();
		if(allMapShapes && allMapShapes.length > 1) {
			// Google Maps Javascript API v3 allows to open several infowindows on map
			for(var i = 0; i < allMapShapes.length; i++) {
				allMapShapes[i].hideInfoWnd();
			}
		}
		this._infoWindow.open(this._map.getRawMapInstance(), this.getRawShapeInstance());
		this._infoWndOpened = true;
	}
};
umsGoogleShape.prototype._updateInfoWndPosition = function() {
	this._infoWindow.position = this._infoWndPosition;
};
umsGoogleShape.prototype.hideInfoWnd = function() {
	if(this._infoWindow && this._infoWndOpened) {
		this._infoWindow.close();
		this._infoWndOpened = false;

		var googleMap = this._map.getRawMapInstance();
		googleMap.setOptions( {scrollwheel: this._mapDragScroll.scrollwheel} );

		jQuery(document).trigger('umsAfterHideInfoWnd', this);
	}
};
umsGoogleShape.prototype._setInfoWndClosed = function() {
	this._infoWndOpened = false;
	jQuery(document).trigger('umsAfterHideInfoWnd', this);
};
umsGoogleShape.prototype._setInfoWndContent = function(newContentHtmlObj) {
	var self = this
	,	map = this.getMap();

	if (!this._infoWindow) {
		// It is common infowindow option: marker_infownd_width_units, marker_infownd_width, marker_infownd_height
		var mapWidth = UMS_DATA.isAdmin ? jQuery('#umsMapPreview').width() : jQuery('#' + map.getViewHtmlId()).width()
		,	infoWndWidth = map.getParam('marker_infownd_width_units') == 'px' ? map.getParam('marker_infownd_width') : mapWidth - 10
		,	infoWndHeight = map.getParam('marker_infownd_height_units') == 'px' ? map.getParam('marker_infownd_height')+ 'px' : false
		,	infoWndParams = { maxWidth: infoWndWidth };

		this._infoWndPosition = this._infoWndPosition
			? this._infoWndPosition
			: (typeof this.getRawShapeInstance().getPath == 'function' ? this.getPath().getAt(0) : this.getMap().getCenter());
		infoWndParams.position = this._infoWndPosition;
		this._infoWindow = new google.maps.InfoWindow(infoWndParams);

		google.maps.event.addListener(this._infoWindow, 'domready', function(){
			changeInfoWndType(map);
			changeInfoWndBgColor(map);
		});
		google.maps.event.addListener(this._infoWindow, 'closeclick', function(){
			self._setInfoWndClosed();
		});
	}
	if(infoWndHeight) {
		newContentHtmlObj.css('cssText', 'max-height: '+ infoWndHeight +';');
	}

	// Fix bug in FF - scroll on infowindow content changes map zoom
	var scrollwheel = map.get('scrollwheel')
	,	googleMap = map.getRawMapInstance();

	//Save scrollwheel setting to container before rewrite it.
	this._mapDragScroll.scrollwheel = scrollwheel;

	newContentHtmlObj.hover(
		function() {
			googleMap.setOptions( {scrollwheel: false} );
		},
		function() {
			googleMap.setOptions( {scrollwheel: scrollwheel} );
		}
	);
	this._infoWindow.setContent(newContentHtmlObj[0]);
};
umsGoogleShape.prototype._updateInfoWndContent = function() {
	var contentStr = jQuery('<div/>', {})
	,	title = this._shapeParams.title ? this._shapeParams.title : false
	,	description = this._shapeParams.description ? this._shapeParams.description.replace(/\n/g, '<br/>') : false;
	if(title) {
		var titleDiv = jQuery('<div/>', {})
			.addClass('umsInfoWindowtitle')
			.html( title );
		// It is common infowindow option
		var titleColor = this._map.getParam('marker_title_color');
		if(titleColor && titleColor != '') {
			titleDiv.css({
				'color': titleColor
			});
		}
		// It is common infowindow option
		var titleSize = this._map.getParam('marker_title_size')
		,	titleSizeUnits = this._map.getParam('marker_title_size_units');
		if(titleSize && titleSizeUnits && titleSize != '') {
			titleDiv.css({
				'font-size': titleSize + titleSizeUnits
			,	'line-height': titleSize + titleSizeUnits
			});
		}
		contentStr.append( titleDiv );
	}
	if(description) {
		var descDiv = jQuery('<div/>', {})
			.addClass('egm-shape-iw')
			.html( description );
		// It is common infowindow option
		var descSize = this._map.getParam('marker_desc_size')
		,	descSizeUnits = this._map.getParam('marker_desc_size_units');
		if(descSize && descSizeUnits && descSize != '') {
			descDiv.css({
				'font-size': descSize + descSizeUnits
				,	'line-height': parseInt(descSize) + 5 + descSizeUnits
			});
		}
		contentStr.append( descDiv );
		// Check scripts in description, and execute them if they are there
		var $scripts = contentStr.find('script');
		if($scripts && $scripts.length) {
			$scripts.each(function(){
				var scriptSrc = jQuery(this).attr('src');
				if(scriptSrc && scriptSrc != '') {
					jQuery.getScript( scriptSrc );
				}
			});
		}
	}
	this._setInfoWndContent( contentStr );
};


umsGoogleShape.prototype.removeFromMap = function() {
	this.getRawShapeInstance().setMap( null );
};
umsGoogleShape.prototype.setShapeParams = function(params) {
	this._shapeParams = params;
	return this;
};
umsGoogleShape.prototype.setShapeParam = function(key, value) {
	this._shapeParams[ key ] = value;
	return this;
};
umsGoogleShape.prototype.setMap = function( map ) {
	this.getRawShapeInstance().setMap( map );
};
umsGoogleShape.prototype.getMap = function() {
	return this._map;
};
umsGoogleShape.prototype.setVisible = function(state) {
	this.getRawShapeInstance().setVisible(state);
};
umsGoogleShape.prototype.getVisible = function(state) {
	this.getRawShapeInstance().getVisible(state);
};
umsGoogleShape.prototype.getShapeParams = function(){
	return this._shapeParams;
};
umsGoogleShape.prototype.getShapeParam = function(key){
	return this._shapeParams[ key ];
};
umsGoogleShape.prototype.setShapeParam = function(key, value){
	this._shapeParams[ key ] = value;
	return this;
};
umsGoogleShape.prototype.getBounds = function() {
	return this.getRawShapeInstance().getBounds();
};
umsGoogleShape.prototype.setStrokeColor = function(color) {
	this.setShapeParam('strokeColor', color);
	this.getRawShapeInstance().setOptions({ strokeColor: color });
};
umsGoogleShape.prototype.setStrokeOpacity = function(opacity) {
	this.setShapeParam('strokeOpacity', opacity);
	this.getRawShapeInstance().setOptions({ strokeOpacity: opacity });
};
umsGoogleShape.prototype.setStrokeWeight = function(weight) {
	this.setShapeParam('strokeWeight', weight);
	this.getRawShapeInstance().setOptions({ strokeWeight: weight });
};
umsGoogleShape.prototype.setFillColor = function(color) {
	this.setShapeParam('fillColor', color);
	this.getRawShapeInstance().setOptions({ fillColor: color });
};
umsGoogleShape.prototype.setFillOpacity = function(opacity) {
	this.setShapeParam('fillOpacity', opacity);
	this.getRawShapeInstance().setOptions({ fillOpacity: opacity });
};
umsGoogleShape.prototype.getPath = function() {
	return this.getRawShapeInstance().getPath();
};
umsGoogleShape.prototype.setPath = function(path) {
	this.setShapeParam('path', path);
	this.getRawShapeInstance().setPath(path);
};
umsGoogleShape.prototype.setCenter = function(point) {
	this.setShapeParam('center', point);
	this.getRawShapeInstance().setCenter(point);
};
umsGoogleShape.prototype.getCenter = function() {
	return this.getRawShapeInstance().getCenter();
};
umsGoogleShape.prototype.setRadius = function(val) {
	this.setShapeParam('radius', val);
	this.getRawShapeInstance().setRadius(val);
};
umsGoogleShape.prototype.getRadius = function() {
	return this.getRawShapeInstance().getRadius();
};
umsGoogleShape.prototype.setType = function(type) {
	this.setShapeParam('type', type);
};
umsGoogleShape.prototype.getType = function() {
	return this.getShapeParam('type');
};
umsGoogleShape.prototype.reinit = function() {
	this.removeFromMap();
	this.init();
};*/
// Common functions
function _umsPrepareShapesList(shapes, params) {
	params = params || {};
	if(shapes) {
		for(var i = 0; i < shapes.length; i++) {
			if(shapes[i].coords) {
				//shapes[i].path = umsGetShapePath(shapes[i].coords);
				shapes[i].geodesic = true;
				for(var j in shapes[i].params) {
					shapes[i][j] = shapes[i].params[j];
				}
			}
		}
	}
	return shapes;
}
/*function umsGetShapePath(coords) {
	var path = [];
	for(var i in coords) {
		var pointPos = new google.maps.LatLng(coords[i].coord_x, coords[i].coord_y);
		path.push(pointPos);
	}
	return path;
}*/
/*function umsGetShapeCenter(coords) {
	var pointPos = {};

	for(var i in coords) {
		pointPos = new google.maps.LatLng(coords[i].coord_x, coords[i].coord_y);
		break;	// We need only first value bun we do not know its index
	}
	return pointPos;
}*/
/*function umsGetShapeRadius(coords) {
	var radius = 0;

	for(var i in coords) {
		radius = coords[i].radius && isNumber(coords[i].radius) ? parseInt(coords[i].radius) : radius;
		break;	// We need only first value bun we do not know its index
	}
	return radius;
}*/
