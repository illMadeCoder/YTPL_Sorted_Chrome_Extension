let addToPlaylistList = document.getElementById("addToPlaylistListButton");
let submitButton = document.getElementById("submitButton");

// chrome.storage.sync.get("color", ({ color }) => {
//   changeColor.style.backgroundColor = color;
// });
chrome.storage.sync.set({playlistIDs: []})
addToPlaylistList.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true})
    //chrome.tabs.create({ url: tab.url });
    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     function: setPageBackgroundColor,
    // })
    //PLA26855F88564F001
    let playlistIDre = /list=(.*)/
    let playlistID = playlistIDre.exec(tab.url)[1]
    chrome.storage.sync.get('playlistIDs', (data) => {   
        playlistIDs = data.playlistIDs     
        console.log(playlistIDs)
        console.log(playlistID)
        playlistIDs.push(playlistID)
        chrome.storage.sync.set({playlistIDs: playlistIDs})
    })
    // fetch(`http://localhost:8000/ytplsorted?playlistIDs=${playlistID}&sortby=views`)
    //     .then(r => r.text())
    //     .then(url => cosneol.log(url))
    //     .catch(e => console.log(e))    
})

submitButton.addEventListener("click", async () => {
    chrome.storage.sync.get('playlistIDs', (data) => {       
        playlistIDsCSV = data.playlistIDs.join(",")
        fetch(`http://localhost:8000/ytplsorted?playlistIDs=${playlistIDsCSV}&sortby=views`)
            .then(r => r.text())
            .then(url => chrome.tabs.create({ url: url }))
            .catch(e => console.log(e))     
        
    })
})