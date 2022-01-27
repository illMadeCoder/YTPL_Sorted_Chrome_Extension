/* eslint-disable no-undef */
import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

function App() {
  const [playlistIDs, setPlaylistIDs] = useState([])
  chrome.storage.sync.get("playlistIDs", ({playlistIDs})=>setPlaylistIDs(playlistIDs))
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button id="appendPlaylistButton" onClick={appendPlaylist}>Append Playlist</button>
        <button id="submitButton" onClick={submit}>Create Playlist</button>
        <button id="cancelButton" onClick={cancel}>Reset</button>
        <ul id="playlistIDs">
          {playlistIDs.map(playlistID => <li key={playlistID}>{playlistID}</li>)}
        </ul>
      </header>
    </div>
  );
}

async function cancel() {
  chrome.storage.sync.set({playlistIDs: []})
}

async function appendPlaylist(playlistIDs) {
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true})
  let playlistIDre = /list=([^&]*)/
  let playlistID = playlistIDre.exec(tab.url)[1]
  chrome.storage.sync.get({'playlistIDs': []}, ({playlistIDs}) => {
      if (!playlistIDs.includes(playlistID)) {
        playlistIDs.push(playlistID)
        chrome.storage.sync.set({playlistIDs: playlistIDs})
      } else {
        // TODO error playlist already in list
      }
  })    
}

async function submit() {
  chrome.storage.sync.get({'playlistIDs': []}, (data) => {       
    let playlistIDsCSV = data.playlistIDs.join(",")
    fetch(`http://localhost:8000/ytplsorted?playlistIDs=${playlistIDsCSV}&sortby=ratio`)
        .then(r => r.text())
        .then(url => chrome.tabs.create({ url: url }))
        .catch(e => console.log(e))        
  })
}

export default App;
