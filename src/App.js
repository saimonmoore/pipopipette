import React, { Component } from 'react'
import { Provider, observer } from "mobx-react"
import uniqid from "uniqid"

import Store from './stores/Store.js'
import WaitingForPlayer from './components/WaitingForPlayer.js'
import GameOver from './components/GameOver.js'
import Form from './components/Form.js'
import Player from './components/Player.js'
import Grid from './components/Grid.js'
import Auth from './lib/Auth.js'

import './App.css'

const store = new Store()
const auth = new Auth()

class App extends Component {

  constructor(props) {
    super(props)

    this.state = { session: {} }
    this.initSession((session) => {
      store.saveSession(session)
      this.state = { session }
    })
  }

  initSession(fn) {
    let session = this.session()

    if (!session) {
      this.signup((error) => {
        if (error) {
          alert(`Failed to signup! (${JSON.stringify(error)})`)
        } else {
          session = this.createSession()
          this.login(session)
          fn(session)
        }
      })
    } else {
      window.location.hash = session.session_id
      this.login(session)
      fn(session)
    }
  }

  login(session) {
    auth.login(this.getUserId(), (error, auth_user) => {
      if (!error) {
        // TODO: What do we need the uid for?
        // Object.assign(session.user, { uid: auth_user.uid })
        // this.saveSession(session)
      } else {
        alert(`Failed to login! (${JSON.stringify(error)})`)
      }
    })
  }

  signup(fn) {
    this.getUserId((signup, user_id) => {
      if (signup) {
        auth.signup(user_id, (error) => {
          if (error) {
            fn && fn(error, null)
          } else {
            fn && fn(null, user_id)
          }
        })
      } else {
        fn && fn(null, user_id)
      }
    })
  }

  saveSession(session) {
    sessionStorage.setItem("session", JSON.stringify(session))
  }

  createSession() {
    const session_id = this.session_id
    const user_id = this.getUserId()

    // Update location hash
    window.location.hash = session_id

    const session = {
      session_id,
      user: { user_id }
    }

    this.saveSession(session)
    return session
  }

  get session_id() {
    const hash = window.location.hash.substr(1)
    return (hash.length && hash) || uniqid()
  }

  session() {
    try {
      return JSON.parse(sessionStorage.getItem("session"))
    } catch(err) {
      return false
    }
  }

  getUserId(fn) {
    const key = "pipopipette_user_id"
    let user_id = localStorage.getItem(key)

    if (!user_id) {
      user_id = uniqid()
      localStorage.setItem(key, user_id)
      fn && fn(true, user_id)
    } else {
      fn && fn(false, user_id)
    }

    return user_id
  }

  render() {
    const { session } = this.state
    const { grid_size, boxes, lines, dots, player1, player2 } = store

    return (
      <Provider store={store}>
        <div className="App">
          <WaitingForPlayer />
          <GameOver />
          <header className="Header">
            <div className="Header-wrapper">
              <div className="LeftPanel">
                <Player player={player1} session={session}/>
              </div>
              <div className="CentrePanel">
                <Form session={session} />
              </div>
              <div className="RightPanel">
                <Player player={player2} session={session}/>
              </div>
            </div>
          </header>
          <div className="App-wrapper">
            <div className="LeftPanel"></div>
            <div className="CentrePanel">
              <Grid grid_size={grid_size} dots={dots} lines={lines} boxes={boxes} />
            </div>
            <div className="RightPanel"></div>
          </div>
        </div>
      </Provider>
    );
  }
}

export default observer(App);
