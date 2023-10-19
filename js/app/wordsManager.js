'use strict';

import db from "../db/db.js";

let wordLists = null;
let thisGame = null;

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
    wordsPerGame,
    wordKey,
    words: wordLists[wordKey].sort((a, b) => 0.5 - Math.random()).slice(0, wordsPerGame)
  }

  clearGameBoard();
  const gameboardEl = document.getElementById('gameboard');

  for (let i = 0; i < thisGame.wordsPerGame; i++) {
    const div = document.createElement('div');
    div.id = 'word-' + i;
    div.classList.add('word');
    div.innerText = thisGame.words[i];

    div.onclick = (event) => {
      if (div.classList.contains('clicked')) {
        div.classList.remove('clicked');

      } else {
        div.classList.add('clicked');
      }
    };

    gameboardEl.appendChild(div);
  }
}
