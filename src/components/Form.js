import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

import { range } from '../utils.js'

class Form extends Component {
  MAX_GRID_SIZE = 20

  constructor(props) {
    super(props)

    this.handleGridSizeChange = this.handleGridSizeChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleOnSubmit(event) {
    event.preventDefault()
  }

  handleGridSizeChange(event) {
    const grid_size = parseInt(event.target.value, 10) || 0
    const { store } = this.props
    store.setGridSize(grid_size)
  }

  render() {
    const { grid_size } = this.props.store

    return (
      <div>
        <form onSubmit={ this.handleOnSubmit }>
          <label>
            Grid size:
            <select value={ grid_size } onChange={this.handleGridSizeChange}>
              { range(this.MAX_GRID_SIZE).map((size) => (
                <option value={size}>{size} x {size}</option>
              )) }
            </select>
          </label>
        </form>
      </div>
    );
  }
}

export default inject("store")(observer(Form));
