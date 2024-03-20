jQuery(document).ready(function(){
	// Map element position
	jQuery('#umsMapForm .umsMapPosChangeSelect').change(function(){
		var newPosition = jQuery(this).val();
		if(newPosition && google.maps.ControlPosition[ newPosition ]) {
			var optionDataKey = jQuery(this).data('for')
			,	optionData = g_umsMap.get( optionDataKey ) || {};
			optionData.position = google.maps.ControlPosition[ newPosition ];
			g_umsMap.set(optionDataKey, optionData);
		}
	});
	jQuery('#umsMapForm input[name="map_opts[enable_trafic_layer]"]').change(function(){
		// Remember - that this is not actually checkbox, we detect hidden field value here, @see htmlUms::checkboxHiddenVal()
		if(parseInt(jQuery(this).val())) {
			if(!g_umsMap.getLayer('trafic')) {
				g_umsMap.createTraficLayer();
			}
			g_umsMap.enbLayer('trafic');
		} else {
			g_umsMap.dsblLayer('trafic');
		}
	});
	jQuery('#umsMapForm input[name="map_opts[enable_transit_layer]"]').change(function(){
		// Remember - that this is not actually checkbox, we detect hidden field value here, @see htmlUms::checkboxHiddenVal()
		if(parseInt(jQuery(this).val())) {
			if(!g_umsMap.getLayer('transit')) {
				g_umsMap.createTransitLayer();
			}
			g_umsMap.enbLayer('transit');
		} else {
			g_umsMap.dsblLayer('transit');
		}
	});
	jQuery('#umsMapForm input[name="map_opts[enable_bicycling_layer]"]').change(function(){
		// Remember - that this is not actually checkbox, we detect hidden field value here, @see htmlUms::checkboxHiddenVal()
		if(parseInt(jQuery(this).val())) {
			if(!g_umsMap.getLayer('bicycling')) {
				g_umsMap.createBicyclingLayer();
			}
			g_umsMap.enbLayer('bicycling');
		} else {
			g_umsMap.dsblLayer('bicycling');
		}
	});
	jQuery('#umsMapForm input[name="map_opts[hide_poi]"]').change(function(){
		g_umsMap.setParam('hide_poi', parseInt(jQuery(this).val()));
        g_umsMap.setHidePoi(parseInt(jQuery(this).val()));
	});
	jQuery('#umsMapForm input[name="map_opts[hide_countries]"]').change(function(){
		g_umsMap.setParam('hide_countries', parseInt(jQuery(this).val()));
		umsStylesToggle(g_umsMap, 'hide_countries');
	});
	jQuery('#umsMapForm input[name="map_opts[center_on_cur_user_pos]"]').change(function(){
		umsCurUserPosOptionsToggle(jQuery(this).val());
	});
	// umsCurUserPosOptionsToggle(g_umsMap.getParam('center_on_cur_user_pos'));
	// // Init window to choose marker for Center On Current User Position option
	// umsInitCurUserPosIconsWnd();
	// umsSetCurUserPosIconImg();
});
function umsInitCurUserPosIconsWnd() {
	var $container = umsInitMarkerIconsDialogWnd()
	,	dialodClasses =  umsGetDialogClasses();

	jQuery('#umsCurUserPosIconBtn').click(function(){
		$container.addClass(dialodClasses.curUserPosIcon);
		$container.dialog('open');
		return false;
	});
	jQuery('.previewIcon').click(function(){
		if($container.hasClass(dialodClasses.curUserPosIcon)) {
			var newId = jQuery(this).data('id');
			jQuery('#umsMapForm input[name="map_opts[center_on_cur_user_pos_icon]"]').val( newId );
			umsSetCurUserPosIconImg();
			$container.dialog('close');
			return false;
		}
	});
	/*
	 * wp media upload
	 *
	 */
	jQuery('#umsUploadCurUserPosIconBtn').click(function(e){
		var custom_uploader;
		e.preventDefault();
		//If the uploader object has already been created, reopen the dialog
		if (custom_uploader) {
			custom_uploader.open();
			return;
		}
		//Extend the wp.media object
		custom_uploader = wp.media.frames.file_frame = wp.media({
			title: 'Choose Image'
		,	button: {
				text: 'Choose Image'
			}
		,	multiple: false
		});
		//When a file is selected, grab the URL and set it as the text field's value
		var currentForm = jQuery(this).parents('form');
		custom_uploader.on('select', function(){
			var attachment = custom_uploader.state().get('selection').first().toJSON()
			,	respElem = jQuery('.umsCurUserPosUplRes')
			,	sendData = {
					page: 'icons'
				,	action: 'saveNewIcon'
				, '_wpnonce': UMS_NONCE['ums_nonce']
				,	reqType: 'ajax'
				,	icon: {
						url: attachment.url
					}
				};
			if(attachment.title != undefined){
				sendData.icon.title = attachment.title;
			}
			if(attachment.description != undefined){
				sendData.icon.description = attachment.description;
			}
			jQuery.sendFormUms({
				msgElID: respElem
			,	data: sendData
			,	onSuccess: function(res){
					if(!res.error) {
						drawNewCurUserPosIcon(res.data);
					} else {
						respElem.html(data.error.join(','));
					}
				}
			});
		});
		//Open the uploader dialog
		custom_uploader.open();
	});
}
function umsSetCurUserPosIconImg() {
	var id = parseInt( jQuery('#umsMapForm input[name="map_opts[center_on_cur_user_pos_icon]"]').val() );
	jQuery('#umsCurUserPosIconPrevImg').attr('src', jQuery('.previewIcon[data-id="'+ id+ '"] img').attr('src'));
}
function drawNewCurUserPosIcon(icon){
	if(typeof(icon.data) == undefined){
		return;
	}
	jQuery('#umsMapForm input[name="map_opts[center_on_cur_user_pos_icon]"]').val(icon.id);
	var newIcon = '<li class="previewIcon" data-id="'+ icon.id+ '" title="'+ icon.title+ '"><img src="'+ icon.url+ '"><i class="fa fa-times" aria-hidden="true"></i></li>';
	jQuery('ul.iconsList').append(newIcon);
	umsSetCurUserPosIconImg();
}
function umsCurUserPosOptionsToggle(val) {
	if(parseInt(val))
		jQuery('#umsCurUserPosOptions').show();
	else
		jQuery('#umsCurUserPosOptions').hide();
}
