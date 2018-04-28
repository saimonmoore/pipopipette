import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

class Line extends Component {
  render() {
    const { line } = this.props

    const from = line.fromDot;
    const to = line.toDot

    const offsets = {
      'top':  { x: 0, y: -20 },
      'bottom':  { x: 0, y: 20 },
      'left':  { x: -20, y: 0 },
      'right':  { x: 20, y: 0 }
    }

    const offsetFrom = offsets[from.anchor] || { x: 0, y: 0 };
    const offsetTo = offsets[to.anchor] || { x: 0, y: 0 };

    return (
      <path
        className="Line"
        markerEnd="url(#arrow)"
        stroke="black" stroke-width="3"
        d={`M ${from.x} ${from.y} L ${from.x + offsetFrom.x} ${from.y + offsetFrom.y} L ${to.x + offsetTo.x} ${to.y + offsetTo.y} L ${to.x} ${to.y}`}
      />
    )
  }
}

export default inject("store")(observer(Line));
