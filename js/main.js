'use strict';

import {getWordLists, loadWords, createWordBoxes, getGameState} from "./app/wordsManager.js";
import {ButtonType} from "../html/tinyComponents/ButtonType.js";
import {becomeSpyMaster} from "./app/spymaster.js";
import {LabelInputType} from "../html/tinyComponents/LabelInputType.js";
import api from "../server/local/api.js";

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
nameInput.onModified(()=>{
  getGameState().player.name = nameInput.getValue();
});




api.newGame();
api.updatePlayer('ben', 'red', 1);
api.updatePlayer('sam', 'red', 2);
api.updatePlayer('dave', 'blue', 3);
api.updatePlayer('paul', 'blue', 4);

api.startGame('food');

api.submitClue(3, 'raw', 2);
api.markGuesses(4, [8,2]);
api.submitGuesses(4);

api.submitClue(1, 'bar', 5);
api.markGuesses(2, [1,4,9]);
api.submitGuesses(2);


api.submitClue(3, 'tool', 2);
api.markGuesses(4, [13]);
api.submitGuesses(4);
