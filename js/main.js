'use strict';

import {ButtonType} from "../html/tinyComponents/ButtonType.js";
import clientActions from "../server/client/clientActions.js";
import {createPlayerSelector} from "./app/playerSelector.js";
import validations from "../server/client/validations.js";
import {createClueElement, createSubmitGuessesBtn} from "./app/playerActions.js";
import {startTimer} from "./app/teamAndTimer.js";
import winScreen from "./app/winScreen.js";
import {updateWordBoxes} from "./app/gameboard.js";

// how often to background try to poll, clientActions will prevent too unneccessary polling
setInterval(clientActions.poll, 5000);

async function start() {
  await clientActions.poll();
  startTimer();

  if (!clientActions.getCachedGameState().isGameStarted) {
    //  win screen is my setting screen since i'm lazy rn
    winScreen.createWinScreen();
  }

  // start button
  const startBtnType = new ButtonType('start-game', 'Start Game',
    clientActions.startGame,
    true, null, document.getElementById("navigation-bar"));

  document.addEventListener('new-server-response', () => {
    const gameState = clientActions.getCachedGameState();
    // fakePlayersBtnType.disableIf(gameState.players.length > 3);
    startBtnType.disableIf(validations.startGame(clientActions.getCachedGameState()));

    if (gameState.winner) {
      winScreen.createWinScreen();
    } else if (gameState.isGameStarted) {
      // this is causing the config screen to close on every poll
      // winScreen.closeWinScreen();
    }

  });

}

createPlayerSelector();

start().then(() => {
  // runAllTests.then();

  const gameConfigI = new ButtonType('game-config', 'Game Config',
    winScreen.createWinScreen, false, null,
    document.getElementById("navigation-bar"));


  createClueElement();
  createSubmitGuessesBtn();

  document.addEventListener('new-server-response', updateWordBoxes);


});
