import { decorate, observable, computed } from "mobx"

class Dot {
  radius = 20
  flashing = false

  constructor({ column=null, row=null } = {}) {
    this.column = column
    this.row = row
  }

  get id() {
    return `x:${this.column}y:${this.row}`
  }

  get x() {
    return this.column * 100 + this.radius + 10
  }

  get y() {
    return this.row * 100 + this.radius + 10
  }

  flash() {
    this.flashing = true

    setTimeout(() => { this.flashing = false }, 1000)
  }

  isAdjacent(toDot) {
    const {column: x1, row: y1 } = this
    const {column: x2, row: y2 } = toDot
    const left = `[${x1 - 1}, ${y1}]` === `[${x2}, ${y2}]` 
    const right = `[${x1 + 1}, ${y1}]` === `[${x2}, ${y2}]` 
    const up = `[${x1}, ${y1 + 1}]` === `[${x2}, ${y2}]` 
    const down = `[${x1}, ${y1 - 1}]` === `[${x2}, ${y2}]` 

    return left || right || up || down
  }
}

decorate(Dot, {
  column: observable,
  row: observable,
  flashing: observable,
  x: computed,
  y: computed,
})

export default Dot
