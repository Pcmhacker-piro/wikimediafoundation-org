<?php
class shapeViewUms extends viewUms {
	public function getListOperations($shapeId) {
		$this->assign('shape', array('id' => $shapeId));
		return parent::getContent('shapeListOperations');
	}
	public function getEditShapes($params) {
		$umsShapesTblDataUrl =  uriUms::mod('shape', 'getListForTbl', array('reqType' => 'ajax', 'map_id' => (int)$params['id'], '_wpnonce' => wp_create_nonce('ums_nonce')));
		frameUms::_()->addJSVar('admin.maps.edit', 'umsShapesTblDataUrl', $umsShapesTblDataUrl);
		frameUms::_()->addJSVar('admin.shape.edit', 'umsShapesTblDataUrl', $umsShapesTblDataUrl);
		foreach($params as $k => $v) {
			$this->assign($k, $v);
		}
		$this->assign('shapeTypes', array(
			'circle' => array('label' => __('Circle', UMS_LANG_CODE), 'icon' => 'fa-circle-o'),
			'polyline' => array('label' => __('Polyline', UMS_LANG_CODE), 'icon' => 'fa-paint-brush'),
			'polygon' => array('label' => __('Polygon', UMS_LANG_CODE), 'icon' => 'fa-paint-brush'),
		));
		return parent::getContent('mapsEditShapes');
	}
}