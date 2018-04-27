import React, { Component } from 'react'
import { Provider } from "mobx-react"

import Store from './stores/Store.js'
import Form from './components/Form.js'
import Grid from './components/Grid.js'
import logo from './logo.svg'
import './App.css'

const store = new Store()

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <Form />
          </header>
          <Grid />
        </div>
      </Provider>
    );
  }
}

export default App;
