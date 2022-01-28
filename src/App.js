/* eslint-disable no-undef */
import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';
// adjust theme here https://bareynol.github.io/mui-theme-creator/
const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#373737',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#ff4f4f',
    },
  },
});

const StageDisplay = ({stage}) => {
  return <ul id="stage">
    {stage.map(playlistID => <li key={playlistID}>
                                <Button variant="contained" onClick={() => removeFromStage(playlistID)}>Remove</Button>
                                      {playlistID}
                             </li>)}
  </ul>
}
//2
function App() {
  const [stage, setStage] = useState([])
  chrome.storage.sync.get("stage", ({stage})=>setStage(stage))
  return (
    <div className="App">
      <ThemeProvider theme={theme}>          
          <Button variant="contained" id="appendPlaylistToStageButton" onClick={appendPlaylistToStage}>Append Playlist</Button>
          <Button variant="contained" id="submitStageButton" onClick={submitStage}>Submit</Button>
          <Button variant="contained" id="clearStageButton" onClick={clearStage}>Clear</Button>
          <StageDisplay stage={stage} />
      </ThemeProvider>
    </div>
  );
}

async function removeFromStage(playlistID) {
  chrome.storage.sync.get({stage: []}, ({stage}) => {
    chrome.storage.sync.set({stage: stage.filter(x=>x!=playlistID)})
  })
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
    let stageCSV = stage.join(",")    
    fetch(`http://localhost:8000/ytplsorted?playlistIDs=${stageCSV}&sortby=ratio`)
        .then(r => r.text())
        .then(url => chrome.tabs.create({ url: url }))
        .catch(e => console.log(e))        
  })
}

export default App;
