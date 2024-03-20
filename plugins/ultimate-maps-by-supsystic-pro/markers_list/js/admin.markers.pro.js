(function($){
	function adminMarkersPro() {

	}

	adminMarkersPro.prototype.init = (function() {
		var datePickerConfiguration = {
			'showAnim': 'fadeIn',
			'changeMonth': true,
			'changeYear': true,
			'dateFormat': "dd-mm-yy",
			'showWeek': false,
			'firstDay': 1,
		};

		jQuery('#markerPeriodDateFrom')
			.datepicker(datePickerConfiguration)
			.datepicker('refresh')
		;
		jQuery('#markerPeriodDateTo').datepicker(datePickerConfiguration);

		jQuery('#marker_opts_marker_group_id').chosen();

	});

	window.umsAdminMarkerPro = new adminMarkersPro();
	jQuery(document).ready(function() {
		window.umsAdminMarkerPro.init();
	});
})(jQuery);