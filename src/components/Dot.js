import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

class Dot extends Component {
  radius = 20

  constructor(props) {
    super(props)

    const { column, row } = this.props

    this.state = { column, row }
    this.onClick = this.onClick.bind(this)
  }

  get x() {
    const { column } = this.state
    return column * 100 + this.radius + 10
  }

  get y() {
    const { row } = this.state
    return row * 100 + this.radius + 10
  }

  onClick(event) {
    console.log(event.target)
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
