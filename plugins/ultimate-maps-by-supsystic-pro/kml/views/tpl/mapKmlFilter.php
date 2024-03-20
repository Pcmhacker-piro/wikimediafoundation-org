<?php
$id = $this->map['params']['id'];
$viewId = $this->map['params']['view_id'];
?>
<div id="umsKmlFilterShell_<?php echo $viewId;?>" class="umsKmlFilterShell" data-map-id="<?php echo $id; ?>" data-map-viewid="<?php echo $viewId; ?>" style="display: none;">
	<div class="umsKmlFilterTitle"><?php _e('KML Layers Filter', UMS_LANG_CODE)?></div>
	<?php /*<div id="umsKmlFilterRowExample" class="umsKmlFilterRow" data-type="" data-id="" style="display: none;">
		<label class="umsRowLabel">
			<?php echo htmlUms::checkboxHiddenVal('layer', array(
				'value' => '1',
				'attrs' => ''))?>
			<span class="umsRowName"></span>
		</label>
	</div>*/ ?>
	<div class="umsKmlLoading">
		<?php _e('KML data loading'); ?>
		<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
	</div>
	<div class="umsKmlFilterRowsShell" style="display: none;"></div>
</div>