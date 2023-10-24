'use strict';

/*
* Routes the api called to local.api.js OR converts to REST POST to hit remote server
*
* */

// controls whether to use local server api or remote server api
import api from "../localServer/api.js";
import userMessage from "../../js/app/userMessage.js";

const isLocal = true;

export default {
  newGame: (isLocal ? localCall : post).bind(null, 'newGame'),
  updatePlayer: (isLocal ? localCall : post).bind(null, 'updatePlayer'),
  startGame: (isLocal ? localCall : post).bind(null, 'startGame'),
  submitClue: (isLocal ? localCall : post).bind(null, 'submitClue'),
  markGuesses: (isLocal ? localCall : post).bind(null, 'markGuesses'),
  submitGuesses: (isLocal ? localCall : post).bind(null, 'submitGuesses'),
  poll: (isLocal ? localCall : post).bind(null, 'poll'),
}

async function localCall(method, params) {
  try {
    return await api[method](...Object.values(params));
  } catch (e) {
    userMessage.errorMsg(e);
    throw e;
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
