<?php
//$markerListParams = $this->map['params']['marker_list_params']['d'];
//$showDesc = in_array('desc', $markerListParams);
//$showTitle = in_array('title', $markerListParams);
$bg_color = isset($this->map['params']['markers_list_color']) && !empty($this->map['params']['markers_list_color']) ? $this->map['params']['markers_list_color'] : '#55BA68';
$dimension = isset($this->map['params']['slider_simple_table_width_dimension']) && !empty($this->map['params']['slider_simple_table_width_dimension']) ? $this->map['params']['slider_simple_table_width_dimension'] : 'px';
$title = isset($this->map['params']['slider_simple_table_width_title']) && !empty($this->map['params']['slider_simple_table_width_title']) ? $this->map['params']['slider_simple_table_width_title'] : '100';
$address = isset($this->map['params']['slider_simple_table_width_address']) && !empty($this->map['params']['slider_simple_table_width_address']) ? $this->map['params']['slider_simple_table_width_address'] : '100';
$description = isset($this->map['params']['slider_simple_table_width_description']) && !empty($this->map['params']['slider_simple_table_width_description']) ? $this->map['params']['slider_simple_table_width_description'] : '100';
$direction = isset($this->map['params']['slider_simple_table_width_getdirection']) && !empty($this->map['params']['slider_simple_table_width_getdirection']) ? $this->map['params']['slider_simple_table_width_getdirection'] : '100';
$tableLayout = !empty($this->map['params']['slider_simple_table_width_title']) || !empty($this->map['params']['slider_simple_table_width_address']) || !empty($this->map['params']['slider_simple_table_width_description']) || !empty($this->map['params']['slider_simple_table_width_getdirection']) ? 'table-layout:fixed;' : '';
?>
<table class="umsMmlSlidesTable"
	   data-map-id="<?php echo $this->map['id']?>"
	   data-map-view-id="<?php echo $this->map['view_id']?>"
	   data-marker-group-id="<?php echo isset($this->group['id']) ? $this->group['id'] : ''?>"
      style="<?php echo $tableLayout?>"
	>
	<tr class="umsMmlSlideTableHeader">
		<th style="width:<?php echo $title?><?php echo $dimension?>!important; background-color: <?php echo $bg_color?> !important;"><?php _e('Title', UMS_LANG_CODE)?></th>
		<th style="width:<?php echo $address?><?php echo $dimension?>!important; background-color: <?php echo $bg_color?> !important;"><?php _e('Address', UMS_LANG_CODE)?></th>
		<th style="width:<?php echo $description?><?php echo $dimension?>!important; background-color: <?php echo $bg_color?> !important;"><?php _e('Description', UMS_LANG_CODE)?></th>
		<?php if(isset($this->map['params']['enable_directions_btn'])
				&& $this->map['params']['enable_directions_btn']
			){ ?>
			<th style="width:<?php echo $direction?><?php echo $dimension?>; background-color: <?php echo $bg_color?> !important;"><?php _e('Directions', UMS_LANG_CODE)?></th>
		<?php } ?>
	</tr>
	<?php foreach($this->markers as $marker){?>
		<?php if($marker['marker_group_id'] == $this->group['id']
				|| (isset($marker['marker_group_ids']) && !empty($marker['marker_group_ids']) && in_array($this->group['id'], $marker['marker_group_ids']))) {?>
			<?php //$showImg = !empty($marker['raw_img']) && in_array('img', $markerListParams);?>
			<tr class="umsMmlSlideTableRow"
				data-marker-id="<?php echo $marker['id']?>"
				data-map-id="<?php echo $this->map['id']?>"
				data-map-view-id="<?php echo $this->map['view_id']?>"
				>
				<?php //if($showTitle) {?>
					<td class="umsMmlSlideTitle" style="background-color: <?php echo $bg_color?>; width:<?php echo $title?><?php echo $dimension?>!important;">
						<a class="umsMmlSlideTitleLink"
						   href="#umsMapDetailsContainer_<?php echo $this->map['view_id']?>"
						   data-slider-type="table"
						   onclick="umsMmlGoToSlideSimpleSliderClk(this); return false;"
						>
							<?php echo $marker['title']?>
						</a>
					</td>
				<?php //}?>
				<td class="umsMmlSlideAddress" style="width:<?php echo $address?><?php echo $dimension?>!important;"><?php echo $marker['address']?></td>
				<td class="umsMmlSlideDescription" style="width:<?php echo $description?><?php echo $dimension?>!important;">
					<?php /*if($showImg) { ?>
						<div class="umsMmlSlideImg">
							<?php echo $marker['raw_img']?>
						</div>
					<?php }*/?>
					<?php //if($showDesc) {?>
						<?php echo $marker['description']?>
					<?php //}?>
				</td>
				<?php if(isset($this->map['params']['enable_directions_btn'])
						&& $this->map['params']['enable_directions_btn']
					){ ?>
					<td class="umsMmlGetDirections" style="width:<?php echo $direction?><?php echo $dimension?>!important;"></td>
				<?php } ?>
			</tr>
		<?php }?>
	<?php }?>
</table>
