<?php
class frontend_actionsUms extends moduleUms {
	public function init() {
		parent::init();
		dispatcherUms::addFilter('mapParamsKeys', array($this, 'addMapParamsKeys'));
		add_shortcode(UMS_SHORTCODE . '_marker_form', array($this, 'drawMarkerForm'));
		dispatcherUms::addAction('afterConnectMapAssets', array($this, 'connectMapAssets'), 10, 2);
	}
	public function addMapParamsKeys($keys) {
		$keys = array_merge($keys, array(
			'frontend_add_markers', 'frontend_add_markers_logged_in_only', 'frontend_add_markers_disable_wp_editor',
			'frontend_add_markers_delete_markers', 'frontend_add_markers_use_limits', 'frontend_add_markers_use_count_limits',
			'frontend_add_markers_use_markers_categories', 'frontend_add_markers_use_time_limits'
		));
		return $keys;
	}
	public function connectMapAssets($params, $forAdminArea) {
		if($forAdminArea) {
			frameUms::_()->addScript('admin.frontend_actions', $this->getModPath(). 'js/admin.frontend_actions.js');
		}

	}
	public function drawMarkerForm($params = null) {
		if(!isset($params['map_id']) || empty($params['map_id'])) {
			return __('Empty or Invalid Map ID. Please, check your Marker Form Shortcode.', UMS_LANG_CODE);
		}

		return $this->getView()->drawMarkerForm($params);
	}
	public function _checkSaveMarkerFormForCurMap($map_id) {
		$map = is_array($map_id) ? $map_id : frameUms::_()->getModule('maps')->getModel()->getMapById($map_id);

		if(!empty($map) && isset($map['params']['frontend_add_markers']) && (int)$map['params']['frontend_add_markers']) {
			return true;
		}
		return false;
	}
}