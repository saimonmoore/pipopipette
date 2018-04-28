import { reaction, decorate, observable } from "mobx"

class Line {

  static sortConnection(connections) {
    return connections.sort((node1, node2) => {
      return node1[0] >= node2[0] && node1[1] >= node2[1]
    })
  }

  constructor({ fromDot, toDot }) {
    this.fromDot = fromDot;
    this.toDot = toDot;

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
}

decorate(Line, {
  fromDot: observable,
  toDot: observable,
})

export default Line
