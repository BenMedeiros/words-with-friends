'use strict';


import {getGameState, updateGameState} from "./wordsManager.js";
import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import {becomeSpyMaster, submitClue} from "./spymaster.js";

let isTeamOne = true;

// toggle the guess of the wordbox based on current state
export function toggleGuess(i) {
  const div = document.getElementById('word-' + i);

  const thisGame = getGameState();

  if (thisGame.wordsStates[i] === null) {
    div.classList.add('clicked');
    thisGame.wordsStates[i] = 'clicked';
    doGuessesExist();
  } else if (thisGame.wordsStates[i] === 'clicked') {
    div.classList.remove('clicked');
    thisGame.wordsStates[i] = null;
    doGuessesExist();
  }
}

// check the game state for 'clicked' which are guesses,
// controls the submit guess btn
function doGuessesExist() {
  const thisGame = getGameState();
  const guessesExist = thisGame.wordsStates.indexOf('clicked') !== -1
  if (guessesExist) {
    btn.enable();
  } else {
    btn.disable();
  }
}

// submit the guesses to server
function submitGuess() {
  console.log('guesses submitted to server');
  // temp pretend if they were right/wrong
  const thisGame = getGameState();

  for (let i = 0; i < thisGame.wordsStates.length; i++) {
    if (thisGame.wordsStates[i] === 'clicked') {
      //  fake logic
      if (i % 2 === 0) {
        thisGame.wordsStates[i] = 'red';

      } else {
        thisGame.wordsStates[i] = 'blue';
      }
    }
  }

  updateGameState();
}



const btn = new ButtonType('submit-guess', 'Submit Guess',
  submitGuess,
  true, null, document.getElementById("controls-bar"));
