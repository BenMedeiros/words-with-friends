import api from "../server/local/api.js";

export function runAllTests() {

  api.newGame();
  api.updatePlayer('ben', 'red', 1);
  api.updatePlayer('sam', 'red', 2);
  api.updatePlayer('dave', 'blue', 3);
  api.updatePlayer('paul', 'blue', 4);

  api.startGame('food');

  api.submitClue(3, 'raw', 2);
  api.markGuesses(4, [8, 2]);
  api.submitGuesses(4);

  api.submitClue(1, 'bar', 5);
  api.markGuesses(2, [1, 4, 9]);
  api.submitGuesses(2);


  api.submitClue(3, 'tool', 2);
  api.markGuesses(4, [13]);
  api.submitGuesses(4);
}
