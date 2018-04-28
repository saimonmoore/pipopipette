import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

class Box extends Component {
  render() {
    return (
      <g stroke="red" strokeWidth="5">
        <polygon points="0,130 130,0 130,130 0,130" fill="lightgrey"  />
        <text x="5" y="35" font-family="Verdana" font-size="25" font-weight="bold" stroke="none" fill="black">
          SM
        </text>
      </g>
    )
  }
}

export default inject("store")(observer(Box));
