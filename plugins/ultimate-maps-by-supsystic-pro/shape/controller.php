<?php
class shapeControllerUms extends controllerUms {
	public function save() {
		$res = new responseUms();
		$shapeData = reqUms::getVar('shape_opts');
		$update = false;
		if($id = $this->getModel()->save($shapeData, $update)){
			$res->addMessage(__('Done', UMS_LANG_CODE));
			$res->addData('shape', $this->getModel()->getById($id));
			$res->addData('update', $update);
		} else {
			$res->pushError($this->getModel()->getErrors());
		}
		//frameUms::_()->getModule('supsystic_promo')->getModel()->saveUsageStat('shape.save');
		return $res->ajaxExec();
	}
	public function updatePos() {
		$res = new responseUms();
		if($this->getModel()->updatePos(reqUms::get('post'))) {
			//$res->addMessage(__('Done', UMS_LANG_CODE));	// Do nothing for now - void method
		} else {
			$res->pushError($this->getModel()->getErrors());
		}
		return $res->ajaxExec();
	}
	public function findAddress(){
		$data = reqUms::get('post');
		$res = new responseUms();
		$result = $this->getModel()->findAddress($data);
		if($result) {
			$res->addData($result);
		} else {
			$res->pushError($this->getModel()->getErrors());
		}
		//frameUms::_()->getModule('supsystic_promo')->getModel()->saveUsageStat('geolocation.address.search');
		return $res->ajaxExec();
	}
	public function removeShape(){
		$params = reqUms::get('post');
		$res = new responseUms();
		if(!isset($params['id'])){
			$res->pushError(__('Figure Not Found', UMS_LANG_CODE));
			return $res->ajaxExec();
		}
		if($this->getModel()->removeShape($params["id"])){
			$res->addMessage(__("Done", UMS_LANG_CODE));
		}else{
			$res->pushError(__("Cannot remove figure", UMS_LANG_CODE));
		}
		//frameUms::_()->getModule("supsystic_promo")->getModel()->saveUsageStat('shape.delete');
		return $res->ajaxExec();
	}
	public function removeList() {
		$params = reqUms::get('post');
		$res = new responseUms();
		if(!isset($params['remove_ids'])){
			$res->pushError(__('Figure Not Found', UMS_LANG_CODE));
			return $res->ajaxExec();
		}
		if($this->getModel()->removeList($params['remove_ids'])){
			$res->addMessage(__('Done', UMS_LANG_CODE));
		} else {
			$res->pushError(__('Cannot remove figure', UMS_LANG_CODE));
		}
		//frameUms::_()->getModule("supsystic_promo")->getModel()->saveUsageStat('shape.delete_list');
		return $res->ajaxExec();
	}
	public function getShapeForm($params){
		return $this->getView()->getShapeForm($params);
	}
	public function getMapShapes() {
		$res = new responseUms();
		$mapId = (int) reqUms::getVar('map_id', 'post');
		$shapes = array();
		if($mapId) {
			$shapes = $this->getModel()->getMapShapes( $mapId );
		} else {
			$addedShapeIds = reqUms::getVar('added_shape_ids', 'post');
			if(!empty($addedShapeIds)) {
				$shapes = $this->getModel()->getShapesByIds( $addedShapeIds );
			}
		}
		if($shapes !== false) {
			$res->addData('shapes', $shapes);
		} else
			$res->pushError($this->getModel ()->getErrors());
		return $res->ajaxExec();
	}
	public function getShape() {
		$res = new responseUms();
		$id = (int) reqUms::getVar('id');
		if($id) {
			$shape = $this->getModel()->getById($id);
			if(!empty($shape)) {
				$res->addData('shape', $shape);
			} else
				$res->pushError ($this->getModel()->getErrors());
		} else
			$res->pushError (__('Empty or invalid figure ID', UMS_LANG_CODE));
		return $res->ajaxExec();
	}
	protected function _prepareModelBeforeListSelect($model) {
		$map_id = (int) reqUms::getVar('map_id');
		$model->addWhere(array('map_id' => $map_id));
		return $model;
	}
	protected function _prepareSortOrder($orderBy) {
		if(!$orderBy)
			$orderBy = 'sort_order';
		return $orderBy;
	}
	protected function _prepareListForTbl($data) {
		if (!empty($data)) {
			$shapesIds = array('map_id' => $data[0]['map_id'], 'shapes_list' => array());
			foreach($data as $i => $m) {
				$data[$i] = $this->getModel()->_afterGet($data[$i]);

				// Save Shape sort order
				$shapesIds['shapes_list'][] = $data[$i]['id'];

				// Shape Icon Image
				//$icon = '<div class="egm-shape-icon"><img src="'. $data[$i]['icon_data']['path'] .'" /></div>';
				//$data[$i]['icon_img'] = preg_replace('/\s\s+/', ' ', trim($icon));

				// Shape Coordinates
				/*$coords = '<div class="egm-shape-latlng">'
					. round($data[$i]['coord_x'], 2)
					. '"N ' . round($data[$i]['coord_y'], 2)
					. '"E</div>';
				$data[$i]['coords'] = preg_replace('/\s\s+/', ' ', trim($coords));*/
			}
			//frameUms::_()->getModule('maps')->getModel()->resortShapes($shapesIds);
		}

		return $data;
	}
	public function getListForTbl() {
      $res = new responseUms();
      $res->ignoreShellData();
      $model = $this->getModel();
      $page = (int)sanitize_text_field(reqUms::getVar('page'));
      $rowsLimit = (int)sanitize_text_field(reqUms::getVar('rows'));
			$mapId = (int)sanitize_text_field(reqUms::getVar('map_id'));
      $search = reqUms::getVar('search');
      $search = !empty($search['text_like']) ? sanitize_text_field($search['text_like']) : '';
      $totalCount = $model->getTotalCountBySearch($search, $mapId);
      $totalPages = 0;
      if ($totalCount > 0) {
         $totalPages = ceil($totalCount / $rowsLimit);
      }
      if ($page > $totalPages) {
         $page = $totalPages;
      }
      $limitStart = $rowsLimit * $page - $rowsLimit;
      if ($limitStart < 0) $limitStart = 0;
      $data = $model->getListForTblBySearch($search, $limitStart, $rowsLimit, $mapId);
      $data = $this->_prepareListForTbl($data);
      $res->addData('page', $page);
      $res->addData('total', $totalPages);
      $res->addData('rows', $data);
      $res->addData('records', $model->getLastGetCount());
      $res = dispatcherUms::applyFilters($this->getCode() . '_getListForTblResults', $res);
      $res->ajaxExec();
   }
	public function getNoncedMethods() {
		return array('save', 'removeShape', 'getShapeForm', 'getListForTable', 'getShape', 'removeList', 'getMapShapes', 'updatePos');
	}
	/**
	 * @see controller::getPermissions();
	 */
	public function getPermissions() {
		return array(
			UMS_USERLEVELS => array(
				UMS_ADMIN => array('save', 'removeShape', 'getShapeForm', 'getListForTable', 'getShape', 'removeList', 'getMapShapes', 'updatePos')
			),
		);
	}
}
