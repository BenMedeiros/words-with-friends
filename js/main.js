'use strict';

import {ButtonType} from "../html/tinyComponents/ButtonType.js";
import {LabelInputType} from "../html/tinyComponents/LabelInputType.js";
import clientActions from "../server/client/clientActions.js";
import {runAllTests} from "../test/test_server_based_happy_path.js";
import {updateWordBoxes} from "./app/gameboard.js";
import {addFakePlayers, createPlayerSelector} from "./app/playerSelector.js";
import validations from "../server/client/validations.js";
import userMessage from "./app/userMessage.js";
import {createClueElement, createSubmitGuessesBtn} from "./app/playerActions.js";
import {startTimer} from "./app/teamAndTimer.js";

const navBarEl = document.getElementById("navigation-bar");
const mainEl = document.getElementById("main");

// how often to background try to poll, clientActions will prevent too unneccessary polling
setInterval(clientActions.poll, 5000);

async function start() {
  await clientActions.poll();

  for (const key of clientActions.getCachedGameState().wordLists) {
    new ButtonType('new-game' + key, 'New Game - ' + key,
      async () => {
        await clientActions.newGame(key);
        updateWordBoxes();
        startTimer();
      },
      false, null, navBarEl);
  }
  // fake players button
  const fakePlayersBtnType = new ButtonType('add-fake-players', 'Add Fake Players',
    addFakePlayers,
    false, null,
    document.getElementById("controls-bar"));

  // start button
  const startBtnType = new ButtonType('start-game', 'Start Game',
    clientActions.startGame,
    true, null, navBarEl);
  document.addEventListener('new-server-response', () => {
    fakePlayersBtnType.disableIf(clientActions.getCachedGameState().players.length > 3);
    startBtnType.disableIf(validations.startGame(clientActions.getCachedGameState()));
  });

}

createPlayerSelector();

start().then(() => {
  // runAllTests.then();
  createSubmitGuessesBtn();
  createClueElement();

});
