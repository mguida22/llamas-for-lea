function httpGetAsync(url, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(JSON.parse(xmlHttp.responseText));
  }
  xmlHttp.open("GET", url, true);
  xmlHttp.send(null);
}

function setPicture() {
  var URL = 'https://api.flickr.com/services/rest/' +
            '?method=flickr.groups.pools.getPhotos' +
            '&api_key=41ec740b69920fb9fd08fca4c5bfd412' +
            '&group_id=54097770@N00' +
            '&per_page=500' +
            '&extras=url_l' +
            '&format=json' +
            '&content_type=1' +
            '&nojsoncallback=1';

  httpGetAsync(URL, function(data) {
    var photos = data.photos.photo.filter(function(photo) { return photo.url_l });

    var rand_index = Math.floor(Math.random() * (photos.length - 1));

    var img = document.querySelector("#llama-img");

    img.setAttribute("src", photos[rand_index].url_l);
  });
}

setPicture();
