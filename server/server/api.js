'use strict';
/*
* Acts as server side code for all of the actions available
* The client side should call these after client side validations to reduce calls
*
* */
import {gameState, initializeGameState, nextTurn} from "./gameState.js";
import {initializeWordLists, selectNewGameWords} from "./wordsManager.js";
import {getSavedPlayer, updateSavedPlayer} from "./playerManager.js";

export default {
  newGame,
  clearPlayers,
  updatePlayer,
  startGame,
  submitClue,
  markGuesses,
  submitGuesses,
  poll
}

initializeWordLists();

function newGame(deviceId, wordKey) {
  initializeGameState();
  initializeWordLists();
  selectNewGameWords(wordKey);

  return poll(deviceId);
}
// clear all players from game
function clearPlayers(deviceId){
  if (gameState.isGameStarted) throw new Error('Game already started.');

  gameState.players = [];
  return poll(deviceId);
}

// players add themselves to teams, assign a deviceId first time calling api
// can't update player during game, but can add new player
function updatePlayer(deviceId, name, team) {
  const savedPlayer = getSavedPlayer(deviceId);
  updateSavedPlayer(savedPlayer, name);

  const playerAlreadyInGame = gameState.players.find(el => el.deviceId === deviceId);
  if (playerAlreadyInGame) {
    console.log('player already in gaem');
    if (gameState.isGameStarted && playerAlreadyInGame.team !== team) {
      throw new Error('Cant update player during game');
    }
    playerAlreadyInGame.team = team;
    playerAlreadyInGame.name = name;
  } else {
    console.log('player not in game');
    gameState.players.push({
      deviceId: savedPlayer.deviceId,
      name: savedPlayer.name,
      team: team
    });
  }

  return poll(deviceId);
}

// starts the game, must have 2 team, each with 2 players
// starts game with wordKey to select the word list
function startGame(deviceId) {
  if (gameState.isGameStarted) throw new Error('Game already started.');
  const redTeam = gameState.getRedPlayers();
  const blueTeam = gameState.getBluePlayers();

  if (redTeam.length < 2) throw new Error('Red team needs more players');
  if (blueTeam.length < 2) throw new Error('Blue team needs more players');

  gameState.isGameStarted = true;
  gameState.gameStartTime = new Date();
  nextTurn();
  // random spymasters for now
  // gameState.spymasterRed = redTeam[Math.floor(Math.random() * redTeam.length)];
  // gameState.spymasterBlue = blueTeam[Math.floor(Math.random() * blueTeam.length)];
  gameState.spymasterBlue = blueTeam[0];
  gameState.spymasterRed = redTeam[0];

  return poll(deviceId);
}

// spymaster for current team should submit a clue for his team
function submitClue(deviceId, clue, count) {
  if (gameState.turn.clue) throw new Error('Clue already submitted for this turn');
  validateIsTurn(deviceId);

  if (!gameState.isSpymaster(deviceId)) {
    throw new Error('You are not a spymaster ' + deviceId);
  }

  gameState.turn.clue = clue;
  gameState.turn.count = count;

  return poll(deviceId);
}

// common check: check if it's player's team's turn
function validateIsTurn(deviceId) {
  if (!gameState.isGameStarted) throw new Error('Game not started');
  if (gameState.winner) throw new Error('Game over, winner is ' + gameState.winner);
  if (!gameState.isTeamTurn(deviceId)) throw new Error('Not your turn');
}

// player marks which words they are guessing, before submitting
// guesses is array of indexes
function markGuesses(deviceId, guessIndexes) {
  if (gameState.isSpymaster(deviceId)) throw new Error('Spymasters cant guess..');
  validateIsTurn(deviceId);

  for (let i = 0; i < gameState.wordsStates.length; i++) {

    // did the user guess this word
    const isGuessed = guessIndexes.indexOf(i) !== -1;

    if (isGuessed) {
      // can't mark a guess if it's already resolved
      if (['red', 'blue', 'death', 'neutral'].indexOf(gameState.wordsStates[i]) !== -1) {
        throw new Error('Word already flagged as ' + gameState.wordsStates[i]);
      }

      if (gameState.wordsStates[i] === null) gameState.wordsStates[i] = [];
      // add player to guessers if not already there
      if (gameState.wordsStates[i].indexOf(deviceId) === -1) {
        gameState.wordsStates[i].push(deviceId);
        console.log('added players guess');
      }
    } else {
      //  remove this player from the guess if they previously guessed it
      if (gameState.wordsStates[i] !== null) {
        const playerIndex = gameState.wordsStates[i].indexOf(deviceId);
        if (playerIndex !== -1) {
          gameState.wordsStates[i].splice(playerIndex, 1);
          console.log('removed player from guess');
          // remove the empty arrays to keep clean
          if (gameState.wordsStates[i].length === 0) gameState.wordsStates[i] = null;
        }
      }
    }
  }

  return poll(deviceId);
}

// submits the guesses that are already in wordStates, all players must have same guesses
function submitGuesses(deviceId) {
  validateIsTurn(deviceId);
  if (gameState.isSpymaster(deviceId)) throw new Error('spymaster cant submit the guesses.');
  // includes spymaster as player
  const playersInTurn = gameState.turn.isRedTurn ? gameState.getRedPlayers().length : gameState.getBluePlayers().length;

  const guessIndexes = [];
  for (let i = 0; i < gameState.wordsStates.length; i++) {
    if (!Array.isArray(gameState.wordsStates[i])) continue;
    console.log('submit guesss api', gameState.wordsStates[i].length, gameState.getRedPlayers(), gameState.getBluePlayers());
    if (gameState.wordsStates[i].length !== playersInTurn - 1) {
      throw new Error('All players must agree on the vote.');
    }

    guessIndexes.push(i);
  }

  if (guessIndexes.length === 0) throw new Error('Must have guesses to submit.');
  if (guessIndexes.length > gameState.turn.count) {
    throw new Error('Max guesses allowed for this clue: ' + gameState.turn.count);
  }

  // update the wordsStates with actuals from wordsGoals
  for (const guessIndex of guessIndexes) {
    gameState.wordsStates[guessIndex] = gameState.wordsGoal[guessIndex];
  }
  // save the guesses in history
  gameState.history[gameState.getTurnTeam()].push({
    clue: gameState.turn.clue,
    count: gameState.turn.count,
    guessIndexes
  });

  nextTurn();

  return poll(deviceId);
}

// returns the state of the game for player, removes sensitive info
function poll(deviceId) {
  const response = Object.assign({}, gameState);
  if (!gameState.isGameStarted || !gameState.isSpymaster(deviceId)) {
    delete response.wordsGoal;
  }

  console.log('server poll', deviceId, gameState.getPlayerById(deviceId));
  const playerAlreadyInGame = gameState.getPlayerById(deviceId);
  if (playerAlreadyInGame) {
    response.thisPlayer = playerAlreadyInGame;
    return response;
  } else {
    const newPlayer = getSavedPlayer(deviceId);
    return updatePlayer(newPlayer.deviceId, newPlayer.name, gameState.getTeamLessPlayers());
  }
}
