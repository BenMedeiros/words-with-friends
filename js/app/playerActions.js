'use strict';


import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import clientActions from "../../server/client/clientActions.js";
import validations from "../../server/client/validations.js";
import {LabelInputType} from "../../html/tinyComponents/LabelInputType.js";
import userMessage from "./userMessage.js";

/*
* Controls submit clue and submit guesses elements
*
* */

export function createSubmitGuessesBtn() {
  const btn = new ButtonType('submit-guesses', 'Submit Guesses',
    clientActions.submitGuesses, true, null,
    document.getElementById("controls-bar"));

  document.addEventListener('new-server-response', () => {
    btn.disableIf(validations.submitGuesses(clientActions.getCachedGameState()));
  });
}


export function createClueElement() {
  const lblInputType = new LabelInputType('clue', 'string', 'Clue',
    null, undefined, true);
  lblInputType.createElementIn(document.getElementById("controls-bar"));

  const btn = new ButtonType('submit-clue', 'Submit Clue',
    () => {
      const count = 12;
      //TODO add real code for count
      clientActions.submitClue(lblInputType.getValue(), count)
        .then(() => userMessage.msg('Clue pushed'))
        .catch(e => userMessage.errorMsg(e));
    }, true, null,
    document.getElementById("controls-bar"));


  document.addEventListener('new-server-response', () => {
    const canSubmitClue = !validations.submitClue(clientActions.getCachedGameState());
    lblInputType.readOnlyIf(!canSubmitClue);
    btn.disableIf(!canSubmitClue);

    if (canSubmitClue) {
      lblInputType.setPlaceholder('write a clue');
    } else {
      lblInputType.setPlaceholder('waiting');
    }

    const turn = clientActions.getCachedGameState().turn;
    if (turn.clue) {
      lblInputType.setValue(turn.clue)
    }else{
      lblInputType.setValue(null);
    }

  });


}
