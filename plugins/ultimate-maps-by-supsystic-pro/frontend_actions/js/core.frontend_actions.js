var g_umsMarkerFormMarker = false;
jQuery(window).on('load', function() {
    setTimeout(function() {
        var frontendMarkerAddForms = jQuery('.umsFrontendMarkerAddForm'),
            frontendMarkerDeleteForms = jQuery('.umsFrontendMarkerDeleteForm');

        frontendMarkerDeleteForms.each(function() {
            var self = jQuery(this),
                formViewId = self.data('form_view_id'),
                mapId = self.find('input[name="marker_opts[map_id]"]').val(),
                map = umsGetMapById(mapId);

            if (typeof(map.geocodeSearchAutocomplete) != 'function') {
                // We do not need a message because this is subform at te moment
                return;
            }
            self.submit(function() {
                if (!jQuery('select[name="marker_id"]').val()) {
                    jQuery('#umsFrontendNoMarkerMsg_' + formViewId).show();
                    return false;
                }
                self.sendFormUms({
                    msgElID: 'umsFrontendMarkerDeleteFormMsg_' + formViewId,
                    btn: self.find('button[type="submit"]'),
                    onSuccess: function(res) {
                        if (!res.error) {
                            if (umsIsMapOnPage(res.data.map)) {
                                location.reload();
                            }
                        }
                    }
                });
                return false;
            });
            self.show();
        });
        frontendMarkerAddForms.each(function() {
            var self = jQuery(this),
                formViewId = self.data('form_view_id'),
                mapId = self.find('input[name="marker_opts[map_id]"]').val(),
                isMapOnPage = umsIsMapOnPage(mapId),
                map = umsGetMapById(mapId);

            if (isMapOnPage) {
                umsAddMapListeners(mapId, self);
            } else {
                self.find('#umsAddNewMarkerBtn').hide();
            }
            if (typeof(map.geocodeSearchAutocomplete) != 'function') {
                jQuery('#umsFrontendNoMapMsg_' + formViewId).show();
                return;
            }
            map.geocodeSearchAutocomplete(self.find('input[name="marker_opts[address]"]'), {
                msgEl: '',
                onSelect: function(item, event, ui) {
                    if (item) {
                        self.find('input[name="marker_opts[coord_x]"]').val(item.lat);
                        self.find('input[name="marker_opts[coord_y]"]').val(item.lng).trigger('change');
                        umsSetFrontendMarkerIconImg(self);
                        map.setCenter(item.lat, item.lng);
                    }
                }
            });
            self.submit(function() {
                var markerFormTxtEditorId = self.find('[name="markerDescripton"]').attr('id');

                jQuery('#umsFrontendNoMapMsg_' + formViewId).hide();
                self.find('input[name="marker_opts[description]"]').val(umsGetTxtEditorVal(markerFormTxtEditorId));
                self.sendFormUms({
                    msgElID: 'umsFrontendMarkerAddFormMsg_' + formViewId,
                    btn: self.find('button[type="submit"]'),
                    onSuccess: function(res) {
                        if (!res.error) {
                            if (umsIsMapOnPage(res.data.marker.map_id)) {
                                if (g_umsMarkerFormMarker) {
                                    g_umsMarkerFormMarker.setMap(null);
                                    g_umsMarkerFormMarker = false;
                                }
                                location.reload();
                            }
                        }
                    }
                });
                return false;
            });

            self.show();

            frontendMarkerAddForms.find('select[name="marker_opts[marker_group_id][]"]').chosen();

            self.find('input[name="marker_opts[coord_x]"],input[name="marker_opts[coord_y]"]').change(function() {
                var newX = jQuery('.umsFrontendMarkerAddForm [name="marker_opts[coord_x]"]').val(),
                    newY = jQuery('.umsFrontendMarkerAddForm [name="marker_opts[coord_y]"]').val();
                var marker = g_umsMarkerFormMarker;
                var title = self.find('[name="marker_opts[title]"]').val();
                var markerFormTxtEditorId = self.find('[name="markerDescripton"]').attr('id');
                var description = umsGetTxtEditorVal(markerFormTxtEditorId);
                if (marker) {
                    marker.setPosition(newX, newY);
                    marker.setTitle(title);
                    marker.setDescription(description);
                } else {
                    g_umsMarkerFormMarker = _umsCreateNewMapMarker({
                        map: map,
                        form: self,
                        coord_x: newX,
                        coord_y: newY,
                        title: title,
                        description: description
                    });
                }
            });
        });
    }, 1000);
    umsInitFrontendMarkerFormIconsWnd();
});

function umsGetIconPath(markerForm) {
    var id = parseInt(markerForm.find('input[name="marker_opts[icon]"]').val()),
        icon = jQuery('.umsFrontendMarkerPreviewIcon[data-id="' + id + '"] img');

    return icon.attr('src');
}

