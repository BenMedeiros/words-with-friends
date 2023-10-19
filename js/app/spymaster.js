'use strict';

let isSpyMaster = false;

// user chooses to be spymaster
export function becomeSpyMaster() {
  if (isSpyMaster) {
    console.log('already spymaster');
    return;
  }

  const spymasterEl = document.getElementById('spymaster-msg');
  spymasterEl.innerText = 'You are spymaster';

  isSpyMaster = true;
}

// submits the clue from text entry for the team to review and guess from
export function submitClue(clue) {

}
