import * as firebase from "firebase";

const APP = "pipopipette"

class Storage {
  constructor() {
    this.initRemoteStorage();
  }

  initRemoteStorage() {
    if (!firebase.apps.length) {
      firebase.initializeApp(this.config())
    }
  }

  config() {
    return {
      apiKey: "AIzaSyDo7kRspbEIVT202T5fuNf5ZTe1GTfZfD0",
      authDomain: "pipo-pipette.firebaseapp.com",
      databaseURL: "https://pipo-pipette.firebaseio.com",
      projectId: "pipo-pipette",
      storageBucket: "pipo-pipette.appspot.com",
      messagingSenderId: "317436935763"
    }
  }

  storage() {
    return firebase.database();
  }

  // e.g. grid_size
  setSession(session_name, session) {
    this.storage().ref(`${APP}/${session_name}/session`).set(session);
  }

  // e.g. colour
  setUser(session_name, user) {
    this.storage().ref(`${APP}/${session_name}/users/user_${user.user_id}`).set(user);
  }

  setLines(session_name, lines) {
    this.storage().ref(`${APP}/${session_name}/lines`).set(lines);
  }

  setBoxes(session_name, boxes) {
    this.storage().ref(`${APP}/${session_name}/boxes`).set(boxes);
  }

  getLines(session_name) {
    return this.getObject(session_name, "lines")
  }

  getBoxes(session_name) {
    return this.getObject(session_name, "boxes")
  }

  async getObject(session_name, object) {
    const ref = this.storage().ref(`/${APP}/${session_name}/${object}`);
    return await ref.once('value')
  }

  async getSession(session_name) {
    const ref = this.storage().ref(`${APP}/${session_name}/session`);
    return await ref.once('value')
  }

  async getUser(session_name, user_id) {
    const ref = this.storage().ref(`${APP}/${session_name}/users/user_${user_id}`);
    return await ref.once('value')
  }

  async getPlayers(session_name) {
    const ref = this.storage().ref(`${APP}/${session_name}/users`);
    return await ref.once('value')
  }

  onGridSizeChanged(session_name, fn) {
    const ref = this.storage().ref(`${APP}/${session_name}/session/grid_size`);
    ref.on('value', (snapshot) => {
      fn(snapshot.val())
    })
  }

  onPlayerAdded(session_name, fn) {
    const ref = this.storage().ref(`${APP}/${session_name}/users`);
    ref.on('child_added', (snapshot) => {
      fn(snapshot.val())
    })
  }

  onPlayerRemoved(session_name, fn) {
    const ref = this.storage().ref(`${APP}/${session_name}/users`);
    ref.on('child_removed', (snapshot) => {
      fn(snapshot.val())
    })
  }

  onPlayerChanged(session_name, fn) {
    const ref = this.storage().ref(`${APP}/${session_name}/users`);
    ref.on('child_changed', (snapshot) => {
      fn(snapshot.val())
    })
  }

  onBoxChanged(session_name, fn) {
    this.onObjectChanged(session_name, "boxes", fn)
  }

  offBoxChanged(session_name) {
    this.offObjectChanged(session_name, "boxes")
  }

  onLineAdded(session_name, fn) {
    this.onObjectAdded(session_name, "lines", fn)
  }

  offLineAdded(session_name) {
    this.offObjectAdded(session_name, "lines")
  }

  onObjectAdded(session_name, object, fn) {
    const ref = this.storage().ref(`/${APP}/${session_name}/${object}`);
    ref.on('child_added', (snapshot) => {
      fn(snapshot.val())
    })
  }

  onObjectChanged(session_name, object, fn) {
    const ref = this.storage().ref(`/${APP}/${session_name}/${object}`);
    ref.on('child_changed', (snapshot) => {
      fn(snapshot.val())
    })
  }

  offObjectAdded(session_name, object) {
    const ref = this.storage().ref(`/${APP}/${session_name}/${object}`);
    ref.off('child_added')
  }

  offObjectChanged(session_name, object) {
    const ref = this.storage().ref(`/${APP}/${session_name}/${object}`);
    ref.off('child_changed')
  }
}

export default Storage;
