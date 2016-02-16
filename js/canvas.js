var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
    container: 'canvas',
    width: width,
    height: height
});

var layer = new Konva.Layer();

function drawImage(imageObj) {
    // darth vader
    var darthVaderImg = new Konva.Image({
        image: imageObj,
        x: stage.getWidth() / 2 - 200 / 2,
        y: stage.getHeight() / 2 - 137 / 2,
        width: 350,
        height: 300,
        draggable: true
    });

    // add cursor styling
    darthVaderImg.on('mouseover', function() {
        document.body.style.cursor = 'pointer';
    });
    darthVaderImg.on('mouseout', function() {
        document.body.style.cursor = 'default';
    });

    layer.add(darthVaderImg);
    stage.add(layer);
}


var imageSource = new Image();
imageSource.onload = function() {
    drawImage(this);
};
imageSource.src = '../imgs/creepy.png';

var underlay = new Image();
underlay.onload = function() {
    drawImage(this);
};
underlay.src = '../imgs/rocket.jpg';

var mask = new Image();
mask.onload = function() {
    drawImage(this);
};
mask.src = '../imgs/porthole-clip.png';

var overlay = new Image();
overlay.onload = function() {
    drawImage(this);
};
overlay.src = '../imgs/porthole-overlay.png';

var layers = stage.getLayers();
