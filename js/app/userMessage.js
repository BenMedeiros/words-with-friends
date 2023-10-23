'use strict';

import clientActions from "../../server/client/clientActions.js";

/*
* Handler for displaying messages to user based on errors, validations, and current
* turn info.
* */


const msgEl = document.getElementById("msg");
const errorMsgEl = document.getElementById("error-msg");
const teamTurnEl = document.getElementById("team-turn");
const teamTurnColorEl = document.getElementById("team-turn-color");
const timerEl = document.getElementById("timer");

document.addEventListener('new-server-response', () => {
  const team = clientActions.getCachedGameState().getTurnTeam();

  if(team !== teamTurnColorEl.style.backgroundColor){
    teamTurnColorEl.style.backgroundColor = team;
    teamTurnEl.innerText = team.toUpperCase() + ' Turn';
  }
});

export default {
  msg: (msg) => {
    msgEl.innerText = msg;
  },
  errorMsg: (msg) => {
    errorMsgEl.innerText = msg;
    errorMsgEl.style.display = null;
    // remove error msg after 3 seconds
    if (errorMsgTimeout) clearTimeout(clearErrorMsg);
    errorMsgTimeout = setTimeout(clearErrorMsg, 3000);
  },
  startTimer
}

let errorMsgTimeout = null

function clearErrorMsg() {
  // errorMsgEl.innerText = '';
  // display none is better otherwise certain css styles affect it
  errorMsgEl.style.display = 'none';
}

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


