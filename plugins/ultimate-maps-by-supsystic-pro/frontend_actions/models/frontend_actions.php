<?php
class frontend_actionsModelUms extends modelUms {
	public function checkMarkerFormSavingLimits($map) {
		$new_limits = true;

		if(isset($map['params']['frontend_add_markers_use_limits']) && (int)$map['params']['frontend_add_markers_use_limits']) {
			$ip = utilsUms::getIP();

			if(!empty($ip)) {
				$date = new DateTime();
				$cur_limits_data = get_option(UMS_CODE . '_frontend_add_markers_limits');
				$map_id = $map['id'];
				$new_limits = array(
					$map_id => array(
						$ip => array('time' => $date->getTimestamp(), 'count' => 1),
					),
				);

				if($cur_limits_data) {
					if(isset($cur_limits_data[$map_id])) {
						if(isset($cur_limits_data[$map_id][$ip]) && isset($cur_limits_data[$map_id][$ip]['time']) && isset($cur_limits_data[$map_id][$ip]['count'])) {
							$map_time_limit = isset($map['params']['frontend_add_markers_use_time_limits']) && (int)$map['params']['frontend_add_markers_use_time_limits']
								? (int)$map['params']['frontend_add_markers_use_time_limits']
								: 10;
							$map_count_limit = isset($map['params']['frontend_add_markers_use_count_limits']) && (int)$map['params']['frontend_add_markers_use_count_limits']
								? (int)$map['params']['frontend_add_markers_use_count_limits']
								: 10;
							$time_since_last_adding = $date->getTimestamp() - $cur_limits_data[$map_id][$ip]['time'];

							if($time_since_last_adding <= $map_time_limit * 60) { // Get seconds
								if($cur_limits_data[$map_id][$ip]['count'] >= $map_count_limit) {
									$time_for_whait = $map_time_limit - $time_since_last_adding / 60;	// Get minures
									$message = sprintf(__('You have exceeded the limit on adding markers from current IP address. Please try again after %s minutes.', UMS_LANG_CODE), ceil($time_for_whait));
									$this->pushError($message);
									return false;
								} else {
									$cur_limits_data[$map_id][$ip]['count'] = ++$cur_limits_data[$map_id][$ip]['count'];
									$new_limits = $cur_limits_data;
								}
							} else {
								$cur_limits_data[$map_id][$ip] = $new_limits[$map_id][$ip];
								$new_limits = $cur_limits_data;
							}
						} else {
							$cur_limits_data[$map_id][$ip] = $new_limits[$map_id][$ip];
							$new_limits = $cur_limits_data;
						}
					} else {
						$cur_limits_data[$map_id] = $new_limits[$map_id];
						$new_limits = $cur_limits_data;
					}
				}
			}
		}
		return $new_limits;
	}
	public function updateMarkerFormSavingLimits($data) {
		if(is_array($data) && !empty($data)) {
			update_option(UMS_CODE. '_frontend_add_markers_limits', $data);
		}
	}
}