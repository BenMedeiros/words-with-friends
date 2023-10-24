'use strict';

import clientActions from "../../server/client/clientActions.js";

const teamTurnEl = document.getElementById("team-turn");
const teamTurnColorEl = document.getElementById("team-turn-color");
const timerEl = document.getElementById("timer");

document.addEventListener('new-server-response', () => {
  const team = clientActions.getCachedGameState().getTurnTeam();

  if (team !== teamTurnColorEl.style.backgroundColor) {
    teamTurnColorEl.style.backgroundColor = team;
    teamTurnEl.innerText = team.toUpperCase() + ' Turn';
  }
});

let timerIntervalId = null;

export function startTimer() {
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

