<?php
class  shapeUms extends moduleUms {
	public function init() {
		dispatcherUms::addAction('afterConnectMapAssets', array($this, 'connectMapAssets'), 10, 2);
	}
	public function connectMapAssets($map, $forAdminArea = false) {
		if($forAdminArea) {
			frameUms::_()->addScript('admin.shape.edit', $this->getModPath(). 'js/admin.shape.edit.js');
			frameUms::_()->addStyle('admin.shape', $this->getModPath(). 'css/admin.shape.css');
			$this->_loadAssets($map);
		} else {
			// TODO: Add check if shapes exists in map
			$this->_loadAssets($map);
		}
	}
	private function _loadAssets($map) {
		frameUms::_()->addScript('ums.core.shape', $this->getModPath(). 'js/core.shape.js');

		$defEngine = frameUms::_()->getModule('options')->get('def_engine');
		$engine = !empty($map) && !empty($map['engine']) ? $map['engine'] : $defEngine;
		$engine = frameUms::_()->getModule('maps')->getView()->getMapsEngine($engine);

		frameUms::_()->addScript('ums_'. $engine. '.core.shape', $this->getModPath(). 'js/engines/core.'. $engine. '.shape.js');

		/*switch($engine) {
			case 'leaflet':
				frameUms::_()->addScript('ums_layer.vector.kml', $this->getModPath(). 'js/lib/leaflet/layer.vector.kml.js');
				break;
		}*/
	}
	public function activate() {
		$this->install(); // Just try to do same things for now
	}
	public function install() {
		if(!dbUms::exist("ums_shapes")) {
			require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
			dbDelta(dbUms::prepareQuery("CREATE TABLE IF NOT EXISTS `@__shapes` (
			 	`id` int(11) NOT NULL AUTO_INCREMENT,
				`title` varchar(125) CHARACTER SET utf8 NOT NULL,
				`description` text CHARACTER SET utf8 NULL,
				`coords` text  CHARACTER SET utf8 NOT NULL,
				`type` varchar(30) CHARACTER SET utf8 NOT NULL,
				`map_id` int(11),
				`create_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
				`animation` int(1),
				`params` text  CHARACTER SET utf8 NOT NULL,
				`sort_order` tinyint(1) NOT NULL DEFAULT '0',
				PRIMARY KEY (`id`)
		   	) DEFAULT CHARSET=utf8;"));
		}
	}
}
