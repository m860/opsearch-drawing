import React, {Component, PureComponent} from "react";
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import guid from 'guid'
import equal from 'fast-deep-equal'
import WorkSpace from './WorkSpace'
import {get as getPath} from 'object-path'
import update from 'immutability-helper'

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

class DrawAction {
	constructor(params) {
		this.params = params;
		this.type = actionTypeEnums.draw
	}
}

export default class InteractionGraph extends PureComponent {
	static propTypes = {
		width: PropTypes.number,
		height: PropTypes.number,
		style: PropTypes.object,
		actions: PropTypes.arrayOf(PropTypes.shape({
			type: PropTypes.oneOf(['draw', 'select', 'delete', 'move', 'undo', 'data']).isRequired,
			params: PropTypes.oneOfType([
				PropTypes.shape({
					id: PropTypes.string.isRequired,
					type: PropTypes.oneOf(['none', 'line', 'link', 'arrowLink', 'dot', 'circle', 'text']).isRequired,
					attrs: PropTypes.object,
					text: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
				})
			])
		})),
		defaultAttrs: PropTypes.shape({
			line: PropTypes.object,
			dot: PropTypes.object,
			circle: PropTypes.object,
			text: PropTypes.object
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
			},
			dot: {
				fill: "black",
				stoke: "none",
				r: "5px"
			},
			circle: {
				fill: "none",
				stroke: "black",
				r: "10px",
				"stroke-width": "1px"
			},
			text: {
				"font-size": "20px"
			}
		}
	}

	constructor(props) {
		super(props);
		this.ele = null;
		//画图的类型
		this.currentDrawType = drawTypeEnums.none;
		this.draws = [];
	}

	findDrawById(id) {
		const index = this.draws.findIndex(f => f.id === id);
		return this.draws[index];
	}

	updateDraw(id, draw) {
		const index = this.draws.findIndex(f => f.id === id);
		this.draws[index] = update(this.draws[index], draw);
		this.draw();
	}

	initialSVG() {
		const svg = d3.select(this.ele);
		svg.on('mousedown', () => {
			switch (this.currentDrawType) {
				case drawTypeEnums.line:
					this._id = guid.raw();
					this._mouseDownEvent = d3.event;
					this.doActions([new DrawAction({
						id: this._id,
						type: drawTypeEnums.line,
						attrs: Object.assign({
							x1: d3.event.offsetX,
							y1: d3.event.offsetY,
							x2: d3.event.offsetX,
							y2: d3.event.offsetY
						}, getPath(this.props.defaultAttrs, drawTypeEnums.line))
					})])
					break;
				case drawTypeEnums.dot:
					this._id = guid.raw();
					this._mouseDownEvent = d3.event;
					this.doActions([new DrawAction({
						id: this._id,
						type: drawTypeEnums.dot,
						attrs: Object.assign({
							cx: d3.event.offsetX,
							cy: d3.event.offsetY,
						}, getPath(this.props.defaultAttrs, drawTypeEnums.dot))
					})])
					break;
				case drawTypeEnums.circle:
					this._id = guid.raw();
					this._mouseDownEvent = d3.event;
					this.doActions([new DrawAction({
						id: this._id,
						type: drawTypeEnums.circle,
						attrs: Object.assign({
							cx: d3.event.offsetX,
							cy: d3.event.offsetY,
						}, getPath(this.props.defaultAttrs, drawTypeEnums.circle))
					})])
					break;
			}
		});
		svg.on("mousemove", () => {
			if (this._mouseDownEvent) {
				if (this.currentDrawType === drawTypeEnums.line) {
					this.updateDraw(this._id, {
						attrs: {
							x2: {$set: d3.event.offsetX},
							y2: {$set: d3.event.offsetY}
						}
					});
				}
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
		//#region draw
		const draws = actions.filter(f => f.type === "draw").map(data => {
			return data.params;
		});
		this.draws = this.draws.concat(draws);
		this.draw();
		//#endregion
	}

	draw() {
		this.drawLines(this.draws.filter(f => f.type === drawTypeEnums.line));
		this.drawDots(this.draws.filter(f => f.type === drawTypeEnums.dot));
		this.drawCircles(this.draws.filter(f => f.type === drawTypeEnums.circle));
		this.drawTexts(this.draws.filter(f => f.type === drawTypeEnums.text));
	}

	updateAttrs(ele, drawType, attrs) {
		const newAttrs = Object.assign({}, getPath(this.props.defaultAttrs, drawType, {}), attrs);
		for (let key in newAttrs) {
			ele.attr(key, newAttrs[key]);
		}
	}

	drawTexts(texts) {
		texts.forEach(text => {
			if (!text.selection) {
				text.selection = d3.select(this.ele).append("text");
			}
			text.selection.call(self => {
				this.updateAttrs(self, drawTypeEnums.circle, text.attrs);
				if (text.text) {
					self.text(text.text);
				}
				else {
					console.warn('no text in `<text>`')
				}
			})
		})
	}

	drawCircles(circles) {
		circles.forEach(circle => {
			if (!circle.selection) {
				circle.selection = d3.select(this.ele).append("circle");
			}
			circle.selection.call(self => {
				this.updateAttrs(self, drawTypeEnums.circle, circle.attrs);
			})
		})
	}

	drawDots(dots) {
		dots.forEach(dot => {
			if (!dot.selection) {
				dot.selection = d3.select(this.ele).append("circle");
			}
			dot.selection.call(self => {
				this.updateAttrs(self, drawTypeEnums.dot, dot.attrs);
			})
		})
	}

	drawLines(lines) {
		lines.forEach(line => {
			if (!line.selection) {
				line.selection = d3.select(this.ele).append("line");
			}
			line.selection.call(self => {
				this.updateAttrs(self, drawTypeEnums.line, line.attrs);
			})
		})
	}

	render() {
		return (
			<WorkSpace actions={[
				<a href="javascript:void(0)"
				   key="draw-line"
				   onClick={() => {
					   this.currentDrawType = drawTypeEnums.line
				   }}>DRAW LINE</a>,
				<a href="javascript:void(0)"
				   key="draw-dot"
				   onClick={() => {
					   this.currentDrawType = drawTypeEnums.dot
				   }}>DRAW DOT</a>,
				<a href="javascript:void(0)"
				   key="draw-circle"
				   onClick={() => {
					   this.currentDrawType = drawTypeEnums.circle
				   }}>DRAW CIRCLE</a>
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
}
