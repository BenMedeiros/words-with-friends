'use strict';

/*
* Routes the api called to local.api.js OR converts to REST POST to hit remote server
*
* */

// controls whether to use local server api or remote server api
import api from "../local/api.js";

const isLocal = true;

export default {
  newGame: isLocal ? api.newGame : async (deviceId) => {
    await post('newGame', {deviceId});
  },
  updatePlayer: isLocal ? api.updatePlayer : async (deviceId, name, team) => {
    await post('updatePlayer', {deviceId, name, team});
  },
  startGame: isLocal ? api.startGame : async (deviceId, wordKey) => {
    await post('startGame', {deviceId, wordKey});
  },
  submitClue: isLocal ? api.submitClue : async (deviceId, clue, count) => {
    await post('submitClue', {deviceId, clue, count});
  },
  markGuesses: isLocal ? api.markGuesses : async (deviceId, guessIndexes) => {
    await post('markGuesses', {deviceId, guessIndexes});
  },
  submitGuesses: isLocal ? api.submitGuesses : async (deviceId) => {
    await post('submitGuesses', {deviceId});
  },
  poll: isLocal ? api.poll : async (deviceId) => {
    await post('poll', {deviceId});
  }
}

async function post(method, params) {
  try {
    const response = await fetch(
      "https://lfiwccnp51.execute-api.us-west-2.amazonaws.com/default/lamda_test_template_restful", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({method, params})
      }
    );

    const result = await response.json();
    console.log("Success:", result);

  } catch (error) {
    console.error("Error:", error);
  }
}
