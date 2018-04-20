import './sass/index.sass'
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import InteractionTable from './components/InteractionTable'
import InteractionGraph from './components/InteractionGraph'
import {set as setPath, get as getPath} from 'object-path'
import guid from 'guid'

class Example extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tableData: [],
			actions: []
		};
		this.circleStyle = "background-color:gray";
	}

	render() {
		return (
			<div>
				<div>{JSON.stringify(this.state.tableData)}</div>
				<InteractionTable tableOption={{
					firstRow: {
						renderCell: (text) => <span>{text}</span>,
						cells: ['a', 'b', 'c']
					},
					firstColumn: {
						renderCell: text => <span>{text}</span>,
						cells: [1, 2, 3]
					},
					renderCell: (data, rowIndex, columnIndex) => {
						return (
							<input type="text"
								   onChange={({target: {value}}) => {
									   let newState = Object.assign({}, this.state);
									   setPath(newState, `tableData.${rowIndex}.${columnIndex}`, value);
									   this.setState(newState);
								   }}
								   defaultValue={getPath(this.state, `tableData.${rowIndex}.${columnIndex}`)}/>
						);
					},
					cells: this.state.tableData
				}}/>
				<InteractionGraph
					onDrawTypeChange={(svg, drawType) => {
						console.log('draw type change', drawType);
						svg.on("mousedown", () => console.log('custom mouse down'));
					}}
					customDrawType={{
						dot: {
							defaultAttrs: {
								fill: "black",
								stoke: "none",
								r: "5px"
							},
							selectedAttrs: {
								fill: "red"
							},
							render: svg => svg.append("circle")
						}
					}}
					actions={[{
						type: "draw",
						params: {
							id: guid.raw(),
							type: "line",
							attrs: {
								x1: 10,
								y1: 10,
								x2: 100,
								y2: 100,
								fill: "none",
								stroke: "black",
								"stroke-width": "10px"
							}
						}
					}, {
						type: "draw",
						params: {
							id: guid.raw(),
							type: "circle",
							attrs: {
								cx: "150px",
								cy: "30px"
							}
						}
					}, {
						type: "draw",
						params: {
							id: guid.raw(),
							type: "text",
							text: "abc",
							attrs: {
								x: "200px",
								y: "10px"
							}
						}
					}, {
						type: "draw",
						params: {
							id: guid.raw(),
							type: "dot",
							attrs: {
								cx: "100px",
								cy: "50px"
							}
						}
					}]}/>
			</div>
		);
	}
}

ReactDOM.render(
	<Example></Example>
	, document.getElementById("view"));