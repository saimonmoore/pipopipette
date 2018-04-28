import React, { Component } from 'react';
import { inject, observer } from "mobx-react";

import DotView from './Dot.js'
import LineView from './Line.js'
import Dot from '../lib/Dot.js'
import Line from '../lib/Line.js'

class Grid extends Component {
  constructor(props) {
    super(props)

    this.state = { active: [] };

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.onClickObject = this.onClickObject.bind(this)
    this.onDotClick = this.onDotClick.bind(this)

    this.createDots()
  }

  createDots() {
    this.range().forEach((column) => (
      this.range().forEach((row) => {
        this.createDot({column, row})
      })
    ))
  }

  createDot(column, row) {
    const { store } = this.props
    const dot = new Dot(column, row)
    store.addDot(dot)
  }

  componentDidMount () {
    this.pt = this.refs.grid.createSVGPoint();
  }

  onClickObject (object) {
    this.setState({
      active: [object]
    });
  }

  handleMouseDown(event) {
    this.pt.x = event.pageX;
    this.pt.y = event.pageY;

    const from = this.pt.matrixTransform(this.refs.grid.getScreenCTM().inverse());

    this.setState({
      fromX: from.x,
      fromY: from.y,
    });

    document.addEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove (event) {
    this.pt.x = event.clientX;
    this.pt.y = event.clientY;

    const to = this.pt.matrixTransform(this.refs.grid.getScreenCTM().inverse());

    this.setState({
      toX: to.x,
      toY: to.y
    });
  }

  handleMouseUp(event) {
    document.removeEventListener('mousemove', this.handleMouseMove);

    const { dots } = this.props.store

    this.pt.x = event.clientX;
    this.pt.y = event.clientY;

    const to = this.pt.matrixTransform(this.refs.grid.getScreenCTM().inverse());
    const { fromX, fromY } = this.state

    const active = dots.filter((o) => { 
      const within = o.x > fromX && o.x < to.x && o.y > fromY && o.y < to.y
      const dotXGreaterThanFromX = o.x > fromX
      const dotXLessThanToX = o.x < to.x
      const dotYGreaterThanFromY = o.y > fromY
      const dotYLessThanToY = o.y < to.y
      console.table([
        ["dotX", "dotY", "fromX", "fromY", "toX", "toY", "dotXGreaterThanFromX", "dotXLessThanToX", "dotYGreaterThanFromY", "dotYLessThanToY", "within"],
        [o.x, o.y, fromX, fromY, to.x, to.y, dotXGreaterThanFromX, dotXLessThanToX, dotYGreaterThanFromY, dotYLessThanToY, within],
      ])
      return within
    });

    this.setState({
      active,
      fromX: null,
      fromY: null,
      toX: null,
      toY: null
    });
  }

  onDotClick (dot) {
    const store = this.props.store

    if (this.state.fromDot) {
      const fromDot = this.state.fromDot;
      const toDot = dot;

      if (fromDot === toDot) return;

      const valid = Line.valid({ fromDot, toDot });

      if (fromDot !== toDot && valid) {
        store.addLine(new Line({
          fromDot,
          toDot,
        }));
      }
      this.setState({
        fromDot: null
      });
    } else {
      this.setState({
        fromDot: dot
      });

      document.addEventListener('mousemove', this.onDotMouseMove);
    }
  }

  range() {
    const { grid_size } = this.props.store
    return Array.apply(null, {length: grid_size}).map(Number.call, Number)
  }

  renderDot(dot) {
    const { active } = this.state;
    return <DotView
      key={dot.id}
      dot={dot}
      point={this.pt}
      active={active.includes(dot)}
      onClick={this.onClickObject}
      onDotClick={this.onDotClick.bind(this)}
    />
  }

  renderLine(line) {
    return <LineView
      key={line.id}
      line={line}
    />
  }

  render() {
    const { grid_size, dots, lines } = this.props.store
    const width = grid_size * 100, height = grid_size * 100

    const dot_views = dots.map((dot) => (this.renderDot(dot)))
    const line_views = lines.map((line) => (this.renderLine(line)))

    return (
      <div>
        <svg
          ref="grid"
          width={width}
          height={height}
          xmlns="http://www.w3.org/2000/svg"
          onMouseDown={this.handleMouseDown.bind(this)}
          onMouseUp={this.handleMouseUp.bind(this)}
        >
          {dot_views}
          {line_views}
        </svg>
      </div>
    );
  }
}

export default inject("store")(Grid);
