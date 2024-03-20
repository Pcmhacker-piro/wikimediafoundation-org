<?php
class importMarkersFromXmlModelUms {
	protected $_code = '';
	protected $tagNameAssoc;
	protected $tagNameKeys;
	protected $addMakerToNode = false;

	public function __construct() {
		$this->init();
	}

	public function init() {
		$this->tagNameAssoc = array(
			'name' => 'title',
			'address' => 'address',
			'description' => 'description',
			'Point' => array('coord_y', 'coord_x'),
			'TimeSpan' => array(
				'begin' => 'period_from',
				'end' => 'period_to',
			)
		);

		$this->tagNameKeys = array_keys($this->tagNameAssoc);
	}

	public function parseNode(&$arrToFill, $node) {
		if(in_array($node->nodeName, $this->tagNameKeys)) {
			$key = $this->tagNameAssoc[$node->nodeName];

			switch($node->nodeName) {
				case 'name':
				case 'address':
				case 'description':
					//var_dump($node->nodeValue); echo "<br/>";
					$arrToFill[$key] = $node->nodeValue;
					break;
				case 'Point':
					$this->addMakerToNode = true;
					for($i = 0; $i < $node->childNodes->length; $i++) {
						$coordNode = $node->childNodes->item($i);
						if($coordNode->nodeName === 'coordinates'){
							$this->parsePointTag($arrToFill, $coordNode->nodeValue, $key, ',');
						}
					}
					break;
				case 'TimeSpan':
					$this->parseTimeSpanTag($arrToFill, $node->childNodes, $key);
					break;
			}
		}
	}

	public function parsePointTag(&$arrToFill, $nodeValue, $keyNames, $delimiter = ',') {
		$point = explode($delimiter, $nodeValue);

		if(count($point) > 1) {
			$arrToFill[$keyNames[0]] = $point[0];
			$arrToFill[$keyNames[1]] = $point[1];
		}
	}

	public function parseTimeSpanTag(&$arrToFill, $nodes, $keyNames) {
		$periodFrom = null;
		$periodTo = null;

		for($indz = 0; $indz < $nodes->length; $indz++) {
			$cnDates = $nodes->item($indz);

			if(isset($keyNames[$cnDates->nodeName])) {
				$arrKey = $keyNames[$cnDates->nodeName];
				$timeFromstr = strtotime($cnDates->nodeValue);
				if($timeFromstr) {
					$arrToFill[$arrKey] = date('Y-m-d H:i:s', $timeFromstr);
				}
			}
		}
	}

	public function getMarkersFromTag($xmlDocument, $tagName) {
		$placemarkList = array();
		$elementsToDelete = array();
		$domPlaceMarkNodeList = $xmlDocument->getElementsByTagName($tagName);
		if($domPlaceMarkNodeList->length) {
			for($ind1 = 0; $ind1 < $domPlaceMarkNodeList->length; $ind1++) {
				$this->addMakerToNode = false;
				$onePlaceMark = array();
				$currPlaceMark = $domPlaceMarkNodeList->item($ind1);
				$elementsToDelete[] = $currPlaceMark;
				if($currPlaceMark->childNodes->length) {
					for($indj = 0; $indj < $currPlaceMark->childNodes->length; $indj++) {
						$this->parseNode($onePlaceMark, $currPlaceMark->childNodes->item($indj));
					}
				}
				if($this->addMakerToNode) {
					// add node Data to Array
					$placemarkList[] = $onePlaceMark;
				}
			}
		}

		// remove node From Tree
		foreach ( $elementsToDelete as $elementToDelete ) {
			$elementToDelete->parentNode->removeChild($elementToDelete);
		}

		return $placemarkList;
	}

	public function setCode($code) {
		$this->_code = $code;
	}
	public function getCode() {
		return $this->_code;
	}
}