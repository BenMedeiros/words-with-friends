'use strict';


import {LabelInputType} from "../../html/tinyComponents/LabelInputType.js";
import {SelectInputType} from "../../html/tinyComponents/SelectInputType.js";
import clientActions from "../../server/client/clientActions.js";

/*
* Creates player selection drop down
* */

export function createPlayerSelector() {
  // const nameInput = new LabelInputType('item', 'string', null,
  //   null, 'name', false);
  // nameInput.bindAutocomplete(['jim', 'pam', 'ben']);
  // nameInput.createElementIn(document.getElementById("navigation-bar"));
  // nameInput.onModified(() => {
  //   console.log(nameInput.getValue());
  // });
  //

  const playerSelectInput = new SelectInputType('player', 'Player', null, {
    1: 'Ben 1 Red',
    2: 'Sam 2 Red',
    3: 'Dave 3 Blue',
    4: 'Paul 4 Blue'
  }, false);

  playerSelectInput.createElementIn(document.getElementById("navigation-bar"));

  console.log(playerSelectInput.element);

  playerSelectInput.element.onchange = () => {
    console.log('change', playerSelectInput.getValue());
    clientActions.bindDeviceId(Number(playerSelectInput.getValue()));
  };
}
