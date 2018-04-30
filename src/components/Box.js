import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

class Box extends Component {
  renderBox(box, hide) {
    const user = box.user
    const colour = box.colour

    const hiddenStyles = { display: "none" }
    const visibleStyles = { display: "block" }
    const styles = hide ? hiddenStyles : visibleStyles

    return (
       <g stroke="red" strokeWidth="5" style={styles}>
        <polygon points={box.coordinates} fill={colour}/>
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
