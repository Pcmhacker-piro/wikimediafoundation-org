jQuery(document).ready(function(){
	jQuery('.umsMmlElement').click(function(){
		var key = jQuery(this).data('key');
		umsMmlClickListStyle( key );
		return false;
	});
	jQuery('.umsMmlApplyBtn').click(function(){
		var key = jQuery(this).parents('.umsMmlElement:first').data('key');
      if (key === 'slider_simple_table') {
         jQuery('.slider_simple_table_show').show();
      } else {
         jQuery('.slider_simple_table_show').hide();
      }
		umsMmlClickListStyle( key );
		return false;
	});

	var listTypeInput = jQuery('#umsMapForm input[name="map_opts[markers_list_type]"]').val();
	// alert(listTypeInput);

	if(listTypeInput && listTypeInput != '') {
		var selectedCell = jQuery('#umsMml').find('.umsMmlElement[data-key="'+ listTypeInput+ '"]');
		selectedCell.addClass('active');
		selectedCell.find('.umsMmlApplyBtn').html( selectedCell.find('.umsMmlApplyBtn').data('active-label') ).addClass('active');
		jQuery('#umsMapMarkersListSettings').show();
		jQuery('#umsMarkerListDefImgOptions').parents('tr:first').show();
		jQuery('#umsMapForm input[name="map_opts[enable_marker_list_type]"]').prop('checked',true);
		jQuery('#umsMapForm #map_optsenable_marker_list_type_check').prop('checked',true);
		jQuery('#umsMapForm #map_optsenable_marker_list_type_check').parent().addClass('checked');
      if (listTypeInput === 'slider_simple_table') {
         jQuery('.slider_simple_table_show').show();
      } else {
         jQuery('.slider_simple_table_show').hide();
      }
	} else {
		jQuery('#umsMapForm input[name="map_opts[enable_marker_list_type]"]').prop('checked',false);
		jQuery('#umsMapForm #map_optsenable_marker_list_type_check').prop('checked',false);
		jQuery('#umsMapForm #map_optsenable_marker_list_type_check').parent().removeClass('checked');
	}
	// Marker options



	jQuery('#umsMarkerForm input[name="marker_opts[params][marker_list_def_img]"]').change(function(){
		umsAddMarkerListDefImgOptions(jQuery(this).prop('checked'));
	});

	jQuery('#umsMarkerListDefImgUploadFileBtn').click(function(e){
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
			var attachment = custom_uploader.state().get('selection').first().toJSON();
			currentForm.find('input[name="marker_opts[params][marker_list_def_img_url]"]').val(attachment.url);
		});
		//Open the uploader dialog
		custom_uploader.open();
	});
});

jQuery('#umsMapForm input[name="map_opts[enable_marker_list_type]"]').on('change', function(){
	var listTypeInput = jQuery('#umsMapForm input[name="map_opts[markers_list_type]"]').val();
	if (listTypeInput.length <= 0) {
		listTypeInput = 'slider_simple_before';
	}
	if(jQuery(this).is(':checked')) {
		umsMmlClickListStyle(listTypeInput);
	} else {
		umsMmlClickListStyle(listTypeInput);
	}
});
function umsMmlClickListStyle(key) {
	jQuery('#umsMapForm input[name="map_opts[enable_marker_list_type]"]').prop('checked',false);
	jQuery('#umsMapForm #map_optsenable_marker_list_type_check').prop('checked',false);
	jQuery('#umsMapForm #map_optsenable_marker_list_type_check').parent().removeClass('checked');
	var list = jQuery('#umsMml');
	list.find('.umsMmlElement').removeClass('active');
	list.find('.umsMmlApplyBtn').each(function(){
		jQuery(this).html( jQuery(this).data('apply-label') );
	}).removeClass('active');
	jQuery('#umsMapMarkersListSettings').hide();
	jQuery('#umsMarkerListDefImgOptions').parents('tr:first').hide();
	var listTypeInput = jQuery('#umsMapForm input[name="map_opts[markers_list_type]"]')
	,	currentStyle = listTypeInput.val();

	if(currentStyle == key) {
		listTypeInput.val('');
	} else {
		listTypeInput.val( key );
		jQuery('#umsMapForm input[name="map_opts[enable_marker_list_type]"]').prop('checked',true);
		jQuery('#umsMapForm #map_optsenable_marker_list_type_check').prop('checked',true);
		jQuery('#umsMapForm #map_optsenable_marker_list_type_check').parent().addClass('checked');
		var selectedCell = list.find('.umsMmlElement[data-key="'+ key+ '"]');
		selectedCell.addClass('active');
		selectedCell.find('.umsMmlApplyBtn').html( selectedCell.find('.umsMmlApplyBtn').data('active-label') ).addClass('active');
		jQuery('#umsMapMarkersListSettings').show();
		jQuery('#umsMarkerListDefImgOptions').parents('tr:first').show();
	}
	listTypeInput.change();
	jQuery('#umsMarkersListWnd').dialog('close');
}
function umsAddMarkerListDefImgOptions(val) {
	if(val) {
		jQuery('#umsMarkerListDefImgOptions').css('display', 'inline');
	} else {
		jQuery('#umsMarkerListDefImgOptions').css('display', 'none');
	}
}
