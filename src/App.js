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
import Typography from '@mui/material/Typography';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
// adjust theme here https://bareynol.github.io/mui-theme-creator/
const theme = createTheme({
  palette: {
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

const StageDisplay = ({stage, setStage}) => {
  console.log("display")
  console.log(stage)
  return <Box sx={{ width: '100%', maxWidth: 340, bgcolor: 'background.paper' }}>
    <List id="stage">
    {stage.map(playlist => <ListItem disablePadding>
                                <ListItemButton onClick={() => removeFromStage(playlist["id"], stage, setStage)}>
                                  <ListItemIcon>
                                    <CancelIcon />
                                  </ListItemIcon>
                                  <ListItemText primary={playlist["snippet"]["title"]} />
                                </ListItemButton>                                
                             </ListItem>)}
  </List>
  </Box>
}

function App() {
  const [stage, setStage] = useState([])  
  useEffect(() => {  
    chrome.storage.sync.get("stage", 
      ({stage}) => {
        setStage(stage)        
      })
  }, [])

  return (
    <ThemeProvider theme={theme}>    
    <Box className="App">
          <Box className="Header">
            <Typography className="HeaderText" variant="h4">Youtube Mixtape</Typography>
            <Typography className="SubheaderText" variant="subtitle2">Pre-Alpha Build</Typography>
          </Box>
          <Box className="StageButtons">
            <Button disableElevation 
                    variant="outlined" 
                    id="appendPlaylistToStageButton" 
                    onClick={() => appendPlaylistToStage(stage, setStage)}>
                      Append
            </Button>
            <Button disableElevation 
                    variant="outlined" 
                    id="submitStageButton" 
                    onClick={() => submitStage(stage)}>
                      Submit
            </Button>
            <Button disableElevation 
                    variant="outlined" 
                    id="clearStageButton" 
                    onClick={() => clearStage(setStage)}>
                      Clear
            </Button>
          </Box>          
          <Box className="Stage">
            <StageDisplay stage={stage} setStage={setStage}/>      
          </Box>
    </Box>
    </ThemeProvider>
  );
}

async function removeFromStage(playlistID, stage, setStage) {
  let updatedStage = stage.filter(x=>x["id"]!==playlistID)
  chrome.storage.sync.set({stage: updatedStage})
  setStage(updatedStage)
}

async function clearStage(setStage) {
  setStage([])
  chrome.storage.sync.set({stage: []})
}

async function appendPlaylistToStage(stage, setStage) {
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true})
  let playlistIDre = /list=([^&]*)/
  let playlistID = playlistIDre.exec(tab.url)[1]
  
  if (!stage.map(playlist => playlist["id"]).includes(playlistID)) {
    console.log(stage)    
    console.log(playlistID)    
    fetch(`http://localhost:8000/playlistsInfo?playlistIDs=${playlistID}`)
    .then(r => r.json())
    .then(newPlaylist => {
      console.log("here")
      console.log(newPlaylist)
      let updatedStage = stage.concat(newPlaylist)
      setStage(updatedStage)
      chrome.storage.sync.set({stage: updatedStage})
    })      
    .catch(e => console.error(e))     
  } else {
    // TODO error playlist already in list
  } 
}

async function submitStage(stage) {
  // chrome.storage.sync.set({stageHistory:stageHistory.concat([stage])})
  let playlistIDs = stage.map(playlist => playlist["id"]).join(",")
  fetch(`http://localhost:8000/ytplsorted?playlistIDs=${playlistIDs}&sortby=ratio`)
      .then(r => r.text())
      .then(url => chrome.tabs.create({ url: url }))
      .catch(e => console.log(e))
}

export default App;
