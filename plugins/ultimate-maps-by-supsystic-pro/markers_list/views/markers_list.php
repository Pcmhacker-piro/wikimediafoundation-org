<?php
class markers_listViewUms extends viewUms {
	public function getSliderSimpleList($map) {
		if(isset($map['markers']) && !empty($map['markers'])) {
			$map['markers'] = $this->extractContentImg( $map['markers'] );
			$this->assign('map', $map);
			return parent::getContent('mmlSliderSimple');
		}
		return '';
	}
	public function getSliderCheckboxTree($map) {
		if(isset($map['markers']) && !empty($map['markers'])) {
			$groupsList = frameUms::_()->getModule('marker_groups')->getModel()->getCurrentMapMarkersGroupsTree($map, false);
			//if enable all category for markers
			if(true){
				$properties = array(
					'id' => 'all',
					'title' => !empty($map['params']['marker_filter_button_title']) ? $map['params']['marker_filter_button_title'] : __('Show all', UMS_LANG_CODE),
					'params' => array(
						'bg_color' => '#e4e4e4',
                  'text_color' => 'black'
					)
				);
				$groupsList[] = $properties;
			}
			frameUms::_()->addJSVar('markers_list.filter', 'ums_group_list', $groupsList);
			$this->assign('map', $map);
		}
	}
	public function getSliderTableList($map) {
		$content = '';

		if(isset($map['markers']) && !empty($map['markers'])) {
			//$map['markers'] = $this->extractContentImg( $map['markers'] );
			$markerGroupsTree = frameUms::_()->getModule('marker_groups')->getModel()->getCurrentMapMarkersGroupsTree($map, true);
			//var_dump($markerGroupsTree); exit();
			$this->assign('map', $map);
			$content .= '<div class="umsMml umsMmlSliderTableShell umsListType_' . $map['params']['markers_list_type'] . '" ' .
	 			'id="umsMmlSimpleSlider_' . $map['view_id'] . '" ' . 'data-slider-type="table" style="display: none;">';
			$content = $this->getMarkerGroupsHtml($markerGroupsTree, $content);
			$content .= '</div>';
		}
		echo $content;
	}
	public function getMarkerGroupsHtml($groups, $content) {
		foreach($groups as $g) {
			$groupMarkers = array();
			foreach($this->map['markers'] as $marker) {
				if($marker['marker_group_id'] == $g['id']
					|| (isset($marker['marker_group_ids']) && !empty($marker['marker_group_ids']) && in_array($g['id'], $marker['marker_group_ids']))
				) {
					array_push($groupMarkers, $marker);
				}
			}
			if(!empty($groupMarkers) || !empty($g['children'])) {
				$this->assign('group', $g);
				$content .= parent::getContent('mmlSliderTable_Group');
				$content .= '<div class="umsMarkerGroupWrapper" style="display:none;">';
				if(!empty($g['children'])) {
					$content = $this->getMarkerGroupsHtml($g['children'], $content);
				}
				$this->assign('group', $g);	// reassign group to current after recursion
				if(!empty($groupMarkers)) {
					$this->assign('markers', $groupMarkers);
					$content .= parent::getContent('mmlSliderTable_Markers');
				}
				$content .= '</div>';
			}
		}
		return $content;
	}
	public function extractContentImg($markers) {
		foreach($markers as $i => $m) {
			$imgTags = utilsUms::umsExtractImgTags( $m['description'] );
			if(!empty($imgTags) && !empty($imgTags[0])) {
				$markers[$i]['raw_content'] = $this->prepareMarkerContent( str_replace($imgTags[0], '', $m['description']) );
				$markers[$i]['raw_img'] = $imgTags[0];
			} else {
				$markers[$i]['raw_content'] = $this->prepareMarkerContent( $m['description'] );
				$markers[$i]['raw_img'] = '';
			}
			if(isset($m['params']['marker_list_def_img'])
				&& isset($m['params']['marker_list_def_img_url'])
				&& $m['params']['marker_list_def_img_url']
			)
				$markers[$i]['raw_img'] = '<img src="'. $m['params']['marker_list_def_img_url'] .'" />';
		}
		return $markers;
	}
	public function prepareMarkerContent($content) {
		return preg_replace("/([^>])\n/", '$1<br/>', $content);
	}
}
