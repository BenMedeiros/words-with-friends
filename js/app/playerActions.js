'use strict';


import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import clientActions from "../../server/client/clientActions.js";
import validations from "../../server/client/validations.js";

/*
* Controls submit clue and submit guesses elements
*
* */


export function createSubmitGuessesBtn() {
  const btn = new ButtonType('submit-guesses', 'Submit Guesses',
    clientActions.submitGuesses, false, null,
    document.getElementById("controls-bar"));

  document.addEventListener('new-server-response', () => {
    btn.disableIf(validations.submitGuesses(clientActions.getCachedGameState()));
  });

}
