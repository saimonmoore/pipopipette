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
    const classNames = online ? "Player" : "Player offline"
    const img = (player === 1) ? leftAvatarImg : rightAvatarImg
    // TODO: Round semi-transparent circle of colour
    const styles = { }

    return (<span style={styles}><img src={img} alt="Player {player}" className={classNames} /></span>)
  }

  render() {
    const { colour } = this.props.store
    const { player, online, score } = this.props

    return (
      <div className="Player">
        <div className="LeftPanel">
          <div className="TopPanel">
            <div className="Avatar">
              { this.renderPlayerAvatar(player, online, colour) }
            </div>
          </div>
          <div className="BottomPanel">
            <form onSubmit={ this.handleOnSubmit }>
              <ColorPicker colour={colour.get()} onChange={this.handleColourChange}/>
            </form>
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
