function umsGoogleStaticMap(map) {
	var $img = jQuery('#'+ map.view_html_id);
	$img.attr('src', this._getMapUrl(map, $img));
}
umsGoogleStaticMap.prototype._getMapUrl = function(map, $img) {
	var imgWidth = $img.width()
	,	imgHeight = $img.height();
	if(!imgWidth) {
		imgWidth = 175;
	}
	if(!imgHeight) {
		imgHeight = 175;
	}
	var reqParams = {
		center: map.params.map_center.coord_x+ ','+ map.params.map_center.coord_y
	,	zoom: map.params.zoom
	,	size: imgWidth+ 'x'+ imgHeight
	,	maptype: map.params.map_type
	,	sensor: 'false'
	,	language: umsStaticMapData.language
	,	key: umsStaticMapData.key
	};

	var reqStr = umsStaticMapData.domain+ 'maps/api/staticmap?'+ jQuery.param(reqParams);

	if(map.markers && map.markers.length) {
		var allowedMarkerColors = ['black', 'brown', 'green', 'purple', 'yellow', 'blue', 'gray', 'orange', 'red', 'white'];
		for(var i = 0; i < map.markers.length; i++) {
			var markerLabel = map.markers[i].title && typeof(map.markers[i].title) === 'string' 
				? map.markers[i].title.substring(0, 1).toUpperCase() 
				: 'none';
			var markerColor = 'red';
			if(map.markers[i].icon_data  && map.markers[i].icon_data.description && map.markers[i].icon_data.description !== '') {
				var iconDescArr = map.markers[i].icon_data.description.split(',');
				if(iconDescArr && iconDescArr.length > 0) {
					for(var j = 0; j < iconDescArr.length; j++) {
						if(allowedMarkerColors.indexOf(iconDescArr[j]) !== -1) {
							markerColor = iconDescArr[j];
							break;
						}
					}
				}
			}
			reqStr += '&markers=color:'+ markerColor+ '|label:'+ markerLabel+ '|'+ map.markers[i].coord_x+ ','+ map.markers[i].coord_y;
		}
	}
	//return '';
	return reqStr;
};