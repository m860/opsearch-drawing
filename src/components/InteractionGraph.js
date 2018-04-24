import React, {Component, PureComponent} from "react";
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import guid from 'guid'
import WorkSpace from './WorkSpace'
import {get as getPath} from 'object-path'
import update from 'immutability-helper'

/**
 * action枚举
 * @readonly
 * @enum {string}
 * @property {string} draw - 绘画
 * @property {string} redraw - 重绘/更新
 * @property {string} select - 选择
 * @property {string} unselect - 反选
 * @property {string} delete - 删除
 * @property {string} move - 移动
 * @property {string} undo - 撤销
 * @property {string} data - 数据操作
 * */
const actionTypeEnums = {
	draw: "draw",
	redraw: "redraw",
	select: "select",
	unselect: "unselect",
	delete: "delete",
	move: "move",
	undo: "undo",
	data: "data",
};

/**
 * 选择模式枚举
 * @readonly
 * @enum {string}
 * @property {string} single - 单选
 * @property {string} multiple - 多选
 * */
const selectModeEnums = {
	single: "single",
	multiple: "multiple"
};

/**
 * 绘图action
 * */
export class DrawAction {
	constructor(params) {
		this.params = params;
		this.type = actionTypeEnums.draw
	}
}

/**
 * 选择action
 * */
export class SelectAction {
	constructor(id) {
		this.params = id;
		this.type = actionTypeEnums.select;
	}
}

/**
 * 取消选择action
 * */
export class UnSelectAction {
	constructor(id) {
		this.params = id;
		this.type = actionTypeEnums.unselect;
	}
}

/**
 * 重绘action
 * */
export class ReDrawAction {
	constructor(id, state) {
		this.type = actionTypeEnums.redraw;
		this.params = {
			id,
			state
		}
	}
}

/**
 * 绘画接口
 * */
export class Drawing {
	/**
	 * 默认的attribute
	 * */
	get defaultAttrs() {
		throw new Error('property `defaultAttrs` is not implementation');
	}

	/**
	 * 选中时的attribute
	 * */
	get selectedAttrs() {
		throw new Error('property `selectedAttrs` is not implementation');
	}

	/**
	 * 是否可以选择
	 * */
	get canSelected() {
		return true;
	}

	/**
	 * 创建元素
	 * */
	render() {
		throw new Error('method `render` is not implementation');
	}

	/**
	 * 获取link的点的位置信息
	 * */
	getLinkPoint() {
		throw new Error('method `getLinkPoint` is not implementation');
	}
}

/**
 * 绘画线
 * */
class LineDrawing extends Drawing {
	get defaultAttrs() {
		return {
			fill: "transparent",
			stroke: "black",
			"stroke-width": "3px"
		};
	}

	get selectedAttrs() {
		return {
			stroke: "red"
		};
	}

	render(svg) {
		return svg.append("line")
	}

	renderToolbar(context, drawType, index) {
		return (
			<a key={index}
			   onClick={() => {
				   console.log('click');
				   d3.select(context.ele)
					   .on("mousedown", function () {
						   this._id = guid.raw();
						   context.doActions([
							   new DrawAction({
								   id: this._id,
								   type: drawType.type,
								   attrs: Object.assign({
									   x1: d3.event.offsetX,
									   y1: d3.event.offsetY,
									   x2: d3.event.offsetX,
									   y2: d3.event.offsetY
								   }, drawType.defaultAttrs)
							   })])
					   })
					   .on("mousemove", function () {
						   if (drawType.type === "line" && this._id) {
							   context.doActions([
								   new ReDrawAction(this._id, {
									   attrs: {
										   x2: {$set: d3.event.offsetX},
										   y2: {$set: d3.event.offsetY}
									   }
								   })
							   ]);
						   }
					   })
					   .on("mouseup", function () {
						   delete this._id;
					   })
			   }}
			   href="javascript:void(0)">Line</a>
		);
	}
}

/**
 * 绘画圈
 * */
class CircleDrawing extends Drawing {
	get defaultAttrs() {
		return {
			fill: "transparent",
			stroke: "black",
			r: "10px",
			"stroke-width": "1px"
		};
	}

	get selectedAttrs() {
		return {
			stroke: "red"
		};
	}

	render(svg) {
		return svg.append("circle")
	}

	renderToolbarCircleButton(context, drawType, index) {
		return (
			<a key={index}
			   onClick={() => {
				   d3.select(context.ele)
					   .on("mousedown", function () {
						   this._id = guid.raw();
						   context.doActions([
							   new DrawAction({
								   id: this._id,
								   type: drawType.type,
								   attrs: Object.assign({
									   cx: d3.event.offsetX,
									   cy: d3.event.offsetY
								   }, drawType.defaultAssignment)
							   })
						   ]);
					   })
					   .on("mouseup", function () {
						   delete this._id;
					   })
			   }}
			   href="javascript:void(0)">Circle</a>
		);
	}

