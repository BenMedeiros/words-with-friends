'use strict';

/*
* Client actions that call the server api after validating alittle on the user
* side if it's ok.  On local server, they call the api directly, but for remote server
* the router converts them to a REST POST call.
*
* */

// this player id
import clientApiRouter from "./clientApiRouter.js";
import {bindCommonFunctions} from "../shared/sharedFunctions.js";
import validations from "./validations.js";

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

export default {
  getCachedGameState: () => gameState,
  // since we're faking different devices, need to rerun processResponse with the new deviceId
  // shouldn't need to use this except during testing
  bindDeviceId: (spoofId) => {
    deviceId = spoofId;
    gameState.thisPlayer = gameState.getPlayerById(deviceId);
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

  // update action states to enable/disable in UI
  actionStates.updatePlayer = !validations.updatePlayer(gameState);
  actionStates.startGame = !validations.startGame(gameState);
  actionStates.submitClue = !validations.submitClue(gameState, deviceId);
  actionStates.markGuesses = !validations.markGuesses(gameState, deviceId);
  actionStates.submitGuesses = !validations.submitGuesses(gameState, deviceId);

  document.dispatchEvent(new Event('new-server-response'));
}

// polls the server for gameState, will prevent polling if gameState is <15s old
async function poll() {
  // only poll if the data is likely stale
  if (new Date() - lastPoll < 15 * 1000) {
    console.log('supressing poll');
    return;
  }

  const response = await clientApiRouter.poll(deviceId);
  processResponse(response);
}


async function newGame(wordKey) {
  if (!actionStates.newGame) throw new Error('No newGame');

  const response = await clientApiRouter.newGame(deviceId, wordKey);
  processResponse(response);
}

async function updatePlayer(name, team) {
  if (!actionStates.updatePlayer) throw new Error(validations.updatePlayer(gameState));

  const response = await clientApiRouter.updatePlayer(deviceId, name, team);
  processResponse(response);
}

async function startGame() {
  if (!actionStates.startGame) throw new Error(validations.startGame(gameState));

  const response = await clientApiRouter.startGame(deviceId)
  processResponse(response);
}

async function submitClue(clue, count) {
  if (!actionStates.submitClue) {
    console.log(!gameState.isGameStarted, gameState.winner, !gameState.isTeamTurn(deviceId));
    console.log(gameState.turn.clue, gameState.isSpymaster(deviceId));
    throw new Error('No submitClue');
  }

//  this one's localStorage local actually would work fine
  const response = await clientApiRouter.submitClue(deviceId, clue, count);
  processResponse(response);
}

async function markGuesses(guessIndexes) {
  if (!actionStates.markGuesses) throw new Error('No markGuesses' + !(gameState.isSpymaster(deviceId)));

  const response = await clientApiRouter.markGuesses(deviceId, guessIndexes);
  processResponse(response);
}

async function submitGuesses() {
  if (!actionStates.submitGuesses) throw new Error('No submitGuesses');

  const response = await clientApiRouter.submitGuesses(deviceId);
  processResponse(response);
}
