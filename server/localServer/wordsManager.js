'use strict';

// load once from db then keep in cache
import {gameState} from "./gameState.js";
import {getWordLists} from "./dbLocalStorage.js";

let wordLists = await getWordLists();
// {wordKey: [words]}

// populate the wordLists that are available to play from db
export function initializeWordLists() {
  gameState.wordLists = Object.keys(wordLists);
}

// selects a random set of words using the wordKey
export function selectNewGameWords(wordKey) {
  const allWords = wordLists[wordKey];
  if (!allWords) throw new Error('No word list exists for ' + wordKey);
  if (!Array.isArray(allWords)) throw new Error('Word list is malformed for ' + wordKey);
  if (allWords.length < gameState.wordsPerGame) {
    throw new Error(`Word list ${wordKey} only has ${allWords.length} words, so can't play game with ${gameState.wordsPerGame} words.`);
  }
  gameState.wordKey = wordKey;
  // choose semi-random set of words
  gameState.words = allWords.sort((a, b) => 0.5 - Math.random()).slice(0, gameState.wordsPerGame);
  gameState.wordsStates = new Array(gameState.wordsPerGame).fill(null);
  gameState.wordsGoal = new Array(gameState.wordsPerGame).fill('neutral');


  if (gameState.wordsPerGame < 10) throw new Error('Must player with at least 10 words.');

  const countFirstTeam = Math.ceil(gameState.wordsPerGame / 3);
  const countSecondTeam = countFirstTeam - 1;
  const firstTeam = gameState.turn.isRedTurn ? 'red' : 'blue';
  const secondTeam = !gameState.turn.isRedTurn ? 'red' : 'blue';
  gameState.wordsGoal.fill(firstTeam, 0, countFirstTeam);
  gameState.wordsGoal.fill(secondTeam, countFirstTeam, countFirstTeam + countSecondTeam);
  gameState.wordsGoal[gameState.wordsPerGame - 1] = 'death';
  // double sort since it's a quick poor sort
  gameState.wordsGoal.sort((a, b) => 0.5 - Math.random());
  gameState.wordsGoal.sort((a, b) => 0.5 - Math.random());

}
