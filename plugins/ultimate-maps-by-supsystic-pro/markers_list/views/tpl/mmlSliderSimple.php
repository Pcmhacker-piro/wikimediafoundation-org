<?php if(isset($this->map['markers']) && !empty($this->map['markers'])) { ?>
	<?php
		$countMarkers = count($this->map['markers']);
		$showDesc = in_array('desc', $this->map['params']['marker_list_params']['d']);
		$showTitle = in_array('title', $this->map['params']['marker_list_params']['d']);
		$twoCols = isset($this->map['params']['marker_list_params']['two_cols']) && $this->map['params']['marker_list_params']['two_cols'];
		$addShellClasses = 'umsListType_'. $this->map['params']['markers_list_type'];
		$optDisableImgByListType = 	($this->map['params']['markers_list_type'] === 'slider_simple_vertical_title_desc')
									|| ($this->map['params']['markers_list_type'] === 'slider_simple_table')
									? true : false;
		if($twoCols) {
			$addShellClasses .= ' umsSlidesListTwoCols';
		}
		$sliderHeight =
			$this->map['params']['marker_list_params']['or'] == 'h'
			&& !in_array('desc', $this->map['params']['marker_list_params']['d'])
			&& !in_array('two_cols', $this->map['params']['marker_list_params']['d'])
		? 'height: 100%;' : '';
		$contentHeight =
			$this->map['params']['marker_list_params']['or'] == 'h'
			&& !in_array('desc', $this->map['params']['marker_list_params']['d'])
			&& !in_array('two_cols', $this->map['params']['marker_list_params']['d'])
		? 'height: inherit;' : '';
		$sliderPos =
			isset($this->map['params']['marker_list_params']['pos'])
			? $this->map['params']['marker_list_params']['pos'] : false ;
		$hideEmptyBlock = isset($this->map['params']['hide_empty_block']) && $this->map['params']['hide_empty_block'] ? true : false;
	?>

	<?php if ($sliderPos === 'before') {?>
		<script type="text/javascript">
			jQuery("document").ready(function(){
				var mapwrapper = jQuery('body').find('#mapConElem_<?php echo $this->map['view_id']?>');
				var map = mapwrapper.find('#umsMapDetailsContainer_<?php echo $this->map['view_id']?>');
				mapwrapper.append(map);
			});
		</script>
	<?php }?>
	<div
		class="umsMml umsMnlJssorSlider <?php echo $addShellClasses?>"
		id="umsMmlSimpleSlider_<?php echo $this->map['view_id']?>"
		data-slider-type="jssor"
		style="display: none;"
	>
		<div class="umsMnlJssorSlides" data-u="slides">
		<?php
			if (!$optDisableImgByListType && $hideEmptyBlock) {
				foreach($this->map['markers'] as $i => $marker) {
					$showImg = !empty($marker['raw_img']) && in_array('img', $this->map['params']['marker_list_params']['d']);
					if (!$showImg) {
						unset($this->map['markers'][$i]);
					}
				}
				$this->map['markers'] = array_values($this->map['markers']);
			}
		?>
		<?php foreach($this->map['markers'] as $i => $marker) { ?>
			<?php
				$showImg = !empty($marker['raw_img']) && in_array('img', $this->map['params']['marker_list_params']['d']);
				$slideId = $i;
				$startSlide = true;
				$endSlide = true;
				$addSlideClasses = '';
				if ($twoCols) {
						$startSlide = !$i || $i % 2 == 0;
						$endSlide = $i % 2 == 1 || $i == $countMarkers - 1;
						if($startSlide) {
							$addSlideClasses .= ' umsStartRowSlide';
						}
						if($endSlide) {
							$addSlideClasses .= ' umsEndRowSlide';
						}
						$slideId = floor($slideId / 2);
				} elseif (!$optDisableImgByListType && $hideEmptyBlock && !$showImg) {
					continue;
				}
				$slideContentWidth = $showImg && $showDesc ? 60 : 100;
			?>
			<?php if($twoCols && $startSlide) {?>
			<div>
			<?php }?>
			<div class="umsMnlJssorSlide <?php echo $addSlideClasses?>"
				data-marker-id="<?php echo $marker['id']?>"
				data-map-id="<?php echo $this->map['id'];?>"
				data-map-view-id="<?php echo $this->map['view_id']?>"
				data-slide-id="<?php echo $slideId;?>"
				onclick="umsMmlShowPopupById('<?php echo $this->map['view_id']?>', <?php echo $marker['id']?>); return false;"
			>
				<?php if($showImg && $showDesc) { ?>
					<div class="umsMmlSlideImg" style="width: 40%;"><?php echo $marker['raw_img']?></div>
				<?php } ?>
				<div class="umsMmlSlideContent" style="width: <?php echo $slideContentWidth?>%; <?php echo $contentHeight?>">
					<?php if($showTitle) {?>
						<div class="umsMmlSlideTitle" style="background-color: <?php echo isset($this->map['params']['markers_list_color']) ? $this->map['params']['markers_list_color'] : '#55BA68'?>;">
							<div class="umsMmlTitleContainer" style="width: <?php echo $style = (isset($this->map['params']['enable_directions_btn']) && $this->map['params']['enable_directions_btn']) ? 'calc(100% - 30px)' : '100%'?>;">
								<a href="#" data-slider-type="jssor" title="<?php echo strip_tags($marker['title'])?>" onclick="umsMmlGoToSlideSimpleSliderClk(this); return false;">
									<?php echo $marker['title']?>
								</a>
							</div>
						</div>
					<?php }?>
					<?php if($showDesc) {?>
						<div class="umsMmlSlideDescription"><?php echo $marker['raw_content']?></div>
					<?php } elseif($showImg) { ?>
						<div class="umsMmlSlideImg" style="<?php echo $sliderHeight?>">
							<a href="#" data-slider-type="jssor" onclick="umsMmlGoToSlideSimpleSliderClk(this); return false;">
								<?php echo $marker['raw_img']?>
							</a>
						</div>
					<?php }?>
				</div>
				<?php if(0 && !$twoCols) {?>
				<div style="clear: both;"></div>
				<?php }?>
			</div>
			<?php if($twoCols && $endSlide) {?>
				</div>
			<?php }?>
		<?php } //exit(); ?>
		</div>
		<?php if($this->map['params']['marker_list_params']['or'] == 'v') {
			$btnClassLeft = 'jssora03u';
			$btnClassRight = 'jssora03d';
			$navClass = 'jssorb03v';
		} else {
			$btnClassLeft = 'jssora03l';
			$btnClassRight = 'jssora03r';
			$navClass = 'jssorb03';
		}?>
		 <!-- Arrow Left -->
		<span data-u="arrowleft" class="<?php echo $btnClassLeft?>" data-type="arrow" data-dir="l"></span>
		 <!-- Arrow Right -->
        <span data-u="arrowright" class="<?php echo $btnClassRight?>" data-type="arrow" data-dir="r"></span>
		<!-- bullet navigator container -->
        <div data-u="navigator" class="<?php echo $navClass?>" data-type="navigator">
            <!-- bullet navigator item prototype -->
            <div data-u="prototype"><div data-u="numbertemplate"></div></div>
        </div>
	</div>
	<div style="clear: both;"></div>
<?php }?>
