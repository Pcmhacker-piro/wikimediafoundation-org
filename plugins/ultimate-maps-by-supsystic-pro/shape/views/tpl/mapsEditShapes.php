<?php
	$opacityRangeOr = range(0, 1, 0.1);
	$opacityRange = array();
	foreach($opacityRangeOr as $v) {
		$opacityRange[ ''. $v ] = $v;
	}
?>
<form id="umsShapeForm">
	<table class="form-table">
		<tr class="umsAddShapeRow">
			<td colspan="2">
				<table width="100%">
					<tr>
						<?php $shapeTypeWidth = floor(100 / count($this->shapeTypes)); ?>
						<?php foreach($this->shapeTypes as $tKey => $t) { ?>
							<td width="<?php echo $shapeTypeWidth; ?>%" style="padding: 0;"><a href="#" class="button umsAddShapeBtn" style="width: 100%"
																							   data-type="<?php echo $tKey; ?>"
																							   data-type-label="<?php echo $t['label']; ?>">
								<i class="fa fa-fw <?php echo $t['icon']?>"></i><?php printf(__('Add %s', UMS_LANG_CODE), $t['label']); ?></a></td>
						<?php } ?>
					</tr>
				</table>
			</td>
		</tr>
		<tr class="umsEditShapeRow">
			<th scope="row">
				<label class="label-big" for="">
					<?php _e('Shape Type', UMS_LANG_CODE)?>:
				</label>
				<i style="float: right;" class="fa fa-question supsystic-tooltip" title="<?php _e('Type of selected shape', UMS_LANG_CODE)?>"></i>
			</th>
			<td id="umsShpeTypeTxt"></td>
		</tr>
		<tr class="umsEditShapeRow">
			<th scope="row">
				<label class="label-big" for="shape_opts_title">
					<?php _e('Shape Name', UMS_LANG_CODE)?>:
				</label>
				<i style="float: right;" class="fa fa-question supsystic-tooltip" title="<?php _e('Your figure title', UMS_LANG_CODE)?>"></i>
			</th>
			<td>
				<?php echo htmlUms::text('shape_opts[title]', array(
					'value' => '',
					'attrs' => 'style="width: 100%;"'))?>
			</td>
		</tr>
		<?php /*?><tr>
			<th scope="row">
				<label class="label-big" for="shape_opts_type">
					<?php _e('Shape Type', UMS_LANG_CODE)?>:
				</label>
				<i style="float: right;" class="fa fa-question supsystic-tooltip" title="<?php _e('Type of your figure:' .
					'<br /><br /><b>Polyline</b> - a series of straight segments on the map.' .
					'<br /><br /><b>Polygon</b> - area enclosed by a closed path (or loop), which is defined by a series of coordinates.' .
					'<br /><br /><b>Circle</b> - circle shape,defined by center coordinates and radius.', UMS_LANG_CODE)?>"></i>
			</th>
			<td>
				<?php echo htmlUms::selectbox('shape_opts[type]', array(
					'options' => array(
						'polyline' => __('Polyline', UMS_LANG_CODE),
						'polygon' => __('Polygon', UMS_LANG_CODE),
						'circle' => __('Circle', UMS_LANG_CODE),),
					'value' => 'polyline',
					'attrs' => 'style="width: 100%;"'))?>
			</td>
		</tr><?php */?>
		<tr class="umsEditShapeRow">
			<td colspan="2" style="padding: 0 10px 0 0;">
				<div class="supRow">
					<div class="supMd6">
						<div class="umsCommonShapeParam">
							<label class="label" for="shape_opts_line_color">
								<?php _e('Line Color', UMS_LANG_CODE)?>
							</label></br>
							<?php echo htmlUms::colorpicker('shape_opts[params][strokeColor]', array(
								'value' => ''))?>
						</div>
						<br style="clear: both;" />
						<div class="umsCommonShapeParam">
							<label class="label" for="shape_opts_line_opacity">
								<?php _e('Line Opacity', UMS_LANG_CODE)?>
							</label><br />
							<?php echo htmlUms::slider('shape_opts[params][strokeOpacity]', array(
								'min' => 0, 'max' => 1, 'step' => 0.1
							))?>
							<?php //echo htmlUms::selectbox('shape_opts[params][strokeOpacity]', array('options' => $opacityRange))?>
						</div>
						<br style="clear: both;" />
						<div class="umsCommonShapeParam">
							<label class="label" for="shape_opts_line_weight">
								<?php _e('Line Weight', UMS_LANG_CODE)?>
							</label></br>
							<?php echo htmlUms::text('shape_opts[params][strokeWeight]', array(
								'value' => '',
								'attrs' => 'style="width: 100%;"'))?>
						</div>
					</div>
					<div class="supMd6">
						<div class="umsPolygonShapeParam">
							<label class="label" for="shape_opts_fill_color">
								<?php _e('Fill Color', UMS_LANG_CODE)?>
							</label></br>
							<?php echo htmlUms::colorpicker('shape_opts[params][fillColor]', array(
								'value' => ''))?>
						</div>
						<br style="clear: both;" />
						<div class="umsPolygonShapeParam">
							<label class="label" for="shape_opts_fill_opacity">
								<?php _e('Fill Opacity', UMS_LANG_CODE)?>
							</label><br />
							<?php echo htmlUms::slider('shape_opts[params][fillOpacity]', array(
								'min' => 0, 'max' => 1, 'step' => 0.1
							))?>
						</div>
					</div>
				</div>
				<div style="clear: both;"></div>
				<div class="umsPolygonShapeParam umsPolygonShapeDesc">
					<div>
						<label>
							<?php _e('Figure Description', UMS_LANG_CODE)?>:
						</label>
						<i style="float: right;" class="fa fa-question supsystic-tooltip" title="<?php _e('Write here all text, that you want to appear in shape info-window PopUp', UMS_LANG_CODE)?>"></i>
					</div>
					<?php wp_editor('', 'shapeDescription', array(
						'textarea_rows' => 10
					));?>
					<?php echo htmlUms::hidden('shape_opts[description]', array('value' => ''))?>
				</div>
			</td>
		</tr>
		<tr class="umsEditShapeRow">
			<th scope="row">
				<label class="umsShapePointLbl" data-txt-circle="<?php echo __('Center', UMS_LANG_CODE). ':'; ?>"
					   data-txt-all="<?php echo __('Points', UMS_LANG_CODE). ':'; ?>">
					<?php _e('Points', UMS_LANG_CODE)?>:
				</label>
				<i style="float: right;" class="fa fa-question supsystic-tooltip" title="<?php _e('Figure\'s points list: you can search the point by address (just start typing in Address field), type the Latitude and Longitude of point in appropriate fields or activate Add by Click button, and then draw figure on the map by clicking on it. Important! You must deactivate Add by Click button after ending of the draw.', UMS_LANG_CODE)?>"></i>
			</th>
			<td>
				<a href="#" class="button" id="umsShapeAddPointByClickBtn" style="float: left;">
					<?php _e('Add by Click', UMS_LANG_CODE)?>
				</a>
				<a href="#" class="button" id="umsShapeAddPointRowBtn" style="float: right;">
					<?php _e('Add New Point', UMS_LANG_CODE)?>
				</a>
			</td>
		</tr>
		<tr class="umsEditShapeRow">
			<td colspan="2" style="padding-top: 10px; padding-left: 0;">
				<div class="umsShapePointRowExample umsShapePointRow" style="display: none;">
					<div style="clear: both;">
						<div style="display: inline-block; width: 50%;">
							<label for="shape_opts_address">
								<?php _e('Address', UMS_LANG_CODE)?>
								<?php echo htmlUms::text('shape_opts[coords][0][address]', array(
									'value' => '',
									'placeholder' => '603 Park Avenue, Brooklyn, NY 11206, USA',
									'attrs' => 'class="umsShapeAddress" data-type="address" style="width: 100%;" disabled="disabled"'))?>
							</label>
						</div>
						<div style="display: inline-block; width: 20%;">
							<label for="shape_opts_lat">
								<?php _e('Latitude', UMS_LANG_CODE)?>
								<?php echo htmlUms::text('shape_opts[coords][0][lat]', array(
									'value' => '',
									'placeholder' => '40.69827799999999',
									'attrs' => 'class="umsShapeLat" data-type="lat" style="width: 100%;" disabled="disabled"'))?>
							</label>
						</div>
						<div style="display: inline-block; width: 20%;">
							<label for="shape_opts_lng">
								<?php _e('Longitude', UMS_LANG_CODE)?>
								<?php echo htmlUms::text('shape_opts[coords][0][lng]', array(
									'value' => '',
									'placeholder' => '-73.95141139999998',
									'attrs' => 'class="umsShapeLng" data-type="lng" style="width: 100%;" disabled="disabled"'))?>
							</label>
						</div>
						<div class="umsShapePointRadiusShell" style="display: none; width: 50%;">
							<label for="shape_opts_radius">
								<?php _e('Radius', UMS_LANG_CODE)?>
								<?php echo htmlUms::text('shape_opts[coords][0][radius]', array(
									'value' => '',
									'placeholder' => '1000',
									'attrs' => 'class="umsShapeRadius" data-type="radius" data-def="1000" style="width: 100%;" disabled="disabled"'))?>
							</label>
						</div>
						<a href="#" title="<?php _e('Remove Point', UMS_LANG_CODE)?>" class="button umsShapeRemovePointRowBtn">
							<i class="fa fa-trash-o"></i>
						</a>
					</div>
				</div>
				<div id="umsShapePointRowsShell"></div>
			</td>
		</tr>
	</table>
	<?php echo htmlUms::hidden('mod', array('value' => 'shape'))?>
	<?php echo htmlUms::hidden('action', array('value' => 'save'))?>
	<?php echo htmlUms::hidden('shape_opts[id]', array('value' => ''))?>
	<?php echo htmlUms::defaultNonceForAdminPanel(); ?>
	<?php echo htmlUms::hidden('shape_opts[map_id]', array('value' => $this->editMap ? $this->map['id'] : ''))?>
	<?php echo htmlUms::hidden('shape_opts[type]')?>
</form>
