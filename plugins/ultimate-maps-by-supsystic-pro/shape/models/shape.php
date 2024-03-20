<?php
class shapeModelUms extends modelUms {
   public static $tableObj;
   function __construct() {
      $this->_setTbl('shape');
      if (empty(self::$tableObj)) {
         self::$tableObj = frameUms::_()->getTable('shape');
      }
   }
   public function save($shape = array() , &$update = false) {
      $id = isset($shape['id']) ? (int)$shape['id'] : 0;
      $shape['title'] = isset($shape['title']) ? trim($shape['title']) : '';
      $update = (bool)$id;
      if (!empty($shape['title'])) {
         $shape['map_id'] = isset($shape['map_id']) ? (int)$shape['map_id'] : 0;
         if (!$update) {
            // We use timestamp field type in db
            //$shape['create_date'] = date('Y-m-d H:i:s');
            if ($shape['map_id']) {
               //$maxSortOrder = (int)dbUms::get('SELECT MAX(sort_order) FROM @__shapes WHERE map_id = "' . $shape['map_id'] . '"', 'one');
               global $wpdb;
               $maxSortOrder = (int)$wpdb->get_var($wpdb->prepare("SELECT MAX(sort_order) FROM {$wpdb->prefix}ums_shapes WHERE map_id=%s", $shape['map_id']));
               $shape['sort_order'] = ++$maxSortOrder;
            }
         }
         $shape['coords'] = isset($shape['coords']) ? base64_encode(utilsUms::serialize($shape['coords'])) : '';
         $shape['params'] = isset($shape['params']) ? utilsUms::serialize($shape['params']) : '';
         if ($update) {
            dispatcherUms::doAction('beforeShapeUpdate', $id, $shape);
            global $wpdb;
            $tableName = $wpdb->prefix . "ums_shapes";
            $data_update = array(
               'title' => $shape['title'],
               'description' => $shape['description'],
               'coords' => $shape['coords'],
               'type' => $shape['type'],
               'map_id' => $shape['map_id'],
               'params' => $shape['params'],
            );
            $data_where = array(
               'id' => $id
            );
            $dbRes = $wpdb->update($tableName, $data_update, $data_where);
            if ($dbRes) {
               $dbResId = $id;
            }
            dispatcherUms::doAction('afterShapeUpdate', $id, $shape);
         }
         else {
            dispatcherUms::doAction('beforeShapeInsert', $shape);
            global $wpdb;
            $tableName = $wpdb->prefix . "ums_shapes";
            $dbRes = $wpdb->insert($tableName, array(
               'id' => $shape['id'],
               'title' => $shape['title'],
               'description' => $shape['description'],
               'coords' => $shape['coords'],
               'type' => $shape['type'],
               'map_id' => $shape['map_id'],
               'params' => $shape['params'],
               'sort_order' => $shape['sort_order'],
            ));
            if ($dbRes) {
               $dbResId = $wpdb->insert_id;;
            }
            dispatcherUms::doAction('afterShapeInsert', $dbResId, $shape);
         }
         if (!empty($dbResId) && $dbResId) {
            if (!$update) $id = $dbResId;
            return $id;
         }
         else {
            $this->pushError(frameUms::_()
               ->getTable('shape')
               ->getErrors());
         }
      }
      else {
         $this->pushError(__('Please enter Shape name') , 'shape_opts[title]', UMS_LANG_CODE);
      }
      return false;
   }
   public function getById($id) {
     global $wpdb;
     $row = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}ums_shapes WHERE " . $wpdb->prepare("id = %s", $id), ARRAY_A);
     return $this->_afterGet($row);
      // return $this->_afterGet(frameUms::_()
      //    ->getTable('shape')
      //    ->get('*', array(
      //    'id' => $id
      // ) , '', 'row'));
   }
   public function getShapeByTitle($title) {
     global $wpdb;
     $row = $wpdb->get_row("SELECT * FROM {$wpdb->prefix}ums_shapes WHERE " . $wpdb->prepare("title = %s", $title), ARRAY_A);
     return $this->_afterGet($row);
      // return $this->_afterGet(frameUms::_()
      //    ->getTable('shape')
      //    ->get('*', array(
      //    'title' => $title
      // ) , '', 'row'));
   }
   public function _afterGet($shape, $widthMapData = false, $withoutIcons = false) {
      if (!empty($shape)) {
         //$shape['coords'] = @unserialize($shape['coords']) ? $shape['coords'] : base64_decode($shape['coords']);
         if (!is_array($shape['coords']) && @unserialize($shape['coords'])) {
           $shape['coords'] = $shape['coords'];
         } else if (!is_array($shape['coords'])){
           $shape['coords'] = base64_decode($shape['coords']);
         }
         if (!is_array($shape['coords'])) {
           $shape['coords'] = utilsUms::unserialize($shape['coords']);
         }
         if (!is_array($shape['params'])) {
           $shape['params'] = utilsUms::unserialize($shape['params']);
         }
         // Go to absolute path as "../wp-content/" will not work on frontend
         //$shape['description'] = str_replace('../wp-content/', UMS_SITE_URL. 'wp-content/', $shape['description']);
         /*if(uriUms::isHttps()) {
         $shape['description'] = uriUms::makeHttps($shape['description']);
         }*/
         if ($widthMapData && !empty($shape['map_id'])) $shape['map'] = frameUms::_()->getModule('maps')
            ->getModel()
            ->getMapById($shape['map_id'], false);
         $shape['actions'] = frameUms::_()->getModule('shape')
            ->getView()
            ->getListOperations($shape['id']);
      }
      return $shape;
   }
   public function getMapShapes($mapId) {
      $mapId = (int)$mapId;
      global $wpdb;
      $shapes = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ums_shapes WHERE " . $wpdb->prepare("map_id = %s", $mapId) . " ORDER BY sort_order ASC ", ARRAY_A);
      // $shapes = frameUms::_()->getTable('shape')
      //    ->orderBy('sort_order ASC')
      //    ->get('*', array(
      //    'map_id' => $mapId
      // ));
      if (!empty($shapes)) {
         foreach ($shapes as $i => $m) {
            $shapes[$i] = $this->_afterGet($shapes[$i], false, true);
         }
      }
      return $shapes;
   }
   public function getMapShapesIds($mapId) {
     global $wpdb;
     return $shapes = $wpdb->get_col("SELECT * FROM {$wpdb->prefix}ums_shapes WHERE " . $wpdb->prepare("map_id = %s", $mapId), ARRAY_A);
      // return frameUms::_()->getTable('shape')
      //    ->get('id', array(
      //    'map_id' => $mapId
      // ) , '', 'col');
   }
   public function getShapesByIds($ids) {
      if (!is_array($ids)) $ids = array(
         $ids
      );
      $ids = array_map('intval', $ids);
      global $wpdb;
      $ids = implode(',', array_map('absint', $ids));
      $shapes = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}ums_shapes WHERE id IN (%1s)", $ids), ARRAY_A);
      // $shapes = frameUms::_()->getTable('shape')
      //    ->get('*', array(
      //    'additionalCondition' => 'id IN (' . implode(',', $ids) . ')'
      // ));
      if (!empty($shapes)) {
         foreach ($shapes as $i => $m) {
            $shapes[$i] = $this->_afterGet($shapes[$i]);
         }
      }
      return $shapes;
   }
   public function removeShape($shapeId) {
      global $wpdb;
      $tableName = $wpdb->prefix . "ums_shapes";
      $data_where = array(
         'id' => $shapeId
      );
      return $res = $wpdb->delete($tableName, $data_where);
   }
   public function removeList($ids) {
      global $wpdb;
      $ids = array_map('intval', $ids);
      $tableName = "`" . $wpdb->prefix . "ums_shapes`";
      $ids = implode(',', $ids);
      $prepareQuery = $wpdb->prepare("DELETE FROM %1s WHERE id IN (%1s)", $tableName, $ids);
      return $res = $wpdb->query($prepareQuery);
   }
   public function findAddress($params) {
      if (!isset($params['addressStr']) || strlen($params['addressStr']) < 3) {
         $this->pushError(__('Address is empty or not match', UMS_LANG_CODE));
         return false;
      }
      $addr = $params['addressStr'];
      $getdata = http_build_query(array(
         'address' => $addr,
         'language' => 'en',
         'sensor' => 'false',
      ));
      $apiDomain = frameUms::_()->getModule('maps')
         ->getView()
         ->getApiDomain();
      $google_response = utilsUms::jsonDecode(file_get_contents($apiDomain . 'maps/api/geocode/json?' . $getdata));
      $res = array();
      foreach ($google_response['results'] as $response) {
         $res[] = array(
            'position' => $response['geometry']['location'],
            'address' => $response['formatted_address'],
         );
      }
      return $res;
   }
   public function removeShapesFromMap($mapId) {
      global $wpdb;
      $tableName = $wpdb->prefix . "ums_shapes";
      $data_where = array(
         'map_id' => $mapId
      );
      return $res = $wpdb->delete($tableName, $data_where);
   }
   public function getAllShapes($d = array() , $widthMapData = false) {
      if (isset($d['limitFrom']) && isset($d['limitTo'])) frameUms::_()->getTable('shape')
         ->limitFrom($d['limitFrom'])->limitTo($d['limitTo']);
      if (isset($d['orderBy']) && !empty($d['orderBy'])) {
         frameUms::_()->getTable('shape')
            ->orderBy($d['orderBy']);
      }
      $shapeList = frameUms::_()->getTable('shape')
         ->get('*', $d);
      foreach ($shapeList as $i => & $m) {
         $shapeList[$i] = $this->_afterGet($shapeList[$i], $widthMapData);
      }
      return $shapeList;
   }
   public function setShapesToMap($addShapeIds, $mapId) {
      if (!is_array($addShapeIds)) {
         $addShapeIds = array(
            $addShapeIds
         );
      }
      $addShapeIds = array_map('intval', $addShapeIds);
      global $wpdb;
      foreach ($addShapeIds as $addShapeId) {
         $tableName = $wpdb->prefix . "ums_shapes";
         $data_update = array(
            'map_id' => (int)$mapId,
         );
         $data_where = array(
            'id' => $addShapeId
         );
         $dbRes = $wpdb->update($tableName, $data_update, $data_where);
      }
      if ($dbRes) {
         return true;
      }
   }
   public function getCount($d = array()) {
    global $wpdb;
    return $wpdb->get_var("SELECT COUNT(*) AS `total` FROM {$wpdb->prefix}ums_shapes");
      // return frameUms::_()->getTable('shape')
      //    ->get('COUNT(*)', $d, '', 'one');
   }
   public function updatePos($d = array()) {
      $d['id'] = isset($d['id']) ? (int)$d['id'] : 0;
      if ($d['id']) {
         $tableName = $wpdb->prefix . "ums_shapes";
         $data_update = array(
            'coords' => base64_encode(utilsUms::serialize($d['coords'])),
         );
         $data_where = array(
            'id' => $d['id']
         );
         return $dbRes = $wpdb->update($tableName, $data_update, $data_where);
      }
      else $this->pushError(__('Invalid Shape ID'));
      return false;
   }
   public function existsId($id) {
      if ($id) {
         $shape = frameUms::_()->getTable('shape')
            ->get('*', array(
            'id' => $id
         ) , '', 'row');
         if (!empty($shape)) {
            return true;
         }
      }
      return false;
   }
   public function getTotalCountBySearch($search, $mapId) {
      global $wpdb;
      if (!empty($search)) {
         $count = (int)$wpdb->get_var("SELECT COUNT(*) AS total FROM {$wpdb->prefix}ums_shapes WHERE " . $wpdb->prepare(" map_id = %s AND (id = %s OR title = %s)", $mapId, $search, $search));
      }
      else {
         $count = (int)$wpdb->get_var("SELECT COUNT(*) AS total FROM {$wpdb->prefix}ums_shapes WHERE " . $wpdb->prepare(" map_id = %s", $mapId));
      }
      return $count;
   }
   public function getListForTblBySearch($search, $limitStart, $rowsLimit, $mapId) {
      global $wpdb;
      if (!empty($search)) {
         $data = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ums_shapes WHERE " . $wpdb->prepare(" map_id = %s AND (id = %s OR title = %s) ORDER BY id ASC LIMIT %1s,%1s", $mapId, $search, $search, (int)$limitStart, (int)$rowsLimit) , ARRAY_A);
      }
      else {
         $data = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ums_shapes WHERE " . $wpdb->prepare(" map_id = %s ORDER BY id ASC LIMIT %1s,%1s", $mapId, (int)$limitStart, (int)$rowsLimit) , ARRAY_A);
      }
      foreach ($data as $i => & $m) {
         $data[$i] = $this->_afterGet($data[$i]);
      }
      return $data;
   }
}
