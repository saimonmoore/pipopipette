import React, { Component } from 'react'
import { Provider, observer } from "mobx-react"

import Store from './stores/Store.js'
import Form from './components/Form.js'
import Grid from './components/Grid.js'
import logo from './logo.svg'
import './App.css'

const store = new Store()

class App extends Component {

  render() {
    const { grid_size, boxes, lines, dots } = store

    return (
      <Provider store={store}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <Form />
          </header>
          <Grid grid_size={grid_size} dots={dots} lines={lines} boxes={boxes} />
        </div>
      </Provider>
    );
  }
}

export default observer(App);
