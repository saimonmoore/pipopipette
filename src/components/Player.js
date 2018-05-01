import React, { Component } from 'react';
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

  render() {
    const { player } = this.props
    const colour = player.colour
    const score = player.score
    const playerNumber = player && player.player
    const isPlayer2 = playerNumber === 2

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

export default inject("store")(observer(Player));
