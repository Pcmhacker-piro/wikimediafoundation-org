<?php
class markers_listUms extends moduleUms {
	public function init() {
		parent::init();
		dispatcherUms::addAction('afterConnectMapAssets', array($this, 'connectMapAssets'), 10, 2);
		dispatcherUms::addAction('addMapBottomControls', array($this, 'showBottomSliderHtml'));
		dispatcherUms::addFilter('mapDataRender', array($this, 'beforeMapDataRender'));
		dispatcherUms::addAction('addMapFilters', array($this, 'addMapFiltersHtml'));
	}
	public function beforeMapDataRender($mapObj) {
		if(isset($mapObj['params']['markers_list_type']) && !empty($mapObj['params']['markers_list_type'])) {
			$mapObj['params']['marker_list_params'] = frameUms::_()->getModule('maps')->getMarkerListByKey( $mapObj['params']['markers_list_type'] );
		}
		return $mapObj;
	}
	public function connectMapAssets($map, $forAdminArea = false) {
		if($forAdminArea) {
			frameUms::_()->addScript('admin.markers_list', $this->getModPath(). 'js/admin.markers_list.js');
			frameUms::_()->addScript('jquery-ui-datepicker');
			frameUms::_()->addScript('admin.markers.pro.js', $this->getModPath() . 'js/admin.markers.pro.js', array('jquery-ui-datepicker'));

			frameUms::_()->addStyle('jui-base-theme-css','http://ajax.googleapis.com/ajax/libs/jqueryui/1.12.0/themes/base/jquery-ui.min.css',false,"1.9.0",false);
			frameUms::_()->addStyle('', $this->getModPath() . 'css/markers.pro.css');
		} else {
			if($map && isset($map['params']['markers_list_type']) && !empty($map['params']['markers_list_type'])) {
				$listParams = frameUms::_()->getModule('maps')->getMarkerListByKey( $map['params']['markers_list_type'] );
				if($listParams['eng'] == 'jssor') {
					$this->connectJssor();
				}
				if($listParams['eng'] == 'table') {
					frameUms::_()->addStyle('slider.table', $this->getModPath(). 'css/slider.table.css');
				}
				frameUms::_()->addScript('core.markers_list', $this->getModPath(). 'js/core.markers_list.js', array('ums.core.maps'));
			}
		}
	}
	public function connectJssor() {
		frameUms::_()->addScript('jssor.slider', $this->getModPath(). 'js/jssor.slider.mini.js');
		frameUms::_()->addStyle('jssor.slider', $this->getModPath(). 'css/jssor.slider.css');
	}
	public function showBottomSliderHtml($map) {
		if(isset($map['params']['markers_list_type']) && !empty($map['params']['markers_list_type'])) {
			$listParams = frameUms::_()->getModule('maps')->getMarkerListByKey( $map['params']['markers_list_type'] );
			if($listParams['eng'] == 'jssor') {
				echo $this->getView()->getSliderSimpleList( $map );
			}
			if($listParams['eng'] == 'table') {
				echo $this->getView()->getSliderTableList( $map );
			}
		}
	}
	public function addMapFiltersHtml($map) {
		if(isset($map['params']['markers_list_type']) 
			&& !empty($map['params']['markers_list_type'])
			&& $map['params']['markers_list_type'] == 'slider_checkbox_table'
		) {
			frameUms::_()->addScript('markers_list.filter', $this->getModPath(). 'js/core.markers_list.filter.js');
			frameUms::_()->addScript('ums_bootstrap-treeview', frameUms::_()->getModule('kml')->getModPath(). 'js/bootstrap-treeview.min.js');
			frameUms::_()->addStyle('ums_bootstrap-treeview', frameUms::_()->getModule('kml')->getModPath(). 'css/bootstrap-treeview.min.css');
			echo $this->getView()->getSliderCheckboxTree( $map );
		}
	}
}
