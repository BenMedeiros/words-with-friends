'use strict';

import clientActions from "../../server/client/clientActions.js";
import validations from "../../server/client/validations.js";

/*
* Manages creation of board word boxes, and toggles the css classes based on client
* gameState.
*
* */

document.addEventListener('new-server-response', updateWordBoxes);

// save the currently displayed words to quickly check if they need update
let wordsOnScreenString = null;

// create Word box elements using the gameState.words
export function updateWordBoxes() {
  const gameState = clientActions.getCachedGameState();

  if (wordsOnScreenString !== JSON.stringify(gameState.words)) {
    const gameboardEl = document.getElementById('gameboard');

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
      gameboardEl.appendChild(div);
    }
  }

  updateWordBoxClassStates();
}

// update word boxes using gameState.wordsStates every time we poll
function updateWordBoxClassStates() {
  const gameState = clientActions.getCachedGameState();

//  TODO compare wordsStates to populated and update
  for (let i = 0; i < gameState.wordsStates.length; i++) {
    const div = document.getElementById('word-' + i);

    if (validations.clickWordBox(gameState, i)) {
      //  if user can't click the word box, disable it
      div.onclick = null;
    } else {
      div.onclick = clickWordBox.bind(null, i);
    }

    // things could be in any state, so remove everything
    div.classList.toggle('clicked', gameState.wordsStates[i] === 'clicked');
    div.classList.toggle('red', gameState.wordsStates[i] === 'red');
    div.classList.toggle('blue', gameState.wordsStates[i] === 'blue');
    div.classList.toggle('neutral', gameState.wordsStates[i] === 'neutral');
    div.classList.toggle('death', gameState.wordsStates[i] === 'death');
  }
}

// store local guesses since these may be different than what the server thinks
// ultimately what the client says they've clicked is most accurate
let localGuessIndexes = [];

function clickWordBox(wordIndex) {
  const gameState = clientActions.getCachedGameState();

  // can't click on words already in these states
  if (!validations.clickWordBox(gameState, wordIndex)) {
    const div = document.getElementById('word-' + wordIndex);

    if (localGuessIndexes.indexOf(wordIndex) === -1) {
      // add new guess
      localGuessIndexes.push(wordIndex);
      div.classList.add('clicked');
    } else {
      // remove that guess
      localGuessIndexes.splice(wordIndex, 1);
      div.classList.remove('clicked');
    }
  }
}
