function umsBingShape(map, params) {
	umsBingShape.superclass.constructor.apply(this, arguments);
}
extendUms(umsBingShape, umsBaseShape);
umsBingShape.prototype.init = function() {
	if(typeof(Microsoft.Maps.SpatialMath) === 'undefined' || typeof(Microsoft.Maps.Contour) === 'undefined') {
		Microsoft.Maps.loadModule(['Microsoft.Maps.SpatialMath', 'Microsoft.Maps.Contour'], jQuery.proxy(function () {
			//console.log('Loaded!');
			umsBingShape.superclass.init.apply(this, arguments);
			//console.log(this);
		}, this));
	} else {
		//console.log('not need toload?');
	}
};
umsBingShape.prototype._createShapeObj = function() {
	//var center = new Microsoft.Maps.Location(this._shapeParams.center.lat, this._shapeParams.center.lng);
	var shape = null;
	var commonParams = {
		fillColor: this._toRgbaColor(this._shapeParams.fillColor, this._shapeParams.fillOpacity)
	,	strokeColor: this._toRgbaColor(this._shapeParams.strokeColor, this._shapeParams.strokeOpacity)
	,	strokeThickness: this._shapeParams.strokeWeight
	};
	switch(this._shapeParams.type) {
		case 'circle':
			//var locs = Microsoft.Maps.SpatialMath.getRegularPolygon(center, this._shapeParams.radius, 36, Microsoft.Maps.SpatialMath.DistanceUnits.Meters);
			commonParams['strokeThickness'] = parseInt(commonParams['strokeThickness'], 10);
			shape = new Microsoft.Maps.Polygon(this._getCirclePoints(), commonParams);
			break;
		case 'polygon':
			commonParams['strokeThickness'] = parseInt(commonParams['strokeThickness'], 10);
			shape = new Microsoft.Maps.Polygon(this._pathToLatLngArray(this._shapeParams.path), commonParams);
			this._map.getRawMapInstance().entities.push(shape);
			break;
		case 'polyline':
			commonParams['strokeThickness'] = parseInt(commonParams['strokeThickness'], 10);
			shape = new Microsoft.Maps.Polyline(this._pathToLatLngArray(this._shapeParams.path), commonParams);
			break;
		 default:
			 console.log('Undefined shape Type? Add it:)');
			 break;
	}
	this._map.getRawMapInstance().entities.push(shape);
	return shape;
};
umsBingShape.prototype._toRgbaColor = function(color, opacity) {
	var colorObj = Microsoft.Maps.Color.fromHex(color);
	opacity = parseFloat(opacity);
	if(isNaN(opacity))
		opacity = 1;
	colorObj.a = opacity;
	return colorObj;
};
umsBingShape.prototype.addEventListener = function(event, callback) {
	Microsoft.Maps.Events.addHandler(this._shapeObj, event, callback);
	//this._shapeObj.on(event, callback);
};
umsBingShape.prototype.setRadius = function(radius) {
	umsBingShape.superclass.setRadius.apply(this, arguments);
	this._shapeObj.setLocations(this._getCirclePoints());
};
umsBingShape.prototype._getCirclePoints = function() {
	return Microsoft.Maps.SpatialMath.getRegularPolygon(new Microsoft.Maps.Location(this._shapeParams.center.lat, this._shapeParams.center.lng), this._shapeParams.radius, 36, Microsoft.Maps.SpatialMath.DistanceUnits.Meters);
};
umsBingShape.prototype.setCenter = function(center) {
	umsBingShape.superclass.setCenter.apply(this, arguments);
    this._shapeObj && this._shapeObj.setLocations(this._getCirclePoints());
};
umsBingShape.prototype.setStrokeOpacity = function(val) {
	// TODO: Add here color reset
	/*this._shapeObj.setOptions({
		polygonOptions: val
	});*/
};
umsBingShape.prototype.setStrokeWeight = function(val) {
    this._shapeObj && this._shapeObj.setOptions({
		polygonOptions: {
			strokeThickness: val
		}
	});
};
umsBingShape.prototype.setFillOpacity = function(val) {
	/*this._shapeObj.setStyle({
		fillOpacity: val
	});*/
};
umsBingShape.prototype.setStrokeColor = function(val) {
	this._shapeObj.setOptions({
		polygonOptions: {
			strokeColor: val
		}
	});
};
umsBingShape.prototype.setFillColor = function(val) {
	this._shapeObj.setOptions({
		polygonOptions: {
			fillColor: val
		}
	});
};
umsBingShape.prototype.setMap = function(map) {
	if(!map) {
		this._map.getRawMapInstance().layers.remove(this._shapeObj);
	} else {
		this._shapeObj.addTo(this._map.getRawMapInstance());
	}
	this._map = map;
};
umsBingShape.prototype._getEventCoords = function(e) {
	long = e.location.longitude;
	lat = e.location.latitude;
	//var latlng = this._map.getRawMapInstance().mouseEventToLatLng(e.originalEvent);
	return {lat: lat, lng: long};
};
umsBingShape.prototype._updateInfoWndContent = function() {
	this._closeInfoBoxes();
	var description = this._shapeParams.description ? this._shapeParams.description.replace(/\n/g, '<br/>') : false
	,	title = this._shapeParams.title ? this._shapeParams.title : false
	,	content = (title ? '<h3 class="umsMarkerTitle">' + title + '</h3>' : '')
			+ (description ? '<div class="umsMarkerDesc">' + description + '</div>' : '');

	if(!this._infoWindow) {
		var latitude = this._shapeParams.center.lat;
		var longitude = this._shapeParams.center.lng;
		var center = this._map.getRawMapInstance().getCenter();
		center['latitude'] = parseFloat(latitude);
		center['longitude'] = parseFloat(longitude);

		if(this._map.getParam('marker_infownd_width_units') === 'px') {
			var width = parseInt(this._map.getParam('marker_infownd_width'));
		}
		 else {
			var width = 200;
		}
		if(this._map.getParam('marker_infownd_height_units') === 'px') {
			var height = parseInt(this._map.getParam('marker_infownd_height'));
		}
		else {
			var height = 200;
		}

		this._infoWindow = new Microsoft.Maps.Infobox(center, {
			title: title,
			description: description,
			visible: false,
			autoAlignment: true,
			maxHeight: height,
			maxWidth: width,
		});

		this._infoWindow.setMap(this._map.getRawMapInstance());
		this._shapeParams.infoBox = this._infoWindow;
		//console.log(this._shapeParams);
		this._map.getRawMapInstance();
		//	this._infoWindow = new L.popup();
		//	this._shapeObj.bindPopup(this._infoWindow); // add popups
		//var location  = {latitude: latitude, longitude: longitude, altitude: 0, altitudeReference: -1};
	}

	//this._infoWindow.setContent( content );
};
umsBingShape.prototype._openInfoWnd = function() {
	this._closeInfoBoxes();
	var latitude = this._shapeParams.center.lat;
	var longitude = this._shapeParams.center.lng;
	this._shapeParams.infoBox.setOptions({
		visible:true,
	});
	//Move map center to shape coord.
	//this._map.setCenter(latitude, longitude);
	//this._shapeObj.openPopup();
};
umsBingShape.prototype._closeInfoWnd = function() {
	//this._shapeObj.closePopup();
};
umsBingShape.prototype._closeInfoBoxes = function() {
	var allMapMArkers = this._map.getAllMarkers();
	if (allMapMArkers && allMapMArkers.length > 1) {
		for(var i = 0; i < allMapMArkers.length; i++) {
			if (allMapMArkers[i]._markerParams.infoBox) {
				allMapMArkers[i]._markerParams.infoBox.setOptions({
					visible:false,
				});
			}
		}
	}
	var allMapShapes = this._map.getAllShapes();
	if(allMapShapes && allMapShapes.length > 1) {
		for(var i = 0; i < allMapShapes.length; i++) {
			if (allMapShapes[i]._shapeParams.infoBox) {
				allMapShapes[i]._shapeParams.infoBox.setOptions({
					visible:false,
				});
			}
		}
	}
}
umsBingShape.prototype.setPath = function(path) {
	umsBingShape.superclass.setPath.apply(this, arguments);
   if (this._shapeObj != null) {
      this._shapeObj.setLocations(this._pathToLatLngArray(this._shapeParams.path));
   }
};
umsBingShape.prototype._pathToLatLngArray = function(path) {
	var res = [];
	for(var i = 0; i < path.length; i++) {
		res.push(new Microsoft.Maps.Location(path[i].lat, path[i].lng));
	}
	return res;
};
