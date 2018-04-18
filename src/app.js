import './sass/index.sass'
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import InteractionTable from './components/InteractionTable'
import InteractionGraph from './components/InteractionGraph'
import {set as setPath, get as getPath} from 'object-path'

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
						console.log(`${rowIndex}:${columnIndex}`, data)
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
				<InteractionGraph actions={[{
					type: "draw",
					params: {
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
				}]}/>
			</div>
		);
	}
}

ReactDOM.render(
	<Example></Example>
	, document.getElementById("view"));