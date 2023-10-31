'use strict';

/*
* Pop up screen showing Win information
* uses winScreen.css
* */


import {ButtonType} from "../../html/tinyComponents/ButtonType.js";
import clientActions from "../../server/client/clientActions.js";
import {SelectInputType} from "../../html/tinyComponents/SelectInputType.js";
import {LabelInputType} from "../../html/tinyComponents/LabelInputType.js";
import {createPlayerIcon} from "./playerSelector.js";

let winScreenElement = null;
// quick access for server responses
let leftDiv = null;
let rightDiv = null;

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
  const idI = new LabelInputType('playerId', 'integer', 'ID', gameState.thisPlayer.deviceId, null, true);
  idI.createElementIn(winScreenElement);
  const nameI = new LabelInputType('name', 'string', 'Name', gameState.thisPlayer.name, 'your name', false);
  nameI.createElementIn(winScreenElement);
  const teamI = new SelectInputType('team', 'Team', gameState.thisPlayer.team, {red: 'red', blue: 'blue'}, null, false);
  teamI.createElementIn(winScreenElement);
  //game config
  const wordKeyI = new SelectInputType('wordKey', 'Word List', gameState.wordKey, wordsMap, null, false);
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

  createPlayerTeamBoxes(winScreenElement);

  document.getElementById("main").appendChild(winScreenElement);
  setTimeout(() => {
    //  i guess i need timeout so it doesn't immediately close thru the propagation
    winScreenElement.addEventListener('click', event => event.stopPropagation());
    document.addEventListener('click', closeWinScreen);
    console.log('settings onp');
  }, 100);
}

function closeWinScreen(event) {
  // event.stopPropagation();
  console.log('close win scree');
  if (!winScreenElement) return;
  winScreenElement.remove();
  winScreenElement = null;
  document.removeEventListener('click', closeWinScreen);
  leftDiv = null;
  rightDiv = null;
  document.removeEventListener('new-server-response', updatePlayerTeamBoxes);
}

// show the teams/players for everyone to see, allow add/remove players
function createPlayerTeamBoxes(parentEl) {
  const wrapperDiv = document.createElement('div');
  wrapperDiv.style.border = 'solid black 1px';
  wrapperDiv.style.display = 'flex';
  wrapperDiv.style.justifyContent = 'space-evenly';

  leftDiv = document.createElement('div');
  leftDiv.style.border = 'solid black 1px';
  leftDiv.style.padding = '1rem';
  // leftDiv.style.width = '50%';
  wrapperDiv.appendChild(leftDiv);

  rightDiv = document.createElement('div');
  rightDiv.style.border = 'solid black 1px';
  rightDiv.style.padding = '1rem';
  // rightDiv.style.width = '50%';
  wrapperDiv.appendChild(rightDiv);

  const leftDivTitle = document.createElement('div');
  leftDivTitle.innerText = 'Red Team';
  leftDiv.appendChild(leftDivTitle);

  const rightDivTitle = document.createElement('div');
  rightDivTitle.innerText = 'Blue Team';
  rightDiv.appendChild(rightDivTitle);

  updatePlayerTeamBoxes();
  parentEl.appendChild(wrapperDiv);

  document.addEventListener('new-server-response', updatePlayerTeamBoxes);
}

// draw the player icons per team, update  on every server response
function updatePlayerTeamBoxes() {
  // remove the icons since they may have changed
  // keep the first child since that's the header
  while (leftDiv.firstChild && leftDiv.firstChild !== leftDiv.lastChild) {
    leftDiv.removeChild(leftDiv.lastChild);
  }
  while (rightDiv.firstChild && rightDiv.firstChild !== rightDiv.lastChild) {
    rightDiv.removeChild(rightDiv.lastChild);
  }

  const gameState = clientActions.getCachedGameState();

  for (const player of gameState.players) {
    const playerIcon = createPlayerIcon(player);
    if (player.team === 'red') {
      leftDiv.appendChild(playerIcon);
    } else if (player.team === 'blue') {
      rightDiv.appendChild(playerIcon);
    }
    // change player team on click
    playerIcon.onclick = async () => await clientActions.changePlayerTeam(player);
  }
}


export default {
  createWinScreen,
  closeWinScreen
}
