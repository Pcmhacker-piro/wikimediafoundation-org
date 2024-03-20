jQuery(document).ready(function(){
	g_umsMapLoadObserver.trigger(umsGetMapsEngine(umsMainMap), function() {
		umsKmlUpdateFileListForMap();
		jQuery('#umsKmlAddFileRowBtn').click(function(){
			umsKmlDrawFileRow();
			return false;
		});
	});
});
var umsKmlMarkerImportIter = 0;
function umsKmlDrawFileRow(params) {
	params = params || {};
	if(!params.filesShell) {
		params.filesShell = jQuery('#umsKmlFileRowsShell');
	}
	var newCell = jQuery('#umsKmlFileRowExample').clone().removeAttr('id')
	,	urlTxt = newCell.find('input[name="map_opts[kml_file_url][]"]')
	,	showSublayersTxt = newCell.find('input[name="map_opts[kml_filter][show_sublayers][]"]')
	,	showSublayersLabel = newCell.find('.umsShowSublayersLabel')
	,	showSublayersChecked = params.showSublayers ? 'checked="checked"' : ''
	,	$kmlImportMarkerLbl = newCell.find('.umsKmlImportToMarkerLbl .umsKitmLblText')
	,	$kmlImportMarkerHid = jQuery('.umsKmlImportToMarkerHid[data-order="' + umsKmlMarkerImportIter + '"]')
	,	$kmlImportMarker = jQuery('<input type="checkbox" name="map_opts[kml_import_to_marker][' + umsKmlMarkerImportIter + ']" class="umsKmlImportToMarker"/>')
	,	showSublayersCheckbox = jQuery('<input type="checkbox" name="map_opts[kml_filter_checkboxes][]" ' + showSublayersChecked + ' class="umsProOpt" style="margin-left: 5px;" />')
	,	uploadBtn = newCell.find('.umsKmlUploadFileBtn');

	if($kmlImportMarkerHid.val() == 1) {
		$kmlImportMarker.prop('checked', true);
	}
	urlTxt.removeAttr('disabled');
	showSublayersTxt.removeAttr('disabled');
	showSublayersTxt.val(parseInt(params.showSublayers));
	showSublayersLabel.append(showSublayersCheckbox);
	$kmlImportMarkerLbl.before($kmlImportMarker);

	showSublayersCheckbox.on('change', function() {
		var input = jQuery(this).parents('.umsShowSublayersLabel:first').find('.umsShowSublayersInput');

		if(jQuery(this).is(':checked')) {
			input.val('1');
		} else {
			input.val('0');
		}
	});

	if(params.fileUrl && params.fileUrl != '') {
		urlTxt.val( params.fileUrl );
	}
	var currAjax = new AjaxUpload(uploadBtn, {
		action: uploadBtn.data('url')
	,	name: 'kml_file'
	,	responseType: 'json'
	,	onSubmit: function() {
			if($kmlImportMarker.is(':checked')) {
				currAjax._settings.data['useMarkerImport'] = 1;
			}
			newCell.find('.umsKmlUploadMsg').showLoaderUms();
		}
	,	onComplete: function(file, res) {
			toeProcessAjaxResponseUms(res, newCell.find('.umsKmlUploadMsg'));
			if(!res.error) {
				newCell.find('input[name="map_opts[kml_file_url][]"]').val(res.data.file_url);
				umsAddKMLLayer(g_umsMap, res.data.file_url);

				if($kmlImportMarker.is(':checked')) {
					var resConfirm = confirm('To see the result, you need to save and reload the map. Do you want to do this?');
					if(resConfirm) {
						var $currMap = jQuery('#umsMapForm');
						$currMap.off('umsSaved').on('umsSaved', function() {
							// reload this page
							window.location.href = window.location.pathname + window.location.search + window.location.hash;
						});
						jQuery('#umsMapForm').submit();
					}
				}
			}
		}
	,	data: {
			_nonce: jQuery(uploadBtn).data('nonce')
		,	'mapId': jQuery('input[name="map_opts[id]"]').val()
		,	'useMarkerImport': 0
		}
	});
	params.filesShell.append(newCell.show());
	umsKmlMarkerImportIter++;
}
function umsKmlRemoveFileRowBtnClick(btn) {
	var $row = jQuery(btn).parents('.umsKmlFileRow:first')
	,	url = $row.find('input[name="map_opts[kml_file_url][]"]').val();

	//umsRemoveKMLLayer(url);
	g_umsMap.removeKmlLayerByUrl( url );
	$row.animateRemoveUms(300);
}
function umsKmlUpdateFileListForMap() {
	var fileUrls = []
	,	$filesShell = jQuery('#umsKmlFileRowsShell')
	,	kmlFileUrl = g_umsMap.getParam('kml_file_url')
	,	kmlFilterShowSulayers = g_umsMap.getParam('kml_filter');

	$filesShell.html('');
	if(kmlFileUrl) {
		fileUrls = kmlFileUrl;
	} else {
		fileUrls.push('');
	}
	for(var i = 0; i < fileUrls.length; i++) {
		umsKmlDrawFileRow({
			fileUrl: fileUrls[i]
		,	filesShell: $filesShell
		,	showSublayers: kmlFilterShowSulayers && kmlFilterShowSulayers['show_sublayers'] ? parseInt(kmlFilterShowSulayers['show_sublayers'][i]) : ''
		});
	}
}
