'use strict';

import {getLastSavedGameState, saveGameState} from "./dbLocalStorage.js";

export const gameState = await getLastSavedGameState();
if(Object.keys(gameState).length === 0){
 console.log('no previous game state so initializing');
 initializeGameState();
}
bindCommonFunctions(gameState);

// starts a new game
export function initializeGameState() {
  gameState.players = [
    // {
    //   deviceId: 81233, // random unique device id assigned by server
    //   name: 'player1',
    //   team: 'red'
    // }
  ];
  // current game spymasters
  gameState.spymasterBlue = null;
  gameState.spymasterRed = null;

  gameState.isGameStarted = false;
  gameState.gameStartTime = null;
  gameState.gameEndTime = null;
  gameState.winner = null;
  // which team's turn
  gameState.turn = {
    turn: 0,
    isRedTurn: true,
    startTime: null,
    clue: null,
    count: 0
  };
  gameState.wordsPerGame = 20;
  // which word list is being used
  gameState.wordKey = null;
  // list of available wordKeys
  gameState.wordLists = [];
  // words used in this game
  gameState.words = [];
  // for each word, its current state
  // contains list of deviceId who have guessed this
  gameState.wordsStates = [];
  // for each word, is the word: red, blue, death, or null/neutral
  gameState.wordsGoal = [];

  // history of guesses per team
  gameState.history = {
    red: [],
    blue: []
  }

  saveGameState(gameState).then();
}

// simple common functions for the gameState
export function bindCommonFunctions(gs) {
  gs.getThisDeviceId = () => gs.thisPlayer ? gs.thisPlayer.deviceId : null;
  gs.getPlayerById = (deviceId) => gs.players.find(el => el.deviceId === deviceId);
  gs.isSpymaster = (deviceId) => (gs.spymasterRed && gs.spymasterRed.deviceId === deviceId)
    || (gs.spymasterBlue && gs.spymasterBlue.deviceId === deviceId);
  gs.getRedPlayers = () => gs.players.filter(el => el.team === 'red');
  gs.getBluePlayers = () => gs.players.filter(el => el.team === 'blue');

  gs.getCountRedGoal = () => gs.wordsGoal.filter(el => el === 'red').length;
  gs.getCountBlueGoal = () => gs.wordsGoal.filter(el => el === 'blue').length;
  gs.getCountRedCurrent = () => gs.wordsStates.filter(el => el === 'red').length;
  gs.getCountBlueCurrent = () => gs.wordsStates.filter(el => el === 'blue').length;

  gs.getTurnTeam = () => gs.turn.isRedTurn ? 'red' : 'blue';
  gs.isTeamTurn = (deviceId) => {
    const player = gs.getPlayerById(deviceId);
    return player && player.team === gs.getTurnTeam();
  };
}

export function nextTurn() {
  checkGameOver();
  if (gameState.winner) {
    console.log('WINNER');
    return;
  }

  gameState.turn.turn++;
  gameState.turn.startTime = new Date();
  gameState.turn.isRedTurn = !gameState.turn.isRedTurn;
  gameState.turn.clue = null;
  gameState.turn.count = 0;

  saveGameState(gameState).then();
}

// checks if either team reached death or their color, ties go to non turn's team
function checkGameOver() {
  if (gameState.wordsStates.filter(el => el === 'death').length === 1) {
    gameState.winner = gameState.turn.isRedTurn ? 'blue' : 'red';

  } else if (gameState.turn.isRedTurn) {
    // ties go to non-turn team
    if (gameState.getCountBlueGoal() === gameState.getCountBlueCurrent()) {
      gameState.winner = 'blue';
    } else if (gameState.getCountRedGoal() === gameState.getCountRedCurrent()) {
      gameState.winner = 'red';
    }
  } else {
    if (gameState.getCountRedGoal() === gameState.getCountRedCurrent()) {
      gameState.winner = 'red';
    } else if (gameState.getCountBlueGoal() === gameState.getCountBlueCurrent()) {
      gameState.winner = 'blue';
    }
  }

  if (gameState.winner) gameState.gameEndTime = new Date();
}
