'use strict';

import {ButtonType} from "../html/tinyComponents/ButtonType.js";
import {LabelInputType} from "../html/tinyComponents/LabelInputType.js";
import clientActions from "../server/client/clientActions.js";
import {runAllTests} from "../test/test_server_based_happy_path.js";

const navBarEl = document.getElementById("navigation-bar");
const mainEl = document.getElementById("main");

async function start() {
  await clientActions.poll();
  const gameState = clientActions.getCachedGameState();


  new ButtonType('new-game', 'New Game',
    clientActions.newGame,
    false, null, navBarEl);

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

  for (const key of gameState.wordLists) {
    new ButtonType('start-game' + key, 'Start Game - ' + key,
      async () => {
        await clientActions.startGame(key);
        updateWordBoxes();
        startTimer();
      },
      false, null, navBarEl);
  }



}

// save the currently displayed words to quickly check if they need update
let wordsOnScreenString = null;

// create Word box elements using the gameState.words
function updateWordBoxes() {
  const gameState = clientActions.getCachedGameState();
  const gameboardEl = document.getElementById('gameboard');

  if (wordsOnScreenString !== JSON.stringify(gameState.words)) {
    console.log('rebuilding word boxes');
    wordsOnScreenString = JSON.stringify(gameState.words);
    // remove existing game words if they've changed (from new game)
    let child = gameboardEl.lastElementChild;
    while (child) {
      gameboardEl.removeChild(child);
      child = gameboardEl.lastElementChild;
    }

    // create new word tiles
    for (let i = 0; i < gameState.wordsPerGame; i++) {
      const div = document.createElement('div');
      div.id = 'word-' + i;
      div.classList.add('word');
      div.innerText = gameState.words[i];
      div.onclick = clickWordBox.bind(null, i);
      gameboardEl.appendChild(div);
    }
  }

//  TODO compare wordsStates to populated and update
  for (let i = 0; i < gameState.wordsStates.length; i++) {
    const div = document.getElementById('word-' + i);
    // things could be in any state, so remove everything
    div.classList.toggle('clicked', gameState.wordsStates[i] === 'clicked');
    div.classList.toggle('red', gameState.wordsStates[i] === 'red');
    div.classList.toggle('blue', gameState.wordsStates[i] === 'blue');
    div.classList.toggle('neutral', gameState.wordsStates[i] === 'neutral');
    div.classList.toggle('death', gameState.wordsStates[i] === 'death');
  }
}


let localGuessIndexes = [];

function clickWordBox(i) {
  const gameState = clientActions.getCachedGameState();

  // it's an array if there are user guesses in it
  if (gameState.wordsStates[i] === null || Array.isArray(gameState.wordsStates[i])) {
    const div = document.getElementById('word-' + i);

    if (localGuessIndexes.indexOf(i) === -1) {
      // add new guess
      localGuessIndexes.push(i);
      div.classList.add('clicked');
    } else {
      // remove that guess
      localGuessIndexes.splice(i, 1);
      div.classList.remove('clicked');
    }
  }
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
