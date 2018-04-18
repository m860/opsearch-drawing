import React, {Component, PureComponent} from "react";
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import guid from 'guid'
import equal from 'fast-deep-equal'
import WorkSpace from './WorkSpace'
import {get as getPath} from 'object-path'
import update from 'immutability-helper'
import merge from 'deepmerge'

const drawTypeEnums = {
	none: "none",
	line: "line",
	link: "link",
	arrowLink: "arrowLink",
	dot: "dot",
	circle: "circle",
	text: "text",
};

const actionTypeEnums = {
	draw: "draw",
	select: "select",
	delete: "delete",
	move: "move",
	undo: "undo",
	data: "data",
};

export default class InteractionGraph extends PureComponent {
	static propTypes = {
		width: PropTypes.number,
		height: PropTypes.number,
		style: PropTypes.object,
		linkStyle: PropTypes.string,
		links: PropTypes.arrayOf(PropTypes.shape({
			source: PropTypes.number,
			target: PropTypes.number
		})),
		circles: PropTypes.arrayOf(PropTypes.shape({
			cx: PropTypes.number,
			cy: PropTypes.number,
			r: PropTypes.number,
			style: PropTypes.string
		})),
		actions: PropTypes.arrayOf(PropTypes.shape({
			type: PropTypes.oneOf(['draw', 'select', 'delete', 'move', 'undo', 'data']),
			params: PropTypes.object
		})),
		defaultAttrs: PropTypes.shape({
			line: PropTypes.object,
		})
	};
	static defaultProps = {
		width: 400,
		height: 300,
		style: {
			backgroundColor: "#CCCCCC"
		},
		defaultAttrs: {
			line: {
				fill: "none",
				stroke: "black",
				"stroke-width": "3px"
			}
		}
	}

	constructor(props) {
		super(props);
		this.ele = null;
		this.currentDrawType = drawTypeEnums.none;
		this.draws = [];
	}

	addDraw(draw) {
		this.draws.push(draw);
		this.draw();
	}

	removeDrawById(id) {
		this.draws = this.draws.filter(f => f.id !== id);
		this.draw();
	}

	updateDraw(draw) {
		const index = this.draws.findIndex(f => f.id === draw.id);
		this.draws[index] = merge(this.draws[index], draw);
		this.draw();
	}

	initialSVG() {
		const svg = d3.select(this.ele);
		svg.on('mousedown', () => {
			switch (this.currentDrawType) {
				case drawTypeEnums.line:
					this._id = guid.raw();
					this._mouseDownEvent = d3.event;
					console.log(d3.event)
					this.addDraw({
						id: this._id,
						type: drawTypeEnums.line,
						attrs: Object.assign({
							x1: d3.event.offsetX,
							y1: d3.event.offsetY,
							x2: d3.event.offsetX,
							y2: d3.event.offsetY
						}, getPath(this.props.defaultAttrs, drawTypeEnums.line))
					});
					break;
			}
		});
		svg.on("mousemove", () => {
			if (this._mouseDownEvent) {
				this.updateDraw({
					id: this._id,
					attrs: {
						x2: d3.event.offsetX,
						y2: d3.event.offsetY
					}
				})
			}
		});
		svg.on("mouseup", () => {
			if (this._mouseDownEvent) {
				delete this._mouseDownEvent;
				delete this._id;
			}
		})
	}

	doActions(actions) {
		const draws = actions.filter(f => f.type === "draw").map(data => {
			if (!data.id) {
				return Object.assign({
					id: guid.raw()
				}, data.params);
			}
			return data;
		});
		this.draws = draws;
		this.draw();
	}

	draw() {
		// console.log(`draw length = ${this.state.draws.length}`);
		this.drawLines(this.draws.filter(f => f.type === drawTypeEnums.line));
		this.draws.forEach(item => {
			console.log(`${item.id} : ${item.constructor.name}`);
		})
	}

	updateAttrs(ele, drawType, attrs) {
		const newAttrs = Object.assign({}, getPath(this.props.defaultAttrs, drawType, {}), attrs);
		for (let key in newAttrs) {
			ele.attr(key, newAttrs[key]);
		}
	}

	drawLines(lines) {
		lines.forEach((line) => {
			let ele;
			if (!line._node) {
				ele = d3.select(this.ele)
					.append('line');
				line._node = ele.node();
			}
			else {
				ele = d3.select(line._node);
			}
			console.log(ele.constructor.name);
			ele.call(self => {
				this.updateAttrs(self, drawTypeEnums.line, line.attrs);
			})
		})
	}

	render() {
		return (
			<WorkSpace actions={[
				<a href="javascript:void(0)" key="draw-line" onClick={() => {
					this.currentDrawType = drawTypeEnums.line
				}}>DRAW LINE</a>
			]}>
				<svg ref={ref => this.ele = ref}
					 style={this.props.style}
					 width={this.props.width}
					 height={this.props.height}>
				</svg>
			</WorkSpace>
		);
	}

	componentWillReceiveProps(nextProps) {
		this.doActions(nextProps.actions);
	}

	componentDidMount() {
		this.initialSVG();
		this.doActions(this.props.actions);
	}

	// componentWillUpdate() {
	// 	console.log('will update')
	// }
	//
	// componentDidUpdate() {
	// 	console.log('did update')
	// 	this.draw(this.state.draws);
	// }
}
