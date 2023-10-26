'use strict';

// disable these Amazon imports when running local Server
// import {DynamoDB} from '@aws-sdk/client-dynamodb';
// import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';

/*
* Server side code for persisting to DB.  This is for local, so uses localStorage
* dbAWS.js is a mirror of this but hits the DynamoDB
* */

const namespace = 'words-with-friends.';
let dbGetItem = null;
let dbSetItem = null;

// change these on the server
dbGetItem = async (key) => localStorage.getItem(namespace + key);
dbSetItem = async (key, value) => localStorage.setItem(namespace + key, value);
// usingAws();


// basic wrapper for Dynamo DB to treat it just like localStorage
function usingAws() {
  const dynamo = DynamoDBDocument.from(new DynamoDB());

  dbGetItem = async (key) => {
    const dynamoResponse = await dynamo.get({
      TableName: 'items',
      Key: {
        id: namespace + key
      }
    });

    if (dynamoResponse && dynamoResponse.Item) {
      return dynamoResponse.Item.items;
    }
  }

  dbSetItem = async (key, value) => {
    await dynamo.put({
      TableName: 'items',
      Item: {
        id: namespace + key,
        items: value
      }
    });
  }
}


export async function getDeviceIdCounter() {
  const deviceIdCounter = await dbGetItem('deviceIdCounter');
  if (!deviceIdCounter) {
    saveDeviceIdCounter(100).then();
    return 100;
  }
  return deviceIdCounter;
}

export async function saveDeviceIdCounter(deviceId) {
  await dbSetItem('deviceIdCounter', deviceId);
}

export async function getLastSavedGameState() {
  let lastSave = await dbGetItem('lastGameState');
  if (!lastSave) return;
  lastSave = JSON.parse(lastSave);

  console.log('last game state found and loaded.');
  return lastSave;
}

export async function saveGameState(gameState) {
  if (!gameState) return;
  await dbSetItem('lastGameState', JSON.stringify(gameState));
}

export async function getWordLists() {
  let wordLists = await dbGetItem('words');
  if (!wordLists) return;
  wordLists = JSON.parse(wordLists);
  console.log('words loaded from localStorage');
  return wordLists;
}

export async function getPlayerList() {
  let playerList = await dbGetItem('playerList');
  if (!playerList) return;
  playerList = JSON.parse(playerList);
  console.log('players loaded from localStorage');
  return playerList;
}

export async function savePlayerList(playerList) {
  await dbSetItem('playerList', JSON.stringify(playerList));
}
