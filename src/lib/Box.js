import { decorate, observable, toJS } from "mobx"

import Line from './Line.js'
import Constants from "../constants.js"

class Box {
  static getPixels(point) {
    return point * Constants.dotSpacing + Constants.dotRadius + Constants.dotRadius * 0.5
  }

  static findBoxes(line, boxes) {
    return boxes.filter((box) => {
      return box.containsPoint(line.toDot.coordinates)
    })
  }

  constructor({ topLeft, topRight, bottomLeft, bottomRight, user, colour }) {
    this.topLeft = topLeft
    this.topRight = topRight
    this.bottomLeft = bottomLeft
    this.bottomRight = bottomRight

    this.user = {}
    Object.assign(this.user, user || {})

    this.closed = observable.box(false)
    this.colour = colour ? colour : user && user.colour
    this.colour = this.colour || ""

    this.edges = {
      topLeftTopRight: null,
      topRightBottomRight: null,
      bottomRightBottomLeft: null,
      bottomLeftTopLeft: null,
    }
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

  containsPoint(coordinates) {
    return JSON.stringify(this.topLeft) === JSON.stringify(coordinates)
        || JSON.stringify(this.topRight) === JSON.stringify(coordinates)
        || JSON.stringify(this.bottomRight) === JSON.stringify(coordinates)
        || JSON.stringify(this.bottomLeft) === JSON.stringify(coordinates)
  }

  isClosed() {
    const { topLeftTopRight, topRightBottomRight, bottomRightBottomLeft, bottomLeftTopLeft } = this.edges
    return !!topLeftTopRight && !!topRightBottomRight && !!bottomRightBottomLeft && !!bottomLeftTopLeft
  }

  topLeftTopRightEdge() {
    return JSON.stringify(Line.sortConnection([this.topLeft, this.topRight]))
  }

  topRightBottomRightEdge() {
    return JSON.stringify(Line.sortConnection([this.topRight, this.bottomRight]))
  }

  bottomRightBottomLeftEdge() {
    return JSON.stringify(Line.sortConnection([this.bottomRight, this.bottomLeft]))
  }

  bottomLeftTopLeftEdge() {
    return JSON.stringify(Line.sortConnection([this.bottomLeft, this.topLeft]))
  }

  findEdgeForLine(line) {
    const connection = line.connection
    const edge = JSON.stringify(connection)

    const tltr = this.topLeftTopRightEdge()
    const trbr = this.topRightBottomRightEdge()
    const brbl = this.bottomRightBottomLeftEdge()
    const bltl = this.bottomLeftTopLeftEdge()

    if (edge === tltr) return "topLeftTopRight"
    if (edge === trbr) return "topRightBottomRight"
    if (edge === brbl) return "bottomRightBottomLeft"
    if (edge === bltl) return "bottomLeftTopLeft"

    return null
  }

  setUser(user) {
    Object.assign(this.user, user)
    if (user.colour) {
      this.setColour(user.colour)
    }
  }

  setColour(colour) {
    this.colour = colour
  }

  addLine(line) {
    const edge = this.findEdgeForLine(line)

    if (!edge) return
    if (!!this.edges[edge]) return

    this.edges[edge] = line.connection

    if (!this.closed.get() && this.isClosed()) {
      this.closed.set(true)
      this.setUser(line.user)
    }
  }

  serialize() {
    const { topLeft, topRight, bottomLeft, bottomRight } = this
    const coords = { topLeft, topRight, bottomLeft, bottomRight }
    const edges = toJS(this.edges)
    const user = toJS(this.user)
    const closed = toJS(this.closed)
    const colour = toJS(this.colour)

    return { coords, edges, user, closed, colour }
  }

  static unserialize(data) {
    const { coords, edges, user, closed, colour } = data
    const box = new Box(coords, user, colour)

    Object.assign(box.edges, edges)
    box.closed.set(closed)

    return box
  }

  static findBox(boxes, surrogate_box) {
    return boxes.find((box) => {
      return box.id === surrogate_box.id
    })
  }

  static updateBox(boxes, surrogate_box) {
    const box = Box.findBox(boxes, surrogate_box)
    if (box) {
      Object.assign(box.edges, surrogate_box.edges)
      box.closed.set(surrogate_box.closed.get())
      box.setUser(surrogate_box.user)
    }
  }
}

decorate(Box, {
  edges: observable,
  user: observable,
  colour: observable
})

export default Box
