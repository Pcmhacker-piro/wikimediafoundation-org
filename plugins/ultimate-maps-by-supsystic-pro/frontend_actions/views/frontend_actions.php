<?php
class frontend_actionsViewUms extends viewUms {
	public $_addIconsWnd = false;

	public function drawMarkerForm($params) {
		$map = frameUms::_()->getModule('maps')->getModel()->getMapById($params['map_id']);

		if(empty($map)) {
			return __('Empty or Invalid Map ID. Please, check your Marker Form Shortcode.', UMS_LANG_CODE);
		}
		if($this->getModule()->_checkSaveMarkerFormForCurMap($map)) {
			if(isset($map['params']['frontend_add_markers_logged_in_only'])
				&& (int)$map['params']['frontend_add_markers_logged_in_only']
				&& !frameUms::_()->getModule('user')->isUserLoggedIn()
			) {
				$message = __('Marker Form will be displayed only for logged in users.', UMS_LANG_CODE);
				$message .= ' <a href="' . get_bloginfo('wpurl') . '/wp-admin/" id="gmpLogInBtn" class="button">' . __('Log In', UMS_LANG_CODE) . '</a>';
				return $message;
			}
			// Generate Form View Id
			$form_view_id = $map['id']. '_'. mt_rand(1, 99999);
			$form_params = array(
				'form_name' => !empty($params['form_name']) ? $params['form_name'] : __('Marker Form', UMS_LANG_CODE),
				'form_description' => !empty($params['form_description']) ? $params['form_description'] : __('Use this form to add markers to your map', UMS_LANG_CODE),
				'marker_name' => !empty($params['marker_name']) ? $params['marker_name'] : __('Marker Name', UMS_LANG_CODE),
				'marker_cat' => !empty($params['marker_cat']) ? $params['marker_cat'] : __('Marker Category', UMS_LANG_CODE),
				'marker_adr' => !empty($params['marker_adr']) ? $params['marker_adr'] : __('Address', UMS_LANG_CODE),
				'marker_desc' => !empty($params['marker_desc']) ? $params['marker_desc'] : __('Marker Description', UMS_LANG_CODE)
			);
			$use_wp_editor = isset($map['params']['frontend_add_markers_disable_wp_editor']) && (int)$map['params']['frontend_add_markers_disable_wp_editor'] ? false : true;
			$user_id = get_current_user_id();
			$user_markers_list = isset($map['params']['frontend_add_markers_delete_markers']) && (int)$map['params']['frontend_add_markers_delete_markers'] && (int) $user_id
				? frameUms::_()->getModule('marker')->getModel()->getMapMarkers($params['map_id'], false, $user_id)
				: false;
			$markerGroupsForSelect = isset($map['params']['frontend_add_markers_use_markers_categories']) && (int)$map['params']['frontend_add_markers_use_markers_categories']
				? frameUms::_()->getModule('marker_groups')->getModel()->getMarkerGroupsForSelect(array(0 => __('None', UMS_LANG_CODE)))
				: array();
			frameUms::_()->getModule('templates')->loadJqueryUi();
			frameUms::_()->getModule('templates')->loadFontAwesome();
			frameUms::_()->getModule('templates')->loadChosenSelects();
			frameUms::_()->addScript('jquery-ui-dialog', '', array('jquery'));
			frameUms::_()->addScript('jquery-ui-autocomplete', '', array('jquery'), false, true);
			frameUms::_()->addStyle('jquery-ui-autocomplete', UMS_CSS_PATH. 'jquery-ui-autocomplete.css');
			frameUms::_()->addScript('core.frontend_actions', $this->getModule()->getModPath(). 'js/core.frontend_actions.js');
			frameUms::_()->addStyle('maps_frontend_actions', $this->getModule()->getModPath(). 'css/maps_frontend_actions.css');

			$this->assign('formViewId', $form_view_id);
			$this->assign('formParams', $form_params);
			$this->assign('mapId', $map['id']);
			$this->assign('useWPEditor', $use_wp_editor);
			$this->assign('userMarkers', $user_markers_list);
			$this->assign('markerIcons', frameUms::_()->getModule('icons')->getModel()->getIcons(array('fields' => 'id, path, title')));
			$this->assign('markerGroupsForSelect', $markerGroupsForSelect);

			return parent::getContent('frontend_actionsMarkerForm');
		} else {
			return __("Marker's Form is not displayed, because the option &quot;Add markers on frontend&quot; is disabled for the Current Map", UMS_LANG_CODE);
		}
	}
}
