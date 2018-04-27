import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

import Dot from './Dot.js'

class Row extends Component {
  range() {
    const { grid_size } = this.props.store
    return Array.apply(null, {length: grid_size}).map(Number.call, Number)
  }

  render() {
    const { column } = this.props

    const columns = this.range().map((row) => (
      <Dot column={column} row={row} key={`x${column}-y${row}`}/>
    ))

    return (columns);
  }
}

export default inject("store")(observer(Row));
