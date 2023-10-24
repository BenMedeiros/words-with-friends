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
  const clueInputType = new LabelInputType('clue', 'string', 'Clue',
    null, undefined, true);
  clueInputType.createElementIn(document.getElementById("controls-bar"));

  const countInputType = new LabelInputType('clue-count', 'integer', '# Words',
    null, 1, true);
  countInputType.createElementIn(document.getElementById("controls-bar"));

  const btn = new ButtonType('submit-clue', 'Submit Clue',
    () => {
      const clueUserInput = clueInputType.getValue();
      if (clueUserInput && clueUserInput.trim() !== '') {
        clientActions.submitClue(clueUserInput, countInputType.getValue())
          .then(() => userMessage.msg('Clue pushed'))
          .catch(e => userMessage.errorMsg(e));
      } else {
        userMessage.errorMsg('Clue cant be blank.');
      }

    }, true, null,
    document.getElementById("controls-bar"));


  document.addEventListener('new-server-response', () => {
    const canSubmitClue = !validations.submitClue(clientActions.getCachedGameState());
    clueInputType.readOnlyIf(!canSubmitClue);
    countInputType.readOnlyIf(!canSubmitClue);
    btn.disableIf(!canSubmitClue);

    if (canSubmitClue) {
      clueInputType.setPlaceholder('write a clue');
    } else {
      clueInputType.setPlaceholder('waiting');
    }

    const turn = clientActions.getCachedGameState().turn;
    if (turn.clue) {
      clueInputType.setValue(turn.clue)
      countInputType.setValue(turn.count);
    } else {
      clueInputType.setValue(null);
      countInputType.setValue(null);
    }

  });


}
