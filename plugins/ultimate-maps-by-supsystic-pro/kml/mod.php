<?php
class kmlUms extends moduleUms {
	public function init() {
		parent::init();
		dispatcherUms::addAction('afterConnectMapAssets', array($this, 'connectMapAssets'), 10, 2);
		dispatcherUms::addFilter('mapParamsKeys', array($this, 'addMapParamsKeys'));
		dispatcherUms::addAction('addMapKmlFilterData', array($this, 'addMapKmlFilterData'));
	}
	public function addMapParamsKeys($keys) {
		$keys = array_merge($keys, array(
			'kml_file_url', 'enable_kml_filter', 'kml_filter', 'kml_import_to_marker',
		));
		return $keys;
	}
	public function connectMapAssets($map, $forAdminArea) {
		if($forAdminArea) {
			frameUms::_()->addScript('admin.kml', $this->getModPath(). 'js/admin.kml.js');
			frameUms::_()->addScript('ajaxupload', UMS_JS_PATH. 'ajaxupload.js');
			//frameUms::_()->addScript('core.kml', $this->getModPath(). 'js/core.kml.js');
			$this->_loadAssets($map);
		} else {
			if(isset($map['params']['kml_file_url']) && !empty($map['params']['kml_file_url'])) {
				$kmlUrlExist = array_filter($map['params']['kml_file_url']);
				if($kmlUrlExist){
					$this->_loadAssets($map);
				}

			}
		}
	}
	private function _loadAssets($map) {
		frameUms::_()->addScript('core.kml', $this->getModPath(). 'js/core.kml.js');

		$defEngine = frameUms::_()->getModule('options')->get('def_engine');
		$engine = !empty($map) && !empty($map['engine']) ? $map['engine'] : $defEngine;
		$engine = frameUms::_()->getModule('maps')->getView()->getMapsEngine($engine);

		frameUms::_()->addScript('ums_'. $engine. '.core.kml', $this->getModPath(). 'js/engines/core.'. $engine. '.kml.js');

		switch($engine) {
			case 'leaflet':
				frameUms::_()->addScript('ums_layer.vector.kml', $this->getModPath(). 'js/lib/leaflet/layer.vector.kml.js');
				break;
		}
	}
	public function addGeoXMLScripts($map) {
		//frameUms::_()->addScript('gmap_geoxml', $this->getModPath(). 'js/geoxml3/polys/geoxml3.js');
		//frameUms::_()->addScript('gmap_geoxml-kmz', $this->getModPath(). 'js/geoxml3/kmz/geoxml3.js');
		//frameUms::_()->addScript('gmap_geoxml-parse-kmz', $this->getModPath(). 'js/geoxml3/kmz/geoxml3_gxParse_kmz.js');
		//frameUms::_()->addScript('gmap_zip-file-complete', $this->getModPath(). 'js/geoxml3/kmz/ZipFile.complete.js');
		//frameUms::_()->addScript('gmap_projected-overlay', $this->getModPath(). 'js/geoxml3/ProjectedOverlay.js');
	}
	public function addMapKmlFilterData($map){
		if(isset($map['params']['enable_kml_filter']) && (int)$map['params']['enable_kml_filter']){
			$this->getView()->drawMapKmlFilter($map);
		}
	}
}
