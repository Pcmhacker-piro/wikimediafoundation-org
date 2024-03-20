<?php
$bg_color = isset($this->group['params']['bg_color']) ? $this->group['params']['bg_color'] : '#E4E4E4';
$color = isset($this->map['params']['custom_controls_txt_color']) ? $this->map['params']['custom_controls_txt_color'] : '#000000';
?>
<div class="umsMarkerGroup"
	 data-map-id="<?php echo $this->map['id']?>"
	 data-map-view-id="<?php echo $this->map['view_id']?>"
	 data-marker-group-id="<?php echo $this->group['id']?>"
	 onclick="umsMmlOpenMarkerGroupContainer(this); return false;"
	 style="background-color: <?php echo $bg_color; ?>;"
>
	<div style="color: <?php echo $color;?>">
		<?php echo $this->group['title']?>
	</div>
</div>
