'use strict';

// user chooses to be spymaster
import {getGameState} from "./wordsManager.js";
import {ButtonType} from "../../html/tinyComponents/ButtonType.js";

export function becomeSpyMaster() {
  const gameState = getGameState();
  if (gameState.player.isSpymaster) {
    console.log('already spymaster');
    return;
  }

  const spymasterEl = document.getElementById('spymaster-msg');
  spymasterEl.innerText = 'You are spymaster';

  gameState.player.isSpymaster = true;
  btnType.setValue('Remove Spymaster');
}

export function removeSpyMaster() {
  const gameState = getGameState();
  if (!gameState.player.isSpymaster) {
    console.log('already not spymaster');
    return;
  }

  const spymasterEl = document.getElementById('spymaster-msg');
  spymasterEl.innerText = '';

  gameState.player.isSpymaster = false;
  btnType.setValue('Be Spymaster');
}

export function toggleSpymaster() {
  const gameState = getGameState();
  if (gameState.player.isSpymaster) {
    console.log('remove');
    removeSpyMaster();
  } else {
    console.log('become', gameState );
    becomeSpyMaster();
  }
}

// submits the clue from text entry for the team to review and guess from
export function submitClue(clue) {
  // db.post('clue', clue).then();
}

const btnType = new ButtonType('become-spymaster',
  'Become Spymaster ',
  toggleSpymaster,
  false, null,
  document.getElementById("navigation-bar")
);
