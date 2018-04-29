import { decorate, observable, toJS } from "mobx"

import Dot from '../lib/Dot.js'
import Box from '../lib/Box.js'
import { range } from '../utils.js'
import Storage from '../lib/Storage.js'

const storage = new Storage()

const defaultGridSize = 5

class Store {
  grid_size = observable.box(defaultGridSize);
  colour = observable.box("");
  dots = []
  lines = []
  boxes = []
  user = {}
  session = {}

  constructor() {
    this.setGridSize(defaultGridSize)
  }

  persistSession() {
    const session_id = this.session.session.id
    storage.setUser(session_id, toJS(this.user))
    storage.setDots(session_id, this.serialize(this.dots))
    storage.setLines(session_id, this.serialize(this.lines))
    storage.setBoxes(session_id, this.serialize(this.boxes))
  }

  saveSession(session) {
    if (!this.user.colour) {
      this.setColour(this.assignRandomColour())
    }

    Object.assign(this.session, session)
    Object.assign(this.user, session.user)

    this.persistSession()
  }

  assignRandomColour() {
    const colours = ["yellow", "red", "green", "blue", "orange", "brown", "pink"]
    return colours[Math.floor(Math.random()*colours.length)];
  }

  clear() {
    this.dots = []
    this.lines = []
    this.boxes = []
  }

  setGridSize(newSize) {
    this.clear()
    this.grid_size.set(newSize)
    this.user.grid_size = newSize
    this.setup()
  }

  setColour(newColour) {
    this.colour.set(newColour)
    this.user.colour = newColour
    this.updateLineColour()
    this.updateBoxColour()
  }

  updateLineColour() {
    this.lines.forEach((line) => {
      if (line.user.user_id === this.user.user_id) {
        line.setColour(this.user.colour)
      }
    })
  }

  updateBoxColour() {
    this.boxes.forEach((box) => {
      if (box.user.user_id === this.user.user_id) {
        box.setColour(this.user.colour)
      }
    })
  }

  setup() {
    range(this.grid_size.get()).forEach((column) => (
      range(this.grid_size.get()).forEach((row) => {
        this.createDot({column, row})
      })
    ))

    // We create N-1 x N-1 boxes from a N x N node grid
    range(this.grid_size.get() - 1).forEach((row) => {
      range(this.grid_size.get() - 1).forEach((column) => {
        this.createBox(column, row)
      })
    })
  }

  createDot(column, row) {
    const dot = new Dot(column, row)
    this.addDot(dot)
  }

  createBox(column, row) {
    const topLeft = [column, row]
    const topRight = [column + 1, row]
    const bottomRight = [column + 1, row + 1 ]
    const bottomLeft = [column, row + 1]
    const box = new Box({topLeft, topRight, bottomRight, bottomLeft})

    this.addBox(box)
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
    line.setUser(this.user)
    this.lines.push(line)
    const boxes = Box.findBoxes(line, this.boxes)
    boxes.forEach((box) => {
      box.addLine(line)
    })

    this.persistSession()
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

  serialize(objects) {
    return objects.map((object) => (object.serialize()))
  } 
}

decorate(Store, {
  dots: observable,
  lines: observable,
  boxes: observable,
  user: observable,
  session: observable,
})

export default Store
