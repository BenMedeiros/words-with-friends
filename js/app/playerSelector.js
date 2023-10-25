'use strict';

import {SelectInputType} from "../../html/tinyComponents/SelectInputType.js";
import clientActions from "../../server/client/clientActions.js";
import userMessage from "./userMessage.js";

/*
* Creates player selection drop down
* */

const playerSelectInput = new SelectInputType('player', 'Player', null,
  null, {0: 'Create New Player'}, false);

export function createPlayerSelector() {
  playerSelectInput.createElementIn(document.getElementById("navigation-bar"));
  // update the players drop down on every response
  document.addEventListener('new-server-response', () => {
    const gameState = clientActions.getCachedGameState();
    //  SelectInputType will handle checking for changes
    const playersMap = {};
    for (const player of gameState.players) {
      playersMap[player.deviceId] = `(${player.deviceId}) ${player.name} - ${player.team.toUpperCase()}`
        + (gameState.isSpymaster(player.deviceId) ? ' SPY' : '');
    }
    playerSelectInput.setValuesMap(playersMap);
    if (Number(playerSelectInput.getValue()) !== Number(gameState.thisPlayer.deviceId)) {
      playerSelectInput.selectValue(gameState.thisPlayer.deviceId);
    }
  });

  playerSelectInput.element.onchange = () => {
    userMessage.msg('Player Change ' + playerSelectInput.getValue());
    clientActions.bindDeviceId(Number(playerSelectInput.getValue()));
  };
}
