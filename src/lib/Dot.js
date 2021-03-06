import { decorate, observable, computed } from 'mobx';

import Constants from '../constants.js';

class Dot {
  flashing = false;

  constructor({ column = null, row = null } = {}) {
    this.column = column;
    this.row = row;
    this.connections = [];
  }

  get id() {
    return `x:${this.column}y:${this.row}`;
  }

  get x() {
    return (
      this.column * Constants.dotSpacing +
      Constants.dotRadius +
      Constants.dotRadius * 0.5
    );
  }

  get y() {
    return (
      this.row * Constants.dotSpacing +
      Constants.dotRadius +
      Constants.dotRadius * 0.5
    );
  }

  flash() {
    this.flashing = true;

    setTimeout(() => {
      this.flashing = false;
    }, 1000);
  }

  connect(otherDot) {
    this.connections.push(otherDot);
  }

  connectedTo(otherDot) {
    this.connections.includes(otherDot);
  }

  isAdjacent(toDot) {
    const { column: x1, row: y1 } = this;
    const { column: x2, row: y2 } = toDot;
    const left = `[${x1 - 1}, ${y1}]` === `[${x2}, ${y2}]`;
    const right = `[${x1 + 1}, ${y1}]` === `[${x2}, ${y2}]`;
    const up = `[${x1}, ${y1 + 1}]` === `[${x2}, ${y2}]`;
    const down = `[${x1}, ${y1 - 1}]` === `[${x2}, ${y2}]`;

    return left || right || up || down;
  }

  get coordinates() {
    return [this.column, this.row];
  }

  serialize() {
    const { column, row } = this;
    return { column, row };
  }

  static unserialize(data) {
    return new Dot(data);
  }
}

decorate(Dot, {
  column: observable,
  row: observable,
  connections: observable,
  flashing: observable,
  x: computed,
  y: computed
});

export default Dot;
