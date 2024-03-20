jQuery(document).ready(function(){
	jQuery('#umsLicenseForm').submit(function(){
		jQuery(this).sendFormUms({
			btn: jQuery(this).find('button.button-primary')
		,	onSuccess: function(res) {
				if(!res.error) {
					toeReload();
				}
			}
		});
		return false;
	});
});
