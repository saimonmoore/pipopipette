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
    const selected = false

    this.onDotClick = onDotClick
    this.state = { column, row, dot, selected }

    this.onClick = this.onClick.bind(this)
  }

  onClick(event) {
    this.onDotClick(this.props.dot)
    const { selected } = this.state
    this.setState({ selected: !selected })
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
    const { selected } = this.state
    const { flashing } = this.state.dot
    const { ourTurn } = this.props

    const classNames = ["Dot"]
    if (ourTurn) classNames.push("OurTurn")
    if (!ourTurn) classNames.push("TheirTurn")
    if (selected) classNames.push("Selected")
    if (flashing) classNames.push("Flash")

    return (<circle
               cx={this.x}
               cy={this.y}
               r={Constants.dotRadius}
               stroke={Constants.dotStroke}
               strokeWidth="2"
               fill={Constants.dotFill}
               className={classNames.join(" ")}
               onClick={this.onClick}/>);
  }
}

export default inject("store")(observer(Dot));
