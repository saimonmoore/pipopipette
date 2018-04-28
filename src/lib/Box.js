import { decorate, observable } from "mobx"

class Box {
  static getPixels(point) {
    return point * 100 + 20 + 10
  }

  static willClose({ store, fromDot, toDot }) {
    const { lines } = store.lines
  }

  constructor({ topLeft, topRight, bottomLeft, bottomRight }) {
    this.topLeft = topLeft
    this.topRight = topRight
    this.bottomLeft = bottomLeft
    this.bottomRight = bottomRight

    this.closed = observable.box(false)
    this.user = observable.box("SM")

    this.lines = {}
  }

  get id() {
    return JSON.stringify([this.topLeft, this.topRight, this.bottomRight, this.bottomLeft])
  }

  get coordinates() {
    const x1 = Box.getPixels(this.topLeft[0])
    const y1 = Box.getPixels(this.topLeft[1])

    const x2 = Box.getPixels(this.topRight[0])
    const y2 = Box.getPixels(this.topRight[1])

    const x3 = Box.getPixels(this.bottomRight[0])
    const y3 = Box.getPixels(this.bottomRight[1])

    const x4 = Box.getPixels(this.bottomLeft[0])
    const y4 = Box.getPixels(this.bottomLeft[1])

    return [x1,y1,x2,y2,x3,y3,x4,y4].join(",")
  }

  get textXCoord() {
    const x1 = Box.getPixels(this.topLeft[0])
    return x1 + 30
  }

  get textYCoord() {
    const y1 = Box.getPixels(this.topLeft[1])
    return y1 + 55
  }
}

decorate(Box, {
  lines: observable
})

export default Box
