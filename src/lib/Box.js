import { decorate, observable, toJS } from 'mobx';

import Line from './Line.js';
import Constants from '../constants.js';

class Box {
  static getPixels(point) {
    return (
      point * Constants.dotSpacing +
      Constants.dotRadius +
      Constants.dotRadius * 0.5
    );
  }

  static findBoxes(line, boxes) {
    return boxes.filter(box => {
      return box.containsPoint(line.toDot.coordinates);
    });
  }

  constructor({ topLeft, topRight, bottomLeft, bottomRight, player, colour }) {
    this.topLeft = topLeft;
    this.topRight = topRight;
    this.bottomLeft = bottomLeft;
    this.bottomRight = bottomRight;

    this.player = player;
    this.closed = observable.box(false);
    this.colour = colour ? colour : player && player.colour;
    this.colour = this.colour || '';

    this.edges = {
      topLeftTopRight: null,
      topRightBottomRight: null,
      bottomRightBottomLeft: null,
      bottomLeftTopLeft: null
    };
  }

  get id() {
    return JSON.stringify([
      this.topLeft,
      this.topRight,
      this.bottomRight,
      this.bottomLeft
    ]);
  }

  get coordinates() {
    const x1 = Box.getPixels(this.topLeft[0]);
    const y1 = Box.getPixels(this.topLeft[1]);

    const x2 = Box.getPixels(this.topRight[0]);
    const y2 = Box.getPixels(this.topRight[1]);

    const x3 = Box.getPixels(this.bottomRight[0]);
    const y3 = Box.getPixels(this.bottomRight[1]);

    const x4 = Box.getPixels(this.bottomLeft[0]);
    const y4 = Box.getPixels(this.bottomLeft[1]);

    return [x1, y1, x2, y2, x3, y3, x4, y4].join(',');
  }

  get textXCoord() {
    const x1 = Box.getPixels(this.topLeft[0]);
    return x1 + 30;
  }

  get textYCoord() {
    const y1 = Box.getPixels(this.topLeft[1]);
    return y1 + 55;
  }

  containsPoint(coordinates) {
    return (
      JSON.stringify(this.topLeft) === JSON.stringify(coordinates) ||
      JSON.stringify(this.topRight) === JSON.stringify(coordinates) ||
      JSON.stringify(this.bottomRight) === JSON.stringify(coordinates) ||
      JSON.stringify(this.bottomLeft) === JSON.stringify(coordinates)
    );
  }

  isClosed() {
    const {
      topLeftTopRight,
      topRightBottomRight,
      bottomRightBottomLeft,
      bottomLeftTopLeft
    } = this.edges;
    return (
      !!topLeftTopRight &&
      !!topRightBottomRight &&
      !!bottomRightBottomLeft &&
      !!bottomLeftTopLeft
    );
  }

  topLeftTopRightEdge() {
    return JSON.stringify(Line.sortConnection([this.topLeft, this.topRight]));
  }

  topRightBottomRightEdge() {
    return JSON.stringify(
      Line.sortConnection([this.topRight, this.bottomRight])
    );
  }

  bottomRightBottomLeftEdge() {
    return JSON.stringify(
      Line.sortConnection([this.bottomRight, this.bottomLeft])
    );
  }

  bottomLeftTopLeftEdge() {
    return JSON.stringify(Line.sortConnection([this.bottomLeft, this.topLeft]));
  }

  findEdgeForLine(line) {
    const connection = line.connection;
    const edge = JSON.stringify(connection);

    const tltr = this.topLeftTopRightEdge();
    const trbr = this.topRightBottomRightEdge();
    const brbl = this.bottomRightBottomLeftEdge();
    const bltl = this.bottomLeftTopLeftEdge();

    console.log(
      `[Box#findEdgeForLine]... line: ${
        line.id
      } edge: ${edge} ${tltr} ${trbr} ${brbl} ${bltl}`
    );

    if (edge === tltr) return 'topLeftTopRight';
    if (edge === trbr) return 'topRightBottomRight';
    if (edge === brbl) return 'bottomRightBottomLeft';
    if (edge === bltl) return 'bottomLeftTopLeft';

    console.log(
      `[Box#findEdgeForLine]... did not find edge for line: ${
        line.id
      } edge: ${edge}`
    );
    return null;
  }

  setPlayer(player) {
    this.player = player;
    if (player && player.colour) {
      this.setColour(player.colour);
    }
  }

  setColour(colour) {
    this.colour = colour;
  }

  addLine(line) {
    console.log(`[Box#addLine]...line: ${line.id}`);
    const edge = this.findEdgeForLine(line);
    console.log(`[Box#addLine]...edge: ${edge}`);

    if (!edge) return null;
    if (!!this.edges[edge]) return null;
    console.log(`[Box#addLine]...edge: ${edge} does not already exist`);

    this.edges[edge] = line.connection;
    console.log(
      `[Box#addLine]...adding edge: ${edge} to edges: ${JSON.stringify(
        this.edges
      )}`
    );

    console.log(
      `[Box#addLine]...checking if closed... this.closed: ${this.closed.get()} isClosed(): ${this.isClosed()}`
    );
    if (!this.closed.get() && this.isClosed()) {
      console.log(
        `[Box#addLine]...should be closed but not marked as such! Closing!`
      );
      this.closed.set(true);
      this.setPlayer(line.player);

      return true;
    }

    console.log(`[Box#addLine]... either already closed or not closed...`);
    return null;
  }

  serialize() {
    const { topLeft, topRight, bottomLeft, bottomRight } = this;
    const coords = { topLeft, topRight, bottomLeft, bottomRight };
    const edges = toJS(this.edges);
    const player = this.player ? this.player.serialize() : null;
    const closed = toJS(this.closed);
    const colour = toJS(this.colour);

    console.log(
      `[Box#serialize]... coords: ${JSON.stringify(
        coords
      )} edges: ${JSON.stringify(edges)} closed: ${closed} colour: ${colour}`
    );
    return { coords, edges, player, closed, colour };
  }

  static unserialize(data, player1, player2) {
    const { coords, edges, closed, colour } = data;
    console.log(
      `[Box#unserialize]... got coords: ${JSON.stringify(
        coords
      )} edges: ${JSON.stringify(edges)} closed: ${closed} colour: ${colour}`
    );
    let player;

    if (data.player && data.player.user_id === player1.id) player = player1;
    if (data.player && data.player.user_id === player2.id) player = player2;

    const box = new Box(Object.assign({ player, colour }, coords));
    Object.assign(box.edges, edges);
    console.log(
      `[Box#unserialize]... assigned edges: ${JSON.stringify(
        edges
      )} to box: ${JSON.stringify(box)}`
    );
    box.closed.set(closed);
    console.log(`[Box#unserialize]... setting box closed to: ${closed}`);

    return box;
  }

  static findBox(boxes, surrogate_box) {
    return boxes.find(box => {
      return box.id === surrogate_box.id;
    });
  }

  static updateBox(boxes, surrogate_box) {
    const box = Box.findBox(boxes, surrogate_box);
    if (box) {
      Object.assign(box.edges, surrogate_box.edges);
      box.closed.set(surrogate_box.closed.get());
      box.setColour(surrogate_box.colour);
      box.setPlayer(surrogate_box.player);
    }
  }
}

decorate(Box, {
  edges: observable,
  player: observable,
  colour: observable
});

export default Box;
