import { decorate, observable, computed } from "mobx"

class Dot {
  radius = 20

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
}

decorate(Dot, {
  column: observable,
  row: observable,
  x: computed,
  y: computed,
})

export default Dot
