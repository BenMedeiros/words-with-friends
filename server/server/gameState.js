'use strict';

import {getLastSavedGameState, saveGameState} from "./db.js";
import {bindCommonFunctions} from "../shared/sharedFunctions.js";

export const gameState = await getLastSavedGameState() || {};

if (Object.keys(gameState).length === 0) {
  console.log('no previous game state so initializing');
  initializeGameState();
} else if (!gameState.isGameStarted || gameState.winner) {
// if last game was done or never started, it's useless
  console.log('no previous valid game state');
  initializeGameState();
}

bindCommonFunctions(gameState);

// starts a new game
export function initializeGameState() {
  // use the same players if already there
  gameState.players = gameState.players || [];
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
  gameState.wordsPerGame = 24;
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

  if (gameState.winner) {
    gameState.gameEndTime = new Date();
    gameState.isGameStarted = false;
  }

}
