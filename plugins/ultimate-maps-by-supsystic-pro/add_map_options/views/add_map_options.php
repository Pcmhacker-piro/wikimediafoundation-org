<?php
class add_map_optionsViewUms extends viewUms {
	public function showFullScreenBtn($map) {
		$this->assign('map', $map);
		frameUms::_()->addStyle('gmap_fullscreen', $this->getModule()->getModPath(). 'css/gmap_fullscreen.css');
		return parent::display('fullScreenBtn');
	}
	public function showPrintBtn($map) {
		// $this->assign('map', $map);
		// frameUms::_()->addScript('jquery.print', UMS_JS_PATH. 'jquery.print.js');
		// frameUms::_()->addStyle('gmap_print', $this->getModule()->getModPath(). 'css/gmap_print.css');
		// return parent::display('printInfoWndBtn');
	}
}
