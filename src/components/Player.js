import React, { Component } from 'react';
import { decorate, computed } from 'mobx';
import { inject, observer } from 'mobx-react';

import ColorPicker from './ColorPicker.js';

import leftAvatarImg from './leftAvatar.svg';
import rightAvatarImg from './rightAvatar.svg';
import './Player.css';

class Player extends Component {
  constructor(props) {
    super(props);

    this.handleColourChange = this.handleColourChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleOnSubmit(event) {
    event.preventDefault();
  }

  handleColourChange(colour) {
    const { store } = this.props;
    store.saveColour(colour);
  }

  renderPlayerAvatar(player, online, colour) {
    const classNames = player ? 'Player' : 'Player offline';
    const playerNumber = player && player.player;
    const img = playerNumber === 1 ? leftAvatarImg : rightAvatarImg;
    return (
      <span>
        <img src={img} alt="Player {playerNumber}" className={classNames} />
      </span>
    );
  }

  static scorePlayer(player, boxes) {
    if (!player) return 0;
    if (!boxes) return 0;
    if (boxes && !typeof boxes === 'object') return 0;

    return boxes.reduce((sum, box) => {
      if (!box.player) return sum;
      if (box.player.id !== player.id) return sum;
      if (box.closed && box.closed.get()) sum += 1;
      return sum;
    }, 0);
  }

  get scorePlayer1() {
    const { store } = this.props;
    const { player1, boxes } = store;
    return Player.scorePlayer(player1, boxes);
  }

  get scorePlayer2() {
    const { store } = this.props;
    const { player2, boxes } = store;
    return Player.scorePlayer(player2, boxes);
  }

  get turnLabel() {
    const { player } = this.props;
    const { status } = this.props.store;
    const playerNumber = player && player.player;
    const { turn, player1, player2 } = this.props.store;

    if (status.get() === 'game_over') return '';
    if (!turn.get()) return '';
    if (!player1) return '';
    if (!player2) return 'Your turn';

    if (turn.get() === player1.id && playerNumber === 1) {
      return 'Your turn';
    }

    if (turn.get() === player1.id && playerNumber === 2) {
      return '';
    }

    if (turn.get() === player2.id && playerNumber === 2) {
      return 'Their turn';
    }

    if (turn.get() === player2.id && playerNumber === 1) {
      return '';
    }
  }

  render() {
    const { player } = this.props;
    const colour = player.colour;
    const playerNumber = player && player.player;
    const isPlayer2 = playerNumber === 2;
    const score = isPlayer2 ? this.scorePlayer2 : this.scorePlayer1;

    return (
      <div className="Player">
        <div className="LeftPanel">
          <div className="TopPanel">
            <div className="Avatar">
              {this.renderPlayerAvatar(player, colour)}
            </div>
          </div>
          <div className="BottomPanel">
            {player.colour && (
              <form onSubmit={this.handleOnSubmit}>
                <ColorPicker
                  colour={colour}
                  disabled={isPlayer2}
                  onChange={this.handleColourChange}
                />
              </form>
            )}
          </div>
        </div>
        <div className="RightPanel">
          <div className="Score">
            <span>Score: {score}</span>
          </div>

          <div className="Turn">
            <span>{this.turnLabel}</span>
          </div>
        </div>
      </div>
    );
  }
}

decorate(Player, {
  scorePlayer1: computed,
  scorePlayer2: computed,
  turnLabel: computed
});

export default inject('store')(observer(Player));
