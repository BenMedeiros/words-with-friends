'use strict';

export const gameState = {};

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
  // which team's turn
  gameState.turn = {
    isRedTurn : true,
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
  gameState.wordsStates = [];
  // for each word, is the word: red, blue, death, or null/neutral
  gameState.wordsGoal = [];
}

export function nextTurn(){
  gameState.turn.startTime = new Date();
  gameState.turn.isRedTurn = !gameState.turn.isRedTurn;
  gameState.turn.clue = null;
  gameState.turn.count = 0;
}
