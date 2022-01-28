/* eslint-disable no-undef */

import './App.css';
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
// adjust theme here https://bareynol.github.io/mui-theme-creator/
const theme = createTheme({
  // palette: {
  //   type: 'light',
  //   primary: {
  //     main: '#373737',
  //   },
  //   secondary: {
  //     main: '#f50057',
  //   },
  //   background: {
  //     default: '#ff4f4f',
  //   },
  // },
});

const StageDisplay = ({stageInfo, stage, setStage}) => {

  return <Box sx={{ width: '100%', maxWidth: 340, bgcolor: 'background.paper' }}>
    <List id="stage">
    {stageInfo.map(playlistInfo => <ListItem disablePadding>
                                <ListItemButton onClick={() => removeFromStage(playlistInfo["id"], stage, setStage)}>
                                  <ListItemIcon>
                                    <CancelIcon />
                                  </ListItemIcon>
                                  <ListItemText primary={playlistInfo["snippet"]["title"]} />
                                </ListItemButton>                                
                             </ListItem>)}
  </List>
  </Box>
}

function App() {
  const [stage, setStage] = useState([])
  const [stageInfo, setStageInfo] = useState([])

  useEffect(() => {  
    chrome.storage.sync.get("stage", 
    ({stage}) => {
      setStage(stage)        
    })
  }, [])

  useEffect(() => {  
    if (stage.length > 0) {
      fetch(`http://localhost:8000/playlistsInfo?playlistIDs=${stage.join(",")}`)
      .then(r => r.json())
      .then(json => {
        setStageInfo(json) //todo look into if this should be immutable
        console.log(json)
      })      
      .catch(e => console.log(e))     
    } else {
      setStageInfo([])
    }
  }, [stage])
  
  return (
    <div className="App">
      <ThemeProvider theme={theme}>          
          <Button variant="contained" id="appendPlaylistToStageButton" onClick={() => appendPlaylistToStage(setStage)}>Append</Button>
          <Button variant="contained" id="submitStageButton" onClick={submitStage}>Submit</Button>
          <Button variant="contained" id="clearStageButton" onClick={() => clearStage(setStage)}>Clear</Button>
          <StageDisplay stage={stage} stageInfo={stageInfo} setStage={setStage}/>
      </ThemeProvider>
    </div>
  );
}

async function removeFromStage(playlistID, stage, setStage) {
  let updatedStage = stage.filter(x=>x!==playlistID)
  chrome.storage.sync.set({stage: updatedStage})
  setStage(updatedStage)
}

async function clearStage(setStage) {
  setStage([])
  chrome.storage.sync.set({stage: []})
}

async function appendPlaylistToStage(setStage) {
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true})
  let playlistIDre = /list=([^&]*)/
  let playlistID = playlistIDre.exec(tab.url)[1]
  chrome.storage.sync.get({stage: []}, ({stage}) => {
      if (!stage.includes(playlistID)) {
        let appendedStage = stage.concat([playlistID])
        chrome.storage.sync.set({stage: appendedStage})
        setStage(appendedStage)
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
