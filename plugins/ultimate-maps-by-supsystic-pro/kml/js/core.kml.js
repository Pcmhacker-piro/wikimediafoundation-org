function umsBaseKml(map, url) {
	this._map = map;
	this._url = url;
	this._layerObj = [];
	this.init();
}
umsBaseKml.prototype.init = function() {

};
/*umsBaseKml.prototype.removeLayerByUrl = function(url) {

};*/
umsBaseKml.prototype.getUrl = function() {
	return this._url;
};
umsBaseKml.prototype.removeFromMap = function() {

};
var umsKmlLoader = {
	initLayer: function(map, url) {
		var engine = umsGetMapsEngine(map);
		var layer = new window['ums'+ toeStrFirstUp(engine)+ 'Kml'](map, url);
		map.addKmlLayer( layer );
		return layer;
	}
};
jQuery(document).bind('umsAfterMapInit', function(event, map){
	if(!map.getAllMarkers().length) {
		// Fix for KML filter's rebuild, because umsAfterMarkersRefresh event triggers only if map has markers
		//umsRebuildKmlFilter(map);
	}
});
jQuery(document).bind('umsAfterMarkersRefresh', function(event, map){
	// We need to rebuild KML filter here, because Markers' list rebuilds on this event
	//umsRebuildKmlFilter(map);
});
jQuery(window).on('resize', function() {
	//umsRebuildKmlFilterForAllMaps();
});
jQuery(window).on('orientationchange', function() {
	//umsRebuildKmlFilterForAllMaps();
});
jQuery(document).bind('umsAfterMapInit', function(event, map){
	var /*filterShell = jQuery('#umsKmlFilterShell_' + map.getViewId())
	,	*/kmlLayersList = umsCleanKmlLayersList(map.getParam('kml_file_url'));

	if(kmlLayersList && kmlLayersList.length) {
		if(UMS_DATA.isAdmin) {
			umsAddKMLLayer(map, kmlLayersList);
		} else {
			umsSwitchKMLMapPreloader('on', map);
			umsAddKMLLayer(map, kmlLayersList);

			/*if(parseInt(map.getParam('enable_kml_filter'))) {
				//filterShell.show();
				umsShowKmlFilterData(map);
			} else {*/
				umsSwitchKMLMapPreloader('off', map);
			//}
		}
	}
});
// Make sure we don't have empty strings here
function umsCleanKmlLayersList(list) {
	if(list && list.length) {
		list = list.filter(function(entry) {
			return entry.trim() != '';
		});
	}
	return list;
}
function umsAddKMLLayer(map, kmlLayersList) {
	if(typeof(kmlLayersList) === 'string') {
		umsKmlLoader.initLayer(map, kmlLayersList);
	} else {
		for(var i = 0; i < kmlLayersList.length; i++) {
			umsKmlLoader.initLayer(map, kmlLayersList[ i ]);
		}
	}

}
function umsSwitchKMLMapPreloader(val, map) {
	var mapContainer = jQuery('#umsMapDetailsContainer_' + map.getViewId());

	switch(val) {
		case 'on':
			mapContainer.find('.umsKMLLayersPreloader').show();
			break;
		case 'off':
			// TODO: Make it hidde only after all layer will be loaded
			//if(!UMS_DATA.isAdmin && g_umsKmlLayers && g_umsKmlLayers.docs.length == map.getParam('kml_file_url').length) {
				mapContainer.find('.umsKMLLayersPreloader').hide();
			/*} else {
				setTimeout(function() {
					umsSwitchKMLMapPreloader(val, map);
				}, 500);
			}*/
			break;
		default:
			break;
	}
}
function umsRemoveKMLLayer(url) {
	// TODO: Make this work as it should
	if(UMS_DATA.isAdmin) {
		/*if(g_umsKmlLayers && g_umsKmlLayers.length) {
			for(var i in g_umsKmlLayers) {
				if(g_umsKmlLayers[i].url == url) {
					g_umsKmlLayers[i].setMap(null);
					var index = g_umsKmlLayers.indexOf(g_umsKmlLayers[i]);
					if (parseInt(index) > -1) {
						g_umsKmlLayers.splice(parseInt(index), 1);
					}
				}
			}
		}*/
	} /*else {
		if(g_umsKmlLayers && g_umsKmlLayers.docs.length) {
			for(var i in g_umsKmlLayers.docs) {
				if(g_umsKmlLayers.docs[i].url == url) {
					g_umsKmlLayers.hideDocument(g_umsKmlLayers.docs[i]);
				}
			}
		}
	}*/
}
/*function umsShowKmlFilterData(map) {
	if(!UMS_DATA.isAdmin && g_umsKmlLayers && g_umsKmlLayers.docs.length == map.getParam('kml_file_url').length) {
		var filterShell = jQuery('#umsKmlFilterShell_' + map.getViewId())
		,	rowsShell = filterShell.find('.umsKmlFilterRowsShell')
		,	layersList = map.getParam('kml_file_url')
		,	sortedDocs = [];

		// Resort layers by list of KML layers at admin area
		for(var i = 0; i < layersList.length; i++) {
			sortedDocs[i] = g_umsKmlLayers.docsByUrl[layersList[i]]
		}
		g_umsKmlLayers.docs = sortedDocs;

		rowsShell.treeview({
			data: umsGerFilterTree(map),
			showCheckbox: true,
			checkedIcon: 'fa fa-check-square-o',
			uncheckedIcon: 'fa fa-square-o',
			expandIcon: 'fa fa-chevron-right',
			collapseIcon: 'fa fa-chevron-down',
			onhoverColor: 'transparent',
			onNodeChecked: function(event, data) {
				umsToggleElem(data, true);
				if(data.ums.type == 'layer') {
					if(data.nodes && data.nodes.length) {
						for(var i = 0; i < data.nodes.length; i++) {
							jQuery(this).treeview('checkNode', [ data.nodes[i].nodeId, { silent: true } ]);
						}
					}
				} else {
					var siblings = jQuery(this).treeview('getSiblings', [ data.nodeId ])
					,	parent = jQuery(this).treeview('getParent', [ data.nodeId ])
					,	needCheck = true;

					for(var j = 0; j < siblings.length; j++) {
						if(!siblings[j].state.checked) {
							needCheck = false;
						}
					}
					if(needCheck) {
						jQuery(this).treeview('checkNode', [ parent.nodeId ])
					}
				}
			},
			onNodeUnchecked: function(event, data) {
				umsToggleElem(data, false);
				if(data.ums.type == 'layer') {
					if(data.nodes && data.nodes.length) {
						for(var i = 0; i < data.nodes.length; i++) {
							jQuery(this).treeview('uncheckNode',[data.nodes[i].nodeId,{silent: true}]);
						}
					}
				} else {
					var parent = jQuery(this).treeview('getParent', [ data.nodeId ]);

					jQuery(this).treeview('uncheckNode', [ parent.nodeId, { silent: true } ]);
				}
			}
		});
		rowsShell.treeview('checkAll', { silent: true });
		rowsShell.treeview('collapseAll', { silent: true });
		filterShell.find('.umsKmlLoading').hide();
		umsSwitchKMLMapPreloader('off', map);
		filterShell.find('.umsKmlFilterRowsShell').fadeIn(1500);
	} else {
		setTimeout(function() {
			umsShowKmlFilterData(map);
		}, 500);
	}
}
function umsGerFilterTree(map) {
	var tree = []
	,	docs = g_umsKmlLayers.docs
	,	showSublayers = map.getParam('kml_filter')
	,	viewId = map.getViewId()
	,	data, i, j;

	for(i = 0; i < docs.length; i++) {
		var fileName = docs[i].url.toString().match(/.*\/(.+?)\./);

		data = {
			text: fileName && fileName.length > 1 ? fileName[1] : 'Main Layer ' + i
		,	ums: { type: 'layer', doc: i, id: '', viewId: viewId }
		,	selectable: false
		};
		tree.push(data);

		if(showSublayers && showSublayers['show_sublayers'] && !parseInt(showSublayers['show_sublayers'][i])) {
			if (!!docs[i].markers) {
				for (j = 0; j < docs[i].markers.length; j++) {
					data = {
						text: docs[i].markers[j].title ? docs[i].markers[j].title : 'Marker ' + j
					,	ums: { type: 'markers', doc: i, id: j, viewId: viewId }
					,	selectable: false
					};
					tree[i].nodes = tree[i].nodes ? tree[i].nodes : [];
					tree[i].nodes.push(data);
				}
			}
			if (!!docs[i].ggroundoverlays) {
				for (j = 0; j < docs[i].ggroundoverlays.length; j++) {
					data = {
						text: docs[i].ggroundoverlays[j].title ? docs[i].ggroundoverlays[j].title : 'Overlay ' + j
					,	ums: { type: 'ggroundoverlays', doc: i, id: j, viewId: viewId }
					,	selectable: false
					};
					tree[i].nodes = tree[i].nodes ? tree[i].nodes : [];
					tree[i].nodes.push(data);
				}
			}
			if(!!docs[i].gpolylines) {
				for (j = 0; j < docs[i].gpolylines.length; j++) {
					data = {
						text: docs[i].gpolylines[j].title ? docs[i].gpolylines[j].title : 'Polyline ' + j
					,	ums: { type: 'gpolylines', doc: i, id: j, viewId: viewId }
					,	selectable: false
					};
					tree[i].nodes = tree[i].nodes ? tree[i].nodes : [];
					tree[i].nodes.push(data);
				}
			}
			if (!!docs[i].gpolygons) {
				for (j = 0; j < docs[i].gpolygons.length; j++) {
					data = {
						text: docs[i].gpolygons[j].title ? docs[i].gpolygons[j].title : 'Polygon ' + j
					,	ums: { type: 'gpolygons', doc: i, id: j, viewId: viewId }
					,	selectable: false
					};
					tree[i].nodes = tree[i].nodes ? tree[i].nodes : [];
					tree[i].nodes.push(data);
				}
			}
		}
	}
	return tree;
}
function umsToggleElem(elem, check) {
	if(check) {
		if(elem.ums.type == 'layer') {
			g_umsKmlLayers.showDocument(g_umsKmlLayers.docs[elem.ums.doc]);
		} else {
			umsShowDocumentPart(elem.ums);
		}
	} else{
		if(elem.ums.type == 'layer') {
			g_umsKmlLayers.hideDocument(g_umsKmlLayers.docs[elem.ums.doc]);
		} else {
			umsHideDocumentPart(elem.ums);
		}
	}
	return false;
}
function umsHideDocumentPart(params) {
	if (g_umsKmlLayers && g_umsKmlLayers.docs.length) {
		switch(params.type) {
			case 'markers':
				var marker = g_umsKmlLayers.docs[params.doc][params.type][params.id];

				if(!!marker.infoWindow) marker.infoWindow.close();
				marker.setVisible(false);
				break;
			case 'ggroundoverlays':
				var overlay = g_umsKmlLayers.docs[params.doc][params.type][params.id];

				overlay.setOpacity(0);
				break;
			case 'gpolylines':case 'gpolygons':
				var shape = g_umsKmlLayers.docs[params.doc][params.type][params.id];

				if(!!shape.infoWindow) shape.infoWindow.close();
				shape.setMap(null);
				break;
			default:
				break;
		}
	}
}
function umsShowDocumentPart(params) {
	if (g_umsKmlLayers && g_umsKmlLayers.docs.length) {
		switch(params.type) {
			case 'markers':
				var marker = g_umsKmlLayers.docs[params.doc][params.type][params.id];

				if(!!marker.infoWindow) marker.infoWindow.close();
				marker.setVisible(true);
				break;
			case 'ggroundoverlays':
				var overlay = g_umsKmlLayers.docs[params.doc][params.type][params.id];

				overlay.setOpacity(overlay.percentOpacity);
				break;
			case 'gpolylines':case 'gpolygons':
				var shape = g_umsKmlLayers.docs[params.doc][params.type][params.id]
				,	map = umsGetMapByViewId(params.viewId);

				if(map) {
					if(!!shape.infoWindow) shape.infoWindow.close();
					shape.setMap(map.getRawMapInstance());
				}
				break;
			default:
				break;
		}
	}
}*/
/*function umsRebuildKmlFilter(map) {
	var kmlLayersList = umsCleanKmlLayersList(map.getParam('kml_file_url'));

	if(parseInt(map.getParam('enable_kml_filter')) && kmlLayersList && kmlLayersList.length) {
		var markerListParams = map.getParam('marker_list_params')
		,	orientation = markerListParams ? markerListParams.or : false
		,	mapShell = jQuery('#'+ map.getViewHtmlId()).parents('.umsMapDetailsContainer:first')
		,	filterShell = jQuery('#umsMapProKmlFilterCon_' + map.getViewId())
		,	sliderShell = jQuery('#umsMapProControlsCon_' + map.getViewId())
		,	filterWidth = '300'
		,	filterHeight = mapShell.height();

		if((orientation == 'h' || !orientation) && jQuery(window).width() > 992) {
			// Vertical Kml Filter
			filterShell.insertBefore(sliderShell);
			filterShell.css({
				'float': 'right'
			,	'width': filterWidth
			,   'height':  filterHeight
			,	'max-height': filterHeight
			,   'margin-top': '0'
			,   'margin-bottom': '5px'
			});
			mapShell.css({
				'float': 'left'
			,	'width': mapShell.parents('.ums_map_opts:first').width() - filterWidth - 5
			});
			sliderShell.css({
				'clear': 'both'
			});
		} else {
			// Horisontal Kml Filter
			filterShell.insertAfter(sliderShell);
			filterShell.css({
				'float': 'right'
			,	'width': '100%'
			,   'height':  'auto'
			,	'max-height': '400px'
			,   'margin-top': '5px'
			,   'margin-bottom': '0'
			});
			if(orientation != 'v') {
				mapShell.css({
					'float': 'none'
				,	'width': '100%'
				});
				sliderShell.css({
					'clear': 'none'
				});
			}
			if(parseInt(map.getParam('directions_steps_show'))) {
				filterShell.css({
					'margin-bottom': '5px'
				});
			}
		}
	}
}*/
/*function umsRebuildKmlFilterForAllMaps() {
	if(typeof(umsGetAllMaps) == 'function') {
		var maps = umsGetAllMaps();

		for(var i = 0; i < maps.length; i++) {
			umsRebuildKmlFilter(maps[i]);
		}
	}
}*/
