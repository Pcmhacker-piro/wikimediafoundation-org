function umsBingKml(map, urls) {
	umsBingKml.superclass.constructor.apply(this, arguments);
}
extendUms(umsBingKml, umsBaseKml);
umsBingKml.prototype.init = function() {
	if(typeof(Microsoft.Maps.GeoXml) === 'undefined') {
		var self = this;
		Microsoft.Maps.loadModule('Microsoft.Maps.GeoXml', function(){
			self._addLayer();
		});
	} else {
		this._addLayer();
	}
};
umsBingKml.prototype._addLayer = function() {
    var self = this;
    setTimeout(function () {
		self._layerObj = new Microsoft.Maps.GeoXmlLayer(self._url, true, {
			autoUpdateMapView: false
		});
        self._map.getRawMapInstance().layers.insert(self._layerObj);
    },2000);
};
umsBingKml.prototype.removeFromMap = function() {
	this._map.getRawMapInstance().layers.remove(this._layerObj);
};
