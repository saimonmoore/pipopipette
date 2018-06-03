import { decorate, observable, toJS } from 'mobx';

import Dot from '../lib/Dot.js';
import Line from '../lib/Line.js';
import Box from '../lib/Box.js';
import Player from '../lib/Player.js';
import { range } from '../utils.js';
import Storage from '../lib/Storage.js';

import Constants from '../constants.js';

class Store {
  grid_size = observable.box(Constants.defaultGridSize);
  turn = observable.box('');
  status = observable.box('loading');
  dots = [];
  lines = [];
  boxes = [];
  player1 = {};
  player2 = {};
  user = {};
  session = {};

  constructor(options) {
    options = options || {};
    this.storage = new Storage();
    if (!options.testing_env) this.storage.clearOldEndedSessions();
    if (options.testing_env) this.storage.clearOldTestingSessions();
    this.handleLineAdded = this.handleLineAdded.bind(this);
    this.handleBoxChanged = this.handleBoxChanged.bind(this);
    this.handleGridSizeChanged = this.handleGridSizeChanged.bind(this);
    this.handlePlayerAdded = this.handlePlayerAdded.bind(this);
    this.handlePlayerRemoved = this.handlePlayerRemoved.bind(this);
    this.handlePlayerChanged = this.handlePlayerChanged.bind(this);

    this.player1 = new Player(this.user);
    this.setDefaultGridSize();
  }

  handleLineAdded(data) {
    const line = Line.unserialize(data, this.player1, this.player2);
    if (!Line.exists(this.lines, line)) {
      this.addLine(line, line.player);
    }
  }

  handleBoxChanged(data) {
    const box = Box.unserialize(data, this.player1, this.player2);
    Box.updateBox(this.boxes, box);
  }

  handleGridSizeChanged(grid_size) {
    if (this.grid_size.get() !== grid_size) {
      this.changeGridSize(grid_size, false);

      this.fetchData()
        .then(data => {
          const { lines, boxes } = data;
          const mustLoadData = lines.length || boxes.length;

          if (mustLoadData) {
            this.loadFromData(data);
          }

          // TODO: Disable loading indicator
        })
        .catch(error => {
          console.log(
            '[Store#handleGridSizeChanged]...error fetchData... error: ',
            JSON.stringify(error)
          );
        });
    }
  }

  handlePlayerChanged(data) {
    const player = new Player(data);
    if (Player.isPlayerTwo(player, this.player1)) {
      player.setPlayer(2);
      this.player2 = player;

      this.setColour(this.player2, player.colour);
    }
  }

  gameOver() {
    return this.status.get() === 'game_over';
  }

  handlePlayerAdded(data) {
    if (this.gameOver()) return;
    const player = new Player(data);
    if (Player.isPlayerTwo(player, this.player1)) {
      player.setPlayer(2);
      this.player2 = player;

      this.setColour(this.player2, player.colour);
      if (!this.turn.get()) this.turn.set(this.player1.id);
      this.setStatus('running');
    }
  }

  handlePlayerRemoved(data) {
    const player = new Player(data);
    if (Player.isPlayerTwo(player, this.player1)) {
      this.player2 = null;
    }
  }

  async fetchData() {
    const session_id = this.session.session_id;
    const user_id = this.player1.id;

    const fetchSession = this.storage.getSession(session_id);
    const fetchLines = this.storage.getLines(session_id);
    const fetchBoxes = this.storage.getBoxes(session_id);
    const fetchUser = this.storage.getUser(session_id, user_id);
    const fetchPlayers = this.storage.getPlayers(session_id);

    const fetches = [
      fetchSession,
      fetchUser,
      fetchLines,
      fetchBoxes,
      fetchPlayers
    ];
    const responses = await Promise.all(fetches);

    if (responses && typeof responses === 'object') {
      const data = responses.map(snapshot => {
        if (!snapshot) return null;
        if (!snapshot.exists()) return false;
        return snapshot.val();
      });

      return {
        session: data[0],
        user: data[1],
        lines: data[2],
        boxes: data[3],
        players: data[4]
      };
    } else {
      return { session: null, user: null, lines: [], boxes: [], players: [] };
    }
  }

