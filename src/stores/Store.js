import { decorate, observable, toJS } from "mobx"

import Dot from '../lib/Dot.js'
import Line from '../lib/Line.js'
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
    this.handleLineAdded = this.handleLineAdded.bind(this)
    this.handleBoxChanged = this.handleBoxChanged.bind(this)
  }

  handleLineAdded(data) {
    const line = Line.unserialize(data)
    if (!Line.exists(this.lines, line)) {
      this.addLine(line, line.user)
    }
  }

  handleBoxChanged(data) {
    const box = Box.unserialize(data)
    Box.updateBox(this.boxes, box)
  }

  async fetchData() {
    const session_id = this.session.session.id
    const user_id = this.user.user_id

    const fetchDots = storage.getDots(session_id)
    const fetchLines = storage.getLines(session_id)
    const fetchBoxes = storage.getBoxes(session_id)
    const fetchUser = storage.getUser(session_id, user_id)

    const fetches = [fetchUser, fetchDots, fetchLines, fetchBoxes]
    const responses = await Promise.all(fetches)

    if (responses && typeof responses === 'object') {
      const data = responses.map((snapshot) => {
        if (!snapshot) return null
        if (!snapshot.exists()) return false
        return snapshot.val()
      })

      return { user: data[0], dots: data[1], lines: data[2], boxes: data[3] }
    } else {
      return { user: null, dots: [], lines: [], boxes: [] }
    }
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

    // Now we have a session, fetch the data
    // If remote data, use that otherwise setup and persist
    this.fetchData().then((data) => {
      const { dots, lines, boxes } = data
      if (!dots.length && !lines.length && !boxes.length) {
        console.log("=====> Success but no data....setup : ")
        this.setGridSize(defaultGridSize)
      } else {
        console.log("=====> Success and data....loading : ")
        this.loadFromData(data)
      }

      this.enableRealTimeListeners()
    }).catch((error) => {
      console.log("=====> data fetch error: ", error)
      this.setGridSize(defaultGridSize)
    })

    this.persistSession()
  }

  enableRealTimeListeners() {
    const session_id = this.session.session.id
    storage.onLineAdded(session_id, this.handleLineAdded)
    storage.onBoxChanged(session_id, this.handleBoxChanged)
  }

  disableRealTimeListeners() {
    const session_id = this.session.session.id
    storage.offLineAdded(session_id)
    storage.offBoxChanged(session_id)
  }

  loadFromData(data) {
    const { user, dots, lines, boxes } = data
    Object.assign(this.user, user)
    this.grid_size.set(user.grid_size || defaultGridSize)
    this.colour.set(user.colour || "")

    dots.forEach((dot) => {
      this.addDot(Dot.unserialize(dot))
    })

    lines.forEach((line) => {
      this.lines.push(Line.unserialize(line))
    })

    boxes.forEach((box) => {
      this.addBox(Box.unserialize(box))
    })
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

  addLine(line, user) {
    line.setUser(user || this.user)
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
