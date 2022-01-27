/* eslint-disable no-undef */
let addToPlaylistList = document.getElementById("addToPlaylistListButton");
let submitButton = document.getElementById("submitButton"); 

addToPlaylistList.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true})
    let playlistIDre = /list=([^&]*)/
    let playlistID = playlistIDre.exec(tab.url)[1]
    chrome.storage.sync.get({'playlistIDs': []}, (data) => {   
        let playlistIDs = data.playlistIDs     
        console.log(playlistIDs)
        console.log(playlistID)        
        
        playlistIDs.push(playlistID)        
        let list = document.getElementById("playlistIDs")
        list.innerText +=  "<li>" + playlistID + "</li>"
        chrome.storage.sync.set({playlistIDs: playlistIDs})
    })    
})

submitButton.addEventListener("click", async () => {
    chrome.storage.sync.get({'playlistIDs': []}, (data) => {       
        let playlistIDsCSV = data.playlistIDs.join(",")
        fetch(`http://localhost:8000/ytplsorted?playlistIDs=${playlistIDsCSV}&sortby=views`)
            .then(r => r.text())
            .then(url => chrome.tabs.create({ url: url }))
            .catch(e => console.log(e))        
    })
})

cancelButton.addEventListener("click", async () => {
    chrome.storage.sync.set({playlistIDs: []})
})