function umsGetIconSize(markerForm) {
    var id = parseInt(markerForm.find('input[name="marker_opts[icon]"]').val()),
        icon = jQuery('.umsFrontendMarkerPreviewIcon[data-id="' + id + '"] img');

    return {
        width: icon.width(),
        height: icon.height()
    };
}

function _umsCreateNewMapMarker(params) {
    params = params || {};
    var iconSize = umsGetIconSize(params.form);
    var newMarkerData = {
        icon: umsGetIconPath(params.form),
        icon_data: iconSize,
        draggable: true,
        dragend: _umsMarkerDragEndClb
    };
    if (params.coord_x && params.coord_y) {
        newMarkerData.coord_x = parseFloat(params.coord_x);
        newMarkerData.coord_y = parseFloat(params.coord_y);
    } else {
        var mapCenter = params.map.getCenter();
        newMarkerData.position = mapCenter;
        newMarkerData.coord_x = mapCenter.lat;
        newMarkerData.coord_y = mapCenter.lng;
    }
    newMarkerData.title = (params.title) ? params.title : 'Added by click';
    newMarkerData.description = (params.description) ? params.description : '';
    newMarker = params.map.addMarker(newMarkerData);
    params.map.markersRefresh();

    return newMarker;
}

function umsInitFrontendMarkerFormIconsWnd() {
    var frontendMarkerAddForms = jQuery('.umsFrontendMarkerForm'),
        $container = umsInitFrontendDialogWnd();

    frontendMarkerAddForms.each(function() {
        var self = jQuery(this);

        self.find('.umsFrontendMarkerIconBtn').click(function(e) {
            $container.data('form_view_id', self.data('form_view_id'));
            $container.dialog('open');
            return false;
        });
        jQuery('.umsFrontendMarkerPreviewIcon').click(function(e) {
            var that = jQuery(this),
                markerFormViewId = that.parents('#umsFrontendMarkerIconsWnd').data('form_view_id'),
                markerForm = jQuery('#umsFrontendMarkerAddForm_' + markerFormViewId),
                newId = that.data('id');

            markerForm.find('input[name="marker_opts[icon]"]').val(newId);
            umsSetFrontendMarkerIconImg(markerForm);
            $container.dialog('close');
            return false;
        });
    });
}

function umsInitFrontendDialogWnd(markerForm) {
    var markerIconsWnd = jQuery('#umsFrontendMarkerIconsWnd');

    if (markerIconsWnd.hasClass('ui-dialog-content')) {
        return markerIconsWnd;
    }
    return markerIconsWnd.dialog({
        modal: true,
        autoOpen: false,
        width: 550,
        height: 500,
        closeText: ''
    });
}

function umsSetFrontendMarkerIconImg(markerForm) {
    var id = parseInt(markerForm.find('input[name="marker_opts[icon]"]').val()),
        src = jQuery('.umsFrontendMarkerPreviewIcon[data-id="' + id + '"] img').attr('src');

    markerForm.find('.umsFrontendMarkerIconImg').attr('src', src);
    if (g_umsMarkerFormMarker) {
        g_umsMarkerFormMarker.setIcon(src);
    }
}

function umsIsMapOnPage(id) {
    if (typeof(umsGetMapInfoById) == 'function') {
        // check map info because map can not be init on page yet
        return umsGetMapInfoById(id);
    }
    return false;
}

function _umsMarkerDragEndClb() {
    //Event DragEnd Marker attached to _umsCreateNewMapMarker EventListener
    //Change marker coords by DragEnd mouse position
    jQuery('.umsFrontendMarkerAddForm input[name="marker_opts[coord_x]"]').val(this.lat());
    jQuery('.umsFrontendMarkerAddForm input[name="marker_opts[coord_y]"]').val(this.lng());
}

function umsAddMapListeners(mapId, form) {
    var map = umsGetMapById(mapId);
    if (map) {
        //If user click on map and our 'Add by Click' button is active ->
        //Create new marker in clicked coords by use trigger('change') for coords input
        //And set map center to created marker
        map.addEventListener('click', function(e) {
            if (jQuery('#umsAddNewMarkerBtn').hasClass('umsActive')) {
                jQuery('input[name="marker_opts[coord_x]"]').val(e.latlng.lat);
                jQuery('input[name="marker_opts[coord_y]').val(e.latlng.lng).trigger('change');
                map.setCenter(e.latlng.lat, e.latlng.lng);
            }
        });
        form.find('#umsAddNewMarkerBtn').on('click', function(e) {
            e.preventDefault();
            var that = jQuery(this);
            that.toggleClass('umsActive');
            if (that.hasClass('umsActive')) {
                umsSetFrontendMarkerIconImg(form);
            }
            return false;
        });
    } else {
        setTimeout(function() {
            umsAddMapListeners(mapId, form)
        }, 50)
    }
}
