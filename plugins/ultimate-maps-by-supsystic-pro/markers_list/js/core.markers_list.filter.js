jQuery(document).bind('umsAfterMapInit', function(event, map) {
	if( map._mapParams.markers_list_type === 'slider_checkbox_table'){
		var viewId = map.getViewId();
		if(window.umsGetMembershipGmeViewId) {
			viewId = umsGetMembershipGmeViewId(map, viewId);
		}
		umsShowCustomControlsMarkerGroupsTreeF(viewId, map);
		jQuery('#umsMapMarkerFilters_' + viewId).show();
		jQuery('#umsMapMarkerFilters_' + viewId).treeview('checkAll', { silent: true });
		var mapsHeight = jQuery('.umsLeft').height();
		jQuery('.filterRight').css({'max-height':mapsHeight + 'px'});

		jQuery(document).on('click tap', '.list-group-item', function(e) {
            var treeViewObj = jQuery('#umsMapMarkerFilters_'+ viewId)
			,	item = jQuery(this)
			,	action = ''
			,	lastChild = false;

            if (Number(item.attr('data-nodeid')) === jQuery('.node-umsMapMarkerFilters_'+ viewId).length - 1) {
                lastChild = true;
            }

			if (item.hasClass('node-checked')) {
                treeViewObj.treeview('uncheckNode', [Number(item.attr('data-nodeid')), {silent: true}]);
                if(lastChild){
                    treeViewObj.treeview('uncheckAll', { silent: true });
                    action = 'hideall';
                }else if(ums_group_list[ums_group_list.length - 1].id === 'all'){
                    var nodeAll = treeViewObj.find('.list-group li').last().attr('data-nodeid');
                    treeViewObj.treeview('uncheckNode', [ Number(nodeAll) , { silent: true } ]);
                }
            } else {
                treeViewObj.treeview('checkNode', [Number(item.attr('data-nodeid')), {silent: true}]);
                if(lastChild){
                    action = 'showall';
                    treeViewObj.treeview('checkAll', { silent: true });
                }
            }

            umsMarkersFilterF(viewId, action);
		});
	}
});

function umsShowCustomControlsMarkerGroupsTreeF(viewId, map) {
	if(ums_group_list && ums_group_list.length) {
		var bgColor = map.getParam('marker_filter_color') + '!important';
        var fontColor = map.getParam('markers_list_color') + '';
				console.log(fontColor);
		umsFilterWrapper = jQuery('#umsMapMarkerFilters_' + viewId);
		umsFilterWrapper.treeview({
			data: umsGetFiltersMarkerGroupsTree(ums_group_list, viewId),
			showCheckbox: true,
			checkedIcon: 'fa fa-check-square-o',
			uncheckedIcon: 'fa fa-square-o',
			expandIcon: 'fa fa-chevron-right',
			collapseIcon: 'fa fa-chevron-down',
			emptyIcon: 'fa',
            color: fontColor,
			backColor: bgColor,
			onhoverColor: 'transparent',
			onNodeChecked: function(event, data) {
				var $this = jQuery(this);
				var action = '';
				if(data.id === 'all'){
					action = 'showall';
					jQuery('#umsMapMarkerFilters_' + data.map_view_id).treeview('checkAll', { silent: true });
				}
				if(data.nodes && data.nodes.length) {
					umsUpdateChildrenNodesF(data.nodes, $this, 'checkNode');
				}
				umsMarkersFilterF(data.map_view_id, action);
			},
			onNodeUnchecked: function(event, data) {
				var $this = jQuery(this);
				var action = '';
				if(data.id === 'all'){
					jQuery('#umsMapMarkerFilters_' + data.map_view_id).treeview('uncheckAll', { silent: true });
					action = 'hideall';
				}else{
					if(ums_group_list[ums_group_list.length - 1].id === 'all'){
						var nodeAll = jQuery('#umsMapMarkerFilters_' + viewId).find('.list-group li').last().attr('data-nodeid');
						jQuery('#umsMapMarkerFilters_' + data.map_view_id).treeview('uncheckNode', [ Number(nodeAll) , { silent: true } ]);
					}
				}
				if(data.nodes && data.nodes.length) {
					umsUpdateChildrenNodesF(data.nodes, $this, 'uncheckNode');
				}
				umsMarkersFilterF(data.map_view_id, action);
			}
		});
		umsFilterWrapper.treeview('collapseAll', { silent: true });
	}
}

