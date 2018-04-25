import './sass/index.sass'
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import InteractionTable from './components/InteractionTable'
import InteractionGraph, {
	ReDrawAction,
	DrawAction,
	LineDrawing,
	CircleDrawing,
	LinkDrawing,
	ArrowLinkDrawing
} from './components/InteractionGraph'
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
				<InteractionGraph
					onDrawTypeChange={(svg, drawType) => {
						console.log('draw type change', drawType);
						svg.on("mousedown", () => console.log('custom mouse down'));
					}}
					customDefinedDrawing={{
						dot: {
							defaultAttrs: {
								fill: "black",
								stoke: "none",
								r: "5px"
							},
							selectedAttrs: {
								fill: "red"
							},
							render: svg => svg.append("circle"),
							renderToolbar: function DotButton(context, drawType, index) {
								return (
									<a key={index}
									   href="javascript:void(0)"
									   onClick={() => {
										   d3.select(context.ele)
											   .on("mousedown", function () {
												   this._id = guid.raw();
												   context.doActions([
													   new DrawAction({
														   id: this._id,
														   type: drawType.type,
														   attrs: {
															   cx: d3.event.offsetX,
															   cy: d3.event.offsetY
														   }
													   })
												   ])
											   })
											   .on("mouseup", function () {
												   delete this._id;
											   })
									   }}>Dot</a>
								);
							}
						}
					}}
					actions={[
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
								cx: "100px",
								cy: "20px"
							}
						})),
						new DrawAction(new CircleDrawing({
							id: "circle2",
							attrs: {
								cx: "100px",
								cy: "60px"
							}
						})),
						new DrawAction(new LinkDrawing({
							sourceId: "circle1",
							targetId: "circle2"
						})),
						new DrawAction(new CircleDrawing({
							id: "c3",
							attrs: {
								cx: "150",
								cy: "20px"
							}
						})),
						new DrawAction(new CircleDrawing({
							id: "c4",
							attrs: {
								cx: "150px",
								cy: "60px"
							}
						})),
						new DrawAction(new ArrowLinkDrawing({
							sourceId: "c3",
							targetId: "c4"
						}))
					]}/>
			</div>
		);
	}
}

ReactDOM.render(
	<Example></Example>
	, document.getElementById("view"));