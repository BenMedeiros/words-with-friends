'use strict';

import {ButtonType} from "../html/tinyComponents/ButtonType.js";
import {LabelInputType} from "../html/tinyComponents/LabelInputType.js";
import clientActions from "../server/client/clientActions.js";
import {runAllTests} from "../test/test_server_based_happy_path.js";
import {updateWordBoxes} from "./app/gameboard.js";

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

  new ButtonType('add-fake-players', 'Add Fake Players',
    async () => {
      clientActions.bindDeviceId(1);
      await clientActions.updatePlayer('ben', 'red');
      clientActions.bindDeviceId(2);
      await clientActions.updatePlayer('sam', 'red');
      clientActions.bindDeviceId(3);
      await clientActions.updatePlayer('dave', 'blue');
      clientActions.bindDeviceId(4);
      await clientActions.updatePlayer('paul', 'blue');
    },
    false, null, navBarEl);


  new ButtonType('start-game', 'Start Game',
    clientActions.startGame,
    false, null, navBarEl);

}






const timerEl = document.getElementById("timer");
let startTime = new Date();
let timerIntervalId = null;

function startTimer() {
  startTime = new Date();
  if (timerIntervalId) clearInterval(timerIntervalId);
  // store the interval to clear it later
  timerIntervalId = setInterval(() => {
    const text = Math.round((new Date() - startTime) / 1000) + 's';
    if (text !== timerEl.innerText) timerEl.innerText = text;
  }, 100);
}


const nameInput = new LabelInputType('item', 'string', null,
  null, 'name', false);
nameInput.createElementIn(navBarEl);
nameInput.onModified(() => {
  console.log(nameInput.getValue());
});


start().then(() => {
  // runAllTests.then();
});
