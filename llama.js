'use strict'

const storePictureData = (data) => {
  chrome.storage.local.set({ data })
}

const getPictureData = (callback) => {
  chrome.storage.local.get(['data'], function (items) {
    callback(items.data)
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

const setPicture = (data) => {
  const imgElem = document.querySelector('#llama-img')
  const titleElem = document.querySelector('#llama-title')
  const headTitleElem = document.querySelector('title')

  const imgData = data.pop()

  imgElem.setAttribute('src', imgData.url)
  titleElem.setAttribute('href', imgData.flickrLink)
  titleElem.innerHTML = imgData.title
  headTitleElem.innerHTML = imgData.title

  storePictureData(data)
}

const main = () => {
  getPictureData((data) => {
    if (data && data.length > 0) {
      setPicture(data)
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
            photo.title
            // most of the 'higher quality' photos don't have numbers in the title
            // !(/^d+$/.test(photo.title))
          )
        })

        let photoData = photos.map((photo) => {
          const link = `https://www.flickr.com/photos/${photo.owner}/${photo.id}`
          return {
            url: photo.url_l,
            title: photo.title,
            flickrLink: link
          }
        })

        // we don't want lots of similar pictures one after the other
        photoData = shuffleArray(photoData)
        setPicture(photoData)
      })
    }
  })
}

main()
