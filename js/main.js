'use strict';

import {getWordLists, loadWords, createWordBoxes} from "./app/wordsManager.js";
import {ButtonType} from "../html/tinyComponents/ButtonType.js";
import {becomeSpyMaster} from "./app/spymaster.js";

const navBarEl = document.getElementById("navigation-bar");
const mainEl = document.getElementById("main");

loadWords();

const wordLists = getWordLists();

for (const key of Object.keys(wordLists)) {
  new ButtonType('new-game' + key, 'New Game ' + key,
    () => {
      createWordBoxes(key);
      startTimer();
    },
    false, null, navBarEl);
}

new ButtonType('become-spymaster', 'Become Spymaster ',
  becomeSpyMaster,
  false, null, navBarEl);


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
