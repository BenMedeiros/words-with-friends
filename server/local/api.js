'use strict';

import {gameState, initializeGameState, nextTurn} from "./gameState.js";
import {initializeWordLists, selectNewGameWords} from "./wordsManager.js";

export default {
  newGame,
  updatePlayer,
  startGame,
  submitClue
}

let deviceIdCounter = 1;

function newGame() {
  initializeGameState();
  initializeWordLists();
}

// players add themselves to teams, assign a deviceId first time calling api
// can't update player during game, but can add new player
function updatePlayer(name, team, deviceId) {
  if (!deviceId) deviceId = deviceIdCounter++;

  const existingPlayer = gameState.players.find(el => el.deviceId === deviceId);
  if (existingPlayer) {
    if (gameState.isGameStarted) throw new Error('Cant update player during game');
    existingPlayer.team = team;
    existingPlayer.name = name;
    return;
  }

  gameState.players.push({deviceId, name, team});
}

// starts the game, must have 2 team, each with 2 players
// starts game with wordKey to select the word list
function startGame(wordKey) {
  console.log(gameState);
  if (gameState.isGameStarted) throw new Error('Game already started.');
  const redTeam = gameState.players.filter(el => el.team === 'red');
  const blueTeam = gameState.players.filter(el => el.team === 'blue');

  if (redTeam.length < 2) throw new Error('Red team needs more players');
  if (blueTeam.length < 2) throw new Error('Blue team needs more players');

  selectNewGameWords(wordKey);
  gameState.isGameStarted = true;
  gameState.gameStartTime = new Date();
  nextTurn();
  // random spymasters for now
  gameState.spymasterRed = redTeam[Math.floor(Math.random() * redTeam.length)];
  gameState.spymasterBlue = blueTeam[Math.floor(Math.random() * blueTeam.length)];
}

// spymaster for current team should submit a clue for his team
function submitClue(deviceId, clue, count) {
  if(gameState.turn.clue) throw new Error('Clue already submitted for this turn');

  if (gameState.spymasterRed.deviceId === deviceId) {
    if (!gameState.turn.isRedTurn) throw new Error('Not your turn');
  } else if (gameState.spymasterBlue.deviceId === deviceId) {
    if (gameState.turn.isRedTurn) throw new Error('Not your turn');
  } else {
    throw new Error('You are not a spymaster');
  }

  gameState.turn.clue = clue;
  gameState.turn.count = count;
}



