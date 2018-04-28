import { reaction, decorate, observable } from "mobx"

class Line {
  constructor({ fromDot, toDot }) {
    this.fromDot = fromDot;
    this.toDot = toDot;
    this.reaction = reaction(
      () => fromDot.value,
      (fromDot, reaction) => {
        toDot.value = fromDot;
      }
    );

    toDot.value = fromDot.value;
  }

  get id() {
    return `from:${this.fromDot.id}|to:${this.toDot.id}`
  }

  static valid({ fromDot, toDot }) {
    return true
    // 0. Must not equal destination
    // 1. Must be adjacent
    // 2. Must not be diagonally adjacent
    // 3. Must not already have 2 Lines connected
  }
}

decorate(Line, {
  fromDot: observable,
  toDot: observable,
})

export default Line;
