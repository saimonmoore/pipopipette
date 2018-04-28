import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

class Dot extends Component {
  radius = 20

  constructor(props) {
    super(props)

    const { dot, onDotClick } = this.props
    const column = dot.column
    const row = dot.row

    this.onDotClick = onDotClick
    this.state = { column, row }

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
    return (<circle
               cx={this.x}
               cy={this.y}
               r={this.radius}
               stroke="green"
               strokeWidth="4"
               fill="yellow"
               className="dot"
               onClick={this.onClick}/>);
  }
}

export default inject("store")(observer(Dot));
