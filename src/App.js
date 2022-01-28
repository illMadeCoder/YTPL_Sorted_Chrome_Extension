/* eslint-disable no-undef */
import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

function App() {
  const [stage, setStage] = useState([])
  chrome.storage.sync.get("stage", ({stage})=>setStage(stage))
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button id="appendPlaylistToStageButton" onClick={appendPlaylistToStage}>Append Playlist</button>
        <button id="submitStageButton" onClick={submitStage}>Submit</button>
        <button id="clearStageButton" onClick={clearStage}>Clear</button>
        <ul id="stage">
          {stage.map(playlistID => <li key={playlistID}>{playlistID}</li>)}
        </ul>
      </header>
    </div>
  );
}

async function clearStage() {
  chrome.storage.sync.set({stage: []})
}

async function appendPlaylistToStage() {
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true})
  let playlistIDre = /list=([^&]*)/
  let playlistID = playlistIDre.exec(tab.url)[1]
  chrome.storage.sync.get({stage: []}, ({stage}) => {
      if (!stage.includes(playlistID)) {
        chrome.storage.sync.set({stage: stage.concat([playlistID])})
      } else {
        // TODO error playlist already in list
      }
  })    
}

async function submitStage() {
  chrome.storage.sync.get({stage: [], stageHistory: []}, ({stage, stageHistory}) => {    
    chrome.storage.sync.set({stageHistory:stageHistory.concat([stage])})
    let playlistIDsCSV = stage.join(",")    
    fetch(`http://localhost:8000/ytplsorted?playlistIDs=${playlistIDsCSV}&sortby=ratio`)
        .then(r => r.text())
        .then(url => chrome.tabs.create({ url: url }))
        .catch(e => console.log(e))        
  })
}

export default App;
