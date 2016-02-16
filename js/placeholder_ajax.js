//http://devpshelman:4000/dog

var img = $("<img />").attr('src', 'http://devpshelman:4000/dog')
    .on('load', function() {
        if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
            alert('broken image!');
        } else {
            $("#something").append(img);
        }
});

