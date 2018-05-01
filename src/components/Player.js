import React, { Component } from 'react';
import { decorate, computed } from "mobx"
import { inject, observer } from "mobx-react";

import ColorPicker from './ColorPicker.js'

import leftAvatarImg from './leftAvatar.svg'
import rightAvatarImg from './rightAvatar.svg'
import "./Player.css"

class Player extends Component {
  constructor(props) {
    super(props)

    this.handleColourChange = this.handleColourChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleOnSubmit(event) {
    event.preventDefault()
  }

  handleColourChange(colour) {
    const { store } = this.props
    store.saveColour(colour)
  }

  renderPlayerAvatar(player, online, colour) {
    const classNames = player ? "Player" : "Player offline"
    const playerNumber = player && player.player
    const img = (playerNumber === 1) ? leftAvatarImg : rightAvatarImg
    return (<span><img src={img} alt="Player {playerNumber}" className={classNames} /></span>)
  }

  scorePlayer(player) {
    if (!player) return 0

    const { boxes } = this.props.store

    return boxes.reduce((sum, box) => {
      if (!box.player) return sum
      if (box.player.id !== player.id) return sum
      if (box.closed && box.closed.get()) sum += 1
      return sum
    }, 0)
  }

  get scorePlayer1() {
    const { player1 } = this.props.store
    return this.scorePlayer(player1)
  }

  get scorePlayer2() {
    const { player2 } = this.props.store
    return this.scorePlayer(player2)
  }

  render() {
    const { player } = this.props
    const colour = player.colour
    const playerNumber = player && player.player
    const isPlayer2 = playerNumber === 2
    const score = isPlayer2 ? this.scorePlayer2 : this.scorePlayer1

    return (
      <div className="Player">
        <div className="LeftPanel">
          <div className="TopPanel">
            <div className="Avatar">
              { this.renderPlayerAvatar(player, colour) }
            </div>
          </div>
          <div className="BottomPanel">
            { 
               player.colour &&
               <form onSubmit={ this.handleOnSubmit }>
                 <ColorPicker colour={colour} disabled={isPlayer2} onChange={this.handleColourChange}/>
               </form>
             }
          </div>
        </div>
        <div className="RightPanel">
          <div className="Score">
            <span>Score: {score}</span>
          </div>
        </div>
      </div>
    );
  }
}

decorate(Player, {
  scorePlayer1: computed,
  scorePlayer2: computed,
})

export default inject("store")(observer(Player));
