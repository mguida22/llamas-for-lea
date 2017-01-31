function storePictureUrls(urls) {
  chrome.storage.sync.set({ "urls": urls });
}

function getPictureUrls(cb) {
  chrome.storage.sync.get(["urls"], function(items) {
    cb(items.urls);
  })
}

function httpGetAsync(url, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(JSON.parse(xmlHttp.responseText));
  }
  xmlHttp.open("GET", url, true);
  xmlHttp.send(null);
}

function setPicture(urls) {
  var img = document.querySelector("#llama-img");
  img.setAttribute("src", urls.pop());

  storePictureUrls(urls);
}

function main() {
  getPictureUrls(function(urls) {
    if (urls && urls.length > 0) {
      setPicture(urls);
    } else {
      var pageIndex = Math.floor(Math.random() * 5) + 1;
      var URL = 'https://api.flickr.com/services/rest/' +
                '?method=flickr.groups.pools.getPhotos' +
                '&api_key=41ec740b69920fb9fd08fca4c5bfd412' +
                '&group_id=54097770@N00' +
                '&per_page=500' +
                '&page=' + pageIndex +
                '&extras=url_l' +
                '&format=json' +
                '&content_type=1' +
                '&nojsoncallback=1';

      httpGetAsync(URL, function(data) {
        var photos = data.photos.photo.filter(function(photo) {
          return (photo.url_l && photo.title.toLowerCase().indexOf("llama") > -1);
        });

        var urls = photos.map(function(photo) {
          return photo.url_l;
        });

        setPicture(urls);
        storePictureUrls(urls);
      });
    }
  });
}

main();
