'use strict';


import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import clientActions from "../../server/client/clientActions.js";
import validations from "../../server/client/validations.js";
import {LabelInputType} from "../../html/tinyComponents/LabelInputType.js";

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


export function createClueElement(){
  const lblInputType = new LabelInputType('clue', 'string', 'Clue',
    null, null, true);
  lblInputType.createElementIn(document.getElementById("controls-bar"));

  document.addEventListener('new-server-response', () => {
    const canSubmitClue = !validations.submitClue(clientActions.getCachedGameState());
    lblInputType.readOnlyIf(!canSubmitClue);
    if(canSubmitClue){
      lblInputType.setPlaceholder('write a clue');
    }else{
      lblInputType.setPlaceholder('waiting');
    }
  });

}
