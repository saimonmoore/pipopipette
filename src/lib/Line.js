import { decorate, observable, toJS } from 'mobx';

import Dot from './Dot.js';

class Line {
  static sortConnection(connections) {
    return connections.sort((node1, node2) => {
      return node1[0] >= node2[0] && node1[1] >= node2[1];
    });
  }

  constructor({ fromDot, toDot, player, colour }) {
    this.fromDot = fromDot;
    this.toDot = toDot;
    this.player = player;
    this.colour = colour ? colour : player && player.colour;

    toDot.connect(fromDot);
    fromDot.connect(toDot);
  }

  get id() {
    return this.connection.join('-');
  }

  // Ensures always left -> right and top -> bottom
  get connection() {
    return Line.sortConnection([
      [this.fromDot.column, this.fromDot.row],
      [this.toDot.column, this.toDot.row]
    ]);
  }

  isConnected(coordinates) {
    return (
      JSON.stringify(Line.sortConnection(coordinates)) ===
      JSON.stringify(this.connection)
    );
  }

  setPlayer(player) {
    this.player = player;
    this.setColour(player.colour);
  }

  setColour(colour) {
    this.colour = colour;
  }

  static isAlreadyConnected(fromDot, toDot) {
    return toDot.connectedTo(fromDot) && fromDot.connectedTo(toDot);
  }

  static valid({ fromDot, toDot }) {
    return (
      fromDot !== toDot &&
      fromDot.isAdjacent(toDot) &&
      !this.isAlreadyConnected(fromDot, toDot)
    );
  }

  serialize() {
    const [fromCoords, toCoords] = this.connection;
    const player = this.player ? this.player.serialize() : null;
    const colour = toJS(this.colour);
    const from = { column: fromCoords[0], row: fromCoords[1] };
    const to = { column: toCoords[0], row: toCoords[1] };

    return { from, to, player, colour };
  }

  static unserialize(data, player1, player2) {
    const fromDot = new Dot(data.from);
    const toDot = new Dot(data.to);
    let player;

    if (data.player.user_id === player1.id) player = player1;
    if (data.player.user_id === player2.id) player = player2;
    const colour = data.colour;

    return new Line({ fromDot, toDot, player, colour });
  }

  static exists(lines, newLine) {
    return !!lines.find(line => {
      return line.id === newLine.id;
    });
  }
}

decorate(Line, {
  fromDot: observable,
  toDot: observable,
  player: observable,
  colour: observable
});

export default Line;