function umsMarkersFilterF(viewId, action) {
	var checked = umsFilterWrapper.treeview('getChecked')
	,	map = umsGetCurMapByViewIdF(viewId)
	,	mapMarkers = map.getAllMarkers()
	,	groupsList = []
	,	markersIdList = []
	,	markersIdListFull = [];

	for(var j = 0; j < checked.length; j++) {
		groupsList.push(checked[j].id);
	}
	for(var i = 0; i < mapMarkers.length; i++) {
		markersIdListFull[i] = mapMarkers[i].getMarkerParam('id');
	}
	if(groupsList.length) {
		for(var i = 0; i < mapMarkers.length; i++) {
			if(!twoArraysContainSameValue(groupsList, mapMarkers[i].getMarkerParam('marker_group_ids'))){
				markersIdList[markersIdList.length] = mapMarkers[i].getMarkerParam('id');
			}
		}
	}
	if(! checked.length > 0){
		action = 'hideall';
	}
	if(action === 'hideall'){
		return umsHideMarkersF(markersIdListFull, map);
	}else if(action === 'showall'){
		return umsHideMarkersF([], map);
	}else{
		return umsHideMarkersF(markersIdList, map);
	}
}

function umsHideMarkersF(markers, map){
	var mapMarkers = map.getAllMarkers()
		,	needClastererEnabled = false;
	for(var i = 0; i < mapMarkers.length; i++){
		mapMarkers[i].setVisible(true);
      window.markertest = mapMarkers[i];
      // mapMarkers[i].showInfoWnd( true, showDescription, true );
	}
	if(map._clastererEnabled) {
		map.disableClasterization();
		needClastererEnabled = true;
	}
	for(var j = 0; j < mapMarkers.length; j++){
		for(var z = 0; z < markers.length; z++) {
			if(mapMarkers[j]._markerParams.id === markers[z]){
				mapMarkers[j].setVisible(false);
			}
		}
	}
	if(needClastererEnabled) {
		map.enableClasterization(map._mapParams.marker_clasterer, true);
	}
	umsSliderMarkersHideF(markers, map);
}
function umsSliderMarkersHideF(markers, map){
	if(map.getParam('marker_list_params')){
		var $sliderContent = jQuery('#' + map.getParam('simple_slider_id'))
			,	sliderType = $sliderContent.data('slider-type');

		switch(sliderType) {
			default:
				$sliderContent.html(map.getParam('original_slider_html'));	// Reset current slider to it's original html
				$sliderContent.find('.umsMnlJssorSlide').each(function () {	// Remove unused in search html slides
					for(var i = 0; i < markers.length; i++) {
						if(jQuery(this).data('marker-id') == markers[i]) {
							jQuery(this).remove();

							// find marker by id
							var mmInd = 0
								,	mmFound = -1
							;
							while(mmInd < map._markers.length && mmFound === -1) {
								if(markers[i] == map._markers[mmInd].getId()) {
									mmFound = mmInd;
								}
								mmInd++;
							}
							// close all open infoWindow
							if(mmFound != -1 && map._markers && map._markers[mmFound] && map._markers[mmFound].hideInfoWnd) {
								map._markers[mmFound].hideInfoWnd();
							}
							return; // stop current .each() iteration
						}
					}
				});
				umsBuildListHtml(map);	// Build slider one more time with required number of slides
				break;
		}
	}
}
function umsGetCurMapByViewIdF(viewId) {
	if(typeof(g_umsMap) !== 'undefined') {
		return g_umsMap;
	} else {
		return umsGetMapByViewId(viewId);
	}
}
function umsUpdateChildrenNodesF(nodes, treeObj, action) {
	var groupsList = [];
	for(var i = 0; i < nodes.length; i++) {
		treeObj.treeview(action, [ nodes[i].nodeId, { silent: true } ]);
		groupsList.push(nodes[i].id);
		if(nodes[i].nodes) {
			groupsList.concat(umsUpdateChildrenNodesF(nodes[i].nodes, treeObj, action));
		}
	}
	return groupsList;
}

function umsGetFiltersMarkerGroupsTree(groups, viewId) {
	for(var i in groups) {
		if(typeof groups[i] == 'object') {
			groups[i].text = groups[i].title;
			groups[i].backColor = groups[i].params.bg_color;
         groups[i].color = groups[i].params.text_color;
			groups[i].nodes = groups[i].children && groups[i].children.length ? groups[i].children : null;
			groups[i].selectable = false;
			groups[i].map_view_id = viewId;
			delete groups[i].children;
			if(groups[i].nodes) {
				groups[i].nodes = umsGetFiltersMarkerGroupsTree(groups[i].nodes, viewId);
			}
		}
	}
	return groups;
}
