'use strict';

import {ButtonType} from "../html/tinyComponents/ButtonType.js";
import {LabelInputType} from "../html/tinyComponents/LabelInputType.js";
import clientActions from "../server/client/clientActions.js";
import {runAllTests} from "../test/test_server_based_happy_path.js";
import {updateWordBoxes} from "./app/gameboard.js";
import {addFakePlayers, createPlayerSelector} from "./app/playerSelector.js";

const navBarEl = document.getElementById("navigation-bar");
const mainEl = document.getElementById("main");

async function start() {
  await clientActions.poll();
  const gameState = clientActions.getCachedGameState();

  for (const key of gameState.wordLists) {
    new ButtonType('new-game' + key, 'New Game - ' + key,
      async () => {
        await clientActions.newGame(key);
        updateWordBoxes();
        startTimer();
      },
      false, null, navBarEl);
  }

  addFakePlayers();


  new ButtonType('start-game', 'Start Game',
    clientActions.startGame,
    false, null, navBarEl);

}

createPlayerSelector();


const timerEl = document.getElementById("timer");
let timerIntervalId = null;

function startTimer() {
  if (timerIntervalId) clearInterval(timerIntervalId);
  // store the interval to clear it later
  timerIntervalId = setInterval(() => {
    const gameState = clientActions.getCachedGameState();
    if (!(gameState && gameState.turn && gameState.turn.startTime)) {
      timerEl.innerText = '';
    } else {
      const text = Math.round((new Date() - new Date(gameState.turn.startTime)) / 1000) + 's';
      if (text !== timerEl.innerText) timerEl.innerText = text;
    }
  }, 100);
}


start().then(() => {
  // runAllTests.then();
});
