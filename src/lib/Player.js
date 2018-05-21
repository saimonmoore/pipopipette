import { decorate, observable, toJS } from 'mobx';

class Player {
  static isPlayerOne(player, currentUser) {
    return player.id === currentUser.user_id;
  }

  static isPlayerTwo(player, currentUser) {
    return !Player.isPlayerOne(player, currentUser);
  }

  constructor({ user_id, colour }) {
    this.user_id = user_id;
    this.colour = colour;
    this.player = 1;
  }

  get id() {
    return this.user_id;
  }

  setColour(colour) {
    this.colour = colour;
  }

  setPlayer(player) {
    this.player = player;
  }

  serialize() {
    const user_id = this.user_id;
    const colour = toJS(this.colour);

    return { user_id, colour };
  }

  static unserialize(data) {
    return new Player(data);
  }
}

decorate(Player, {
  colour: observable,
  player: observable
});

export default Player;
