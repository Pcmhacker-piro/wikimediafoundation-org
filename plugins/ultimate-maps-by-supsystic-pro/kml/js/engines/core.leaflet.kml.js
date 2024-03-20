function umsLeafletKml(map, urls) {
	umsLeafletKml.superclass.constructor.apply(this, arguments);
}
extendUms(umsLeafletKml, umsBaseKml);
umsLeafletKml.prototype.init = function() {

	map = this._map;
	var runLayer = omnivore.kml(this._url)
    .on('ready', function() {
        map.getRawMapInstance().fitBounds(runLayer.getBounds());
        runLayer.eachLayer(function(layer) {
			var description = layer.feature.properties.description ? layer.feature.properties.description.replace(/\n/g, '<br/>') : false
			,	title = layer.feature.properties.name ? layer.feature.properties.name : false
			,	content = (title ? '<h3 class="umsMarkerTitle">' + title + '</h3>' : '')
					+ (description ? '<div class="umsMarkerDesc">' + description + '</div>' : '');
            layer.bindPopup(content);
        });
		map._mapParams.zoom = map._mapParams.zoom ? parseInt(map._mapParams.zoom) : 10;
		map.getRawMapInstance().setZoom(map._mapParams.zoom);
    })
    .addTo(this._map.getRawMapInstance())
	this._layerObj = runLayer;
	//window.layer = this._layerObj;

	/*
	//for(var i = 0; i < this._urls.length; i++) {
		this._layerObj = new L.KML(this._url, {async: true});

         this._layerObj.on('loaded', function(e) {
			 // TODO: Add here success load check
           // self._map.getRawMapInstance().fitBounds(e.target.getBounds());
         });

        this._map.getRawMapInstance().addLayer(this._layerObj);
	//}
	*/
};
umsLeafletKml.prototype.removeFromMap = function() {
	 this._map.getRawMapInstance().removeLayer( this._layerObj );
};
