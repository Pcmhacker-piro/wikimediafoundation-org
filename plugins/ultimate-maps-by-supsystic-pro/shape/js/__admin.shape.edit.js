var	g_umsCurrentEditShape = null
,	g_umsShapeFormChanged = false
,	g_umsClearPointRows = false
,	g_umsTinyMceShapeEditorUpdateBinded = false
,	g_umsShapeStrokeColorLast = ''
,	g_umsShapeStrokeColorTimeoutSet = false
,	g_umsShapeFillColorLast = ''
,	g_umsShapeFillColorTimeoutSet = false;
jQuery(document).ready(function() {
	g_umsMapLoadObserver.trigger(umsGetMapsEngine(umsMainMap), function() {
		var shapeForm = jQuery('#umsShapeForm');

		// Build initial shapes list
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
				if(res.rows.length) {
					g_umsMap.applyZoomTypeAdmin();	// Apply zoom type fit_bounds after all shapes load in admin area
				}
				_umsResizeRightSidebar(jQuery('#umsShapesListGrid'));
			}
		}).jqGrid('sortableRows', {
			update: function (e, ui) {
				var shapesList = jQuery('#umsShapesListGrid').jqGrid('getDataIDs');
				jQuery.sendFormUms({
					data: { mod: 'maps', action: 'resortShapes', shapes_list: shapesList , '_wpnonce': UMS_NONCE['ums_nonce'] }
				,	onSuccess: function(res) {
						if(!res.error) {
							jQuery('#umsShapesListGrid').trigger('reloadGrid');
						}
					}
				});
			}
		});
		// Reset Shape form
		umsResetShapeForm();
		// Shapes form functionality
		function umsSaveAndClearShapeForm() {
			var currentEditId = parseInt( shapeForm.find('input[name="shape_opts[id]"]').val() );
			if(!currentEditId) {	// This was new shape
				var title = jQuery.trim( shapeForm.find('input[name="shape_opts[title]"]').val() );
				if(title && title != '') {	// Save it if there was some required changes
					shapeForm.data('only-save', 1).submit();
				} else {
					var shape = umsGetCurrentShape();

					if(shape) {
						shape.removeFromMap();
					}
				}
			}
			umsOpenShapeForm();
		}
		jQuery('#umsAddNewShapeBtn').click(function(){
			umsSaveAndClearShapeForm();
			return false;
		});
		jQuery('.umsAddShapeBtn').click(function(){
			umsSaveAndClearShapeForm();
			_umsCreateNewMapShape( jQuery(this).data('type') );
			return false;
		});
		jQuery('#umsShapeAddPointByClickBtn').click(function() {
			jQuery(this).toggleClass('umsAddByClickActivated');

			if(jQuery(this).hasClass('umsAddByClickActivated')) {
				umsUnshiftButtons({
					umsHeatmapAddPointBtn: 'umsAddActivated'
				,	umsHeatmapRemovePointBtn: 'umsRemoveActivated'
				});

				if(!g_umsClearPointRows) {
					umsShapeClearRows();
					g_umsClearPointRows = true;
				}
				var eventHandle = google.maps.event.addListener(g_umsMap.getRawMapInstance(), 'click', jQuery.proxy(function(e){
					var point = { address: '', coord_x: e.latLng.lat(),	coord_y: e.latLng.lng(), radius: 1000 };

					if(shapeForm.find('select[name="shape_opts[type]"]').val() != 'circle' || !shapeForm.find('.umsShapePointRow').length) {
						umsShapeDrawPointRow(point);
					} else {
						umsShapeUpdatePointRow(point);
					}
					shapeForm.find('.umsShapePointRow:first .umsShapeCoordX').trigger('change');
					shapeForm.find('.umsShapePointRow:first .umsShapeRadius').trigger('change');
				}, this));
				g_umsMap._addEventListenerHandle('click', 'getLatLng', eventHandle);
			} else {
				google.maps.event.removeListener(g_umsMap._getEventListenerHandle('click', 'getLatLng'));
			}
			return false;
		});
		shapeForm.find('select[name="shape_opts[type]"]').change(function() {
			var type = jQuery(this).val()
			,	shape = umsGetCurrentShape();

			switch(type) {
				case 'polyline': case 'polygon':
					shapeForm.find('.umsPolygonShapeParam').each(function() {
						if(type == 'polyline') {
							jQuery(this).hide();
						} else {
							jQuery(this).show();
						}
					});
					shapeForm.find('#umsShapeAddPointRowBtn').show();
					shapeForm.find('.umsShapePointRow').each(function(index) {
						if(!index) {
							umsHideRadiusField(jQuery(this));
						} else {
							jQuery(this).show(300);
						}
					});
					break;
				case 'circle':
					shapeForm.find('.umsPolygonShapeParam').each(function() {
						jQuery(this).show();
					});
					shapeForm.find('#umsShapeAddPointRowBtn').hide();
					shapeForm.find('.umsShapePointRow').each(function(index) {
						if(!index) {
							umsShowRadiusField(jQuery(this));
						} else {
							jQuery(this).hide(300);
						}
					});
					break;
				default:
					break;
			}
			if(shape) {
				shape.setType(type);
				shape.reinit();
				shapeForm.find('.umsShapePointRow:first .umsShapeCoordX').trigger('change');
				shapeForm.find('.umsShapePointRow:first .umsShapeRadius').trigger('change');
			}
		});
		shapeForm.find('select[name="shape_opts[type]"]').trigger('change');

		jQuery('#umsShapeAddPointRowBtn').click(function() {
			umsShapeDrawPointRow();
			return false;
		});
		shapeForm.find('input,textarea,select').change(function(){
			_umsChangeShapeForm();
		});
		shapeForm.find('input[name="shape_opts[title]"]').change(function() {
			var shape = umsGetCurrentShape();
			if(!shape) {
				_umsCreateNewMapShape();
				shape = umsGetCurrentShape();
			}
			shape.setTitle( jQuery(this).val() );
			if(shape.getShapeParam('type') != 'polyline')
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
			var shape = umsGetCurrentShape();
			if(!shape) {
				_umsCreateNewMapShape();
				shape = umsGetCurrentShape();
			}
			if(shape) {
				shape.setDescription( umsGetTxtEditorVal('shapeDescription') );
				shape.showInfoWnd();
			}
		});
	});
});
// Functions for manipulate the shapes's rows
function umsShapeClearRows() {
	jQuery('#umsShapePointRowsShell').html('');
	g_umsClearPointRows = false;
}
function umsShapeRemovePointRow(btn) {
	var row = jQuery(btn).parents('.umsShapePointRow:first')
	,	shapeForm = jQuery('#umsShapeForm');

	row.animateRemoveUms(300, function() {
		shapeForm.find('.umsShapePointRow:first .umsShapeCoordX').trigger('change');
		shapeForm.find('.umsShapePointRow:first .umsShapeRadius').trigger('change');
	});
}
function umsShapeUpdatePointRow(point) {
	var shell = jQuery('#umsShapePointRowsShell')
	,	row = shell.find('.umsShapePointRow:first');

	row.find('input').each(function(){
		jQuery(this).val(point[jQuery(this).data('type')]);
	});
}
function umsShapeDrawPointRow(point) {
	point = point ? point : { address: '', coord_x: '',	coord_y: '', radius: 1000 };
	var shapeForm = jQuery('#umsShapeForm')
	,	shell = jQuery('#umsShapePointRowsShell')
	,	newRow = shell
			.parents('td:first')
			.find('.umsShapePointRowExample')
			.clone()
			.removeClass('umsShapePointRowExample')
			.addClass('umsShapePointRow')
	,	prewPointId = parseInt(shell.find('.umsShapePointRow:last-child').data('point-pos'))
	,	nextPointId = !isNaN(prewPointId) ? prewPointId + 1 : 1;

	newRow.data('point-pos', nextPointId);
	newRow.find('input').each(function(){
		jQuery(this).removeAttr('disabled');
		jQuery(this).attr('name', jQuery(this).attr('name').replace('[0]', '['+ nextPointId+ ']'));
		jQuery(this).val(point[jQuery(this).data('type')]);
	});
	if(shapeForm.find('select[name="shape_opts[type]"]').val() == 'circle') {
		umsShowRadiusField(newRow);
	}
	shell.append(newRow.show());
	newRow.find('.umsShapeCoordX, .umsShapeCoordY').each(function() {
		jQuery(this).change(function() {
			var type = jQuery('#umsShapeForm select[name="shape_opts[type]"]').val()
			,	shape = umsGetCurrentShape()
			,	newShapeCoords = jQuery('.umsShapePointRow')
			,	path = [];

			if(!shape) {
				_umsCreateNewMapShape();
				shape = umsGetCurrentShape();
			}
			newShapeCoords.each(function() {
				var lat = jQuery(this).find('.umsShapeCoordX').val()
				,	lng = jQuery(this).find('.umsShapeCoordY').val();

				if(lat && lng) {
					path.push({ address: '', coord_x: lat, coord_y: lng });
				}
			});
			if(shape && path && path.length) {
				if(type == 'circle') {
					shape.setCenter(umsGetShapeCenter(path));
				} else {
					shape.setPath(umsGetShapePath(path));
				}
				if(shape._createdFromCenter) {
					if(type == 'circle') {
						shape._infoWndPosition = shape.getCenter();
					} else {
						shape._infoWndPosition = shape.getPath().getAt(0);
					}
					shape._createdFromCenter = false;
				}
			}
		});
	});
	g_umsMap.geocodeSearchAutocomplete(newRow.find('.umsShapeAddress'), {
		msgEl: ''
	,	onSelect: function(item, event, ui) {
		if(item) {
				newRow.find('.umsShapeCoordX').val(item.lat);
				newRow.find('.umsShapeCoordY').val(item.lng).trigger('change');
			}
		}
	});
	newRow.find('#umsShapeRemovePointRowBtn').click(function() {
		umsShapeRemovePointRow(jQuery(this));
		return false;
	});
}
// Functions for manipulate the shapes's form
function umsShowShapeForm() {
	var shapeFormIsVisible = jQuery('#umsShapeForm').is(':visible');
	if(!shapeFormIsVisible) {
		jQuery('#umsMapPropertiesTabs').wpTabs('activate', '#umsShapeTab');
	}
}
function umsOpenShapeEdit(id) {
	umsOpenShapeForm();
	var shapeForm = jQuery('#umsShapeForm')
	,	shape = g_umsMap.getShapeById( id );	// We need to get shape belonged to map otherwise the options' changes will not apply to shape

	if(shape) {
		var shapeParams = shape.getRawShapeParams();
		shapeForm.find('input[name="shape_opts[id]"]').val( shapeParams.id );
		shapeForm.find('input[name="shape_opts[title]"]').val( shapeParams.title );
		umsSetTxtEditorVal('shapeDescription', shapeParams.description);

		shapeForm.find('select[name="shape_opts[type]"]').val( shapeParams.type );
		shapeForm.find('select[name="shape_opts[type]"]').trigger('change');

		shapeForm.find('input[name="shape_opts[params][strokeColor]"]').val( shapeParams.strokeColor ).trigger('change');
		shapeForm.find('select[name="shape_opts[params][strokeOpacity]"]').val( parseFloat(shapeParams.strokeOpacity) );
		shapeForm.find('input[name="shape_opts[params][strokeWeight]"]').val( shapeParams.strokeWeight == '' ? 0 : parseFloat(shapeParams.strokeWeight) );
		shapeForm.find('input[name="shape_opts[params][fillColor]"]').val( shapeParams.fillColor ).trigger('change');
		shapeForm.find('select[name="shape_opts[params][fillOpacity]"]').val( parseFloat(shapeParams.fillOpacity) );

		umsShapeClearRows();
		for(var i in shapeParams.coords) {
			umsShapeDrawPointRow(shapeParams.coords[i]);
		}
		umsSetCurrentShape( shape );
	}
}
function umsResetShapeForm() {
	var shapeForm = jQuery('#umsShapeForm');

	umsSetCurrentShape( null );
	shapeForm[0].reset();
	shapeForm.find('input[name="shape_opts[id]"]').val('');
	shapeForm.find('input[name="shape_opts[title]"]').val('');
	//shapeForm.find('select[name="shape_opts[type]"]').val('polyline');
	//shapeForm.find('select[name="shape_opts[type]"]').trigger('change');

	if(shapeForm.find('#umsShapeAddPointByClickBtn').hasClass('umsAddByClickActivated')) {
		shapeForm.find('#umsShapeAddPointByClickBtn').removeClass('umsAddByClickActivated');
		google.maps.event.removeListener(g_umsMap._getEventListenerHandle('click', 'getLatLng'));
	}
	shapeForm.find('input[name="shape_opts[params][strokeColor]"]').val('#dd3333').trigger('change');
	shapeForm.find('select[name="shape_opts[params][strokeOpacity]"]').val(1);
	shapeForm.find('input[name="shape_opts[params][strokeWeight]"]').val(2);
	shapeForm.find('input[name="shape_opts[params][fillColor]"]').val('#dd3333').trigger('change');
	shapeForm.find('select[name="shape_opts[params][fillOpacity]"]').val(1);

	umsShapeClearRows();
	// Add two new point rows
	umsShapeDrawPointRow();
	umsShapeDrawPointRow();

	jQuery('.umsAddShapeRow').show();
	jQuery('.umsEditShapeRow').hide();
}
// Show / hide circle's radius field
function umsShowRadiusField(row) {
	row.find('.umsShapeAddress').parents('div:first').css({ width: '40%' });
	row.find('.umsShapeRadius').parents('div:first').css({ display: 'inline-block' });
	row.find('.umsShapeRadius').on('change', function() {
		var shape = umsGetCurrentShape();

		if(shape && shape.getType() == 'circle')
			shape.setRadius(parseInt(jQuery(this).val()));
	});
}
function umsHideRadiusField(row) {
	row.find('.umsShapeAddress').parents('div:first').css({ width: '50%' });
	row.find('.umsShapeRadius').parents('div:first').css({ display: 'none' });
}
// Shape's description callback
function umsBindShapeTinyMceUpdate() {
	if(!g_umsTinyMceShapeEditorUpdateBinded && typeof(tinyMCE) !== 'undefined' && tinyMCE.editors) {
		if(tinyMCE.editors.shapeDescription) {
			tinyMCE.editors.shapeDescription.onKeyUp.add(function(){
				var shape = umsGetCurrentShape();

				if(!shape) {
					_umsCreateNewMapShape();
					shape = umsGetCurrentShape();
				}
				if(shape) {
					shape.setDescription( umsGetTxtEditorVal('shapeDescription') );
					shape.showInfoWnd();
				}
			});
			g_umsTinyMceShapeEditorUpdateBinded = true;
		}
	}
}
// Functions for manipulations with g_umsCurrentEditShape variable
function umsSetCurrentShape(shape) {
	g_umsCurrentEditShape = shape;
	jQuery('.umsAddShapeRow').hide();
	jQuery('.umsEditShapeRow').show();

	var type = shape.getType()
	,	typeLabel = jQuery('.umsAddShapeBtn[data-type="'+ type+ '"]').html();
	jQuery('#umsShpeTypeTxt').html( typeLabel );
}
function umsGetCurrentShape() {
	// We need to create shape only in several cases, so this function shows us was shape already created or not
	return g_umsCurrentEditShape;
}
function _umsCreateNewMapShape(type) {
	var shapeForm = jQuery('#umsShapeForm')
	,	newShapeData = {
			type: type
		,	path: [ g_umsMap.getCenter() ]
		,	center: g_umsMap.getCenter()
		,	radius: 10
		,	strokeColor: shapeForm.find('input[name="shape_opts[params][strokeColor]"]').val()
		,	strokeOpacity: shapeForm.find('select[name="shape_opts[params][strokeOpacity]"]').val()
		,	strokeWeight: shapeForm.find('input[name="shape_opts[params][strokeWeight]"]').val()
		,	fillColor: shapeForm.find('input[name="shape_opts[params][fillColor]"]').val()
		,	fillOpacity: shapeForm.find('select[name="shape_opts[params][fillOpacity]"]').val()
		,	created_from_center: true
		};
	umsSetCurrentShape(g_umsMap.addShape(newShapeData));
}
// Shapes' list buttons callbacks
function umsShapeEditBtnClick(btn){
	var shapeId = jQuery(btn).data('shape_id');
	umsOpenShapeEdit( shapeId );
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
					umsResetShapeForm();
				}
			}
		}
	});
}
function umsRefreshMapShapesList(shapesList) {
	umsRefreshMapShapes(g_umsMap, shapesList);
	var currentFormShape = parseInt( jQuery('#umsShapeForm input[name="shape_opts[id]"]').val() );
	if(currentFormShape) {
		var editMapShape = g_umsMap.getShapeById(currentFormShape);
		if(editMapShape) {
			umsSetCurrentShape( editMapShape );
		}
	}
}
function umsRefreshMapShapes(map, shapes) {
	map.clearShapes();
	shapes = _umsPrepareShapesListAdmin( shapes );
	for(var i in shapes) {
		var newShape = map.addShape( shapes[i] );
	}
}
function _umsPrepareShapesListAdmin(shapes) {
	return _umsPrepareShapesList(shapes);
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
	var shape = umsGetCurrentShape();

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
	var shape = umsGetCurrentShape();

	if(shape)
		shape.setFillColor(g_umsShapeFillColorLast);
	g_umsShapeFillColorTimeoutSet = false;
}
// Shapes form check change actions
function _umsIsShapeFormChanged() {
	return g_umsShapeFormChanged;
}
function _umsChangeShapeForm() {
	g_umsShapeFormChanged = true;
}
function _umsUnchangeShapeForm() {
	g_umsShapeFormChanged = false;
}
function umsOpenShapeForm() {
	umsShowShapeForm();
	umsResetShapeForm();
}
