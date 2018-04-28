import { decorate, observable } from "mobx"

class Store {
  grid_size = 5
  dots = []
  lines = []

  setGridSize(newSize) {
    this.grid_size = newSize
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
}

decorate(Store, {
  grid_size: observable,
  dots: observable,
  lines: observable,
})

export default Store
