import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

class Box extends Component {
  renderBox(box, hide) {
    const user = box.user
    const colour = box.colour
    const user_id = user.user_id
    const initials = user_id ? user_id.substring(0, 2).toUpperCase() : "✔"

    const hiddenStyles = { display: "none" }
    const visibleStyles = { display: "block" }
    const styles = hide ? hiddenStyles : visibleStyles

    return (
       <g stroke="red" strokeWidth="5" style={styles}>
        <polygon points={box.coordinates} fill={colour}/>
        <text x={box.textXCoord} y={box.textYCoord} fontFamily="Verdana" fontSize="30" fontWeight="bold" stroke="none" fill="black">
          {initials}
        </text>
      </g>
    )
  }

  render() {
    const { box } = this.props
    const hide = !box.closed.get()

    return this.renderBox(box, hide)
  }
}

export default inject("store")(observer(Box));
