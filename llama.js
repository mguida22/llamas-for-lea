function storePictureData (data) {
  chrome.storage.sync.set({ 'data': data })
}

function getPictureData (cb) {
  chrome.storage.sync.get(['data'], function (items) {
    cb(items.data)
  })
}

// adapted from http://stackoverflow.com/a/12646864/3711733
function shuffleArray (array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

function httpGetAsync (url, callback) {
  var xmlHttp = new XMLHttpRequest()
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      callback(JSON.parse(xmlHttp.responseText))
    }
  }
  xmlHttp.open('GET', url, true)
  xmlHttp.send(null)
}

function setPicture (data) {
  var imgElem = document.querySelector('#llama-img')
  var titleElem = document.querySelector('#llama-title')

  var imgData = data.pop()

  imgElem.setAttribute('src', imgData.url)
  titleElem.setAttribute('href', imgData.flickrLink)
  titleElem.innerHTML = imgData.title

  storePictureData(data)
}

function main () {
  getPictureData(function (data) {
    if (data && data.length > 0) {
      setPicture(data)
    } else {
      var pageIndex = Math.floor(Math.random() * 5) + 1
      var URL = 'https://api.flickr.com/services/rest/' +
                '?method=flickr.groups.pools.getPhotos' +
                '&api_key=41ec740b69920fb9fd08fca4c5bfd412' +
                '&group_id=54097770@N00' +
                '&per_page=500' +
                '&page=' + pageIndex +
                '&extras=url_l' +
                '&format=json' +
                '&content_type=1' +
                '&nojsoncallback=1'

      httpGetAsync(URL, function (d) {
        var photos = d.photos.photo.filter(function (photo) {
          return (photo.url_l && photo.title && photo.owner && photo.id)
        })

        var data = photos.map(function (photo) {
          var link = 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id
          return {
            url: photo.url_l,
            title: photo.title,
            flickrLink: link
          }
        })

        // take a random 20 images
        data = shuffleArray(data).slice(0, 20)
        setPicture(data)
      })
    }
  })
}

main()
