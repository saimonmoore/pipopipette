import React, { Component } from 'react';
import { Provider, observer } from 'mobx-react';
import uniqid from 'uniqid';

import Store from './stores/Store.js';
import WaitingForPlayer from './components/WaitingForPlayer.js';
import GameOver from './components/GameOver.js';
import Form from './components/Form';
import Player from './components/Player.js';
import Grid from './components/Grid.js';
import Auth from './lib/Auth.js';

import './App.css';

const store = new Store();
const auth = new Auth();

if (window.Cypress || true) {
  // only available during E2E tests
  window.app = { store };
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { session: {} };
    this.initSession(session => {
      store.saveSession(session);
      this.state = { session };
    });
  }

  // Session without firebase authentication
  initSession(fn) {
    let session = this.session();

    if (!session) {
      session = this.createSession();
      fn(session);
    } else {
      window.location.hash = session.session_id;
      fn(session);
    }
  }

  // Session with firebase authentication
  // initSession(fn) {
  //   let session = this.session()

  //   if (!session) {
  //     this.signup((error) => {
  //       if (error) {
  //         alert(`Failed to signup! (${JSON.stringify(error)})`)
  //       } else {
  //         session = this.createSession()
  //         this.login(session)
  //         fn(session)
  //       }
  //     })
  //   } else {
  //     window.location.hash = session.session_id
  //     this.login(session)
  //     fn(session)
  //   }
  // }

  login(session) {
    auth.login(this.getUserId(), (error, auth_user) => {
      if (!error) {
        // TODO: What do we need the uid for?
        // Object.assign(session.user, { uid: auth_user.uid })
        // this.saveSession(session)
      } else {
        alert(`Failed to login! (${JSON.stringify(error)})`);
      }
    });
  }

  signup(fn) {
    this.getUserId((signup, user_id) => {
      if (signup) {
        auth.signup(user_id, error => {
          if (error) {
            fn && fn(error, null);
          } else {
            fn && fn(null, user_id);
          }
        });
      } else {
        fn && fn(null, user_id);
      }
    });
  }

  saveSession(session) {
    sessionStorage.setItem('pipopipette_session', JSON.stringify(session));
  }

  createSession() {
    const session_id = this.session_id;
    const user_id = this.getUserId();

    // Update location hash
    window.location.hash = session_id;

    const session = {
      session_id,
      user: { user_id }
    };

    this.saveSession(session);
    return session;
  }

  get session_id() {
    const hash = window.location.hash.substr(1);
    const session_id = (hash.length && hash) || uniqid();
    return session_id;
  }

  session() {
    let session;
    try {
      session = JSON.parse(sessionStorage.getItem('pipopipette_session'));
      return session;
    } catch (err) {
      console.log('[App#session] err: ', JSON.stringify(err));
      return false;
    }
  }

  getUserId(fn) {
    const key = 'pipopipette_user_id';
    let user_id = localStorage.getItem(key);

    if (!user_id) {
      user_id = uniqid();
      localStorage.setItem(key, user_id);
      fn && fn(true, user_id);
    } else {
      fn && fn(false, user_id);
    }

    return user_id;
  }

  renderStatusLabel() {
    const { status } = store;
    if (status.get() === 'loading')
      return (
        <div className="Status">
          <span>Loading...</span>
        </div>
      );
    if (status.get() === 'waiting')
      return (
        <div className="Status">
          <span>Waiting for other player</span>
        </div>
      );
    if (status.get() === 'running')
      return (
        <div className="Status">
          <span>Game started</span>
        </div>
      );
    if (status.get() === 'game_over')
      return (
        <div className="Status">
          <span>Game over</span>
        </div>
      );
  }

  render() {
    const { session } = this.state;
    const { grid_size, boxes, lines, dots, player1, player2 } = store;

    return (
      <Provider store={store}>
        <div className="App">
          <WaitingForPlayer />
          <GameOver />
          <header className="Header">
            {this.renderStatusLabel()}
            <div className="Header-wrapper">
              <div className="LeftPanel">
                <Player player={player1} session={session} />
              </div>
              <div className="CentrePanel">
                <Form session={session} />
              </div>
              <div className="RightPanel">
                <Player player={player2} session={session} />
              </div>
            </div>
          </header>
          <div className="App-wrapper">
            <div className="LeftPanel" />
            <div className="CentrePanel">
              <Grid
                grid_size={grid_size}
                dots={dots}
                lines={lines}
                boxes={boxes}
              />
            </div>
            <div className="RightPanel" />
          </div>
          <div className="Recognition">
            <div className="Author">
              Made by{' '}
              <a
                href="https://github.com/saimonmoore/pipopipette"
                title="Saimon Moore"
              >
                Dr Moore
              </a>
            </div>
            <div className="Borrowings">
              Icons made by{' '}
              <a href="http://www.freepik.com" title="Freepik">
                Freepik
              </a>{' '}
              from{' '}
              <a href="https://www.flaticon.com/" title="Flaticon">
                www.flaticon.com
              </a>{' '}
              is licensed by{' '}
              <a
                href="http://creativecommons.org/licenses/by/3.0/"
                title="Creative Commons BY 3.0"
                target="_blank"
                rel="noopener noreferrer"
              >
                CC 3.0 BY
              </a>
            </div>
          </div>
        </div>
      </Provider>
    );
  }
}

export default observer(App);
