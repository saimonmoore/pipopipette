import { decorate, observable, toJS } from "mobx"

import Dot from '../lib/Dot.js'
import Line from '../lib/Line.js'
import Box from '../lib/Box.js'
import { range } from '../utils.js'
import Storage from '../lib/Storage.js'

import Constants from "../constants.js"

const storage = new Storage()

class Store {
  grid_size = observable.box(Constants.defaultGridSize);
  colour = observable.box("");
  dots = []
  lines = []
  boxes = []
  user = {}
  session = {}

  constructor() {
    this.handleLineAdded = this.handleLineAdded.bind(this)
    this.handleBoxChanged = this.handleBoxChanged.bind(this)
    this.handleGridSizeChanged = this.handleGridSizeChanged.bind(this)

    this.changeGridSize(Constants.defaultGridSize)
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

  handleGridSizeChanged(grid_size) {
    if (this.grid_size.get() !== grid_size) {
      this.changeGridSize(grid_size)

      this.fetchData().then((data) => {
        const { lines, boxes } = data
        const mustLoadData = lines.length || boxes.length

        if (mustLoadData) {
          this.loadFromData(data)
        }

        // TODO: Disable loading indicator
      }).catch((error) => {
        console.log("=====> data fetch error: ", error)
      })
    }
  }

  async fetchData() {
    const session_id = this.session.session.id
    const user_id = this.user.user_id

    const fetchLines = storage.getLines(session_id)
    const fetchBoxes = storage.getBoxes(session_id)
    const fetchUser = storage.getUser(session_id, user_id)

    const fetches = [fetchUser, fetchLines, fetchBoxes]
    const responses = await Promise.all(fetches)

    if (responses && typeof responses === 'object') {
      const data = responses.map((snapshot) => {
        if (!snapshot) return null
        if (!snapshot.exists()) return false
        return snapshot.val()
      })

      return { user: data[0], lines: data[1], boxes: data[2] }
    } else {
      return { user: null, lines: [], boxes: [] }
    }
  }

  persistSession() {
    const session_id = this.session.session.id
    storage.setUser(session_id, toJS(this.user))
    storage.setLines(session_id, this.serialize(this.lines))
    storage.setBoxes(session_id, this.serialize(this.boxes))
  }

  saveSession(session) {
    Object.assign(this.session, session)
    Object.assign(this.user, session.user)

    if (!this.user.colour) {
      this.setColour(this.assignRandomColour())
    }

    // TODO: Enable loading indicator
    this.fetchData().then((data) => {
      const { lines, boxes } = data
      const mustLoadData = lines.length || boxes.length

      if (mustLoadData) {
        this.loadFromData(data)
      }

      this.persistSession()
      this.enableRealTimeListeners()
      // TODO: Disable loading indicator
    }).catch((error) => {
      console.log("=====> data fetch error: ", error)
      this.persistSession()
      this.enableRealTimeListeners()
    })
  }

  enableRealTimeListeners() {
    const session_id = this.session.session.id
    const user_id = this.user.user_id
    storage.onLineAdded(session_id, this.handleLineAdded)
    storage.onBoxChanged(session_id, this.handleBoxChanged)
    storage.onGridSizeChanged(session_id, user_id, this.handleGridSizeChanged)
  }

  disableRealTimeListeners() {
    const session_id = this.session.session.id
    storage.offLineAdded(session_id)
    storage.offBoxChanged(session_id)
  }

  loadFromData(data) {
    console.log("=====> loading from data...")
    const { lines, boxes } = data

    // TODO: Only pull in info from other player
    // Object.assign(this.user, user)

    // TODO: When players concept introduce update colour of other player
    // this.colour.set(user.colour || "")

    if (lines && typeof lines === "object") {
      lines.forEach((line) => {
        this.lines.push(Line.unserialize(line))
      })
    }

    if (boxes && typeof boxes === "object") {
      boxes.forEach((data) => {
        this.handleBoxChanged(data)
      })
    }
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
    this.grid_size.set(newSize)
    this.user.grid_size = newSize
  }

  changeGridSize(newSize) {
    this.clear()
    this.setGridSize(newSize)
    this.setup()

    if (this.session.session_id) this.persistSession()
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
    this.setupDots()
    this.setupBoxes()
  }

  setupDots() {
    range(this.grid_size.get()).forEach((column) => (
      range(this.grid_size.get()).forEach((row) => {
        this.createDot({column, row})
      })
    ))
  }

  setupBoxes() {
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
