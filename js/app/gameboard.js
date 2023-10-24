'use strict';

import clientActions from "../../server/client/clientActions.js";
import validations from "../../server/client/validations.js";
import userMessage from "./userMessage.js";

/*
* Manages creation of board word boxes, and toggles the css classes based on client
* gameState.
*
* */

// store local guesses since these may be different than what the server thinks
// ultimately what the client says they've clicked is most accurate
let localGuessIndexes = [];
let localGuessTurn = null;
let localGuessDeviceId = null;

document.addEventListener('new-server-response', updateWordBoxes);

// pool the markGuesses to prevent tons of api requests
let timeoutMarkGuesses = null;
let lastGuessesSentString = null;

// save the currently displayed words to quickly check if they need update
let wordsOnScreenString = null;

// create Word box elements using the gameState.words
export function updateWordBoxes() {
  userMessage.msg('Server Response');

  const gameState = clientActions.getCachedGameState();

  if (wordsOnScreenString !== JSON.stringify(gameState.words)) {
    const gameboardEl = document.getElementById('gameboard');

    userMessage.msg('Rebuilding word boxes');
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

  updateWordBoxClassStates();
}

// update word boxes using gameState.wordsStates every time we poll
function updateWordBoxClassStates() {
  const gameState = clientActions.getCachedGameState();
  checkClearLocalGuesses();

//  TODO compare wordsStates to populated and update
  for (let i = 0; i < gameState.wordsStates.length; i++) {
    const div = document.getElementById('word-' + i);

    const indexOfLocalGuess = localGuessIndexes.indexOf(i);
    if (indexOfLocalGuess !== -1) {
      if (['red', 'blue', 'death', 'neutral'].indexOf(gameState.wordsStates[i]) !== -1) {
        //  this word has been marked so isn't a valid guess
        div.classList.remove('clicked');
        // remove that guess
        localGuessIndexes.splice(indexOfLocalGuess, 1);
      } else {
        div.classList.add('clicked');
      }
    } else {
      div.classList.remove('clicked');
    }

    // things could be in any state, so remove everything
    div.classList.toggle('red', gameState.wordsStates[i] === 'red');
    div.classList.toggle('blue', gameState.wordsStates[i] === 'blue');
    div.classList.toggle('neutral', gameState.wordsStates[i] === 'neutral');
    div.classList.toggle('death', gameState.wordsStates[i] === 'death');
  }
}

function clickWordBox(wordIndex) {
  const gameState = clientActions.getCachedGameState();

  // can't click on words already in these states
  const validationMsg = validations.clickWordBox(gameState, wordIndex);
  if (!validationMsg) {
    const div = document.getElementById('word-' + wordIndex);
    const indexOfLocalGuess = localGuessIndexes.indexOf(wordIndex);

    if (indexOfLocalGuess === -1) {
      // add new guess
      localGuessIndexes.push(wordIndex);
      div.classList.add('clicked');
      userMessage.msg('clicked ' + gameState.words[wordIndex]);
    } else {
      // remove that guess
      localGuessIndexes.splice(indexOfLocalGuess, 1);
      div.classList.remove('clicked');
      userMessage.msg('removed ' + gameState.words[wordIndex]);
    }
    pooledMarkGuesses();

  } else {
    userMessage.errorMsg(validationMsg);
  }
}

// when a new response comes, if the turn changed clear player's guesses
// also check if player changed (which should happen during testing only)
function checkClearLocalGuesses() {
  const gameState = clientActions.getCachedGameState();

  if (gameState.getThisDeviceId() !== localGuessDeviceId) {
    localGuessDeviceId = gameState.getThisDeviceId();
    localGuessIndexes.length = 0;
  }
  if (gameState.turn.turn !== localGuessTurn) {
    localGuessTurn = gameState.turn.turn;
    localGuessIndexes.length = 0;
  }
}

// submit the guesses to server but wait for user to stop clicking
function pooledMarkGuesses() {
  if (timeoutMarkGuesses) clearTimeout(timeoutMarkGuesses);

  timeoutMarkGuesses = setTimeout(() => {
    if (lastGuessesSentString === JSON.stringify(localGuessIndexes)) {
      userMessage.msg('not sending, since no changes');
      return;
    }

    clientActions.markGuesses(localGuessIndexes)
      .then(() => userMessage.msg('Guesses pushed to server'))
      .catch(e => {
        console.error(e);
        userMessage.errorMsg(e + 'error');
      });
    // save what was just sent to compare, and only send if different
    lastGuessesSentString = JSON.stringify(localGuessIndexes);

  }, 3000);
}
