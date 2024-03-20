var g_umsCurrentEditShape = null
,	g_umsShapeStrokeColorLast = ''
,	g_umsShapeStrokeColorTimeoutSet = false
,	g_umsShapeFillColorLast = ''
,	g_umsShapeFillColorTimeoutSet = false
,	g_umsTinyMceShapeEditorUpdateBinded = false;

var g_umsShapesEditor = {
	_selectedType: null
,	_addPointByClick: false
,	setAddPointByClick: function(newState) {
		newState
			? jQuery('#umsShapeAddPointByClickBtn').addClass('umsAddByClickActivated')
			: jQuery('#umsShapeAddPointByClickBtn').removeClass('umsAddByClickActivated');
		this._addPointByClick = newState;
	}
,	getAddPointByClick: function(val) {
		return this._addPointByClick;
	}
,	init: function() {
		jQuery('.umsAddShapeBtn').click(function(){
			g_umsShapesEditor.saveAndClearForm();
			g_umsShapesEditor._selectedType = jQuery(this).data('type');
			g_umsShapesEditor.createNew( g_umsShapesEditor._selectedType );
			return false;
		});
		jQuery('#umsAddNewShapeBtn').click(function(){
			g_umsShapesEditor.saveAndClearForm();
			return false;
		});
		jQuery('#umsShapeAddPointRowBtn').click(function(){
			g_umsShapesEditor.addPointRow();
			return false;
		});
		jQuery('#umsShapeAddPointByClickBtn').click(function(){
			g_umsShapesEditor.setAddPointByClick( !g_umsShapesEditor.getAddPointByClick() );
			return false;
		});

		g_umsMap.addEventListener('click', this.mapClickClb);

		// if (typeof Microsoft !== 'undefined') {
		// 	Microsoft.Maps.Events.addHandler(g_umsMap._mapObj, 'click', this.mapClickClb);
		// }

		jQuery('#umsShapeForm').find('input[name="shape_opts[title]"]').change(function() {
			var shape = _umsGetCurrentShape();
			if(!shape) {
				return;
			}
			shape.setTitle( jQuery(this).val() );
			if(shape.getType() != 'polyline')
				shape.showInfoWnd();
		});
		// Bind change shape description - with it's description in map preview
		setTimeout(function(){
			umsBindShapeTinyMceUpdate();
			if(!g_umsTinyMceShapeEditorUpdateBinded) {
				jQuery('#shapeDescription-tmce.wp-switch-editor.switch-tmce').click(function(){
					setTimeout(umsBindShapeTinyMceUpdate, 500);
				});
			}
		}, 500);
		jQuery('#shapeDescription').keyup(function(){
			var shape = _umsGetCurrentShape();
			if(!shape) {
				return;
			}
			shape.setDescription( umsGetTxtEditorVal('shapeDescription') );
			shape.showInfoWnd();
		});
	}
,	clearForm: function() {
		var $shapeForm = jQuery('#umsShapeForm');

		_umsSetCurrentShape( null );
		$shapeForm[0].reset();
		$shapeForm.find('input[name="shape_opts[id]"]').val('');
		$shapeForm.find('input[name="shape_opts[title]"]').val('');
		//shapeForm.find('select[name="shape_opts[type]"]').val('polyline');
		//shapeForm.find('select[name="shape_opts[type]"]').trigger('change');

		/*if(shapeForm.find('#umsShapeAddPointByClickBtn').hasClass('umsAddByClickActivated')) {
			shapeForm.find('#umsShapeAddPointByClickBtn').removeClass('umsAddByClickActivated');
			google.maps.event.removeListener(g_umsMap._getEventListenerHandle('click', 'getLatLng'));
		}*/
		$shapeForm.find('input[name="shape_opts[params][strokeColor]"]').val('#dd3333').trigger('change');
		$shapeForm.find('input[name="shape_opts[params][strokeOpacity]"]').prev().slider('value', 1);
		$shapeForm.find('input[name="shape_opts[params][strokeWeight]"]').val(2);

		$shapeForm.find('input[name="shape_opts[params][fillColor]"]').val('#dd3333').trigger('change');
		$shapeForm.find('input[name="shape_opts[params][fillOpacity]"]').prev().slider('value', 1);

		this.setAddPointByClick(false);
		this.clearPointRows();

		jQuery('.umsAddShapeRow').show();
		jQuery('.umsEditShapeRow').hide();
	}
,	saveAndClearForm: function() {
		var $shapeForm = jQuery('#umsShapeForm');
		var currentEditId = parseInt( $shapeForm.find('input[name="shape_opts[id]"]').val() );
		if(!currentEditId) {	// This was new shape
			var title = jQuery.trim( $shapeForm.find('input[name="shape_opts[title]"]').val() );
			if(title && title != '') {	// Save it if there was some required changes
				$shapeForm.data('only-save', 1).submit();
			} else {
				var shape = _umsGetCurrentShape();
				if(shape) {
					if (shape.removeFromMap && typeof shape.removeFromMap === 'function') {
						shape.removeFromMap();
					}
				}
			}
		}
		this.clearForm();
		this.openForm();
	}
,	_getDefRadius: function() {
		return parseInt(10000 / g_umsMap.getZoom());
	}
,	createNew: function(type) {
		var defRadius = this._getDefRadius();
		var shapeCenter = g_umsMap.getCenter();
		var $shapeForm = jQuery('#umsShapeForm')
		,	newShapeData = {
				type: type
			,	path: [ shapeCenter ]
			,	center: shapeCenter
			,	radius: defRadius
			,	strokeColor: $shapeForm.find('input[name="shape_opts[params][strokeColor]"]').val()
			,	strokeOpacity: $shapeForm.find('select[name="shape_opts[params][strokeOpacity]"]').val()
			,	strokeWeight: $shapeForm.find('input[name="shape_opts[params][strokeWeight]"]').val()
			,	fillColor: $shapeForm.find('input[name="shape_opts[params][fillColor]"]').val()
			,	fillOpacity: $shapeForm.find('select[name="shape_opts[params][fillOpacity]"]').val()
			,	created_from_center: true
			};
			switch(type) {
				case 'polyline' :
					$shapeForm.find('input[name="shape_opts[params][fillColor]"]').closest('.umsPolygonShapeParam').hide();
					$shapeForm.find('input[name="shape_opts[params][fillOpacity]"]').closest('.umsPolygonShapeParam').hide();
				break;
				case 'circle' :
					$shapeForm.find('input[name="shape_opts[params][fillColor]"]').closest('.umsPolygonShapeParam').show();
					$shapeForm.find('input[name="shape_opts[params][fillOpacity]"]').closest('.umsPolygonShapeParam').show();
				break;
				case 'polygon' :
					$shapeForm.find('input[name="shape_opts[params][fillColor]"]').closest('.umsPolygonShapeParam').show();
					$shapeForm.find('input[name="shape_opts[params][fillOpacity]"]').closest('.umsPolygonShapeParam').show();
				break;
			};
		_umsSetCurrentShape(g_umsMap.addShape(newShapeData));

		$shapeForm.find('[name="shape_opts[type]"]').val( type );
		this.addPointRow({
			lat: shapeCenter.lat
		,	lng: shapeCenter.lng
		,	radius: defRadius
		});


	}
,	editById: function(id) {
		this.saveAndClearForm();
		var $shapeForm = jQuery('#umsShapeForm')
		,	shape = g_umsMap.getShapeById( id );	// We need to get shape belonged to map otherwise the options' changes will not apply to shape
		if(shape) {
			g_umsShapesEditor._selectedType = shape.getType();
			switch(g_umsShapesEditor._selectedType) {
				case 'polyline' :
					$shapeForm.find('input[name="shape_opts[params][fillColor]"]').closest('.umsPolygonShapeParam').hide();
					$shapeForm.find('input[name="shape_opts[params][fillOpacity]"]').closest('.umsPolygonShapeParam').hide();
				break;
				case 'circle' :
					$shapeForm.find('input[name="shape_opts[params][fillColor]"]').closest('.umsPolygonShapeParam').show();
					$shapeForm.find('input[name="shape_opts[params][fillOpacity]"]').closest('.umsPolygonShapeParam').show();
				break;
				case 'polygon' :
					$shapeForm.find('input[name="shape_opts[params][fillColor]"]').closest('.umsPolygonShapeParam').show();
					$shapeForm.find('input[name="shape_opts[params][fillOpacity]"]').closest('.umsPolygonShapeParam').show();
				break;
			}
			var shapeParams = shape.getRawShapeParams();
			$shapeForm.find('input[name="shape_opts[id]"]').val( shapeParams.id );
			$shapeForm.find('input[name="shape_opts[title]"]').val( shapeParams.title );
			umsSetTxtEditorVal('shapeDescription', shapeParams.description);

			$shapeForm.find('input[name="shape_opts[type]"]').val( shapeParams.type );

			$shapeForm.find('input[name="shape_opts[params][strokeColor]"]').val( shapeParams.strokeColor ).trigger('change');
			$shapeForm.find('input[name="shape_opts[params][strokeOpacity]"]').prev().slider('value', parseFloat(shapeParams.strokeOpacity));
			$shapeForm.find('input[name="shape_opts[params][strokeWeight]"]').val( shapeParams.strokeWeight == '' ? 0 : parseFloat(shapeParams.strokeWeight) );
			$shapeForm.find('input[name="shape_opts[params][fillColor]"]').val( shapeParams.fillColor ).trigger('change');
			$shapeForm.find('input[name="shape_opts[params][fillOpacity]"]').prev().slider('value', parseFloat(shapeParams.fillOpacity));

			this.clearPointRows();
			for(var i in shapeParams.coords) {
				this.addPointRow(shapeParams.coords[i]);
			}
			_umsSetCurrentShape( shape );
		}
	}
,	openForm: function() {
		var shapeFormIsVisible = jQuery('#umsShapeForm').is(':visible');
		if(!shapeFormIsVisible) {
			jQuery('#umsMapPropertiesTabs').wpTabs('activate', '#umsShapeTab');
		}
	}
,	clearPointRows: function() {
		jQuery('#umsShapePointRowsShell').html('');
	}
,	_updateShapePath: function() {
		var shape = _umsGetCurrentShape()
		,	$newShapeCoords = jQuery('.umsShapePointRow')
		,	path = [];

		if(!shape) {
			// This should not happen
			return;
		}
		$newShapeCoords.each(function() {
			var lat = jQuery(this).find('.umsShapeLat').val()
			,	lng = jQuery(this).find('.umsShapeLng').val();

			if(lat && lng) {
				path.push({ address: '', lat: lat, lng: lng });
			}
		});
		if(shape && path && path.length) {
			if(g_umsShapesEditor._selectedType === 'circle') {
				shape.setCenter(path[0]);
			} else {
				shape.setPath(path);
			}
			/*if(shape._createdFromCenter) {
				if(type == 'circle') {
					shape._infoWndPosition = shape.getCenter();
				} else {
					shape._infoWndPosition = shape.getPath().getAt(0);
				}
				shape._createdFromCenter = false;
			}*/
		}
	}
,	addPointRow: function(point) {
		point = point ? point : { address: '', lat: '',	lng: '', radius: this._getDefRadius() };
		var $shapeForm = jQuery('#umsShapeForm')
		,	$shell = jQuery('#umsShapePointRowsShell')
		,	$newRow = $shell
				.parents('td:first')
				.find('.umsShapePointRowExample')
				.clone()
				.removeClass('umsShapePointRowExample')
				.addClass('umsShapePointRow')
		,	prewPointId = parseInt($shell.find('.umsShapePointRow:last-child').data('point-pos'))
		,	nextPointId = !isNaN(prewPointId) ? prewPointId + 1 : 0;

		$newRow.data('point-pos', nextPointId);
		$newRow.find('input').each(function(){
			jQuery(this).removeAttr('disabled');
			jQuery(this).attr('name', jQuery(this).attr('name').replace('[0]', '['+ nextPointId+ ']'));
			jQuery(this).val(point[jQuery(this).data('type')]);
		});
		if(this._selectedType === 'circle') {
			$newRow.find('.umsShapePointRadiusShell').show().find('.umsShapeRadius').change(function(){
				_umsGetCurrentShape().setRadius(jQuery(this).val());
			}).val( point.radius );
			$newRow.find('.umsShapeRemovePointRowBtn').hide();
		}
		$shell.append($newRow.show());
		$newRow.find('.umsShapeLat, .umsShapeLng').each(function() {
			jQuery(this).change(function() {
				g_umsShapesEditor._updateShapePath();
				/*var type = g_umsShapesEditor._selectedType
				,	shape = _umsGetCurrentShape()
				,	$newShapeCoords = jQuery('.umsShapePointRow')
				,	path = [];

				if(!shape) {
					// This should not happen
					return;
				}
				$newShapeCoords.each(function() {
					var lat = jQuery(this).find('.umsShapeLat').val()
					,	lng = jQuery(this).find('.umsShapeLng').val();

					if(lat && lng) {
						path.push({ address: '', lat: lat, lng: lng });
					}
				});
				if(shape && path && path.length) {
					if(type === 'circle') {
						shape.setCenter(path[0]);
					} else {
						shape.setPath(path);
					}
					if(shape._createdFromCenter) {
						if(type == 'circle') {
							shape._infoWndPosition = shape.getCenter();
						} else {
							shape._infoWndPosition = shape.getPath().getAt(0);
						}
						shape._createdFromCenter = false;
					}
				}*/
			});
		});
		g_umsMap.geocodeSearchAutocomplete($newRow.find('.umsShapeAddress'), {
			msgEl: ''
		,	onSelect: function(item, event, ui) {
			if(item) {
					$newRow.find('.umsShapeLat').val(item.lat);
					$newRow.find('.umsShapeLng').val(item.lng).trigger('change');
				}
			}
		});
		$newRow.find('.umsShapeRemovePointRowBtn').click(function() {
			g_umsShapesEditor.removePointRow($newRow);
			return false;
		});
		if(point) {
			this._updateShapePath();
		}
	}
,	removePointRow: function($row) {
		$row.remove();
		g_umsShapesEditor._updateShapePath();
	}
,	mapClickClb: function(e) {
	if(g_umsShapesEditor._addPointByClick && jQuery('#umsShapeForm').is(':visible')) {
			var shape = _umsGetCurrentShape();

			if(shape) {
					// TODO: Add here check for map engine - and get coords from event in our format
					if (g_umsMap._engine === 'bing') {
						var latitude = e.location.latitude;
						var longitude = e.location.longitude;
						var coords = {lat: latitude, lng: longitude};
					} else {
						var coords = e.latlng;
					}
					shape.setPointOnClick( coords );
					switch(g_umsShapesEditor._selectedType) {
						case 'circle':
							jQuery('#umsShapePointRowsShell [name="shape_opts[coords][0][lat]"]').val( coords.lat );
							jQuery('#umsShapePointRowsShell [name="shape_opts[coords][0][lng]"]').val( coords.lng );
							break;
						default:
							g_umsShapesEditor.addPointRow({
								lat: coords.lat
							,	lng: coords.lng
							});
							//console.log('TODO: Add here adding new points after click');
							break;
				}
			}
		}
	}
};
jQuery(document).ready(function() {
	g_umsMapLoadObserver.trigger(umsGetMapsEngine(umsMainMap), function() {
		g_umsShapesEditor.init();
		var $shapeForm = jQuery('#umsShapeForm');
		jQuery('#umsSaveShapeBtn').click(function(){
			$shapeForm.submit();
			return false;
		});
		jQuery('#umsShapeDeleteBtn').click(function(){
			var shapeTitle = $shapeForm.find('input[name="shape_opts[title]"]').val();
			if(shapeTitle && shapeTitle != '') {
				shapeTitle = '"'+ shapeTitle+ '"';
			} else {
				shapeTitle = 'current';
			}
			if(confirm('Remove '+ shapeTitle+ ' shape?')) {
				var currentShapeIdInForm = g_umsCurrentEditShape ? g_umsCurrentEditShape.getId() : 0;
				/*var removeFinalClb = function() {
					if(currentShapeIdInForm) {
						g_umsMap.removeShape( currentShapeIdInForm );
						jQuery('#umsShapesListGrid').trigger('reloadGrid');
					}
					if(g_umsCurrentEditShape) {
						g_umsCurrentEditShape.removeFromMap();
					}
					umsResetShapeForm();
				};*/
				if(currentShapeIdInForm) {
					jQuery.sendFormUms({
						btn: this
						,	data: {action: 'removeShape', mod: 'shape', id: currentShapeIdInForm, '_wpnonce': UMS_NONCE['ums_nonce']}
						,	onSuccess: function(res) {
							if(!res.error) {
								jQuery('#umsShapesListGrid').trigger('reloadGrid');
								g_umsShapesEditor.clearForm();
								//removeFinalClb();
							}
						}
					});
				} else {
					//removeFinalClb();
				}
			}
			return false;
		});
		// Shape saving
		$shapeForm.submit(function(){
			var currentMapId = umsGetCurrentId()
			,	currentShapeMapId = parseInt( $shapeForm.find('input[name="shape_opts[map_id]"]').val() )
			,	onlySave = parseInt(jQuery(this).data('only-save'));

			if(currentMapId && !currentShapeMapId) {
				$shapeForm.find('input[name="shape_opts[map_id]"]').val( currentMapId );
			}
			$shapeForm.find('input[name="shape_opts[description]"]').val( umsGetTxtEditorVal('shapeDescription') );
			if(onlySave) {
				jQuery(this).data('only-save', 0);
			}
			jQuery(this).sendFormUms({
				btn: jQuery('#umsSaveShapeBtn')
			,	onSuccess: function(res) {
					if(!res.error) {
						if(!onlySave) {
							if(!res.data.update) {
								$shapeForm.find('input[name="shape_opts[id]"]').val( res.data.shape.id );
								var shape = _umsGetCurrentShape();
								if(shape)
									shape.setId(res.data.shape.id);
							}
						}
						/*if(!currentShapeMapId) {
							g_umsMapShapesIdsAdded.push( res.data.shape.id );
						}*/
						if(!onlySave) {
							jQuery('#umsShapesListGrid').trigger('reloadGrid');
						}

						jQuery('#umsMapSaveBtn').click();
					}
				}
			});
			return false;
		});
		$shapeForm.find('input[name="shape_opts[params][strokeOpacity]"]').prev().on('slidechange', function(event, ui) {
			var shape = _umsGetCurrentShape();
			if(shape)
				shape.setStrokeOpacity(ui.value);
		});
		$shapeForm.find('input[name="shape_opts[params][strokeWeight]"]').change(function() {
			var shape = _umsGetCurrentShape();

			if(shape)
				shape.setStrokeWeight(jQuery(this).val());
		});
		$shapeForm.find('input[name="shape_opts[params][fillOpacity]"]').prev().on('slidechange', function(event, ui) {
			var shape = _umsGetCurrentShape();

			if(shape) {
				shape.setFillOpacity(ui.value);
			}
		});
		jQuery('#umsShapesListGrid').jqGrid({
			url: umsShapesTblDataUrl
		,	mtype: 'GET'
		,	datatype: 'json'
		,	colNames:[toeLangUms('ID'), toeLangUms('Title'), toeLangUms('Type'), toeLangUms('Actions')]
		,	colModel: [
				{ name: 'id', index: 'id', key: true, sortable: true, width: '90', align: 'center' }
			,	{ name: 'title', index: 'title', sortable: true, width: '250', align: 'center' }
			,	{ name: 'type', index: 'type', sortable: false, width: '80', align: 'center' }
			,	{ name: 'actions', index: 'actions', sortable: false, width: '100', align: 'center' }
			]
		,	width: jQuery('#umsMapRightStickyBar').width()
		,	height: 200
		//,	autowidth: true
		,	shrinkToFit: false
		,	sortname: 'sort_order'
		,	rowNum: 1000000000000
		,	viewrecords: true
		,	emptyrecords: toeLangUms('You have no figures for now.')
		,	loadComplete: function(res) {
				umsRefreshMapShapesList(res.rows);
				/*if(res.rows.length) {
					g_umsMap.applyZoomTypeAdmin();	// Apply zoom type fit_bounds after all shapes load in admin area
				}*/
				_umsResizeRightSidebar(jQuery('#umsShapesListGrid'));
			}
		}).jqGrid('sortableRows', {
			update: function (e, ui) {
				var shapesList = jQuery('#umsShapesListGrid').jqGrid('getDataIDs');
				jQuery.sendFormUms({
					data: { mod: 'maps', action: 'resortShapes', shapes_list: shapesList, '_wpnonce': UMS_NONCE['ums_nonce'] }
				,	onSuccess: function(res) {
						if(!res.error) {
							jQuery('#umsShapesListGrid').trigger('reloadGrid');
						}
					}
				});
			}
		});
	});

});
function _umsGetCurrentShape() {
	// We need to create shape only in several cases, so this function shows us was shape already created or not
	return g_umsCurrentEditShape;
}
function _umsSetCurrentShape(shape) {
	g_umsCurrentEditShape = shape;
	if(shape) {
		jQuery('.umsAddShapeRow').hide();
		jQuery('.umsEditShapeRow').show();

		var type = shape.getType()
		,	typeLabel = jQuery('.umsAddShapeBtn[data-type="'+ type+ '"]').data('type-label');
		jQuery('#umsShpeTypeTxt').html( typeLabel );

		switch(type) {
			case 'circle':
				jQuery('.umsShapePointLbl').html( jQuery('.umsShapePointLbl').data('txt-circle') );
				jQuery('#umsShapeAddPointRowBtn').hide();
				break;
			default:
				jQuery('.umsShapePointLbl').html( jQuery('.umsShapePointLbl').data('txt-all') );
				jQuery('#umsShapeAddPointRowBtn').show();
				break;
		}
	}
}
// Colorpickers callbacks
function wpColorPicker_shape_optsparamsstrokeColor_change(event, ui) {
	g_umsShapeStrokeColorLast = ui.color.toString();
	if(!g_umsShapeStrokeColorTimeoutSet) {
		setTimeout(function(){
			umsWpColorpickerUpdateStrokeColor();
		}, 500);
		g_umsShapeStrokeColorTimeoutSet = true;
	}
}
function umsWpColorpickerUpdateStrokeColor(color) {
	var shape = _umsGetCurrentShape();

	if(shape)
		shape.setStrokeColor(g_umsShapeStrokeColorLast);
	g_umsShapeStrokeColorTimeoutSet = false;
}
function wpColorPicker_shape_optsparamsfillColor_change(event, ui) {
	g_umsShapeFillColorLast = ui.color.toString();
	if(!g_umsShapeFillColorTimeoutSet) {
		setTimeout(function(){
			umsWpColorpickerUpdateFillColor();
		}, 500);
		g_umsShapeFillColorTimeoutSet = true;
	}
}
function umsWpColorpickerUpdateFillColor(color) {
	var shape = _umsGetCurrentShape();

	if(shape)
		shape.setFillColor(g_umsShapeFillColorLast);
	g_umsShapeFillColorTimeoutSet = false;
}
function umsRefreshMapShapesList(shapesList) {
	umsRefreshMapShapes(g_umsMap, shapesList);
	var currentFormShape = parseInt( jQuery('#umsShapeForm input[name="shape_opts[id]"]').val() );
	if(currentFormShape) {
		var editMapShape = g_umsMap.getShapeById(currentFormShape);
		if(editMapShape) {
			_umsSetCurrentShape( editMapShape );
		}
	}
}
function umsRefreshMapShapes(map, shapes) {
	map.clearShapes();
	shapes = _umsPrepareShapesList( shapes );
	for(var i in shapes) {
		var newShape = map.addShape( shapes[i] );
	}
}
// Shapes' list buttons callbacks
function umsShapeEditBtnClick(btn){
	var shapeId = jQuery(btn).data('shape_id');
	g_umsShapesEditor.editById( shapeId );
}
function umsShapeDelBtnClick(btn){
	var shapeId = jQuery(btn).data('shape_id')
	,	shapeRow = jQuery(btn).parents('tr:first');
	umsRemoveShapeFromMapTblClick(shapeId, {row: shapeRow});
}
function umsRemoveShapeFromMapTblClick(shapeId, params) {
	params = params || {};
	var shapeTitle = params.row ? params.row.find('td[aria-describedby="umsShapesListGrid_title"]').text() : ''
	,	btn = params.row ? params.row : params.btn;
	if(!confirm('Remove "'+ shapeTitle+ '" shape?')) {
		return false;
	}
	if(shapeId == ''){
		return false;
	}
	jQuery.sendFormUms({
		btn: btn
	,	data: {action: 'removeShape', mod: 'shape', id: shapeId, '_wpnonce': UMS_NONCE['ums_nonce']}
	,	onSuccess: function(res) {
			if(!res.error){
				//g_umsMap.removeShape( shapeId );
				jQuery('#umsShapesListGrid').trigger('reloadGrid');
				var currentEditShapeId = parseInt( jQuery('#umsShapeForm input[name="shape_opts[id]"]').val() );
				if(currentEditShapeId && currentEditShapeId == shapeId) {
					g_umsShapesEditor.clearForm();
				}
			}
		}
	});
}
// Shape's description callback
function umsBindShapeTinyMceUpdate() {
	if(!g_umsTinyMceShapeEditorUpdateBinded && typeof(tinyMCE) !== 'undefined' && tinyMCE.editors) {
		if(tinyMCE.editors.shapeDescription) {
			tinyMCE.editors.shapeDescription.onKeyUp.add(function(){
				var shape = _umsGetCurrentShape();
				if(!shape) {
					return;
				}
				shape.setDescription( umsGetTxtEditorVal('shapeDescription') );
				shape.showInfoWnd();
			});
			g_umsTinyMceShapeEditorUpdateBinded = true;
		}
	}
}
