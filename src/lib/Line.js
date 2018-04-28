import { reaction, decorate, observable } from "mobx"

class Line {
  constructor({ fromDot, toDot }) {
    this.fromDot = fromDot;
    this.toDot = toDot;

    toDot.connect(fromDot)
    fromDot.connect(toDot)
  }

  get id() {
    return `from:${this.fromDot.id}|to:${this.toDot.id}`
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
