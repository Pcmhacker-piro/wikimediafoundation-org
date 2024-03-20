<?php
class kmlControllerUms extends controllerUms {
	public function addFromFile() {
		$res = new responseUms();
		$nonce = reqUms::getVar('_nonce');
		$mapId = (int) reqUms::getVar('mapId');
		$useMarkerImport = reqUms::getVar('useMarkerImport');
		$fileInfo = null;

		if(wp_verify_nonce($nonce, 'upload-kml-file')) {
			$this->getModel()->addKmlFileTypeFilter();

			if($fileUrl = $this->getModel()->addFromFile(reqUms::get('files'), $fileInfo)) {

				// prepare import Markers from Layer
				$uplFilePath = $this->replaceUrlToPath($fileUrl);
				if($uplFilePath && $useMarkerImport) {
					$markerHash = md5($fileInfo['name']);
					$placemarkList = $this->getMarkerListFromKmlFile($uplFilePath, true);
					// save marker list to DB
					if($placemarkList && count($placemarkList) && $mapId) {
						$markerModule = frameUms::getInstance()->getModule('marker');
						$markerModel = $markerModule->getModel('marker');
						foreach($placemarkList as $onePm) {
							$onePm['map_id'] = $mapId;
							$onePm['hash'] = $markerHash;
							$markerModel->save($onePm);
						}
					}
				}

				$res->addMessage(langUms::_('Done'));
				$res->addData('file_url', $fileUrl);
			} else {
				$res->pushError($this->getModel()->getErrors());
			}
			$this->getModel()->removeKmlFileTypeFilter();
		} else
			$res->pushError(langUms::_('Security check failed'));
		return $res->ajaxExec();
	}

	public function replaceUrlToPath($url) {
		$resultPath = null;
		$uplDir = rtrim(utilsUms::getUploadsDir(), '/');
		$position1 = strpos($url, '/uploads/');

		if($position1 !== false) {
			$fileNamePart2 = substr($url, $position1 + 8); // 8 length '/uploads/'
			$resultPath = $uplDir . $fileNamePart2;
		}
		return $resultPath;
	}

	public function getMarkerListFromKmlFile($fileName, $removeMarkerFromFile = false) {
		$placemarkList = array();
		$xmlElement = utilsUms::getXml($fileName);

		if($xmlElement !== false) {
			$domFromXml = dom_import_simplexml($xmlElement);
			$imfx = $this->getModel('importMarkersFromXml');
			// Prepare Markers Data to save
			$placemarkList = $imfx->getMarkersFromTag($domFromXml, 'Placemark');
			// save changes into this file
			if($removeMarkerFromFile) {
				$domFromXml->ownerDocument->save($fileName);
			}
		}
		return $placemarkList;
	}

	public function getPermissions() {
		return array(
			UMS_USERLEVELS => array(
				UMS_ADMIN => array('addFromFile')
			),
		);
	}
}
