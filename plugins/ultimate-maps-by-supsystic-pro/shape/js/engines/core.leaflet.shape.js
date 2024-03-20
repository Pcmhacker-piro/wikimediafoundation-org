function umsLeafletShape(map, params) {
	umsLeafletShape.superclass.constructor.apply(this, arguments);
}
extendUms(umsLeafletShape, umsBaseShape);
umsLeafletShape.prototype._createShapeObj = function() {
	var shape = null;
	var commonParams = {
		color: this._shapeParams.strokeColor
	,	opacity: this._shapeParams.strokeOpacity
	,	weight: this._shapeParams.strokeWeight
	,	fillColor: this._shapeParams.fillColor
	,	fillOpacity: this._shapeParams.fillOpacity
	};
	switch(this._shapeParams.type) {
		case 'circle':
			shape = new L.circle([this._shapeParams.center.lat, this._shapeParams.center.lng], jQuery.extend(commonParams, {
				radius: this._shapeParams.radius
			}));
			break;
		case 'polygon':
			shape = L.polygon(this._pathToLatLngArray(this._shapeParams.path), commonParams);
			break;
		case 'polyline':
			shape = L.polyline(this._pathToLatLngArray(this._shapeParams.path), commonParams);
			break;
		 default:
			 console.log('Undefined shape Type? Add it:)');
			 break;
	}
	shape.addTo(this._map.getRawMapInstance());
	return shape;
};
umsLeafletShape.prototype.addEventListener = function(event, callback) {
	this._shapeObj.on(event, callback);
};
umsLeafletShape.prototype.setRadius = function(radius) {
	umsLeafletShape.superclass.setRadius.apply(this, arguments);
	this._shapeObj.setRadius(radius);
};
umsLeafletShape.prototype.setCenter = function(center) {
	umsLeafletShape.superclass.setCenter.apply(this, arguments);
	this._shapeObj.setLatLng([center.lat, center.lng]);
};
umsLeafletShape.prototype.setStrokeOpacity = function(val) {
	this._shapeObj.setStyle({
		opacity: val
	});
};
umsLeafletShape.prototype.setStrokeWeight = function(val) {
	this._shapeObj.setStyle({
		weight: val
	});
};
umsLeafletShape.prototype.setFillOpacity = function(val) {
	this._shapeObj.setStyle({
		fillOpacity: val
	});
};
umsLeafletShape.prototype.setStrokeColor = function(val) {
	this._shapeObj.setStyle({
		color: val
	});
};
umsLeafletShape.prototype.setFillColor = function(val) {
	this._shapeObj.setStyle({
		fillColor: val
	});
};
umsLeafletShape.prototype.setMap = function(map) {
	if(!map) {
		this._map.getRawMapInstance().removeLayer( this._shapeObj );
	} else {
		this._shapeObj.addTo(this._map.getRawMapInstance());
	}
	this._map = map;
};
umsLeafletShape.prototype._getEventCoords = function(e) {
	var latlng = this._map.getRawMapInstance().mouseEventToLatLng(e.originalEvent);
	return {lat: latlng.lat, lng: latlng.lng};
};
umsLeafletShape.prototype._updateInfoWndContent = function() {
	var description = this._shapeParams.description ? this._shapeParams.description.replace(/\n/g, '<br/>') : false
	,	title = this._shapeParams.title ? this._shapeParams.title : false
	,	content = (title ? '<h3 class="umsMarkerTitle">' + title + '</h3>' : '')
			+ (description ? '<div class="umsMarkerDesc">' + description + '</div>' : '');

	if(!this._infoWindow) {
		this._infoWindow = new L.popup();
		this._shapeObj.bindPopup(this._infoWindow); // add popups
	}

	this._infoWindow.setContent( content );
};
umsLeafletShape.prototype._openInfoWnd = function() {
	this._shapeObj.openPopup();
};
umsLeafletShape.prototype._closeInfoWnd = function() {
	this._shapeObj.closePopup();
};
umsLeafletShape.prototype.setPath = function(path) {
	umsLeafletShape.superclass.setPath.apply(this, arguments);
	this._shapeObj.setLatLngs(this._pathToLatLngArray(this._shapeParams.path));
};
umsLeafletShape.prototype._pathToLatLngArray = function(path) {
	var res = [];
	for(var i = 0; i < path.length; i++) {
		res.push([path[i].lat, path[i].lng]);
	}
	return res;
};
