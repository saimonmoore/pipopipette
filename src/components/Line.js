import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import Constants from '../constants.js';
import './Line.css';

class Line extends Component {
  render() {
    const { line } = this.props;

    const from = line.fromDot;
    const to = line.toDot;
    const colour = line.colour;

    const offsets = {
      top: { x: 0, y: -Constants.dotRadius },
      bottom: { x: 0, y: Constants.dotRadius },
      left: { x: -Constants.dotRadius, y: 0 },
      right: { x: Constants.dotRadius, y: 0 }
    };

    const offsetFrom = offsets[from.anchor] || { x: 0, y: 0 };
    const offsetTo = offsets[to.anchor] || { x: 0, y: 0 };

    return (
      <g stroke={colour} strokeWidth="5">
        <path
          className="Line"
          fill={colour}
          strokeLinejoin="miter"
          d={`M ${from.x} ${from.y} L ${from.x + offsetFrom.x} ${from.y +
            offsetFrom.y} L ${to.x + offsetTo.x} ${to.y + offsetTo.y} L ${
            to.x
          } ${to.y}`}
        />
        <circle cx={from.x} cy={from.y} r="3" fill="lightgrey" />
        <circle cx={to.x} cy={to.y} r="3" fill="lightgrey" />
      </g>
    );
  }
}

export default inject('store')(observer(Line));
