import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class ColorOption extends Component {
  constructor(props) {
    super(props)

    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
  }

	handleMouseDown(event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onSelect(this.props.option, event);
	}

	handleMouseEnter(event) {
		this.props.onFocus(this.props.option, event);
	}

	handleMouseMove(event) {
		if (this.props.isFocused) return;
		this.props.onFocus(this.props.option, event);
	}

  render() {
    const { option } = this.props

    return (
      <div
				onMouseDown={this.handleMouseDown}
				onMouseEnter={this.handleMouseEnter}
				onMouseMove={this.handleMouseMove}      
      >
      <svg width="90" height="50" xmlns="http://www.w3.org/2000/svg">
        <circle fill={option.value} cx="10" cy="10" r="10" />
        <text x="10" y="15" fontFamily="Verdana" fontSize="10">{option.label}</text>
      </svg>            
      {this.props.children}
      </div>
    )
  }
}

class ColorValue extends Component {
  render() {
    const { value } = this.props
    const styles = {
      marginLeft: "10px",
      marginTop: "15px"
    }

    return (
      <svg width="70" height="20" xmlns="http://www.w3.org/2000/svg" style={styles}>
        <circle fill={value.value} cx="10" cy="10" r="10" />
        <text x="10" y="15" fontFamily="Verdana" fontSize="10">{value.label}</text>
      </svg>            
    )
  }
}
class ColorPicker extends Component {
  constructor(props) {
    super(props)

    const { colour } = props
    this.state = { colour: colour }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(colour) {
    this.setState({ colour });
    const { onChange } = this.props
    onChange(colour)
    console.log(`Selected: ${colour.label}`);
  }

  availableColors() {
    return ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"].map((color) => (color.toLowerCase()))
  }

  get options() {
    return this.availableColors().map((colour) => (
      { name: colour, label: colour, value: colour }
    ))
  }

  render() {
    const { colour } = this.state
    const wrapperStyles = {
      maxWidth: '90px',
    };

    return (
      <Select 
        name="colour"
        value={colour}
        onChange={this.handleChange}
        autosize={false}
        clearable={false}
        options={this.options}
        wrapperStyle={wrapperStyles}
        optionComponent={ColorOption}
        valueComponent={ColorValue}
      />
    )
  }
} 

export default ColorPicker
