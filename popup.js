let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

changeColor.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true})
    //chrome.tabs.create({ url: tab.url });
    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     function: setPageBackgroundColor,
    // })
    //PLA26855F88564F001
    let playlistIDre = /list=(.*)/
    let playlistID = playlistIDre.exec(tab.url)[1]
    fetch(`http://localhost:8000/ytplsorted?playlistIDs=${playlistID}&sortby=views`)
        .then(r => r.text())
        .then(url => chrome.tabs.create({ url: url }))
        .catch(e => console.log(e))
    
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        //let url = tabs[0].url;
                
        // use `url` here inside the callback because it's asynchronous!
        });
})

function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({ color }) => {
        document.body.style.backgroundColor = color;
    })
}