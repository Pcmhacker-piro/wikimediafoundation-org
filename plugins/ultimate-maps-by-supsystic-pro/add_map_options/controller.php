<?php
class add_map_optionsControllerUms extends controllerUms {
	public function getPermissions() {
		return array(
			UMS_USERLEVELS => array(
				UMS_ADMIN => array()
			),
		);
	}
}

