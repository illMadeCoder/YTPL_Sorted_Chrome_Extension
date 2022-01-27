/* eslint-disable no-undef */
import logo from './logo.svg';
import './App.css';

function App() {
  chrome.storage.sync.get("playlistIDs", data=>console.log(data))
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />        
        <button id="submitButton" onClick={submit}>Create Playlist</button>
        <button id="cancelButton" onClick={cancel}>Reset</button>
        <button id="addToPlaylistListButton" onClick={appendPlaylist}>Add Playlist</button>
        <ul id="playlistIDs">            
        </ul>
      </header>
    </div>
  );
}

async function cancel() {
  chrome.storage.sync.set({playlistIDs: []})
}

async function appendPlaylist() {
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
}

async function submit() {
  chrome.storage.sync.get({'playlistIDs': []}, (data) => {       
    let playlistIDsCSV = data.playlistIDs.join(",")
    fetch(`http://localhost:8000/ytplsorted?playlistIDs=${playlistIDsCSV}&sortby=views`)
        .then(r => r.text())
        .then(url => chrome.tabs.create({ url: url }))
        .catch(e => console.log(e))        
  })
}

export default App;