	getLinkPoint(sourceShape, targetShape, targetDrawing) {
		return {
			x: sourceShape.attrs.cx,
			y: sourceShape.attrs.cy
		}
	}
}

/**
 * 绘画矩形
 * */
class RectDrawing extends Drawing {
	get defaultAttrs() {
		return {};
	}

	get selectedAttrs() {
		return {};
	}

	render(svg) {
		return svg.append('path');
	}

	renderToolbar(context, drawType, index) {
		return (
			<a key={index} href="javascript:void(0)" onClick={() => {
				d3.select(context.ele)
					.on('mousedown', function () {
						this._id = guid.raw();
						this._mouseDownEvent = d3.event;
						context.doActions([
							new DrawAction({
								id: this._id,
								type: drawType.type,
								attrs: Object.assign({
									d: `M ${d3.event.offsetX} ${d3.event.offsetY} l 0 0 z`
								}, drawType.defaultAttrs)
							})
						])
					})
					.on('mousemove', function () {
						if (this._id
							&& this._mouseDownEvent
							&& drawType.type === "rect") {
							const width = d3.event.offsetX - this._mouseDownEvent.offsetX;
							const height = d3.event.offsetY - this._mouseDownEvent.offsetY;
							console.log(`width:${width},height:${height}`)
							const d = [
								`M ${this._mouseDownEvent.offsetX} ${this._mouseDownEvent.offsetY}`,
								`L ${d3.event.offsetX} ${this._mouseDownEvent.offsetY}`,
								`L ${d3.event.offsetX} ${d3.event.offsetY}`,
								`L ${this._mouseDownEvent.offsetX} ${d3.event.offsetY}`,
								'z'
							]
							//update
							context.doActions([
								new ReDrawAction(this._id, {
									attrs: {
										d: {$set: d.join(' ')}
									}
								})
							])
						}
					})
					.on("mouseup", function () {
						delete this._id;
						delete this._mouseDownEvent
					})
			}}>Rect</a>
		);
	}
}

/**
 * 绘制水平刻度
 * */
class HorizontalScaleDrawing extends Drawing {
	get defaultAttrs() {
		return {}
	}

	get selectedAttrs() {
		return {}
	}

	get canSelected() {
		return false;
	}

	render(svg, shape) {
		const g = svg.append("g");
		const line = g.append("line")
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", 100)
			.attr("y2", 50)
			.attr("stoke","black")
			.attr("fill","transparent")
			.attr("stroke-width","10px")
		return g;
	}

	getLinkPoint() {
		throw new Error('method `getLinkPoint` is not implementation');
	}
}

/**
 * 绘制水平刻度
 * */
class VerticalScaleDrawing extends Drawing {

}

const builtinDrawType = {
	line: new LineDrawing(),
	circle: new CircleDrawing(),
	rect: new RectDrawing(),
	link: {
		defaultAttrs: {
			fill: "none",
			"stroke-width": "2px",
			stroke: "black"
		},
		selectedAttrs: {
			stroke: "red"
		},
		render: svg => svg.append("line")
	},
	text: {
		defaultAttrs: {
			fill: "black",
			"font-size": "20px"
		},
		selectedAttrs: {
			fill: "red"
		},
		render: function (svg) {
			return svg.append("text")
		}
	},
	xaxis: new HorizontalScaleDrawing(),
	yaxis: new VerticalScaleDrawing()
};