  persistSession() {
    const { session_id, timestamp } = this.session;

    if (!timestamp) {
      const now = new Date().getTime();
      console.log('[Warning] no timestamp found! Setting to: ', now);
      this.session['timestamp'] = now;
    }

    this.storage.setSession(session_id, toJS(this.session));
    this.storage.setUser(session_id, this.player1.serialize());
    this.storage.setLines(session_id, this.serialize(this.lines));
    this.storage.setBoxes(session_id, this.serialize(this.boxes));
  }

  firstTimeActions() {
    console.log(`[first time]=======> ${this.session.session_id}`);
    const colour = this.player1.colour;
    console.log(`[first time]=======> player 1 colour: ${colour}`);
    if (!colour || !colour.length) {
      console.log(`[first time]=======> setting random colour`);
      this.player1.setColour(this.assignRandomColour());
    }

    this.persistSession();
    this.enableRealTimeListeners();
    this.status.set('waiting');
  }

  saveSession(session) {
    Object.assign(this.session, session);
    Object.assign(this.user, session.user);
    this.player1 = new Player(this.user);
    this.session.turn = this.player1.id;
    const currentGridSize = this.grid_size.get();

    // TODO: Enable loading indicator
    this.fetchData()
      .then(data => {
        const { session, lines, boxes, players } = data;
        const mustLoadData = lines.length || boxes.length;

        // Update the grid_size from the remote session
        if (session) {
          Object.assign(this.session, session);

          if (
            currentGridSize !== session.grid_size &&
            session.grid_size > Constants.minimumGridSize
          ) {
            this.changeGridSize(session.grid_size);
          }

          if (session.turn) {
            this.turn.set(session.turn);
          } else {
            this.turn.set(this.player1.id);
          }

          if (session.status) {
            this.status.set(session.status);
          } else {
            this.status.set('loading');
          }
        }

        // Load players
        players &&
          Object.values(players).forEach(data => {
            const player = new Player(data);
            if (Player.isPlayerOne(player, this.player1)) {
              this.player1 = new Player(player);
            }

            if (Player.isPlayerTwo(player, this.player1)) {
              player.setPlayer(2);
              this.player2 = player;
            }
          });

        if (mustLoadData) {
          this.loadFromData(data);
        }

        this.firstTimeActions();
        // TODO: Disable loading indicator
      })
      .catch(error => {
        this.firstTimeActions();
      });
  }

  enableRealTimeListeners() {
    const session_id = this.session.session_id;
    this.storage.onLineAdded(session_id, this.handleLineAdded);
    this.storage.onBoxChanged(session_id, this.handleBoxChanged);
    this.storage.onGridSizeChanged(session_id, this.handleGridSizeChanged);
    this.storage.onPlayerAdded(session_id, this.handlePlayerAdded);
    this.storage.onPlayerRemoved(session_id, this.handlePlayerRemoved);
    this.storage.onPlayerChanged(session_id, this.handlePlayerChanged);
  }

  disableRealTimeListeners() {
    const session_id = this.session.session_id;
    this.storage.offLineAdded(session_id);
    this.storage.offBoxChanged(session_id);
  }

  loadFromData(data) {
    const { lines, boxes } = data;

    if (lines && typeof lines === 'object') {
      lines.forEach(line => {
        this.lines.push(Line.unserialize(line, this.player1, this.player2));
      });
    }

    if (boxes && typeof boxes === 'object') {
      boxes.forEach(data => {
        this.handleBoxChanged(data);
      });
    }

    if (this.hasWon()) {
      this.setStatus('game_over');
      this.persistSession();
      // this.destroySession();
    }
  }

  destroySession() {
    sessionStorage.removeItem('pipopipette_session');
    const currentSession = this.session.session_id;
    this.storage.clearSession(currentSession);
  }

