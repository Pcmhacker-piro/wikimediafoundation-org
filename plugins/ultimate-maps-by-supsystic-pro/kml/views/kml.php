<?php
class kmlViewUms extends viewUms {
	public function drawMapKmlFilter($map) {
		$this->assign('map', $map);
		return parent::display('mapKmlFilter');
	}
}
