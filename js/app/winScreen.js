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
import userMessage from "./userMessage.js";

let winScreenElement = null;
let nameI = null;
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
  if(!gameState.thisPlayer || !gameState.thisPlayer.name|| gameState.thisPlayer.name.trim() === ''){
    div.innerText = 'New Player';
  }else if(!gameState.winner && !gameState.isGameStarted){
    div.innerText = 'Waiting to Start';
  }
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
  nameI = new LabelInputType('name', 'string', 'Name', gameState.thisPlayer.name, 'your name', false);
  nameI.createElementIn(winScreenElement);
  //game config
  const wordKeyI = new SelectInputType('wordKey', 'Word List', gameState.wordKey, wordsMap, null, false);
  wordKeyI.createElementIn(winScreenElement);

  createPlayerTeamBoxes(winScreenElement);

  // clear players
  const clearPlayerBtn = new ButtonType('clear-players', 'Clear Players', clientActions.clearPlayers);
  clearPlayerBtn.createElementIn(winScreenElement);

  // allow player to update their team and the game wordKey
  const submit = new ButtonType('new-game', 'New Game', async () => {
    // newGame clears players so must be first
    await clientActions.newGame(wordKeyI.getValue());
    await closeWinScreen();
  });
  submit.createElementIn(winScreenElement);

  document.getElementById("main").appendChild(winScreenElement);
  setTimeout(() => {
    //  i guess i need timeout so it doesn't immediately close thru the propagation
    winScreenElement.addEventListener('click', event => event.stopPropagation());
    document.addEventListener('click', closeWinScreen);
    console.log('settings onp');
  }, 100);
}

async function closeWinScreen(event) {
  // event.stopPropagation();
  console.log('close win scree');
  if (!winScreenElement) return;
  // make sure user made a name
  if(!nameI.getValue() || nameI.getValue().trim() === ''){
    userMessage.errorMsg('Must input a name');
    return;
  }else{
    const gameState = clientActions.getCachedGameState();
    if (!gameState.thisPlayer || nameI.getValue() !== gameState.thisPlayer.name) {
      await clientActions.updatePlayer(nameI.getValue(), gameState.thisPlayer.team);
    }
  }

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
  wrapperDiv.id = 'team-selector-box';

  leftDiv = document.createElement('div');
  wrapperDiv.appendChild(leftDiv);

  rightDiv = document.createElement('div');
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
