import clientActions from "../server/client/clientActions.js";


export function runAllTests() {
  runAllTestsAsync().then();
}

export async function runAllTestsAsync() {

  await clientActions.poll();
  console.log('poll done');
  await clientActions.newGame();
  clientActions.bindDeviceId(1);
  await clientActions.updatePlayer('ben', 'red');
  clientActions.bindDeviceId(2);
  await clientActions.updatePlayer('sam', 'red');
  clientActions.bindDeviceId(3);
  await clientActions.updatePlayer('dave', 'blue');
  clientActions.bindDeviceId(4);
  await clientActions.updatePlayer('paul', 'blue');

  clientActions.bindDeviceId(3);
  await clientActions.startGame('food');
  await clientActions.submitClue('raw', 2);

  clientActions.bindDeviceId(4);
  await clientActions.markGuesses([8, 2]);
  await clientActions.submitGuesses();

  clientActions.bindDeviceId(1);
  await clientActions.submitClue('bar', 5);
  clientActions.bindDeviceId(2);
  await clientActions.markGuesses([1, 4, 9]);
  await clientActions.submitGuesses();

  clientActions.bindDeviceId(3);
  await clientActions.submitClue(3, 'tool', 2);

  clientActions.bindDeviceId(4);
  await clientActions.markGuesses([13]);
  await clientActions.submitGuesses(4);
}
