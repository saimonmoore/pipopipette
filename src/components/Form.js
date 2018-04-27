import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

class Form extends Component {
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
            <input type="text" name='grid_size' value={ grid_size } onChange={this.handleGridSizeChange} />
          </label>
        </form>
      </div>
    );
  }
}

export default inject("store")(observer(Form));
