<div
	class="umsFullScreenBtn"
	data-disabletxt="<?php _e('Exit Full Screen', UMS_LANG_CODE)?>"
	data-enabletxt="<?php _e('Open Full Screen', UMS_LANG_CODE)?>"
	data-mapid="<?php echo $this->map['id']?>"
	data-viewid="<?php echo $this->map['params']['view_id']?>"
	style="display: none;"
	id="umsFullScreenBtn_<?php echo $this->map['params']['view_id']?>"
	onclick="umsSwitchFullscreenBtn(this); return false;"
>
	<?php _e('Open Full Screen', UMS_LANG_CODE)?>
</div>