import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

import Constants from "../constants.js"

import "./Dot.css"

class Dot extends Component {
  constructor(props) {
    super(props)

    const { dot, onDotClick } = this.props
    const column = dot.column
    const row = dot.row

    this.onDotClick = onDotClick
    this.state = { column, row, dot }

    this.onClick = this.onClick.bind(this)
  }

  onClick(event) {
    this.onDotClick(this.props.dot)
  }

  get x() {
    const { column } = this.state
    return column * Constants.dotSpacing + Constants.dotRadius + Constants.dotRadius * 0.5
  }

  get y() {
    const { row } = this.state
    return row * Constants.dotSpacing + Constants.dotRadius + Constants.dotRadius * 0.5
  }

  render() {
    const { flashing } = this.state.dot

    const classNames = flashing ? "Dot flash" : "Dot"

    return (<circle
               cx={this.x}
               cy={this.y}
               r={Constants.dotRadius}
               stroke={Constants.dotStroke}
               strokeWidth="4"
               fill={Constants.dotFill}
               className={classNames}
               onClick={this.onClick}/>);
  }
}

export default inject("store")(observer(Dot));
