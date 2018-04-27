import './sass/index.sass'
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import InteractionTable from './components/InteractionTable'
import D3Graph, {
	ReDrawAction,
	DrawAction,
	LineDrawing,
	CircleDrawing,
	LinkDrawing,
	ArrowLinkDrawing,
	DotDrawing,
	NumberScaleDrawing,
	PathDrawing
} from './components/D3Graph'
import {set as setPath, get as getPath} from 'object-path'
import guid from 'guid'
import * as d3 from 'd3'

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
				<D3Graph
					original={{x: 20, y: 280}}
					coordinateType={"math"}
					mode="playing"
					actions={[
						new DrawAction(new NumberScaleDrawing()),
						new DrawAction(new DotDrawing({
							attrs: {
								cx: 20,
								cy: 20
							}
						})),
						new DrawAction(new LineDrawing({
							attrs: {
								x1: 50,
								y1: 50,
								x2: 100,
								y2: 100
							}
						})),
						new DrawAction(new LineDrawing({
							attrs: {
								x1: 50,
								y1: 150,
								x2: 100,
								y2: 200
							}
						})),
						new DrawAction(new CircleDrawing({
							id: "circle1",
							attrs: {
								cx: 100,
								cy: 20
							}
						})),
						new DrawAction(new CircleDrawing({
							id: "circle2",
							attrs: {
								cx: 100,
								cy: 60
							}
						})),
						new DrawAction(new LinkDrawing({
							sourceId: "circle1",
							targetId: "circle2"
						})),
						new DrawAction(new CircleDrawing({
							id: "c3",
							attrs: {
								cx: 150,
								cy: 20
							}
						})),
						new DrawAction(new CircleDrawing({
							id: "c4",
							attrs: {
								cx: 150,
								cy: 60
							}
						})),
						new DrawAction(new ArrowLinkDrawing({
							sourceId: "c3",
							targetId: "c4"
						})),
						new DrawAction(new DotDrawing({
							attrs: {
								cx: Math.random() * 100,
								cy: Math.random() * 100
							}
						})),
						new DrawAction(new PathDrawing({
							attrs: {
								d: "M 100 100 L 150 100 L 130 80 Z"
							}
						}))
					]}/>
			</div>
		);
	}
}

ReactDOM.render(
	<Example></Example>
	, document.getElementById("view"));