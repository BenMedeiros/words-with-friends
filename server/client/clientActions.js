'use strict';

/*
* Client actions that call the server api after validating alittle on the user
* side if it's ok.  On local server, they call the api directly, but for remote server
* the router converts them to a REST POST call.
*
* */

// this player id
import api from "../local/api.js";
import {bindCommonFunctions} from "../local/gameState.js";

let deviceId = null;
let gameState = null;
let lastPoll = null;

// stores the states of whether user can submit these actions
// coincide directly with the api's Error validations
const actionStates = {
  newGame: true,
  updatePlayer: true,
  startGame: false,
  submitClue: false,
  markGuesses: false,
  submitGuesses: false
}

setInterval(poll, 20000);


export default {
  // since we're faking different devices, need to rerun processResponse with the new deviceId
  // shouldn't need to use this except during testing
  bindDeviceId: (spoofId) => {
    deviceId = spoofId;
    processResponse(gameState);

  },
  poll,
  newGame,
  updatePlayer,
  startGame,
  submitClue,
  markGuesses,
  submitGuesses,
}


function processResponse(response) {
  if (!response) return;
  gameState = JSON.parse(JSON.stringify(response));
  console.log(gameState);
  lastPoll = new Date();

  if (!deviceId) {
    if (response.thisPlayer && response.thisPlayer.deviceId) {
      deviceId = response.thisPlayer.deviceId;
    }
  }

  bindCommonFunctions(gameState);
  console.log(JSON.stringify(gameState.getRedPlayers()),
    JSON.stringify(gameState));

  // update action states to enable/disable in UI

  actionStates.updatePlayer = !(gameState.isGameStarted);

  actionStates.startGame = !gameState.isGameStarted
    && gameState.getRedPlayers().length >= 2 && gameState.getBluePlayers().length >= 2;

  if (!gameState.isGameStarted || gameState.winner || !gameState.isTeamTurn(deviceId)) {
    actionStates.submitClue = false;
    actionStates.markGuesses = false;
    actionStates.submitGuesses = false;
  } else {
    actionStates.submitClue = !gameState.turn.clue && gameState.isSpymaster(deviceId);
    // markGuesses also needs validation on the per click of word
    actionStates.markGuesses = !gameState.isSpymaster(deviceId);
    // need to validate player agreed on votes
    actionStates.submitGuesses = !gameState.isSpymaster(deviceId);
  }
}

async function poll() {
  // only poll if the data is likely stale
  if (new Date() - lastPoll < 15 * 1000) {
    console.log('supressing poll');
    return;
  }

  const response = await api.poll(deviceId);
  console.log('poll', JSON.stringify(response));
  processResponse(response);
}


async function newGame() {
  if (!actionStates.newGame) throw new Error('No newGame');

  const response = await api.newGame(deviceId);
  processResponse(response);
}

async function updatePlayer(name, team) {
  if (!actionStates.updatePlayer) throw new Error('No updatePlayer');

  const response = await api.updatePlayer(deviceId, name, team);
  processResponse(response);
}

async function startGame(wordKey) {
  if (!actionStates.startGame) throw new Error('No startGame' + JSON.stringify(gameState.players));

  const response = await api.startGame(deviceId, wordKey)
  processResponse(response);
}

async function submitClue(clue, count) {
  if (!actionStates.submitClue) {
    console.log(!gameState.isGameStarted , gameState.winner , !gameState.isTeamTurn(deviceId));
    console.log(gameState.turn.clue , gameState.isSpymaster(deviceId));
    throw new Error('No submitClue');
  }

//  this one's localStorage local actually would work fine
  const response = await api.submitClue(deviceId, clue, count);
  processResponse(response);
}

async function markGuesses(guessIndexes) {
  if (!actionStates.markGuesses) throw new Error('No markGuesses' + !(gameState.isSpymaster(deviceId)));

  const response = await api.markGuesses(deviceId, guessIndexes);
  processResponse(response);
}

async function submitGuesses() {
  if (!actionStates.submitGuesses) throw new Error('No submitGuesses');

  const response = await api.submitGuesses(deviceId);
  processResponse(response);
}
