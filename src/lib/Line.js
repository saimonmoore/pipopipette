import { decorate, observable, toJS } from "mobx"

import Dot from "./Dot.js"

class Line {

  static sortConnection(connections) {
    return connections.sort((node1, node2) => {
      return node1[0] >= node2[0] && node1[1] >= node2[1]
    })
  }

  constructor({ fromDot, toDot, user, colour }) {
    this.fromDot = fromDot;
    this.toDot = toDot;
    this.user = user
    this.colour = colour ? colour : user && user.colour

    toDot.connect(fromDot)
    fromDot.connect(toDot)
  }

  get id() {
    return `from:${this.fromDot.id}|to:${this.toDot.id}`
  }

  // Ensures always left -> right and top -> bottom
  get connection() {
    return Line.sortConnection([[this.fromDot.column, this.fromDot.row],[this.toDot.column, this.toDot.row]])
  }

  isConnected(coordinates) {
    return JSON.stringify(Line.sortConnection(coordinates)) === JSON.stringify(this.connection)
  }

  setUser(user) {
    this.user = user
    this.setColour(user.colour)
  }

  setColour(colour) {
    this.colour = colour
  }

  static isAlreadyConnected(fromDot, toDot) {
    return toDot.connectedTo(fromDot) && fromDot.connectedTo(toDot)
  }

  static valid({ fromDot, toDot }) {
    return fromDot !== toDot
        && fromDot.isAdjacent(toDot)
        && !this.isAlreadyConnected(fromDot, toDot)
  }

  serialize() {
    const [ fromCoords, toCoords ] = this.connection
    const user = toJS(this.user)
    const colour = toJS(this.colour)
    const from = { column: fromCoords[0], row: fromCoords[1] }
    const to = { column: toCoords[0], row: toCoords[1] }

    return { from, to, user, colour }
  }

  static unserialize(data) {
    const fromDot = new Dot(data.from)
    const toDot = new Dot(data.to)
    const user = data.user
    const colour = data.colour

    return new Line({ fromDot, toDot, user, colour })
  }

  static exists(lines, newLine) {
    return !!lines.find((line) => {
      return line.id === newLine.id
    })
  }
}

decorate(Line, {
  fromDot: observable,
  toDot: observable,
  user: observable,
  colour: observable,
})

export default Line
