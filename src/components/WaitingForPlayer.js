import React, { Component } from 'react'
import { inject, observer } from "mobx-react"

import Modal from './Modal.js'

import "./WaitingForPlayer.css"

class WaitingForPlayer extends Component {
  constructor(props) {
    super(props)

    this.onClose = this.onClose.bind(this)
  }

  onClose() {
  }

  render() {
    const { store } = this.props
    const { player2 } = store
    const showWaitingForPlayer = !player2.id

    return (
      <Modal show={showWaitingForPlayer} onClose={this.onClose} closable={false}>
        <div className="WaitingForPlayer">
          <p>
            This is Pipopipette.
            A simple <a href="https://en.wikipedia.org/wiki/Dots_and_Boxes" target="_blank" rel="noopener noreferrer">game</a> where each player has to
            connect dots with lines and win the game by completing boxes.
          </p>

          <p>
            Now all you only need to start is one more player...
          </p>

          <p>
            Share this <a href={window.location.href}>link</a> with a friend and start playing...
          </p>
        </div>
      </Modal>
    );
  }
}

export default inject("store")(observer(WaitingForPlayer));
