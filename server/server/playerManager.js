'use strict';

/*
* Manages all players and player histories.
* */

import {getDeviceIdCounter, getPlayerList, saveDeviceIdCounter, savePlayerList} from "./db.js";

let fullPlayerList = await getPlayerList() || {};

let deviceIdCounter = await getDeviceIdCounter();


// gets the saved player by deviceId if exists.  If doesn't exist, creates a new player
export function getSavedPlayer(deviceId) {
  if (!deviceId) {
    console.log('No deviceId provided so creating new');
    deviceId = deviceIdCounter++;
    saveDeviceIdCounter(deviceIdCounter).then();
  }

  if (!fullPlayerList[deviceId]) {
    fullPlayerList[deviceId] = {deviceId, name: ''};
    savePlayerList(fullPlayerList).then();
  }

  return fullPlayerList[deviceId];
}

// looks to update the player name if needed and persists to DB
export function updateSavedPlayer(savedPlayer, name) {
  if (savedPlayer.name !== name) {
    savedPlayer.name = name || '';
    fullPlayerList[savedPlayer.deviceId].name = name || '';
    savePlayerList(fullPlayerList).then();
  }
}
