'use strict';

/*
* Pop up screen showing Win information
* uses winScreen.css
* */


import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import clientActions from "../../server/client/clientActions.js";
import {SelectInputType} from "../../html/tinyComponents/SelectInputType.js";
import {LabelInputType} from "../../html/tinyComponents/LabelInputType.js";

let winScreenElement = null;

// create screen to show if player won or lost
function createWinScreen() {
  if (winScreenElement) return;
  const gameState = clientActions.getCachedGameState();

  winScreenElement = document.createElement("div");
  winScreenElement.id = 'win-screen';
  winScreenElement.classList.add('win-screen');

  const div = document.createElement("div");
  div.innerText = 'Game Over';
  div.style.fontSize = 'xx-large';
  winScreenElement.appendChild(div);

  if (gameState.winner) {
    const div2 = document.createElement("div");
    div2.innerText = gameState.winner === gameState.thisPlayer.team ? 'YOU WIN' : 'YOU LOSE';
    div2.style.fontSize = 'xx-large';
    winScreenElement.appendChild(div2);
  }

  const wordsMap = {};
  gameState.wordLists.forEach(el => wordsMap[el] = el);

  if (gameState.winner) {
    const winnerI = new LabelInputType('winner', 'string', 'Winner', null, gameState.winner, true);
    winnerI.createElementIn(winScreenElement);
  }
  //player config
  const nameI = new LabelInputType('name', 'string', 'Name', gameState.thisPlayer.name, 'your name', false);
  nameI.createElementIn(winScreenElement);
  const teamI = new SelectInputType('team', 'Team', null, {red: 'red', blue: 'blue'}, null, false);
  teamI.createElementIn(winScreenElement);
  //game config
  const wordKeyI = new SelectInputType('wordKey', 'Word List', null, wordsMap, null, false);
  wordKeyI.createElementIn(winScreenElement);

  // allow player to update their team and the game wordKey
  const submit = new ButtonType('new-game', 'New Game', async () => {
    // newGame clears players so must be first
    await clientActions.newGame(wordKeyI.getValue());

    if (!gameState.thisPlayer
      || teamI.getValue() !== gameState.thisPlayer.team
      || nameI.getValue() !== gameState.thisPlayer.name) {
      await clientActions.updatePlayer(nameI.getValue(), teamI.getValue());
    }
    closeWinScreen();
  });
  submit.createElementIn(winScreenElement);

  document.getElementById("main").appendChild(winScreenElement);
}

function closeWinScreen() {
  if (!winScreenElement) return;
  winScreenElement.remove();
  winScreenElement = null;
}


export default {
  createWinScreen,
  closeWinScreen
}
