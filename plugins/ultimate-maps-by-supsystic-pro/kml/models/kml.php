<?php
class kmlModelUms extends modelUms {
	private $_uploadDir = 'gmap_kml';
	public function addFromFile($files, &$fileInfo) {
		//if($this->_validateFile($files, 'kml_file')) {
			@$file = $files['kml_file'];
			importClassUms('fileuploaderUms');
			$uploader = toeCreateObjUms('fileuploader', array());

			if($uploader->validate('kml_file', $this->getUploadDir(), @$file['name']) && $uploader->upload()) {
				$fileInfo = $uploader->getFileInfo();
				if(uriUms::isHttps()) {
					$fileInfo['url'] = uriUms::makeHttps($fileInfo['url']);
				}
				return $fileInfo['url'];
			} else {
				$this->pushError( $uploader->getError() );
			}
		/*} else
			$this->pushError(langUms::_('Invalid file type'));*/
		return false;
	}
	public function addKmlFileTypeFilter() {
		add_filter('upload_mimes', array($this, 'addKmlToWpUpload'));
	}
	public function removeKmlFileTypeFilter() {
		add_filter('upload_mimes', array($this, 'removeKmlFromWpUpload'));
	}
	public function addKmlToWpUpload($mimes = array()) {
		// $mimes['kml'] = 'application/vnd.google-earth.kml+xml';
		// $mimes['kmz'] = 'application/vnd.google-earth.kmz';
		if (!defined('PHP_VERSION_ID')) {
		    $version = explode('.', PHP_VERSION);
		    define('PHP_VERSION_ID', ($version[0] * 10000 + $version[1] * 100 + $version[2]));
		}
		if (PHP_VERSION_ID < 70210) {
			$mimes['kml'] = 'application/xml';
		} else {
			$mimes['kml'] = 'text/xml';
		}
		$mimes['kmz'] = 'application/zip';
		return $mimes;
	}
	public function removeKmlFromWpUpload($mimes = array()) {
		if(isset($mimes['kml']))
			unset($mimes['kml']);
		if(isset($mimes['kmz']))
			unset($mimes['kmz']);
		return $mimes;
	}
	public function getUploadDir() {
		return $this->_uploadDir;
	}
	private function _validateFile($files, $key) {
		if(in_array($files[$key]['type'], array('application/octet-stream'))) {
			return true;
		}
		return false;
	}
}
