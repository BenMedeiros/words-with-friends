'use strict';

let idCounter = 0;

// valuesMap is key: value of key sent when selected vs display value
export class SelectInputType {
  element = null;

  constructor(name, labelText, initialValue, valuesMap, readOnly) {
    if (name === 'id') {
      throw new Error('id/name cannot be id because it messes up using el.id for some reason');
    }

    this.id = name + '-slt-' + idCounter++;
    this.name = name;
    this.labelText = labelText;
    this.initialValue = initialValue;
    if(!valuesMap || typeof valuesMap !== 'object'){
      throw new Error('valuesMap must be key:displayValue object');
    }
    this.valuesMap = valuesMap;
    this.readOnly = readOnly;
  }


  createElementIn(parentEl){
    this.element = document.createElement('select');
    this.element.id = this.id;
    this.element.name = this.name;

    for (const [key, displayValue] of Object.entries(this.valuesMap)) {
      const optionEl = document.createElement('option');
      optionEl.value = key;
      optionEl.innerText = displayValue;
      this.element.appendChild(optionEl);
    }

    parentEl.appendChild(this.element);
  }

  // returns the key for the valuesMap selected
  getValue(){
    return this.element.value;
  }
}
