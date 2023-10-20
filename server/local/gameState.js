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
  gameState.gameEndTime = null;
  gameState.winner = null;
  // which team's turn
  gameState.turn = {
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
//  history of guesses per team
  gameState.history = {
    red: [],
    blue: []
  }

//  simple common functions
  gameState.getPlayerById = (deviceId) => gameState.players.find(el => el.deviceId === deviceId);
  gameState.isSpymaster = (deviceId) => gameState.spymasterRed.deviceId === deviceId || gameState.spymasterBlue.deviceId === deviceId;
  gameState.getRedPlayers = () => gameState.players.filter(el => el.team === 'red');
  gameState.getBluePlayers = () => gameState.players.filter(el => el.team === 'blue');

  gameState.getCountRedGoal = () => gameState.wordsGoal.filter(el => el === 'red').length;
  gameState.getCountBlueGoal = () => gameState.wordsGoal.filter(el => el === 'blue').length;
  gameState.getCountRedCurrent = () => gameState.wordsStates.filter(el => el === 'red').length;
  gameState.getCountBlueCurrent = () => gameState.wordsStates.filter(el => el === 'blue').length;

  gameState.getTurnTeam = () => gameState.turn.isRedTurn ? 'red' : 'blue';
}

export function nextTurn() {
  checkGameOver();
  if (gameState.winner) {
    console.log('WINNER');
    return
  }

  gameState.turn.startTime = new Date();
  gameState.turn.isRedTurn = !gameState.turn.isRedTurn;
  gameState.turn.clue = null;
  gameState.turn.count = 0;
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
