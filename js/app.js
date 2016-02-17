var stage, canvas, context, underlay, insertion, mask, overlay;
var URL_NAME = 'http://devpshelman:5000/upload';

function initCanvas(underlayImage) {
    var layer = new Konva.Layer();
    stage = new Konva.Stage({
        container: 'canvas',
        width: underlayImage.width,
        height: underlayImage.height
    });

    var underlay = new Konva.Image({
        image: underlayImage
    });

    layer.add(underlay);
    stage.add(layer);

    $('#canvas-header').show();
    $('#canvas-submit').show();

    //OVERRIDES FOR STYLING/PLACEMENT OF CANVAS
    $('.konvajs-content').css("margin", "auto");
}

function drawImage(imageObj, name) {
    var layer = new Konva.Layer();
    var image = new Konva.Image({
        image: imageObj
    });
    image.name(name);
    image.opacity(0.5);

    var darthVaderGroup = new Konva.Group({
        draggable: true
    });

    layer.add(darthVaderGroup);
    darthVaderGroup.add(image);
    addAnchor(darthVaderGroup, 0, 0, 'topLeft');
    addAnchor(darthVaderGroup, image.width(), 0, 'topRight');
    addAnchor(darthVaderGroup, image.width(), image.height(), 'bottomRight');
    addAnchor(darthVaderGroup, 0, image.height(), 'bottomLeft');

    // add cursor styling
    image.on('mouseover', function() {
        document.body.style.cursor = 'pointer';
    });
    image.on('mouseout', function() {
        document.body.style.cursor = 'default';
    });

    stage.add(layer);
    stage.draw();
}

function loadUnderlay(input) {
    if (input.files && input.files.length) {
        var reader = new FileReader();

        reader.onload = function(e) {
            underlay = e.target.result;
            var imageSource = new Image();
            imageSource.onload = function() {
                underlay = this;
                initCanvas(this);
            };
            imageSource.src = underlay;
        };

        for (var i = 0; i < input.files.length; i++) {
            reader.readAsDataURL(input.files[i]);
        }
    }
}

function loadInsertion(input) {
    if (input.files && input.files.length) {
        var reader = new FileReader();

        reader.onload = function(e) {
            insertion = e.target.result;
            var imageSource = new Image();
            imageSource.onload = function() {
                insertion = this;
                drawImage(this, "insertion");
            };
            imageSource.src = insertion;
        };

        for (var i = 0; i < input.files.length; i++) {
            reader.readAsDataURL(input.files[i]);
        }
    }
}

function loadMask(input) {
    if (input.files && input.files.length) {
        var reader = new FileReader();

        reader.onload = function(e) {
            mask = e.target.result;
            var imageSource = new Image();
            imageSource.onload = function() {
                mask = this;
                drawImage(this, "mask");
            };
            imageSource.src = mask;
        };

        for (var i = 0; i < input.files.length; i++) {
            reader.readAsDataURL(input.files[i]);
        }
    }
}

function loadOverlay(input) {
    if (input.files && input.files.length) {
        var reader = new FileReader();

        reader.onload = function(e) {
            overlay = e.target.result;
            var imageSource = new Image();
            imageSource.onload = function() {
                overlay = this;
                drawImage(this, "overlay");
            };
            imageSource.src = overlay
        };

        for (var i = 0; i < input.files.length; i++) {
            reader.readAsDataURL(input.files[i]);
        }
    }
}

function getBlendedImageWithBlackNWhite(canvasimage, canvasbw) {
    var tmp = document.createElement('canvas');
    tmp.width = canvasimage.width;
    tmp.height = canvasimage.height;

    var tmpctx = tmp.getContext('2d');

    tmpctx.globalCompositeOperation = 'source-over';
    tmpctx.drawImage(canvasimage, 0, 0);

    // multiply means, that every white pixel gets replaced by canvasimage pixel
    // and every black pixel will be left black
    tmpctx.globalCompositeOperation = 'multiply';
    tmpctx.drawImage(canvasbw, 0, 0);
    return tmp;
}

function submitImage() {
    var fd = new FormData();
    if (underlay) {
        fd.append('underlayfile', dataURItoBlob(underlay.src), "underlayfile.jpg");
    }
    if (insertion) {
        fd.append('insertionfile', dataURItoBlob(insertion.src), "insertionfile.jpg");
        fd.append('insertionW', stage.findOne('.insertion').width());
        fd.append('insertionH', stage.findOne('.insertion').height());
        fd.append('insertionRotation', stage.findOne('.insertion').rotation());
        fd.append('insertionX', stage.findOne('.insertion').x());
        fd.append('insertionY', stage.findOne('.insertion').y());
    }
    if (mask) {
        fd.append('maskfile', dataURItoBlob(mask.src), "maskfile.jpg");
    }
    if (overlay) {
        fd.append('overlayfile', overlay.src);
        fd.append('overlayW', stage.findOne('.overlay').width());
        fd.append('overlayH', stage.findOne('.overlay').height());
        fd.append('overlayX', stage.findOne('.overlay').x());
        fd.append('overlayY', stage.findOne('.overlay').y());
    }

    $.ajax({
        url: URL_NAME,
        data: fd,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data) {
            var img = $("<img />").attr('src', data);
            $('body').append(img);
        }
    });
}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {
        type: mimeString
    });
}

function update(activeAnchor) {
    var group = activeAnchor.getParent();

    var topLeft = group.get('.topLeft')[0];
    var topRight = group.get('.topRight')[0];
    var bottomRight = group.get('.bottomRight')[0];
    var bottomLeft = group.get('.bottomLeft')[0];
    var image = group.get('Image')[0];

    var anchorX = activeAnchor.getX();
    var anchorY = activeAnchor.getY();

    // update anchor positions
    switch (activeAnchor.getName()) {
        case 'topLeft':
            topRight.setY(anchorY);
            bottomLeft.setX(anchorX);
            break;
        case 'topRight':
            topLeft.setY(anchorY);
            bottomRight.setX(anchorX);
            break;
        case 'bottomRight':
            bottomLeft.setY(anchorY);
            topRight.setX(anchorX);
            break;
        case 'bottomLeft':
            bottomRight.setY(anchorY);
            topLeft.setX(anchorX);
            break;
    }

    image.position(topLeft.position());

    var width = topRight.getX() - topLeft.getX();
    var height = bottomLeft.getY() - topLeft.getY();
    if (width && height) {
        image.width(width);
        image.height(height);
    }
}

function addAnchor(group, x, y, name) {
    var stage = group.getStage();
    var layer = group.getLayer();

    var anchor = new Konva.Circle({
        x: x,
        y: y,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        radius: 8,
        name: name,
        draggable: true,
        dragOnTop: false
    });

    anchor.on('dragmove', function() {
        update(this);
        layer.draw();
    });
    anchor.on('mousedown touchstart', function() {
        group.setDraggable(false);
        this.moveToTop();
    });
    anchor.on('dragend', function() {
        group.setDraggable(true);
        layer.draw();
    });
    // add hover styling
    anchor.on('mouseover', function() {
        var layer = this.getLayer();
        document.body.style.cursor = 'pointer';
        this.setStrokeWidth(4);
        layer.draw();
    });
    anchor.on('mouseout', function() {
        var layer = this.getLayer();
        document.body.style.cursor = 'default';
        this.setStrokeWidth(2);
        layer.draw();
    });

    group.add(anchor);
}