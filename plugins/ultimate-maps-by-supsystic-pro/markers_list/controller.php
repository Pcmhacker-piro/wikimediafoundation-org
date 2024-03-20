<?php
class markers_listControllerUms extends controllerUms {
	public function getPermissions() {
		return array(
			UMS_USERLEVELS => array(
				UMS_ADMIN => array()
			),
		);
	}
}

