'use strict';

import clientActions from "../../server/client/clientActions.js";

const teamTurnEl = document.getElementById("team-turn");
const teamTurnColorEl = document.getElementById("team-turn-color");
const timerEl = document.getElementById("timer");
const turnMsgEl = document.getElementById("turn-msg");


document.addEventListener('new-server-response', () => {
  const gameState = clientActions.getCachedGameState();
  const team = gameState.getTurnTeam();

  if (team !== teamTurnColorEl.style.backgroundColor) {
    teamTurnColorEl.style.backgroundColor = team;
    teamTurnEl.innerText = team.toUpperCase() + ' Turn ' + gameState.turn.turn;
  }

  if (!gameState.isGameStarted) {
    turnMsgEl.innerText = 'Waiting to Start Game';
  } else if (gameState.winner) {
    turnMsgEl.innerText = 'GAME OVER - Winner - ' + gameState.winner.toUpperCase();
  } else if (!gameState.turn.clue) {
    turnMsgEl.innerText = 'Spymaster Thinking';
  } else {
    turnMsgEl.innerText = 'Team Guessing';
  }

});

let timerIntervalId = null;

export function startTimer() {
  if (timerIntervalId) clearInterval(timerIntervalId);
  // store the interval to clear it later
  timerIntervalId = setInterval(() => {
    const gameState = clientActions.getCachedGameState();
    if (!(gameState && gameState.turn && gameState.turn.startTime && !gameState.winner)) {
      timerEl.innerText = '';
    } else {
      const text =  Math.round((new Date() - new Date(gameState.turn.startTime)) / 1000) + 's';
      if (text !== timerEl.innerText) timerEl.innerText = text;
    }
  }, 100);
}

