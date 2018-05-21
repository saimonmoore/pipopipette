import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import DotView from './Dot.js';
import LineView from './Line.js';
import BoxView from './Box.js';
import Line from '../lib/Line.js';
import Constants from '../constants.js';

import './Grid.css';

class Grid extends Component {
  constructor(props) {
    super(props);

    this.state = { active: [] };

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.onClickObject = this.onClickObject.bind(this);
    this.onDotClick = this.onDotClick.bind(this);
  }

  componentDidMount() {
    this.pt = this.refs.grid.createSVGPoint();
  }

  onClickObject(object) {
    this.setState({
      active: [object]
    });
  }

  handleMouseDown(event) {
    this.pt.x = event.pageX;
    this.pt.y = event.pageY;

    const from = this.pt.matrixTransform(
      this.refs.grid.getScreenCTM().inverse()
    );

    this.setState({
      fromX: from.x,
      fromY: from.y
    });

    document.addEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove(event) {
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

    const { dots } = this.props.store;

    this.pt.x = event.clientX;
    this.pt.y = event.clientY;

    const to = this.pt.matrixTransform(this.refs.grid.getScreenCTM().inverse());
    const { fromX, fromY } = this.state;

    const active = dots.filter(o => {
      const dotXGreaterThanFromX = o.x > fromX;
      const dotXLessThanToX = o.x < to.x;
      const dotYGreaterThanFromY = o.y > fromY;
      const dotYLessThanToY = o.y < to.y;

      return (
        dotXGreaterThanFromX &&
        dotXLessThanToX &&
        dotYGreaterThanFromY &&
        dotYLessThanToY
      );
    });

    this.setState({
      active,
      fromX: null,
      fromY: null,
      toX: null,
      toY: null
    });
  }

  onDotClick(dot) {
    const store = this.props.store;
    const { turn, player1 } = store;
    const player = player1;

    let line;

    if (this.state.fromDot) {
      const fromDot = this.state.fromDot;
      const toDot = dot;

      if (fromDot === toDot) return;

      const valid = Line.valid({ fromDot, toDot });
      if (!valid) toDot.flash();

      if (valid && turn.get() === player.id) {
        line = new Line({ fromDot, toDot, player });
        store.addLine(line);
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

  get isOurTurn() {
    const { turn, player1 } = this.props.store;

    const ourTurn = turn.get() === player1.id;
    console.log(`[Grid#isOurTurn] ourTurn: ${ourTurn}`);
    return ourTurn;
  }

  renderDot(dot) {
    const { active } = this.state;

    return (
      <DotView
        key={dot.id}
        dot={dot}
        ourTurn={this.isOurTurn}
        point={this.pt}
        active={active.includes(dot)}
        onClick={this.onClickObject}
        onDotClick={this.onDotClick.bind(this)}
      />
    );
  }

  renderLine(line) {
    return <LineView key={line.id} line={line} />;
  }

  renderBox(box) {
    const colour = box.colour;

    return <BoxView key={box.id} box={box} colour={colour} />;
  }

  render() {
    const { grid_size, dots, lines, boxes } = this.props;
    const width = grid_size.get() * Constants.dotSpacing,
      height = grid_size.get() * Constants.dotSpacing;

    const dot_views = dots.map(dot => this.renderDot(dot));
    const line_views = lines.map(line => this.renderLine(line));
    const box_views = boxes.map(box => this.renderBox(box));

    return (
      <div className="Grid">
        <svg
          ref="grid"
          width={width}
          height={height}
          xmlns="http://www.w3.org/2000/svg"
          onMouseDown={this.handleMouseDown.bind(this)}
          onMouseUp={this.handleMouseUp.bind(this)}
        >
          {line_views}
          {box_views}
          {dot_views}
        </svg>
      </div>
    );
  }
}

export default inject('store')(observer(Grid));
