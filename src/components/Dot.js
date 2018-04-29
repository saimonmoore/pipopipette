import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

import "./Dot.css"

class Dot extends Component {
  radius = 20

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
    return column * 100 + this.radius + 10
  }

  get y() {
    const { row } = this.state
    return row * 100 + this.radius + 10
  }

  render() {
    const { flashing } = this.state.dot

    const classNames = flashing ? "Dot flash" : "Dot"

    return (<circle
               cx={this.x}
               cy={this.y}
               r={this.radius}
               stroke="green"
               strokeWidth="4"
               fill="lightgrey"
               className={classNames}
               onClick={this.onClick}/>);
  }
}

export default inject("store")(observer(Dot));