/**
 * 运筹学图形D3
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
			type: PropTypes.oneOf(Object.keys(actionTypeEnums)).isRequired,
			params: PropTypes.oneOfType([
				//draw
				PropTypes.shape({
					id: PropTypes.string.isRequired,
					type: PropTypes.string.isRequired,
					attrs: PropTypes.object,
					text: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
				}),
				//select
				PropTypes.string
			])
		})),
		// //默认的图形的样式
		// defaultAttrs: PropTypes.shape({
		// 	line: PropTypes.object,
		// 	dot: PropTypes.object,
		// 	circle: PropTypes.object,
		// 	text: PropTypes.object
		// }),
		// //图形被选中时候的样式
		// selectedAttrs: PropTypes.shape({
		// 	line: PropTypes.object,
		// 	dot: PropTypes.object,
		// }),
		//选择模式,是多选还是单选
		selectMode: PropTypes.oneOf(['single', 'multiple']),
		//自定义绘制类型
		customDrawType: PropTypes.object,
		onDrawTypeChange: PropTypes.func
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
		selectMode: "single",
		onDrawTypeChange: () => null
	}

	constructor(props) {
		super(props);
		this.ele = null;
		//画布中已有的图形
		this.shapes = [];
		//已经选中的图形的id
		this.selectedShapeId = [];
		//绘制类型
		this.drawTypes = Object.assign({}, builtinDrawType, this.props.customDrawType);
	}

	findShapeById(id) {
		const index = this.shapes.findIndex(f => f.id === id);
		return this.shapes[index];
	}

	updateShape(id, shape) {
		const index = this.shapes.findIndex(f => f.id === id);
		this.shapes[index] = update(this.shapes[index], shape);
		this.drawShapes(this.shapes);
	}

	doActions(actions) {
		console.log('do actions ...')
		//#region draw
		const drawActions = actions.filter(f => f.type === actionTypeEnums.draw);
		if (drawActions.length > 0) {
			console.log(`draw : ${drawActions.map(f => f.params.type).join(',')}`)
			this.shapes = this.shapes.concat(drawActions.map(data => data.params));
			this.drawShapes(this.shapes);
		}
		//#endregion

		//#region redraw
		const redrawActions = actions.filter(f => f.type === actionTypeEnums.redraw);
		if (redrawActions.length > 0) {
			console.log(`redraw : ${redrawActions.map(f => f.params.id).join(',')}`);
			let shapes = [];
			redrawActions.forEach(action => {
				const index = this.shapes.findIndex(f => f.id === action.params.id);
				if (index >= 0) {
					this.shapes[index] = update(this.shapes[index], action.params.state);
					shapes.push(this.shapes[index]);
				}
			});
			this.drawShapes(shapes);
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
			const shape = this.findShapeById(id);
			if (shape) {
				if (shape.selection) {
					const attrs = getPath(this.drawTypes, `${shape.type}.selectedAttrs`, {});
					console.log('select attrs', attrs);
					shape.selection.call(self => {
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
		const svg = d3.select(this.ele);
		shapes.forEach(shape => {
			const drawing = this.drawTypes[shape.type];
			if (drawing) {
				switch (shape.type) {
					case "link":
						//计算link的相关属性
						this.linkShape(shape, drawing);
						break;
				}
				//#region create selection
				if (!shape.selection) {
					// create element
					shape.selection = drawing.render.call(null, svg, shape)
					//listene click event
					shape.selection.on('click', () => {
						if (drawing.canSelected) {
							this.doActions([
								new SelectAction(shape.id)
							]);
						}
					})
				}
				//#endregion


				//#region deal with svg common property
				//update attrs
				shape.selection.call(self => {
					this.updateShapeAttrs(self, shape.type, Object.assign({}, drawing.defaultAttrs, shape.attrs));
				});
				//update text
				if (shape.text) {
					shape.selection.text(shape.text);
				}
				//#endregion
			}
			else {
				console.warn(`draw type \`${shape.type}\` is not defined`);
			}
		})
		// this.drawLines(shapes.filter(f => f.type === drawTypeEnums.line));
		// this.drawDots(shapes.filter(f => f.type === drawTypeEnums.dot));
		// this.drawCircles(shapes.filter(f => f.type === drawTypeEnums.circle));
		// this.drawTexts(shapes.filter(f => f.type === drawTypeEnums.text));
	}

	getLinkPosition(shape) {
		const drawing = this.drawTypes[shape.type];
		if (drawing) {
			return drawing.getLinkPoint(shape);
		}
		throw new Error(`draw type \`${shape.type}\` is not defined`);
	}


	linkShape(shape) {
		const source = this.findShapeById(shape.source);
		const target = this.findShapeById(shape.target);
		if (source && target) {
			const sourcePos = this.getLinkPosition(source);
			const targetPos = this.getLinkPosition(target);
			shape.attrs.x1 = sourcePos.x;
			shape.attrs.y1 = sourcePos.y;
			shape.attrs.x2 = targetPos.x;
			shape.attrs.y2 = targetPos.y;
		}
	}

	updateShapeAttrs(ele, drawType, attrs) {
		const newAttrs = Object.assign({}, this.drawTypes[drawType].defaultAttrs, attrs);
		for (let key in newAttrs) {
			ele.attr(key, newAttrs[key]);
		}
	}

	render() {
		return (
			<WorkSpace actions={Object.keys(this.drawTypes).map((key, index) => {
				const drawType = this.drawTypes[key];
				if (drawType) {
					if (drawType.renderToolbar) {
						return drawType.renderToolbar(this, {
							type: key,
							...drawType
						}, index);
					}
				}
				return null;
			})}>
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
		// this.initialSVG();
		this.doActions(this.props.actions);
	}
}
