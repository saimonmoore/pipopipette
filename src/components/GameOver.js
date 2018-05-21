import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { decorate, computed } from 'mobx';

import Player from './Player.js';
import Modal from './Modal.js';

import './GameOver.css';

class GameOver extends Component {
  constructor(props) {
    super(props);

    this.onClose = this.onClose.bind(this);
  }

  get winningPlayer() {
    if (this.scorePlayer1 === this.scorePlayer2) return null;
    return this.scorePlayer1 > this.scorePlayer2 ? 1 : 2;
  }

  get scorePlayer1() {
    const { player1, boxes } = this.props.store;
    return Player.scorePlayer(player1, boxes);
  }

  get scorePlayer2() {
    const { player2, boxes } = this.props.store;
    return Player.scorePlayer(player2, boxes);
  }

  get scoreWinningPlayer() {
    if (!this.winningPlayer) return 0;
    if (this.winningPlayer === 1) return this.scorePlayer1;
    if (this.winningPlayer === 2) return this.scorePlayer2;
  }

  get scoreLosingPlayer() {
    if (!this.winningPlayer) return 0;
    if (this.winningPlayer === 1) return this.scorePlayer2;
    if (this.winningPlayer === 2) return this.scorePlayer1;
  }

  get currentPlayerWon() {
    return this.winningPlayer === 1;
  }

  get draw() {
    return !this.winningPlayer;
  }

  renderCongrats() {
    if (this.draw) return;
    if (!this.currentPlayerWon) return;

    return (
      <p>
        Congratulations! You win!{' '}
        <span role="img" aria-label="Happy">
          😀
        </span>({this.scoreWinningPlayer} boxes vs {this.scoreLosingPlayer}{' '}
        boxes)
      </p>
    );
  }

  renderSorry() {
    if (this.draw) return;
    if (this.currentPlayerWon) return;

    return (
      <p>
        You lost!!!{' '}
        <span role="img" aria-label="Sad">
          😞
        </span>({this.scoreWinningPlayer} boxes vs {this.scoreLosingPlayer}{' '}
        boxes)
      </p>
    );
  }

  renderDraw() {
    if (!this.draw) return;

    return (
      <p>
        Draw!!! You both won{' '}
        <span role="img" aria-label="Wink">
          😉
        </span>({this.scoreWinningPlayer} boxes vs {this.scoreLosingPlayer}{' '}
        boxes)
      </p>
    );
  }

  onClose() {}

  render() {
    const { status } = this.props.store;
    const show = status.get() === 'game_over';

    return (
      <Modal show={show} onClose={this.onClose} closable={false}>
        <div className="GameOver">
          <h2>Game over</h2>

          {this.renderCongrats()}
          {this.renderSorry()}
          {this.renderDraw()}

          <p>
            Play again? Click this{' '}
            <a href={window.location.href.split('#')[0]}>link</a>.
          </p>
        </div>
      </Modal>
    );
  }
}

decorate(GameOver, {
  winningPlayer: computed,
  scoreWinningPlayer: computed,
  scoreLosingPlayer: computed,
  scorePlayer1: computed,
  scorePlayer2: computed
});

export default inject('store')(observer(GameOver));
