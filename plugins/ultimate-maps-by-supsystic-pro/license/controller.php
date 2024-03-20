<?php
class licenseControllerUms extends controllerUms {
	public function activate() {
		$res = new responseUms();
		if($this->getModel()->activate(reqUms::get('post'))) {
			$res->addMessage(__('Done', UMS_LANG_CODE));
		} else
			$res->pushError ($this->getModel()->getErrors());
		$res->ajaxExec();
	}
	public function dismissNotice() {
		$res = new responseUms();
		frameUms::_()->getModule('options')->getModel()->save('dismiss_pro_opt', 1);
		$res->ajaxExec();
	}
	public function getPermissions() {
		return array(
			UMS_USERLEVELS => array(
				UMS_ADMIN => array('activate', 'dismissNotice')
			),
		);
	}
}

