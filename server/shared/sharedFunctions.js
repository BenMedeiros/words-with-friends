'use strict';

/*
* Functions used by the client and server
* */


// simple common functions for the gameState
export function bindCommonFunctions(gameState) {
  gameState.getThisDeviceId = () => gameState.thisPlayer ? gameState.thisPlayer.deviceId : null;
  gameState.getPlayerById = (deviceId) => gameState.players.find(el => el.deviceId === deviceId);
  gameState.isSpymaster = (deviceId) => (gameState.spymasterRed && gameState.spymasterRed.deviceId === deviceId)
    || (gameState.spymasterBlue && gameState.spymasterBlue.deviceId === deviceId);
  gameState.getRedPlayers = () => gameState.players.filter(el => el.team === 'red');
  gameState.getBluePlayers = () => gameState.players.filter(el => el.team === 'blue');

  gameState.getCountRedGoal = () => gameState.wordsGoal.filter(el => el === 'red').length;
  gameState.getCountBlueGoal = () => gameState.wordsGoal.filter(el => el === 'blue').length;
  gameState.getCountRedCurrent = () => gameState.wordsStates.filter(el => el === 'red').length;
  gameState.getCountBlueCurrent = () => gameState.wordsStates.filter(el => el === 'blue').length;

  gameState.getTurnTeam = () => gameState.turn.isRedTurn ? 'red' : 'blue';
  gameState.isTeamTurn = (deviceId) => {
    const player = gameState.getPlayerById(deviceId);
    return player && player.team === gameState.getTurnTeam();
  };
  gameState.isThisTeamTurn = () => gameState.isTeamTurn(gameState.getThisDeviceId());
}
