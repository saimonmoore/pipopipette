import * as firebase from "firebase";

import { to } from '../utils.js'

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

  // e.g. grid_size, colour
  setUser(session_name, user) {
    this.storage().ref(`${APP}/${session_name}/users/user_${user.user_id}`).set(user);
  }

  setDots(session_name, dots) {
    this.storage().ref(`${APP}/${session_name}/dots`).set(dots);
  }

  setLines(session_name, lines) {
    this.storage().ref(`${APP}/${session_name}/lines`).set(lines);
  }

  setBoxes(session_name, boxes) {
    this.storage().ref(`${APP}/${session_name}/boxes`).set(boxes);
  }

  async getDots(session_name, fn) {
    this.getArray(session_name, "dots", fn)
  }

  async getLines(session_name, fn) {
    this.getArray(session_name, "lines", fn)
  }

  async getBoxes(session_name, fn) {
    this.getArray(session_name, "boxes", fn)
  }

  async getArray(session_name, object, fn) {
    let list = [];
    let snapshot;
    let error;

    const ref = this.storage().ref(`${APP}/${session_name}/${object}`);
    [error, snapshot] = await to(ref.once('value'));
    if (error) return fn(error, null);

    const response = Object.assign({}, snapshot.val());
    list = response[object] || [];

    fn(null, { list });
  }

  async getUser(session_name, user_id, fn) {
    let user;
    let snapshot;
    let error;

    const ref = this.storage().ref(`${APP}/${session_name}/users/user_${user_id}`);
    [error, snapshot] = await to(ref.once('value'));
    if (error) return fn(error, null);

    const response = Object.assign({}, snapshot.val());
    user = response.user

    fn(null, { user });
  }
}

export default Storage;
