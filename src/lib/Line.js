import { decorate, observable, toJS } from "mobx"

import Dot from "./Dot.js"

class Line {

  static sortConnection(connections) {
    return connections.sort((node1, node2) => {
      return node1[0] >= node2[0] && node1[1] >= node2[1]
    })
  }

  constructor({ fromDot, toDot, user }) {
    this.fromDot = fromDot;
    this.toDot = toDot;
    this.user = user || "SM"

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
    const user = this.user
    const from = { column: fromCoords[0], row: fromCoords[1] }
    const to = { column: toCoords[0], row: toCoords[1] }

    return { from, to, user }
  }

  static unserialize(data) {
    const from = new Dot(data.from)
    const to = new Dot(data.to)
    const user = toJS(data.user)

    return new Line(from, to, user)
  }
}

decorate(Line, {
  fromDot: observable,
  toDot: observable,
  user: observable,
})

export default Line
