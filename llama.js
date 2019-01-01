'use strict'

const storePictureData = (pictureData) => {
  chrome.storage.local.set({ pictureQueue: pictureData })
}

const storePictureDataById = (pictureData) => {
  chrome.storage.local.get(['oldPictures'], (items) => {
    let update = { [pictureData.id]: pictureData }
    chrome.storage.local.set({ oldPictures: { ...update, ...items.oldPictures } })
  })
}

const getPictureData = (callback) => {
  chrome.storage.local.get(['pictureQueue'], (items) => {
    callback(items.pictureQueue)
  })
}

const getPictureDataFromId = (id, callback) => {
  chrome.storage.local.get(['oldPictures'], (items) => {
    callback(items.oldPictures[id])
  })
}

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    // pick random remaining element and swap with current element
    let j = Math.floor(Math.random() * (i + 1))
    let temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }

  return array
}

const httpGetAsync = (url, callback) => {
  const xmlHttp = new XMLHttpRequest()

  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      callback(JSON.parse(xmlHttp.responseText))
    }
  }

  xmlHttp.open('GET', url, true)
  xmlHttp.send()
}

const updateHistory = (id) => {
  const url = new URL(window.location.href)
  url.search = `id=${id}`

  // set the history so we can return to this specific image when pressing back
  window.history.replaceState(null, null, url.href)
}

const setPicture = (imgData) => {
  const imgElem = document.querySelector('#llama-img')
  const titleElem = document.querySelector('#llama-title')
  const headTitleElem = document.querySelector('title')

  imgElem.setAttribute('src', imgData.url)
  titleElem.setAttribute('href', imgData.flickrLink)
  titleElem.innerHTML = imgData.title
  headTitleElem.innerHTML = imgData.title

  updateHistory(imgData.id)
}

const handlePictureUpdate = (data) => {
  const photo = data.pop()
  setPicture(photo)
  storePictureDataById(photo)
  storePictureData(data)
}

const main = () => {
  // if there's an image id param, display that image.
  // this is to handle a user going back to an old image via history
  const loc = new URL(window.location.href)
  const id = loc.searchParams.get('id')

  if (id) {
    getPictureDataFromId(id, (data) => {
      setPicture(data)
    })
  } else {
    getPictureData((data) => {
      if (data && data.length > 0) {
        handlePictureUpdate(data)
      } else {
        const pageIndex = Math.floor(Math.random() * 5) + 1
        const URL = 'https://api.flickr.com/services/rest/' +
                  '?method=flickr.groups.pools.getPhotos' +
                  '&api_key=41ec740b69920fb9fd08fca4c5bfd412' +
                  '&group_id=54097770@N00' +
                  '&per_page=500' +
                  '&page=' + pageIndex +
                  '&extras=url_l' +
                  '&format=json' +
                  '&content_type=1' +
                  '&nojsoncallback=1'

        httpGetAsync(URL, (response) => {
          const photos = response.photos.photo.filter((photo) => {
            return (
              photo.id &&
              photo.url_l &&
              photo.owner &&
              photo.title &&
              // remove images with indicators of poor quality
              //   - only numbers in the title
              //   - contains the word shear
              !(/^d+$/.test(photo.title)) &&
              photo.title.toLowerCase().indexOf('shear') === -1
            )
          })

          let photoData = photos.map((photo) => {
            const link = `https://www.flickr.com/photos/${photo.owner}/${photo.id}`
            return {
              id: photo.id,
              url: photo.url_l,
              title: photo.title,
              flickrLink: link
            }
          })

          // we don't want lots of similar pictures one after the other
          photoData = shuffleArray(photoData)
          handlePictureUpdate(photoData)
        })
      }
    })
  }
}

main()
