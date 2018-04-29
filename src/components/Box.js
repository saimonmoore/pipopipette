import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

class Box extends Component {
  renderBox() {
    const { box } = this.props
    const user = box.user
    const user_id = user.user_id
    const initials = user_id ? user_id.substring(0, 2).toUpperCase() : "✔"
    const colour = box.colour

    return (
       <g stroke="red" strokeWidth="5">
        <polygon points={box.coordinates} fill={colour}/>
        <text x={box.textXCoord} y={box.textYCoord} fontFamily="Verdana" fontSize="30" fontWeight="bold" stroke="none" fill="black">
          {initials}
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
