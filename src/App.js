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
    console.log("[App#constructor] ===> beforeInitSession")
    this.initSession((session) => {
      console.log("[App#constructor] ===> in InitSession#fn...about to call `store.saveSession` with: ", JSON.stringify(session))
      store.saveSession(session)
      console.log("[App#constructor] ===> in InitSession#fn...called `store.saveSession`")
      this.state = { session }
    })
  }

  // Session without firebase authentication
  initSession(fn) {
    console.log("[App#initSession] ===> ...looking for session")
    let session = this.session()

    if (!session) {
      console.log("[App#initSession] ===> ...no session found....about to call #signup")
      session = this.createSession()
      console.log("[App#initSession] ===> ...created session: ", JSON.stringify(session))
      fn(session)
    } else {
      console.log("[App#initSession] ===> ...found session:", JSON.stringify(session))
      window.location.hash = session.session_id
      console.log("[App#initSession] ===> ...set location hash to:", window.location.hash)
      fn(session)
    }
  }

  // Session with firebase authentication
  // initSession(fn) {
  //   console.log("[App#initSession] ===> ...looking for session")
  //   let session = this.session()

  //   if (!session) {
  //     console.log("[App#initSession] ===> ...no session found....about to call #signup")
  //     this.signup((error) => {
  //       console.log("[App#initSession] ===> ...in signup#fn ...")
  //       if (error) {
  //         console.log("[App#initSession] ===> ...in signup#fn error! ", JSON.stringify(error))
  //         alert(`Failed to signup! (${JSON.stringify(error)})`)
  //       } else {
  //         console.log("[App#initSession] ===> ...in signup#fn...creating session ")
  //         session = this.createSession()
  //         console.log("[App#initSession] ===> ...in signup#fn...created session: ", JSON.stringify(session))
  //         console.log("[App#initSession] ===> ...in signup#fn...about to login...")
  //         this.login(session)
  //         console.log("[App#initSession] ===> ...in signup#fn...logged in...about to call outer fn with session")
  //         fn(session)
  //       }
  //     })
  //   } else {
  //     console.log("[App#initSession] ===> ...found session:", JSON.stringify(session))
  //     window.location.hash = session.session_id
  //     console.log("[App#initSession] ===> ...set location hash to:", window.location.hash)
  //     console.log("[App#initSession] ===> ...about to login...")
  //     this.login(session)
  //     console.log("[App#initSession] ===> ...logged in...about to call outer fn with session")
  //     fn(session)
  //   }
  // }

  login(session) {
    console.log("[App#login] ===> ...with session:", JSON.stringify(session))
    auth.login(this.getUserId(), (error, auth_user) => {
      console.log("[App#login] ===> in auth.login#fn")
      if (!error) {
        console.log("[App#login] ===> in auth.login#fn no error auth_user: ", JSON.stringify(auth_user))
        // TODO: What do we need the uid for?
        // Object.assign(session.user, { uid: auth_user.uid })
        // this.saveSession(session)
      } else {
        console.log("[App#login] ===> in auth.login#fn error! ", JSON.stringify(error))
        alert(`Failed to login! (${JSON.stringify(error)})`)
      }
    })
    console.log("[App#login] ===> ...after auth.login")
  }

  signup(fn) {
    console.log("[App#signup] ===> ...before #getUserId")
    this.getUserId((signup, user_id) => {
      if (signup) {
        console.log("[App#signup] ===> ...in #getUserId#fn have to signup for user_id: ", user_id)
        console.log("[App#signup] ===> ...in #getUserId#fn calling auth.signup for user_id: ", user_id)
        auth.signup(user_id, (error) => {
          if (error) {
            console.log("[App#signup] ===> ...in auth.signup#fn user_id: ", user_id, " error: ", JSON.stringify(error))
            fn && fn(error, null)
          } else {
            console.log("[App#signup] ===> ...in auth.signup#fn user_id: ", user_id, " no error...calling outer fn")
            fn && fn(null, user_id)
          }
        })
      } else {
        console.log("[App#signup] ===> ...in #getUserId#fn don't have to signup for user_id: ", user_id)
        fn && fn(null, user_id)
      }
    })
  }

  saveSession(session) {
    console.log("[App#saveSession] saving session to sessionStorage: ", JSON.stringify(session))
    sessionStorage.setItem("pipopipette_session", JSON.stringify(session))
  }

  createSession() {
    console.log("[App#createSession] creating session... ")
    const session_id = this.session_id
    const user_id = this.getUserId()

    // Update location hash
    window.location.hash = session_id

    const session = {
      session_id,
      user: { user_id }
    }

    console.log("[App#createSession] created session: ", JSON.stringify(session))
    console.log("[App#createSession] now saving session to sessionStorage")
    this.saveSession(session)
    console.log("[App#createSession] done saving session to sessionStorage")
    return session
  }

  get session_id() {
    const hash = window.location.hash.substr(1)
    const session_id = (hash.length && hash) || uniqid()
    console.log("[App#session_id] session_id: ", session_id)
    return session_id
  }

  session() {
    let session
    try {
      session = JSON.parse(sessionStorage.getItem("pipopipette_session"))
      console.log("[App#session] session: ", JSON.stringify(session))
      return session
    } catch(err) {
      console.log("[App#session] err: ", JSON.stringify(err))
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
    console.log("[App#render] starting...")
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
          <div class="Recognition">
            <div class="Author">Made by <a href="https://github.com/saimonmoore/pipopipette" title="Saimon Moore">Dr Moore</a></div>
            <div class="Borrowings">
              Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
            </div>
          </div>
        </div>
      </Provider>
    );
  }
}

export default observer(App);
