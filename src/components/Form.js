import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { range } from '../utils.js'
import ColorPicker from './ColorPicker.js'

import "./Form.css"

class Form extends Component {
  MAX_GRID_SIZE = 20

  constructor(props) {
    super(props)

    this.handleGridSizeChange = this.handleGridSizeChange.bind(this);
    this.handleColourChange = this.handleColourChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleOnSubmit(event) {
    event.preventDefault()
  }

  handleGridSizeChange(option) {
    const grid_size = parseInt(option.value, 10) || 0
    const { store, session } = this.props
    store.setGridSize(grid_size)
    store.saveSession(session)
  }

  handleColourChange(colour) {
    const { store, session } = this.props
    store.setColour(colour)
    store.saveSession(session)
  }

  gridSizeOptions() {
    return range(this.MAX_GRID_SIZE).map((size) => (
      { label: `${size} x ${size}`, name: size, value: size }
    ))
  }

  render() {
    const { grid_size, colour } = this.props.store

    return (
      <div>
        <form onSubmit={ this.handleOnSubmit } className="Form">
          <label>
            Color:
            <ColorPicker colour={colour.get()} onChange={this.handleColourChange}/>
          </label>
          <label>
            Grid size:
            <Select
              value={ grid_size.get() }
              options={this.gridSizeOptions()}
              clearable={false}
              onChange={this.handleGridSizeChange} />
          </label>
        </form>
      </div>
    );
  }
}

export default inject("store")(observer(Form));
