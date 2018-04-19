import React, {Component, PureComponent} from "react";
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import guid from 'guid'
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
	unselect: "unselect",
	delete: "delete",
	move: "move",
	undo: "undo",
	data: "data",
};

const selectModeEnums = {
	single: "single",
	multiple: "multiple"
};

class DrawAction {
	constructor(params) {
		this.params = params;
		this.type = actionTypeEnums.draw
	}
}

class SelectAction {
	constructor(id) {
		this.params = id;
		this.type = actionTypeEnums.select;
	}
}

class UnSelectAction {
	constructor(id) {
		this.params = id;
		this.type = actionTypeEnums.unselect;
	}
}

/**
 * 运筹学图形D3
 * - [x] action:draw - 画线
 * - [x] action:draw - 画点
 * - [x] action:draw - 画圈
 * - [x] action:draw - 画文本
 * - [ ] action:draw - 画link
 * - [ ] action:draw - 画arrowLink
 * - [x] action:select - 选择
 * - [x] action:unselect - 取消选择
 * - [ ] action:delete - 删除
 * - [ ] action:move - 移动
 * - [ ] action:undo - 撤销
 * - [ ] action:data - 数据
 * */
export default class InteractionGraph extends PureComponent {
	/**
	 * @property {Array} actions - 所有的操作
	 * @property {Object} defaultAttrs - 默认的图形的样式
	 * @property {Object} selectedAttrs - 图形被选中时候的样式
	 * @property {single|multiple} selectMode - 选择模式,是多选还是单选
	 * */
	static propTypes = {
		width: PropTypes.number,
		height: PropTypes.number,
		style: PropTypes.object,
		//action
		actions: PropTypes.arrayOf(PropTypes.shape({
			type: PropTypes.oneOf(['draw', 'select', 'unselect', 'delete', 'move', 'undo', 'data']).isRequired,
			params: PropTypes.oneOfType([
				//draw
				PropTypes.shape({
					id: PropTypes.string.isRequired,
					type: PropTypes.oneOf(['none', 'line', 'link', 'arrowLink', 'dot', 'circle', 'text']).isRequired,
					attrs: PropTypes.object,
					text: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
				}),
				//select
				PropTypes.string
			])
		})),
		//默认的图形的样式
		defaultAttrs: PropTypes.shape({
			line: PropTypes.object,
			dot: PropTypes.object,
			circle: PropTypes.object,
			text: PropTypes.object
		}),
		//图形被选中时候的样式
		selectedAttrs: PropTypes.shape({
			line: PropTypes.object,
			dot: PropTypes.object,
		}),
		//选择模式,是多选还是单选
		selectMode: PropTypes.oneOf(['single', 'multiple'])
	};
	static defaultProps = {
		width: 400,
		height: 300,
		style: {
			backgroundColor: "#CCCCCC"
		},
		defaultAttrs: {
			line: {
				fill: "transparent",
				stroke: "black",
				"stroke-width": "3px"
			},
			dot: {
				fill: "black",
				stoke: "none",
				r: "5px"
			},
			circle: {
				fill: "transparent",
				stroke: "black",
				r: "10px",
				"stroke-width": "1px"
			},
			text: {
				fill: "black",
				"font-size": "20px"
			}
		},
		selectedAttrs: {
			line: {
				stroke: "red"
			},
			dot: {
				fill: "red"
			},
			circle: {
				stroke: "red"
			},
			text: {
				fill: "red"
			}
		},
		selectMode: "single"
	}

	constructor(props) {
		super(props);
		this.ele = null;
		//画图的类型
		this.currentDrawType = drawTypeEnums.none;
		//画布中已有的图形
		this.shapes = [];
		//已经选中的图形的id
		this.selectedShapeId = [];
	}

	findDrawById(id) {
		const index = this.shapes.findIndex(f => f.id === id);
		return this.shapes[index];
	}

	updateDraw(id, draw) {
		const index = this.shapes.findIndex(f => f.id === id);
		this.shapes[index] = update(this.shapes[index], draw);
		this.drawShapes(this.shapes);
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
		console.log('do actions ...')
		const drawActions = actions.filter(f => f.type === actionTypeEnums.draw);
		if (drawActions.length > 0) {
			console.log(`draw : ${drawActions.map(f => f.params.type).join(',')}`)
			this.shapes = this.shapes.concat(drawActions.map(data => data.params));
			this.drawShapes(this.shapes);
		}
		//#endregion

		//#region select
		const selectActions = actions.filter(f => f.type === actionTypeEnums.select);
		if (selectActions.length > 0) {
			console.log(`${this.props.selectMode} select : ${selectActions.map(f => f.params).join(',')}`)
			if (this.props.selectMode === selectModeEnums.single) {
				// this.unSelect(this.selectedShapeId);
				this.doActions(this.selectedShapeId.map(id => new UnSelectAction(id)))
				this.selectedShapeId = selectActions.map(f => f.params);
			}
			else {
				this.selectedShapeId = this.selectedShapeId.concat(selectActions.map(f => f.params));
			}
			this.select(this.selectedShapeId);
		}
		//#endregion

		//#region unselect
		const unSelectActions = actions.filter(f => f.type === actionTypeEnums.unselect);
		if (unSelectActions.length > 0) {
			console.log(`unselect : ${unSelectActions.map(f => f.params).join(',')}`);
			const ids = unSelectActions.map(f => f.params);
			this.unSelect(ids);
		}
		//#endregion
	}

	select(ids) {
		ids.forEach(id => {
			const draw = this.findDrawById(id);
			if (draw) {
				if (draw.selection) {
					const attrs = getPath(this.props.selectedAttrs, draw.type, {})
					draw.selection.call(self => {
						for (let key in attrs) {
							self.attr(key, attrs[key]);
						}
					})
				}
			}
		})
	}

	unSelect(ids) {
		const shapes = this.shapes.filter(f => ids.indexOf(f.id) >= 0);
		this.drawShapes(shapes);
	}

	drawShapes(shapes) {
		this.drawLines(shapes.filter(f => f.type === drawTypeEnums.line));
		this.drawDots(shapes.filter(f => f.type === drawTypeEnums.dot));
		this.drawCircles(shapes.filter(f => f.type === drawTypeEnums.circle));
		this.drawTexts(shapes.filter(f => f.type === drawTypeEnums.text));
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
				text.selection = this.createShape(text, 'text');
			}
			text.selection.call(self => {
				this.updateAttrs(self, drawTypeEnums.text, text.attrs);
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
				circle.selection = this.createShape(circle, "circle");
			}
			circle.selection.call(self => {
				this.updateAttrs(self, drawTypeEnums.circle, circle.attrs);
			})
		})
	}

	drawDots(dots) {
		dots.forEach(dot => {
			if (!dot.selection) {
				dot.selection = this.createShape(dot, "circle");
			}
			dot.selection.call(self => {
				this.updateAttrs(self, drawTypeEnums.dot, dot.attrs);
			})
		})
	}

	drawLines(lines) {
		lines.forEach(line => {
			if (!line.selection) {
				//create line
				line.selection = this.createShape(line, "line")
			}
			line.selection.call(self => {
				this.updateAttrs(self, drawTypeEnums.line, line.attrs);
			})
		})
	}

	createShape(shapeDefine, tag) {
		const shape = d3.select(this.ele).append(tag);
		//listen click event trigger selection action
		shape.on('click', () => {
			this.doActions([new SelectAction(shapeDefine.id)]);
		});
		return shape;
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
