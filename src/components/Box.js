import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

class Box extends Component {
  renderBox() {
    const { box } = this.props

    return (
       <g stroke="red" strokeWidth="5">
        <polygon points={box.coordinates} fill="lightgrey"  />
        <text x={box.textXCoord} y={box.textYCoord} fontFamily="Verdana" fontSize="30" fontWeight="bold" stroke="none" fill="black">
          {box.user.get()}
        </text>
      </g>
    )
  }

  render() {
    const { box } = this.props

    if (!box.closed.get()) {
      return null
    }

    return this.renderBox()
  }
}

export default inject("store")(observer(Box));
