import { decorate, observable, toJS } from "mobx"

import Dot from '../lib/Dot.js'
import Line from '../lib/Line.js'
import Box from '../lib/Box.js'
import Player from '../lib/Player.js'
import { range } from '../utils.js'
import Storage from '../lib/Storage.js'

import Constants from "../constants.js"

const storage = new Storage()

class Store {
  grid_size = observable.box(Constants.defaultGridSize);
  turn = observable.box("");
  status = observable.box("waiting");
  dots = []
  lines = []
  boxes = []
  player1 = {}
  player2 = {}
  user = {}
  session = {}

  constructor() {
    this.handleLineAdded = this.handleLineAdded.bind(this)
    this.handleBoxChanged = this.handleBoxChanged.bind(this)
    this.handleGridSizeChanged = this.handleGridSizeChanged.bind(this)
    this.handlePlayerAdded = this.handlePlayerAdded.bind(this)
    this.handlePlayerRemoved = this.handlePlayerRemoved.bind(this)

    this.player1 = new Player(this.user)
    this.setDefaultGridSize()
  }

  handleLineAdded(data) {
    const line = Line.unserialize(data, this.player1, this.player2)
    if (!Line.exists(this.lines, line)) {
      this.addLine(line, line.player)
    }
  }

  handleBoxChanged(data) {
    const box = Box.unserialize(data, this.player1, this.player2)
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

  handlePlayerChanged(data) {
    const player = new Player(data)
    if (Player.isPlayerTwo(player, this.player1)) {
      player.setPlayer(2)

      if (this.player.colour.get() !== player.colour) {
        this.setColour(player, player.colour)
      }

      this.player2 = player
    }
  }

  gameOver() {
    return this.status.get() === "game_over"
  }

  handlePlayerAdded(data) {
    console.log("[Store#handlePlayerAdded]...data: ", JSON.stringify(data))
    if (this.gameOver()) return
    console.log("[Store#handlePlayerAdded]...not game over...")
    const player = new Player(data)
    if (Player.isPlayerTwo(player, this.player1)) {
      player.setPlayer(2)
      this.player2 = player

      this.setColour(this.player2, player.colour)
      this.setStatus("running")
      console.log("[Store#handlePlayerAdded]...was player 2...game now running...")
    }
  }

  handlePlayerRemoved(data) {
    const player = new Player(data)
    if (Player.isPlayerTwo(player, this.player1)) this.player2 = null
  }

  async fetchData() {
    const session_id = this.session.session_id
    const user_id = this.player1.id

    const fetchSession = storage.getSession(session_id)
    const fetchLines = storage.getLines(session_id)
    const fetchBoxes = storage.getBoxes(session_id)
    const fetchUser = storage.getUser(session_id, user_id)
    const fetchPlayers = storage.getPlayers(session_id)

    const fetches = [fetchSession, fetchUser, fetchLines, fetchBoxes, fetchPlayers]
    const responses = await Promise.all(fetches)

    if (responses && typeof responses === 'object') {
      const data = responses.map((snapshot) => {
        if (!snapshot) return null
        if (!snapshot.exists()) return false
        return snapshot.val()
      })

      return { session: data[0], user: data[1], lines: data[2], boxes: data[3], players: data[4] }
    } else {
      return { session: null, user: null, lines: [], boxes: [], players: [] }
    }
  }

  persistSession() {
    const session_id = this.session.session_id
    storage.setSession(session_id, toJS(this.session))
    storage.setUser(session_id, this.player1.serialize())
    storage.setLines(session_id, this.serialize(this.lines))
    storage.setBoxes(session_id, this.serialize(this.boxes))
  }

  firstTimeActions() {
    const colour = this.player1.colour
    if (!colour || !colour.length) {
      this.player1.setColour(this.assignRandomColour())
    }

    this.persistSession()
    this.enableRealTimeListeners()
  }

  saveSession(session) {

    Object.assign(this.session, session)

    Object.assign(this.user, session.user)
    this.player1 = new Player(this.user)
    this.session.turn = this.player1.id

    // TODO: Enable loading indicator
    this.fetchData().then((data) => {
      const { session, lines, boxes, players } = data
      const mustLoadData = lines.length || boxes.length

      // Update the grid_size from the remote session
      if (session) {
        Object.assign(this.session, session)

        if ((this.grid_size.get() !== session.grid_size) && (session.grid_size > Constants.minimumGridSize)) {
          this.changeGridSize(session.grid_size)
        }

        if (session.turn) {
          this.turn.set(session.turn)
        } else {
          this.turn.set(this.player1.id)
        }
      }

      // Load players
      players && Object.values(players).forEach((data) =>{
        const player = new Player(data)
        if (Player.isPlayerOne(player, this.player1)) {
          this.player1 = new Player(player)
        }

        if (Player.isPlayerTwo(player, this.player1)) {
          player.setPlayer(2)
          this.player2 = player
        }
      })

      if (mustLoadData) {
        this.loadFromData(data)
      }

      this.firstTimeActions()
      // TODO: Disable loading indicator
    }).catch((error) => {
      console.log("=====> data fetch error: ", error)
      this.firstTimeActions()
    })
  }

  enableRealTimeListeners() {
    const session_id = this.session.session_id
    storage.onLineAdded(session_id, this.handleLineAdded)
    storage.onBoxChanged(session_id, this.handleBoxChanged)
    storage.onGridSizeChanged(session_id, this.handleGridSizeChanged)
    storage.onPlayerAdded(session_id, this.handlePlayerAdded)
    storage.onPlayerRemoved(session_id, this.handlePlayerRemoved)
  }

  disableRealTimeListeners() {
    const session_id = this.session.session_id
    storage.offLineAdded(session_id)
    storage.offBoxChanged(session_id)
  }

  loadFromData(data) {
    console.log("=====> loading from data...")
    const { lines, boxes } = data

    if (lines && typeof lines === "object") {
      lines.forEach((line) => {
        this.lines.push(Line.unserialize(line, this.player1, this.player2))
      })
    }

    if (boxes && typeof boxes === "object") {
      boxes.forEach((data) => {
        this.handleBoxChanged(data)
      })
    }

    if (this.hasWon()) {
      console.log("[Store#loadFromData]...has won! GAME OVER!") 
      this.setStatus("game_over")
      this.persistSession()
    }

    console.log("[Store#loadFromData]...done") 
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
    this.session.grid_size = newSize
  }

  setDefaultGridSize() {
    this.clear()
    this.setGridSize(Constants.defaultGridSize)
    this.setup()
  }

  changeGridSize(newSize) {
    this.clear()
    this.setGridSize(newSize)
    this.setup()
    this.persistSession()
  }

  saveColour(colour) {
    this.setColour(this.player1, colour)
    this.persistSession()
  }

  setColour(player, newColour) {
    this.updateLineColour(player, newColour)
    this.updateBoxColour(player, newColour)
  }

  updateLineColour(player, colour) {
    this.lines.forEach((line) => {
      if (line.player && (line.player.id === player.id)) {
        line.setColour(colour)
      }
    })
  }

  updateBoxColour(player, colour) {
    this.boxes.forEach((box) => {
      if (box.player && (box.player.id === player.id)) {
        box.setColour(colour)
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

  setTurn(player, boxClosed) {
    if (boxClosed) return

    const nextTurn = player.id === this.player1.id ? this.player2.id : this.player1.id
    this.turn.set(nextTurn)
    this.session.turn = this.turn.get()
  }

  setStatus(newStatus) {
    console.log("[Store#setStatus]...newStatus: ", newStatus) 
    this.status.set(newStatus)
    this.session.status = this.status.get()
    console.log("[Store#setStatus]...done", this.status.get(), this.session.status) 
  }

  hasWon() {
    const won = this.boxes.every((box) => {
      return box.closed.get()
    })
    console.log("[Store#hasWon]...won: ", won) 
    return won
  }

  addLine(line, player) {
    let boxClosed;
    line.setPlayer(player || this.player1)
    this.lines.push(line)
    const boxes = Box.findBoxes(line, this.boxes)
    boxes.forEach((box) => {
      boxClosed = box.addLine(line)
    })

    this.setTurn(player || this.player1, boxClosed)

    if (this.hasWon()) {
      this.setStatus("game_over")
      this.persistSession()
    }

    console.log("[Store#addLine]...done...persisting session") 
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
  player1: observable,
  player2: observable,
  user: observable,
  session: observable,
})

export default Store
