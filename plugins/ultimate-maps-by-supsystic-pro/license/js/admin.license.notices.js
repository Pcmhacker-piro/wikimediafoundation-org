jQuery(document).ready(function(){
	jQuery(document).on('click', '.supsystic-pro-notice.ums-notification .notice-dismiss', function(){
		jQuery.sendFormUms({
			msgElID: 'noMessages'
		,	data: {mod: 'license', action: 'dismissNotice', '_wpnonce': UMS_NONCE['ums_nonce']}
		});
	});
});