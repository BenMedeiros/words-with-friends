'use strict';

import db from "../../server/db/db.js";
import {toggleGuess} from "./playerTurn.js";

let wordLists = null;
let thisGame = null;

export function getGameState() {
  return thisGame;
}

// loads the words from server if not in localStorage
export function loadWords() {
  wordLists = localStorage.getItem('words-with-friends.words');
  if (wordLists) {
    wordLists = JSON.parse(wordLists);
    console.log('words loaded from localStorage');

  } else {
    //    get from server
    db.get('words').then(res => {
      wordLists = {};

      for (const [key, listString] of Object.entries(res)) {
        if (key === 'id') continue;
        wordLists[key] = JSON.parse(listString);
      }
      // save so that we don't have to bother the server again
      localStorage.setItem('words-with-friends.words', JSON.stringify(wordLists));
    });
  }
}

export function getWordLists() {
  return wordLists;
}

function clearGameBoard() {
  const gameboardEl = document.getElementById('gameboard');

  // remove existing game words
  let child = gameboardEl.lastElementChild;
  while (child) {
    gameboardEl.removeChild(child);
    child = gameboardEl.lastElementChild;
  }
}


export function createWordBoxes(wordKey) {
  const wordsPerGame = 20;

  thisGame = {
    player: {
      name: null,
      team: 'red',
      isSpymaster: false
    },
    wordsPerGame,
    wordKey,
    words: wordLists[wordKey].sort((a, b) => 0.5 - Math.random()).slice(0, wordsPerGame),
    wordsStates: new Array(wordsPerGame).fill(null)
  }

  clearGameBoard();
  const gameboardEl = document.getElementById('gameboard');

  for (let i = 0; i < thisGame.wordsPerGame; i++) {
    const div = document.createElement('div');
    div.id = 'word-' + i;
    div.classList.add('word');
    div.innerText = thisGame.words[i];

    div.onclick = toggleGuess.bind(null, i);

    gameboardEl.appendChild(div);
  }
}

// get updated state from server and update the words/colors
export function updateGameState() {
  console.log(thisGame);

  db.post('gameState', JSON.stringify(thisGame)).then((res) => {
    console.log(res);
  });

  for (let i = 0; i < thisGame.wordsStates.length; i++) {
    const div = document.getElementById('word-' + i);

    // things could be in any state, so remove everything
    div.classList.toggle('clicked', thisGame.wordsStates[i] === 'clicked');
    div.classList.toggle('red', thisGame.wordsStates[i] === 'red');
    div.classList.toggle('blue', thisGame.wordsStates[i] === 'blue');

  }
}
