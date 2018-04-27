import React, {Component, PureComponent} from "react";
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import guid from 'guid'
import WorkSpace from './WorkSpace'
import {get as getPath} from 'object-path'
import update from 'immutability-helper'

/**
 * @typedef
 * */
type FromDrawingType = {
	/**
	 * 对应到绘制的类的名字
	 * */
	type: String,
	/**
	 * 目前包含两个主要属性就是`attrs`和`text`,`text`是指svg中的嵌套内容,`attrs`是对应到svg元素的attributes,以后可能还会扩展其他属性(svg的标准)
	 * */
	option: Object
}
type DrawingOptionType = {
	type: String,
	option: Object
};

type ActionOptionType = {
	type: String,
	params: Array
};

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
export const actionTypeEnums = {
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

const graphMode = {
	none: "none",
	draw: "draw",
	playing: "playing"
};

let drawingIndex = {};
let actionIndex = {};

/**
 * 注册Drawing绘制类
 * @param {String} name - name值必须和绘图类的类名保持一致
 * @param {Function} drawing - 绘图类
 * */
function registerDrawing(name, drawing) {
	drawingIndex[name] = drawing;
}

function isNullOrUndefined(value) {
	if (value === undefined || value === null) {
		return true;
	}
	return false;
}

/**
 * 反序列化drawing
 * */
export function fromDrawing(drawingOps: DrawingOptionType) {
	const func = drawingIndex[drawingOps.type];
	return new func(drawingOps.option);
}

/**
 * 反序列化actions
 * */
export function fromActions(actions: Array<ActionOptionType>) {
	return actions.map(action => {
		const type = action.type;
		const args = action.params;
		const func = actionIndex[type];
		if (!func) {
			throw new Error(`action ${type} is not defined`);
		}
		switch (type) {
			case actionTypeEnums.draw:
				return new actionIndex[type](...args.map(arg => fromDrawing(arg)));
			default:
				return new actionIndex[type](...args);
		}

	})
}

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

/**
 * action基类
 * */
class Action {
	static fromActions() {

	}

	constructor(type, params) {
		this.type = type;
		this.params = params;
	}
}

/**
 * 绘图action
 * */
export class DrawAction extends Action {
	constructor(drawingOps) {
		super(actionTypeEnums.draw, drawingOps)
	}
}

actionIndex[actionTypeEnums.draw] = DrawAction;

/**
 * 选择action
 * */
export class SelectAction extends Action {
	constructor(shapeId) {
		super(actionTypeEnums.select, shapeId)
	}
}

actionIndex[actionTypeEnums.select] = SelectAction;

/**
 * 取消选择action
 * */
export class UnSelectAction extends Action {
	constructor(shapeId) {
		super(actionTypeEnums.unselect, shapeId)
	}
}

actionIndex[actionTypeEnums.unselect] = UnSelectAction;

/**
 * 重绘action
 * */
export class ReDrawAction extends Action {
	constructor(shapeId, state) {
		super(actionTypeEnums.redraw, {
			id: shapeId,
			state: state
		})
	}
}

actionIndex[actionTypeEnums.redraw] = ReDrawAction;

/**
 * 绘画接口,所有的绘画类都需要继承这个类并实现相关方法
 * */
export class Drawing {

	constructor(option) {
		this.id = getPath(option, "id", guid.raw());
		this.attrs = getPath(option, "attrs", {});
		this.text = getPath(option, "text", "");
		this.selection = null;
		this.type = null;
		this.graph = null;
		this.ready = false;
		this.selected = false;
	}

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
	 * 绘制,更新selection相关
	 * */
	render() {
		let attrs = Object.assign({}, this.defaultAttrs, this.attrs, this.selected ? this.selectedAttrs : {});
		if (!isNullOrUndefined(attrs.x)) {
			attrs.x = this.graph.getX(attrs.x);
		}
		if (!isNullOrUndefined(attrs.y)) {
			attrs.y = this.graph.getY(attrs.y);
		}
		if (!isNullOrUndefined(attrs.x1)) {
			attrs.x1 = this.graph.getX(attrs.x1);
		}
		if (!isNullOrUndefined(attrs.x2)) {
			attrs.x2 = this.graph.getX(attrs.x2);
		}
		if (!isNullOrUndefined(attrs.y1)) {
			attrs.y1 = this.graph.getY(attrs.y1);
		}
		if (!isNullOrUndefined(attrs.y2)) {
			attrs.y2 = this.graph.getY(attrs.y2);
		}
		if (!isNullOrUndefined(attrs.cx)) {
			attrs.cx = this.graph.getX(attrs.cx);
		}
		if (!isNullOrUndefined(attrs.cy)) {
			attrs.cy = this.graph.getY(attrs.cy);
		}
		this.updateAttrs(attrs);
		if (this.text) {
			this.selection.text(this.text);
		}
	}

	/**
	 * 获取link的点的位置信息
	 * */
	getLinkPoint() {
		throw new Error('method `getLinkPoint` is not implementation');
	}

	/**
	 * 初始化drawing,创建selection,监听事件需要在里面实现
	 * */
	initialize(graph) {
		this.graph = graph;
		this.ready = true;
	}

	/**
	 * 批量更新attrs
	 * */
	updateAttrs(attrs) {
		if (this.selection) {
			this.selection.call(self => {
				for (let key in attrs) {
					self.attr(key, attrs[key]);
				}
			})
		}
	}

	/**
	 * 选中当前图形
	 * */
	select() {
		if (this.graph) {
			this.graph.doActions([
				new SelectAction(this.id)
			])
		}
	}
}

/**
 * 绘画线
 * */
export class LineDrawing extends Drawing {
	constructor(option) {
		super(option);
		this.type = "line";
	}

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

	initialize(graph) {
		super.initialize(graph);
		this.selection = d3.select(graph.ele).append("line");
		this.selection.on("click", () => {
			this.select();
		})
	}

	// renderToolbar(graph, drawType, index) {
	// 	return (
	// 		<a key={index}
	// 		   onClick={() => {
	// 			   console.log('click');
	// 			   d3.select(graph.ele)
	// 				   .on("mousedown", function () {
	// 					   this._id = guid.raw();
	// 					   graph.doActions([
	// 						   new DrawAction({
	// 							   id: this._id,
	// 							   type: this.type,
	// 							   attrs: Object.assign({
	// 								   x1: d3.event.offsetX,
	// 								   y1: d3.event.offsetY,
	// 								   x2: d3.event.offsetX,
	// 								   y2: d3.event.offsetY
	// 							   }, this.defaultAttrs)
	// 						   })])
	// 				   })
	// 				   .on("mousemove", function () {
	// 					   if (drawType.type === "line" && this._id) {
	// 						   graph.doActions([
	// 							   new ReDrawAction(this._id, {
	// 								   attrs: {
	// 									   x2: {$set: d3.event.offsetX},
	// 									   y2: {$set: d3.event.offsetY}
	// 								   }
	// 							   })
	// 						   ]);
	// 					   }
	// 				   })
	// 				   .on("mouseup", function () {
	// 					   delete this._id;
	// 				   })
	// 		   }}
	// 		   href="javascript:void(0)">Line</a>
	// 	);
	// }
}

registerDrawing("LineDrawing", LineDrawing);

/**
 * 绘画圈
 * */
export class CircleDrawing extends Drawing {
	constructor(option) {
		super(option);
		this.type = "circle";
	}

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

	initialize(graph) {
		super.initialize(graph);
		this.selection = d3.select(graph.ele).append("circle");
		this.selection.on("click", () => {
			this.select();
		})
	}

	getLinkPoint() {
		return new Point(parseFloat(this.attrs.cx), parseFloat(this.attrs.cy));
	}

}

registerDrawing("CircleDrawing", CircleDrawing);

/**
 * 绘制点
 * */
export class DotDrawing extends Drawing {
	constructor(option) {
		super(option);
		this.type = "dot";
	}

	get defaultAttrs() {
		return {
			fill: "black",
			stroke: "black",
			r: "5px"
		};
	}

	get selectedAttrs() {
		return {
			stroke: "red"
		};
	}

	initialize(graph) {
		super.initialize(graph);
		this.selection = d3.select(graph.ele).append("circle");
		this.selection.on("click", () => {
			this.select();
		})
	}

}

registerDrawing("DotDrawing", DotDrawing);

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

registerDrawing("RectDrawing", RectDrawing);

/**
 * 绘制刻度
 * */
export class NumberScaleDrawing extends Drawing {
	constructor(option) {
		super(option);
		this.type = "number-scale";
		this.grid = getPath(option, "grid", {
			top: 20,
			bottom: 20,
			left: 20,
			right: 20
		});
		//刻度的间距大小
		this.scale = getPath(option, "scale", 20);
	}

	get defaultAttrs() {
		return {}
	}

	get selectedAttrs() {
		return {}
	}

	initialize(graph) {
		super.initialize(graph);
		const width = graph.ele.clientWidth;
		const height = graph.ele.clientHeight;
		this.selection = d3.select(graph.ele).append("g");
		const originalPoint = new Point(this.grid.left, height - this.grid.bottom);
		const xEndPoint = new Point(width - this.grid.right, height - this.grid.bottom);
		const yEndPoint = new Point(this.grid.left, this.grid.top)
		//xAxis
		this.selection.append("line")
			.attr("x1", originalPoint.x)
			.attr("y1", originalPoint.y)
			.attr("x2", xEndPoint.x)
			.attr("y2", xEndPoint.y)
			.attr("stroke", "black")
			.attr("stroke-width", "1px");
		//画x轴的箭头
		this.selection.append("path")
			.attr("d", `M ${xEndPoint.x} ${xEndPoint.y} L ${xEndPoint.x} ${xEndPoint.y + 5} L ${xEndPoint.x + 15} ${xEndPoint.y} L ${xEndPoint.x} ${xEndPoint.y - 5} Z`)
		// 画x轴的刻度
		const xScaleCount = Math.floor(Math.abs(xEndPoint.x - originalPoint.x) / this.scale);
		Array.apply(null, {length: xScaleCount}).forEach((v, i) => {
			const p1 = new Point(originalPoint.x + this.scale * i, originalPoint.y);
			const p2 = new Point(originalPoint.x + this.scale * i, originalPoint.y - 3)
			this.selection.append("line")
				.attr("x1", p1.x)
				.attr("y1", p1.y)
				.attr("x2", p2.x)
				.attr("y2", p2.y)
				.attr("fill", "none")
				.attr("stroke", "black")
				.attr("stroke-width", 1);
			this.selection.append("text")
				.text(i)
				.attr("x", p1.x)
				.attr("y", p1.y + 10)
				.attr("style", "font-size:10px")
		})
		//yAxis
		this.selection.append("line")
			.attr("x1", originalPoint.x)
			.attr("y1", originalPoint.y)
			.attr("x2", yEndPoint.x)
			.attr("y2", yEndPoint.y)
			.attr("stroke", "black")
			.attr("stroke-width", 1)
		//画y轴的箭头
		this.selection.append("path")
			.attr("d", `M ${yEndPoint.x} ${yEndPoint.y} L ${yEndPoint.x + 5} ${yEndPoint.y} L ${yEndPoint.x} ${yEndPoint.y - 15} L ${yEndPoint.x - 5} ${yEndPoint.y} Z`)
		//画y轴的刻度
		const yScaleCount = Math.floor(Math.abs(yEndPoint.y - originalPoint.y) / this.scale);
		Array.apply(null, {length: yScaleCount}).forEach((v, i) => {
			const p1 = new Point(originalPoint.x, originalPoint.y - this.scale * i);
			const p2 = new Point(originalPoint.x + 3, originalPoint.y - this.scale * i)
			this.selection.append("line")
				.attr("x1", p1.x)
				.attr("y1", p1.y)
				.attr("x2", p2.x)
				.attr("y2", p2.y)
				.attr("fill", "none")
				.attr("stroke", "black")
				.attr("stroke-width", 1);
			this.selection.append("text")
				.text(i)
				.attr("x", p1.x - 15)
				.attr("y", p1.y)
				.attr("style", "font-size:10px")
		})
	}
}

registerDrawing("NumberScaleDrawing", NumberScaleDrawing);

/**
 * 绘制带箭头的link
 * */
export class ArrowLinkDrawing extends Drawing {
	constructor(option) {
		super(option);
		this.type = "arrow-link";
		this.sourceId = getPath(option, "sourceId");
		if (!this.sourceId) {
			throw new Error(`ArrowLinkDrawing option require sourceId property`);
		}
		this.targetId = getPath(option, "targetId");
		if (!this.targetId) {
			throw new Error(`ArrowLinkDrawing option require targetId property`);
		}
		this.source = null;
		this.target = null;
	}

	get defaultAttrs() {
		return {
			fill: "black",
			stroke: "black"
		};
	}

	get selectedAttrs() {
		return {
			stroke: "red"
		};
	}

	initialize(graph) {
		super.initialize(graph);
		this.source = this.graph.findShapeById(this.sourceId);
		this.target = this.graph.findShapeById(this.targetId);
		this.selection = d3.select(graph.ele).append("path");
		this.selection.on("click", () => {
			this.select();
		});
	}

	render() {
		//计算link的位置信息
		const p1 = this.source.getLinkPoint();
		const p2 = this.target.getLinkPoint();
		this.attrs = update(this.attrs, {
			d: {$set: this.getArrowLinkPath(p1, p2).join(' ')}
		});
		super.render();
	}

	getArrowLinkPath(startPoint, endPoint, distance = 10) {
		const diffX = startPoint.x - endPoint.x;
		const diffY = startPoint.y - endPoint.y;
		const a = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
		const q1x = endPoint.x + (distance * (diffX + diffY)) / a
		const q1y = endPoint.y + (distance * (diffY - diffX)) / a
		const q2x = endPoint.x + (diffX * distance) / a;
		const q2y = endPoint.y + (diffY * distance) / a;
		const q3x = endPoint.x + (distance * (diffX - diffY)) / a;
		const q3y = endPoint.y + (distance * (diffX + diffY)) / a;
		return [
			`M ${this.graph.getX(startPoint.x)} ${this.graph.getY(startPoint.y)}`,
			`L ${this.graph.getX(q2x)} ${this.graph.getY(q2y)}`,
			`L ${this.graph.getX(q1x)} ${this.graph.getY(q1y)}`,
			`L ${this.graph.getX(endPoint.x)} ${this.graph.getY(endPoint.y)}`,
			`L ${this.graph.getX(q3x)} ${this.graph.getY(q3y)}`,
			`L ${this.graph.getX(q2x)} ${this.graph.getY(q2y)}`,
			`L ${this.graph.getX(startPoint.x)} ${this.graph.getY(startPoint.y)}`,
			'Z'
		];
	}
}

registerDrawing("ArrowLinkDrawing", ArrowLinkDrawing);

/**
 * 绘制link
 * */
export class LinkDrawing extends Drawing {
	constructor(option) {
		super(option);
		this.type = "link";
		this.sourceId = getPath(option, "sourceId");
		if (!this.sourceId) {
			throw new Error(`LinkDrawing option require sourceId property`);
		}
		this.targetId = getPath(option, "targetId");
		if (!this.targetId) {
			throw new Error(`LinkDrawing option require targetId property`);
		}
		this.source = null;
		this.target = null;
	}

	get defaultAttrs() {
		return {
			fill: "none",
			"stroke-width": "2px",
			stroke: "black"
		}
	}

	get selectedAttrs() {
		return {
			stroke: "red"
		}
	}

	initialize(graph) {
		super.initialize(graph);
		this.source = this.graph.findShapeById(this.sourceId);
		this.target = this.graph.findShapeById(this.targetId);
		this.selection = d3.select(graph.ele).append("line");
		this.selection.on("click", () => {
			this.select();
		});
	}

	render() {
		//计算link的位置信息
		const p1 = this.source.getLinkPoint();
		const p2 = this.target.getLinkPoint();
		this.attrs = update(this.attrs, {
			x1: {$set: p1.x},
			y1: {$set: p1.y},
			x2: {$set: p2.x},
			y2: {$set: p2.y}
		});
		super.render();
	}

}

registerDrawing("LinkDrawing", LinkDrawing);

export class PathDrawing extends Drawing {
	constructor(option) {
		super(option);
		this.type = "path";
	}

	get defaultAttrs() {
		return {};
	}

	get selectedAttrs() {
		return {};
	}

	initialize(graph) {
		super.initialize(graph);
		this.selection = d3.select(graph.ele).append("path");
		this.selection.on("click", () => {
			this.select();
		});
	}
}

registerDrawing("PathDrawing", PathDrawing)

class TextDrawing extends Drawing {
	get defaultAttrs() {
		return {
			fill: "black",
			"font-size": "20px"
		}
	}

	get selectedAttrs() {
		return {
			fill: "red"
		}
	}
}

// const builtinDefinedDrawing = {
// 	line: new LineDrawing(),
// 	circle: new CircleDrawing(),
// 	rect: new RectDrawing(),
// 	link: new LinkDrawing(),
// 	text: new TextDrawing(),
// 	xAxis: new HorizontalScaleDrawing(),
// 	yAxis: new VerticalScaleDrawing(),
// 	arrowLink: new ArrowLinkDrawing()
// };

/**
 * 运筹学图形D3
 * */
export default class D3Graph extends PureComponent {
	/**
	 * @property {object} attrs - svg的属性
	 * @property {Array} actions - 所有的操作
	 * @property {single|multiple} selectMode [single] - 选择模式,是多选还是单选
	 * @property {object} original - 坐标原点,默认值{x:0,y:0}
	 * @property {screen|math} coordinateType - 坐标系,默认值是屏幕坐标系
	 * @property {none|playing} mode - 模式,默认是:none,如果是playing,则是样式模式,会一步一步的演示绘图过程
	 * @property {object} playingOption - mode===playing时有效
	 * */
	static propTypes = {
		attrs: PropTypes.object,
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
		// customDefinedDrawing: PropTypes.object,
		// onDrawTypeChange: PropTypes.func,
		original: PropTypes.shape({
			x: PropTypes.number,
			y: PropTypes.number
		}),
		coordinateType: PropTypes.oneOf(['screen', 'math']),
		mode: PropTypes.oneOf(Object.keys(graphMode)),
		playingOption: PropTypes.shape({
			interval: PropTypes.number
		})
	};
	static defaultProps = {
		attrs: {
			width: 400,
			height: 300,
			viewBox: "0 0 400 300",
			style: {
				backgroundColor: "#cccccc"
			}
		},
		selectMode: "single",
		// onDrawTypeChange: () => null,
		actions: [],
		original: {
			x: 0,
			y: 0
		},
		coordinateType: "screen",
		mode: graphMode.none
	}

	constructor(props) {
		super(props);
		this.ele = null;
		//画布中已有的图形
		this.shapes = [];
		//已经选中的图形的id
		this.selectedShapes = [];
		//绘制类型
		// this.definedDrawing = Object.assign({}, builtinDefinedDrawing, this.props.customDefinedDrawing);
	}

	findShapeById(id) {
		const index = this.shapes.findIndex(f => f.id === id);
		return this.shapes[index];
	}

	/**
	 * 根据坐标系计算x值
	 * */
	getX(value) {
		return this.props.original.x + parseFloat(value);
	}

	/**
	 * 根据坐标系计算y值
	 * */
	getY(value) {
		if (this.props.coordinateType === "screen") {
			return this.props.original.y + parseFloat(value);
		}
		return this.props.original.y - parseFloat(value);
	}

	// updateShape(id, shape) {
	// 	const index = this.shapes.findIndex(f => f.id === id);
	// 	this.shapes[index] = update(this.shapes[index], shape);
	// 	this.drawShapes(this.shapes);
	// }

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
				this.doActions(this.selectedShapes.map(shape => new UnSelectAction(shape.id)))
				this.selectedShapes = selectActions.map(f => {
					const id = f.params;
					let shape = this.findShapeById(id);
					shape.selected = true;
					return shape;
				});
			}
			else {
				this.selectedShapes = this.selectedShapes.concat(selectActions.map(f => {
					const id = f.params;
					let shape = this.findShapeById(id);
					shape.selected = true;
					return shape;
				}));
			}
			this.drawShapes(this.selectedShapes);
		}
		//#endregion

		//#region unselect
		const unSelectActions = actions.filter(f => f.type === actionTypeEnums.unselect);
		if (unSelectActions.length > 0) {
			console.log(`unselect : ${unSelectActions.map(f => f.params).join(',')}`);
			const unSelectShape = unSelectActions.map(f => {
				const id = f.params;
				let shape = this.findShapeById(id);
				shape.selected = false;
				return shape;
			});
			this.selectedShapes = this.selectedShapes.filter(f => unSelectActions.findIndex(ff => ff.id !== f.id) >= 0);
			this.drawShapes(unSelectShape);
		}
		//#endregion
	}

	drawShapes(shapes) {
		shapes.forEach(shape => {
			//初始化
			if (!shape.ready) {
				shape.initialize(this);
			}
			shape.render();
		})
	}

	play() {
		let actionIndex = 0;
		const next = () => {
			if (actionIndex >= this.props.actions.length) {
				return;
			}
			const action = this.props.actions[actionIndex];
			this.doActions([action]);
			actionIndex++;
			setTimeout(next.bind(this), getPath(this.props.playingOption, "interval", 3000));
		}
		next();
	}

	// getLinkPosition(shape) {
	// 	const drawing = this.definedDrawing[shape.type];
	// 	if (drawing) {
	// 		return drawing.getLinkPoint(shape);
	// 	}
	// 	throw new Error(`draw type \`${shape.type}\` is not defined`);
	// }
	//
	// linkShape(shape) {
	// 	const source = this.findShapeById(shape.source);
	// 	const target = this.findShapeById(shape.target);
	// 	if (source && target) {
	// 		const sourcePos = this.getLinkPosition(source);
	// 		const targetPos = this.getLinkPosition(target);
	// 		shape.attrs.x1 = sourcePos.x;
	// 		shape.attrs.y1 = sourcePos.y;
	// 		shape.attrs.x2 = targetPos.x;
	// 		shape.attrs.y2 = targetPos.y;
	// 	}
	// }

	// updateShapeAttrs(ele, drawType, attrs) {
	// 	const newAttrs = Object.assign({}, this.definedDrawing[drawType].defaultAttrs, attrs);
	// 	for (let key in newAttrs) {
	// 		ele.attr(key, newAttrs[key]);
	// 	}
	// }


	render() {
		return (
			<WorkSpace>
				<svg ref={ref => this.ele = ref} {...this.props.attrs}>
				</svg>
			</WorkSpace>
		);
	}

	componentWillReceiveProps(nextProps) {
		this.doActions(nextProps.actions);
	}

	componentDidMount() {
		if (this.props.mode === graphMode.draw) {
			this.doActions(this.props.actions);
		}
		if (this.props.mode === graphMode.playing) {
			this.play();
		}
	}
}
