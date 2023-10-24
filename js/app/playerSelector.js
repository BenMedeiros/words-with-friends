'use strict';


import {LabelInputType} from "../../html/tinyComponents/LabelInputType.js";
import {SelectInputType} from "../../html/tinyComponents/SelectInputType.js";
import clientActions from "../../server/client/clientActions.js";
import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import userMessage from "./userMessage.js";

/*
* Creates player selection drop down
* */

const playerSelectInput = new SelectInputType('player', 'Player', null,
  null, {0: 'Create New Player'}, false);

export function createPlayerSelector() {
  playerSelectInput.createElementIn(document.getElementById("navigation-bar"));

  console.log(playerSelectInput.element);
  document.addEventListener('new-server-response', () => {
    //  SelectInputType will handle checking for changes
    const playersMap = {};
    for (const player of clientActions.getCachedGameState().players) {
      playersMap[player.deviceId] = `(${player.deviceId}) ${player.name} - ${player.team.toUpperCase()}`;
    }
    playerSelectInput.setValuesMap(playersMap);
  });

  playerSelectInput.element.onchange = () => {
    userMessage.msg('Player Change ' + playerSelectInput.getValue());
    clientActions.bindDeviceId(Number(playerSelectInput.getValue()));
  };
}

export async function addFakePlayers() {
  clientActions.bindDeviceId(1);
  await clientActions.updatePlayer('ben', 'red');
  clientActions.bindDeviceId(2);
  await clientActions.updatePlayer('sam', 'red');
  clientActions.bindDeviceId(3);
  await clientActions.updatePlayer('dave', 'blue');
  clientActions.bindDeviceId(4);
  await clientActions.updatePlayer('paul', 'blue');
}
