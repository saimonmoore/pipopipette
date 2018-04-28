import { reaction, decorate, observable } from "mobx"

class Line {
  constructor({ fromDot, toDot }) {
    this.fromDot = fromDot;
    this.toDot = toDot;
    toDot.connection = fromDot
    fromDot.connection = toDot
  }

  get id() {
    return `from:${this.fromDot.id}|to:${this.toDot.id}`
  }

  static isAlreadyConnected(fromDot, toDot) {
    if (!fromDot.connection) return false
    return toDot.connection === fromDot && fromDot.connection === toDot
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
