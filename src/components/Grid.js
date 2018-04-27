import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

import Row from './Row.js'

class Grid extends Component {
  range() {
    const { grid_size } = this.props.store
    return Array.apply(null, {length: grid_size}).map(Number.call, Number)
  }

  render() {
    const { grid_size } = this.props.store
    const width = grid_size * 100, height = grid_size * 100

    const rows = this.range().map((column) => (
      <Row column={column} key={`col-${column}`} />
    ))

    return (
      <div>
        <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
          {rows}
        </svg>
      </div>
    );
  }
}

export default inject("store")(observer(Grid));
