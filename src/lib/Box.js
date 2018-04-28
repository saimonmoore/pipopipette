import { reaction, decorate, observable } from "mobx"

class Box {
  constructor({ fromDot, toDot }) {
    this.fromDot = fromDot;
    this.toDot = toDot;
    // TODO: Each dot can have 2-4 connections
    toDot.connection = fromDot
    fromDot.connection = toDot
  }

  static willClose({ store, fromDot, toDot }) {
    const { lines } = store.lines
  }
}

export default Box
