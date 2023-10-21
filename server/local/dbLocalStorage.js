'use strict';

/*
* Server side code for persisting to DB.  This is for local, so uses localStorage
* dbAWS.js is a mirror of this but hits the DynamoDB
* */

const namespace = 'words-with-friends.';

export async function getDeviceIdCounter() {
  const deviceIdCounter = localStorage.getItem(namespace + 'deviceIdCounter');
  if (!deviceIdCounter) {
    setDeviceIdCounter(100).then();
    return 100;
  }
  return deviceIdCounter;
}

export async function setDeviceIdCounter(deviceId) {
  localStorage.setItem(namespace + 'deviceIdCounter', deviceId);
}

export async function getLastSavedGameState() {
  let lastSave = localStorage.getItem(namespace + 'lastGameState');
  if (!lastSave) return {};
  lastSave = JSON.parse(lastSave);
  // if last game was done or never started, it's useless
  if (!lastSave.isGameStarted || lastSave.winner) {
    console.log('no previous valid game state');
    return {};
  }
  console.log('last game state found and loaded.');
  return lastSave;
}

export async function saveGameState(gameState){
  if(!gameState) return;
  localStorage.setItem(namespace + 'lastGameState', JSON.stringify(gameState));
}

export async function getWordLists(){
  let wordLists = localStorage.getItem(namespace+'words');
  wordLists = JSON.parse(wordLists);
  delete wordLists.id;
  console.log('words loaded from localStorage');
  return wordLists;
}