  assignRandomColour() {
    const colours = [
      'yellow',
      'red',
      'green',
      'blue',
      'orange',
      'brown',
      'pink'
    ];
    return colours[Math.floor(Math.random() * colours.length)];
  }

  clear() {
    this.dots = [];
    this.lines = [];
    this.boxes = [];
  }

  setGridSize(newSize) {
    this.grid_size.set(newSize);
    this.session.grid_size = newSize;
  }

  setDefaultGridSize() {
    this.clear();
    this.setGridSize(Constants.defaultGridSize);
    this.setup();
  }

  changeGridSize(newSize, persist) {
    this.clear();
    this.setGridSize(newSize);
    this.setup();
    if (persist) this.persistSession();
  }

  saveColour(colour) {
    this.player1.setColour(colour);
    this.setColour(this.player1, colour);
    this.persistSession();
  }

  setColour(player, newColour) {
    this.updateLineColour(player, newColour);
    this.updateBoxColour(player, newColour);
  }

  updateLineColour(player, colour) {
    this.lines.forEach(line => {
      if (line.player && line.player.id === player.id) {
        line.setColour(colour);
      }
    });
  }

  updateBoxColour(player, colour) {
    this.boxes.forEach(box => {
      if (box.player && box.player.id === player.id) {
        box.setColour(colour);
      }
    });
  }

  setup() {
    this.setupDots();
    this.setupBoxes();
  }

  setupDots() {
    range(this.grid_size.get()).forEach(column =>
      range(this.grid_size.get()).forEach(row => {
        this.createDot({ column, row });
      })
    );
  }

  setupBoxes() {
    // We create N-1 x N-1 boxes from a N x N node grid
    range(this.grid_size.get() - 1).forEach(row => {
      range(this.grid_size.get() - 1).forEach(column => {
        this.createBox(column, row);
      });
    });
  }

  createDot(column, row) {
    const dot = new Dot(column, row);
    this.addDot(dot);
  }

  createBox(column, row) {
    const topLeft = [column, row];
    const topRight = [column + 1, row];
    const bottomRight = [column + 1, row + 1];
    const bottomLeft = [column, row + 1];
    const box = new Box({ topLeft, topRight, bottomRight, bottomLeft });

    this.addBox(box);
  }

  addDot(dot) {
    this.dots.push(dot);
  }

  removeDot(dot) {
    this.dots.forEach(dot => {
      this.dots.splice(this.dots.indexOf(dot), 1);
    });
  }

  setTurn(player, boxClosed) {
    if (boxClosed) return;

    const nextTurn =
      player.id === this.player1.id ? this.player2.id : this.player1.id;
    this.turn.set(nextTurn);
    this.session.turn = this.turn.get();
  }

  setStatus(newStatus) {
    this.status.set(newStatus);
    this.session.status = this.status.get();
  }

  hasWon() {
    const won = this.boxes.every(box => {
      return box.closed.get();
    });
    return won;
  }

  addLine(line, player) {
    let boxClosed;
    line.setPlayer(player || this.player1);
    this.lines.push(line);
    const boxes = Box.findBoxes(line, this.boxes);
    boxes.forEach(box => {
      if (box.addLine(line)) boxClosed = true;
    });

    this.setTurn(player || this.player1, boxClosed);

    if (this.hasWon()) {
      this.setStatus('game_over');
      this.persistSession();
      // this.destroySession();
    }

    this.persistSession();
  }

  removeLine(line) {
    this.lines.forEach(line => {
      this.lines.splice(this.lines.indexOf(line), 1);
    });
  }

  addBox(box) {
    this.boxes.push(box);
  }

  removeBox(box) {
    this.boxes.forEach(box => {
      this.boxes.splice(this.boxes.indexOf(box), 1);
    });
  }

  serialize(objects) {
    return objects.map(object => object.serialize());
  }
}

decorate(Store, {
  dots: observable,
  lines: observable,
  boxes: observable,
  player1: observable,
  player2: observable,
  user: observable,
  session: observable
});

export default Store;
