jQuery(window).on('load',function() {
	var mapForm = jQuery('#umsMapForm');

	mapForm.find('input[name="map_opts[frontend_add_markers]"]').change(function(){
		gmpAddMarkerFormOptions(jQuery(this).val());
	});
	mapForm.find('input[name="map_opts[frontend_add_markers_use_limits]"]').change(function(){
		gmpAddMarkerFormLimitsOptions(jQuery(this).val());
	});
	var interval = setInterval(function(){
		if (g_umsMap) {
			clearInterval(interval);
            gmpAddMarkerFormOptions(g_umsMap.getParam('frontend_add_markers'));
            gmpAddMarkerFormLimitsOptions(g_umsMap.getParam('frontend_add_markers_use_limits'));
		}
	},100);
});
function gmpAddMarkerFormOptions(val) {
	val = parseInt(val);

	var	markerFormCodeShell = jQuery('#shortcodeCode .umsMapMarkerFormCodeShell')
	,	markerOnFrontendOptions = jQuery('#umsMapForm #umsAddMarkersOnFrontendOptions');

	if(val) {
		markerFormCodeShell.parents('span:first').show(300);
		markerOnFrontendOptions.show(300);
	} else {
		markerFormCodeShell.parents('span:first').hide(300);
		markerOnFrontendOptions.hide(300);
	}
}
function gmpAddMarkerFormLimitsOptions(val) {
	val = parseInt(val);

	var limitsShell = jQuery('#umsMapForm #umsUseLimitsForMarkerAddingOptions');

	if(parseInt(val)) {
		limitsShell.show(300);
	} else {
		limitsShell.hide(300);
	}
}