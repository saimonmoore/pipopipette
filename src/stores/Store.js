import { decorate, observable } from "mobx"

import Dot from '../lib/Dot.js'
import { range } from '../utils.js'

class Store {
  grid_size = observable.box(5);
  dots = []
  lines = []
  boxes = []

  constructor() {
    this.createDots()
  }

  clear() {
    this.dots = []
    this.lines = []
    this.boxes = []
  }

  setGridSize(newSize) {
    this.clear()
    this.grid_size.set(newSize)
    this.createDots()
  }

  createDots() {
    range(this.grid_size.get()).forEach((column) => (
      range(this.grid_size.get()).forEach((row) => {
        this.createDot({column, row})
      })
    ))
  }

  createDot(column, row) {
    const dot = new Dot(column, row)
    this.addDot(dot)
  }

  addDot(dot) {
    this.dots.push(dot)
  }

  removeDot(dot) {
    this.dots.forEach((dot) => {
      this.dots.splice(this.dots.indexOf(dot), 1);
    });
  }

  addLine(line) {
    this.lines.push(line)
  }

  removeLine(line) {
    this.lines.forEach((line) => {
      this.lines.splice(this.lines.indexOf(line), 1);
    });
  }

  addBox(box) {
    this.boxes.push(box)
  }

  removeBox(box) {
    this.boxes.forEach((box) => {
      this.boxes.splice(this.boxes.indexOf(box), 1);
    });
  }
}

decorate(Store, {
  dots: observable,
  lines: observable,
  boxes: observable,
})

export default Store
