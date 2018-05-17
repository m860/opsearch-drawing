/**
 * @todo 实现用户的输入action,输入action是一个中断操作
 * 实现link,arrowLink的label
 * @todo 实现图的drawing
 * @todo 实现transition
 * @todo 实现data action
 *
 * */

import React, {Component, PureComponent} from "react";
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import guid from 'guid'
import WorkSpace from './WorkSpace'
import {get as getPath} from 'object-path'
import update from 'immutability-helper'
import {EventEmitter} from 'fbemitter'

//#region event
const emitter = new EventEmitter();
//toolbar 按钮切换
const EVENT_TOOLBAR_CHANGE = "EVENT_TOOLBAR_CHANGE";
//#endregion

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
    params: Array,
    ops: ?Object
};

//#region enums
/**
 * action枚举
 * @readonly
 * @enum {string}
 * @property {string} draw - 绘画
 * @property {string} redraw - 重绘/更新
 * @property {string} select - 选择
 * @property {string} unselect - 反选
 * @property {string} delete - 删除
 * @property {string} clear - 清除所有图形
 * @property {string} undo - 撤销
 * @property {string} data - 数据操作
 * @property {string} input - 用户输入操作
 * */
export const actionTypeEnums = {
    draw: "draw",
    redraw: "redraw",
    select: "select",
    unselect: "unselect",
    delete: "delete",
    clear: "clear",
    // move: "move",
    // undo: "undo",
    data: "data",
    input: "input"
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

export const graphModeEnum = {
    none: "none",
    draw: "draw",
    playing: "playing"
};
export const coordinateTypeEnum = {
    "screen": "screen",
    "math": "math"
}
//#endregion

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

function getArrowPoints(startPoint, endPoint, distance = 5) {
    const diffX = startPoint.x - endPoint.x;
    const diffY = startPoint.y - endPoint.y;
    const a = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
    const q1x = endPoint.x + (distance * (diffX + diffY)) / a
    const q1y = endPoint.y + (distance * (diffY - diffX)) / a
    const q3x = endPoint.x + (distance * (diffX - diffY)) / a;
    const q3y = endPoint.y + (distance * (diffX + diffY)) / a;
    return [
        new Point(endPoint.x, endPoint.y),
        new Point(q1x, q1y),
        new Point(q3x, q3y)
    ];
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
 *
 * @example
 *
 * const actions=fromActions([{
 * 	type:"draw",
 * 	params:[{
 * 		type:"LineDrawing",
 * 		option:{
 * 			id:"line1",
 * 			attrs:{}
 * 		}
 * 	}]
 * },{
 * 	type:"draw",
 * 	params:[{
 * 		type:"DotDrawing",
 * 		option:{
 * 			id:"dot1",
 * 			attrs:{}
 * 		}
 * 	}]
 * }])
 *
 * */
export function fromActions(actions: Array<ActionOptionType>) {
    return actions.map(action => {
        const type = action.type;
        const args = action.params;
        const ops = action.ops;
        const func = actionIndex[type];
        if (!func) {
            throw new Error(`action ${type} is not defined`);
        }
        switch (type) {
            case actionTypeEnums.draw:
                return new actionIndex[type](...args.map(arg => fromDrawing(arg), ops));
            default:
                return new actionIndex[type](...args, ops);
        }

    })
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

//#region Action
/**
 * action基类
 * */
class Action {
    constructor(type, params, ops) {
        /**
         * action的类型,是一个枚举值
         * @member {actionTypeEnums}
         * */
        this.type = type;
        /**
         * action的参数
         * @member {Array}
         * */
        this.params = params;
        /**
         * playing模式执行下一步时的时间间隔,默认没有
         * @member {?Number}
         * */
        this.nextInterval = getPath(ops, "nextInterval", null);
    }
}

/**
 * 绘图action
 *
 * @example
 *
 * <D3Graph actions={[
 * 	new DrawAction(new LineDrawing({id:"line1",attrs:{x1:0,y1:0,x2:100,y2:100}})),
 * 	new DrawAction(new DotAction({id:"dot1",attrs:{cx:100,cy:100}}))
 * ]}/>
 *
 * */
export class DrawAction extends Action {
    constructor(drawingOps, ops) {
        super(actionTypeEnums.draw, drawingOps, ops)
    }
}

actionIndex[actionTypeEnums.draw] = DrawAction;

/**
 * 选择action
 *
 * @example
 *
 * <D3Graph actions={[new SelectAction('SHAPE_ID')]}/>
 *
 * */
export class SelectAction extends Action {
    constructor(shapeId, ops) {
        super(actionTypeEnums.select, shapeId, ops)
    }
}

actionIndex[actionTypeEnums.select] = SelectAction;

/**
 * 取消选择action
 *
 * @example
 *
 * <D3Graph actions={[new UnSelectAction('SHAPE_ID')]}/>
 *
 * */
export class UnSelectAction extends Action {
    constructor(shapeId, ops) {
        super(actionTypeEnums.unselect, shapeId, ops)
    }
}

actionIndex[actionTypeEnums.unselect] = UnSelectAction;

/**
 * 删除图形action
 *
 * @example
 *
 * <D3Graph actions={[new DeleteAction('SHAPE_ID')]}/>
 *
 * */
export class DeleteAction extends Action {
    constructor(shapeId, ops) {
        super(actionTypeEnums.delete, shapeId, ops);
    }
}

actionIndex[actionTypeEnums.delete] = DeleteAction;

/**
 * 清除所有的图形action
 *
 * @example
 *
 * <D3Graph actions={[new ClearAction()]}/>
 *
 * */
export class ClearAction extends Action {
    constructor(ops) {
        super(actionTypeEnums.clear, null, ops);
    }
}

actionIndex[actionTypeEnums.clear] = ClearAction;


/**
 * 重绘action
 * */
export class ReDrawAction extends Action {
    constructor(shapeId, state, ops) {
        super(actionTypeEnums.redraw, {
            id: shapeId,
            state: state
        }, ops)
    }
}

actionIndex[actionTypeEnums.redraw] = ReDrawAction;
//#endregion

//#region Drawing
/**
 * 绘画接口,所有的绘画类都需要继承这个类并实现相关方法
 * @todo 添加 TextCircleDrawing 实现图(有向图/无向图)节点的绘制
 * */
export class Drawing {

    /**
     * @constructor
     *
     * @param {Object} option
     * @param {?String} option.id - 默认是guid
     * @param {?Object} option.attrs
     * @param {?Function|?String} option.text
     *
     * */
    constructor(option) {
        /**
         * 图形的id,如果没有提供会生成一个guid
         * @member {String}
         * */
        this.id = getPath(option, "id", guid.raw());
        /**
         * 图形的attrs
         * @member {Object}
         * */
        this.attrs = getPath(option, "attrs", {});
        /**
         * 对应svg元素的text
         * @member {String|Function}
         * */
        this.text = getPath(option, "text", "");
        /**
         * 图形svg
         * @member {D3.Selection}
         * @private
         * */
        this.selection = null;
        /**
         * 绘图的类型
         * @member {String}
         * */
        this.type = null;
        /**
         * graph的实例
         * @member {React.Component}
         * @private
         * */
        this.graph = null;
        /**
         * 是否已经初始化
         * @member {Boolean}
         * @protected
         * */
        this.ready = false;
        /**
         * 当前图形是否被选中
         * @member {Boolean}
         * @private
         * */
        this.selected = false;
    }

    /**
     * 默认的attribute
     * @readonly
     * @member {Object}
     * */
    get defaultAttrs() {
        return {};
    }

    /**
     * 选中时的attribute
     * @readonly
     * @member {Object}
     * */
    get selectedAttrs() {
        return {};
    }

    /**
     * 绘制,更新selection相关
     * */
    render() {
        this.updateAttrs(this.selection, this.combineAttrs(this.defaultAttrs, this.attrs, this.selectedAttrs, null));
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
    updateAttrs(selection, attrs) {
        if (selection) {
            selection.call(self => {
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

    combineAttrs(defaultAttrs = {}, attrs = {}, defaultSelectedAttrs, selectedAttrs) {
        let result = Object.assign({}, defaultAttrs, attrs, this.selected ? Object.assign({}, defaultSelectedAttrs, selectedAttrs) : {});
        if (!isNullOrUndefined(result.x)) {
            result.x = this.graph.getX(result.x);
        }
        if (!isNullOrUndefined(result.y)) {
            result.y = this.graph.getY(result.y);
        }
        if (!isNullOrUndefined(result.x1)) {
            result.x1 = this.graph.getX(result.x1);
        }
        if (!isNullOrUndefined(result.x2)) {
            result.x2 = this.graph.getX(result.x2);
        }
        if (!isNullOrUndefined(result.y1)) {
            result.y1 = this.graph.getY(result.y1);
        }
        if (!isNullOrUndefined(result.y2)) {
            result.y2 = this.graph.getY(result.y2);
        }
        if (!isNullOrUndefined(result.cx)) {
            result.cx = this.graph.getX(result.cx);
        }
        if (!isNullOrUndefined(result.cy)) {
            result.cy = this.graph.getY(result.cy);
        }
        result["shape-id"] = this.id;
        return result;
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
export class RectDrawing extends Drawing {
    constructor(option) {
        super(option);
        this.type = "rect"
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

    // renderToolbar(context, drawType, index) {
    // 	return (
    // 		<a key={index} href="javascript:void(0)" onClick={() => {
    // 			d3.select(context.ele)
    // 				.on('mousedown', function () {
    // 					this._id = guid.raw();
    // 					this._mouseDownEvent = d3.event;
    // 					context.doActions([
    // 						new DrawAction({
    // 							id: this._id,
    // 							type: drawType.type,
    // 							attrs: Object.assign({
    // 								d: `M ${d3.event.offsetX} ${d3.event.offsetY} l 0 0 z`
    // 							}, drawType.defaultAttrs)
    // 						})
    // 					])
    // 				})
    // 				.on('mousemove', function () {
    // 					if (this._id
    // 						&& this._mouseDownEvent
    // 						&& drawType.type === "rect") {
    // 						const width = d3.event.offsetX - this._mouseDownEvent.offsetX;
    // 						const height = d3.event.offsetY - this._mouseDownEvent.offsetY;
    // 						console.log(`width:${width},height:${height}`)
    // 						const d = [
    // 							`M ${this._mouseDownEvent.offsetX} ${this._mouseDownEvent.offsetY}`,
    // 							`L ${d3.event.offsetX} ${this._mouseDownEvent.offsetY}`,
    // 							`L ${d3.event.offsetX} ${d3.event.offsetY}`,
    // 							`L ${this._mouseDownEvent.offsetX} ${d3.event.offsetY}`,
    // 							'z'
    // 						]
    // 						//update
    // 						context.doActions([
    // 							new ReDrawAction(this._id, {
    // 								attrs: {
    // 									d: {$set: d.join(' ')}
    // 								}
    // 							})
    // 						])
    // 					}
    // 				})
    // 				.on("mouseup", function () {
    // 					delete this._id;
    // 					delete this._mouseDownEvent
    // 				})
    // 		}}>Rect</a>
    // 	);
    // }
}

registerDrawing("RectDrawing", RectDrawing);

/**
 * 绘制刻度
 * */
export class NumberScaleDrawing extends Drawing {
    constructor(option) {
        super(option);
        this.type = "number-scale";
        this.original = getPath(option, "original", {
            x: 20,
            y: 280
        });
        this.xAxisLength = getPath(option, "xAxisLength", 360);
        this.yAxisLength = getPath(option, "yAxisLength", 260);
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
        // const width = graph.ele.clientWidth;
        // const height = graph.ele.clientHeight;
        this.selection = d3.select(graph.ele).append("g");
        const originalPoint = Object.assign({}, this.original);
        const xEndPoint = new Point(this.original.x + this.xAxisLength, this.original.y);
        const yEndPoint = new Point(this.original.x, this.original.y - this.yAxisLength)
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
 * @todo 实现label的修改
 * */
export class ArrowLinkDrawing extends Drawing {
    /**
     * @constructor
     *
     * @param {object} option
     * @param {string} option.sourceId - link的源id
     * @param {string} option.targetId - link的目标id
     * @param {string|function} option.label - link的label
     * @param {object} option.labelAttrs - label的attributes
     * */
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
        this.label = getPath(option, "label");
        this.labelAttrs = getPath(option, "labelAttrs");
        this.labelSelection = null;
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
        this.labelSelection = d3.select(graph.ele).append("text");
    }

    renderLabel(x, y) {
        if (this.labelSelection) {
            if (this.label) {
                this.labelSelection.text(this.label);
            }
            const attrs = Object.assign({
                x: this.graph.getX(x),
                y: this.graph.getY(y)
            }, this.labelAttrs);
            this.updateAttrs(this.labelSelection, attrs);
        }
    }

    render() {
        //计算link的位置信息
        const p1 = this.source.getLinkPoint();
        const p2 = this.target.getLinkPoint();
        this.attrs = update(this.attrs, {
            d: {$set: this.getArrowLinkPath(p1, p2, 10 / this.graph.scale).join(' ')}
        });
        super.render();
        const hx = Math.abs(p1.x - p2.x) / 2;
        const hy = Math.abs(p1.y - p2.y) / 2;
        const labelX = Math.min(p1.x, p2.x) + hx;
        const labelY = Math.min(p1.y, p2.y) + hy;
        this.renderLabel(labelX, labelY);
    }

    getArrowLinkPath(startPoint, endPoint, distance = 10) {

        const diffX = startPoint.x - endPoint.x;
        const diffY = startPoint.y - endPoint.y;
        const a = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
        const q1x = endPoint.x + (distance * (diffX + diffY)) / a;
        const q1y = endPoint.y + (distance * (diffY - diffX)) / a;
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
 * @todo 添加label
 * @todo 实现label的修改
 * */
export class LinkDrawing extends Drawing {
    /**
     * @constructor
     *
     * @param {object} option
     * @param {string} option.sourceId - link的源id
     * @param {string} option.targetId - link的目标id
     * @param {string|function} option.label - link的label
     * @param {object} option.labelAttrs - label的attributes
     * */
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
        this.label = getPath(option, "label");
        this.labelAttrs = getPath(option, "labelAttrs");
        this.labelSelection = null;
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
        this.labelSelection = d3.select(graph.ele).append("text");
    }

    renderLabel(x, y) {
        if (this.labelSelection) {
            if (this.label) {
                this.labelSelection.text(this.label);
            }
            const attrs = Object.assign({
                x: this.graph.getX(x),
                y: this.graph.getY(y)
            }, this.labelAttrs);
            this.updateAttrs(this.labelSelection, attrs);
        }
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
        const hx = Math.abs(p1.x - p2.x) / 2;
        const hy = Math.abs(p1.y - p2.y) / 2;
        const labelX = Math.min(p1.x, p2.x) + hx;
        const labelY = Math.min(p1.y, p2.y) + hy;
        this.renderLabel(labelX, labelY);
    }

}

registerDrawing("LinkDrawing", LinkDrawing);

/**
 * 绘画Path
 * */
export class PathDrawing extends Drawing {
    constructor(option) {
        super(option);
        this.type = "path";
        this.d = getPath(option, "d", []);
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

    render() {
        if (!this.attrs.d) {
            let d = this.d.map((point, index) => {
                if (index === 0) {
                    return `M ${this.graph.getX(point.x)} ${this.graph.getY(point.y)}`
                }
                return `L ${this.graph.getX(point.x)} ${this.graph.getY(point.y)}`;
            });
            d.push("Z");
            this.attrs.d = d.join(" ");
        }
        super.render();
    }
}

registerDrawing("PathDrawing", PathDrawing)

/**
 * 绘制text
 * */
export class TextDrawing extends Drawing {
    constructor(option) {
        super(option);
        this.type = "text";
    }

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

    initialize(graph) {
        super.initialize(graph);
        this.selection = d3.select(graph.ele).append("text");
        this.selection.on("click", () => {
            this.select();
        });
    }
}

registerDrawing("TextDrawing", TextDrawing)

/**
 * 绘制带文本的圆圈
 */
export class TextCircleDrawing extends Drawing {
    get defaultCircleAttrs() {
        return {
            r: 20,
            fill: "transparent",
            stroke: "black"
        };
    }

    get defaultCircleSelectedAttrs() {
        return {
            fill: "transparent",
            stroke: "red"
        };
    }

    get defaultTextAttrs() {
        return {
            "text-anchor": "middle",
            "dominant-baseline": "middle"
        };
    }

    get defaultTextSelectedAttrs() {
        return {
            fill: "red"
        };
    }

    /**
     * @constructor
     *
     * @param {Object} option - 绘制的选项
     * @param {Object} option.circleAttrs - 圆圈的属性
     * @param {Object} option.circleSelectedAttrs - 圆圈选中的属性
     * @param {Object} option.textAttrs - 文本的属性
     * @param {Object} option.textSelectedAttrs - 文本选中的属性
     * @param {String} option.text
     *
     * */
    constructor(option) {
        super(option);
        /**
         * 绘制的类型
         * @member {String}
         * */
        this.type = "text-circle";
        /**
         * 圆圈的属性
         * @member {Object}
         * @private
         * */
        this.circleAttrs = getPath(option, "circleAttrs", {});
        /**
         * 圆圈选中的属性
         * @member {Object}
         * @private
         * */
        this.circleSelectedAttrs = getPath(option, "circleSelectedAttrs", {});
        /**
         * 文本的属性
         * @member {Object}
         * @private
         * */
        this.textAttrs = getPath(option, "textAttrs", {});
        /**
         * 文本选中的属性
         * @member {Object}
         * @private
         * */
        this.textSelectedAttrs = getPath(option, "textSelectedAttrs", {});
        /**
         * 文本的selection
         * @member {D3.Selection}
         * @private
         * */
        this.textSelection = null;
        /**
         * 圆圈的selection
         * @member {D3.Selection}
         * @private
         * */
        this.circleSelection = null;
    }

    initialize(graph) {
        super.initialize(graph);
        this.selection = d3.select(graph.ele).append("g");
        //add  circle
        this.circleSelection = this.selection.append("circle");
        //add text
        this.textSelection = this.selection.append("text");
        this.selection.on("click", this.select.bind(this));
    }

    render() {
        this.textSelection.text(this.text);
        let circleAttrs = this.combineAttrs(this.defaultCircleAttrs, this.circleAttrs, this.defaultCircleSelectedAttrs, this.circleSelectedAttrs);
        let textAttrs = this.combineAttrs(this.defaultTextAttrs, this.textAttrs, this.defaultTextSelectedAttrs, this.textSelectedAttrs);
        textAttrs.x = circleAttrs.cx;
        textAttrs.y = circleAttrs.cy;
        this.updateAttrs(this.textSelection, textAttrs);
        this.updateAttrs(this.circleSelection, circleAttrs);
    }

    getLinkPoint() {
        const circleAttrs = this.combineAttrs(this.defaultCircleAttrs, this.circleAttrs, this.defaultCircleSelectedAttrs, this.circleSelectedAttrs);
        return new Point(circleAttrs.cx, circleAttrs.cy);
    }
}

registerDrawing("TextCircleDrawing", TextCircleDrawing);
//#endregion

//#region Toolbar
export class Toolbar extends PureComponent {
    static propTypes = {
        children: PropTypes.any,
        onClick: PropTypes.func,
        style: PropTypes.object
    };


    get attrs() {
        return {
            width: 40,
            height: 40
        };
    }

    render() {
        return (
            <svg {...this.attrs}
                 onClick={this.props.onClick}
                 style={this.props.style}>
                {this.props.children}
            </svg>
        );
    }
}

export class DrawingToolbar extends PureComponent {
    static propTypes = {
        children: PropTypes.any,
        onClick: PropTypes.func,
        //绘制的类型:如LineDrawing
        type: PropTypes.string,
        style: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.listener = null;
        this.state = {
            selected: false
        };
    }

    render() {
        return (
            <Toolbar
                style={Object.assign({}, this.props.style, this.state.selected ? {backgroundColor: "#D6D6D6"} : {})}
                type={this.props.type}
                onClick={(...args) => {
                    emitter.emit(EVENT_TOOLBAR_CHANGE, this.props.type);
                    this.props.onClick && this.props.onClick(...args)
                }}>
                {this.props.children}
            </Toolbar>
        );
    }

    componentDidMount() {
        this.listener = emitter.addListener(EVENT_TOOLBAR_CHANGE, (type) => {
            this.setState({
                selected: type === this.props.type
            })
        })
    }

    componentWillUnmount() {
        if (this.listener) {
            this.listener.remove();
        }
    }
}

export class NoneToolbar extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func,
        style: PropTypes.object,
        graph: PropTypes.object.isRequired
    };

    get type() {
        return ""
    }

    render() {
        return (
            <DrawingToolbar style={this.props.style}
                            onClick={() => {
                                const {graph} = this.props;
                                const svg = d3.select(graph.ele);
                                svg.on("mousedown", null)
                                    .on("mousemove", null)
                                    .on("mouseup", null)
                            }}
                            type={this.type}>
                <text y={20} fontSize={12}>none</text>
            </DrawingToolbar>
        );
    }
}

export class LineToolbar extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func,
        style: PropTypes.object,
        graph: PropTypes.object.isRequired
    };

    get type() {
        return "LineDrawing"
    }

    render() {
        return (
            <DrawingToolbar style={this.props.style}
                            onClick={() => {
                                const {graph} = this.props;
                                const svg = d3.select(graph.ele);
                                svg.on("mousedown", () => {
                                    const point = graph.getPointFromScreen(d3.event.offsetX, d3.event.offsetY);
                                    const drawing = new LineDrawing({
                                        attrs: {
                                            x1: point.x,
                                            y1: point.y,
                                            x2: point.x,
                                            y2: point.y
                                        }
                                    });
                                    this._id = drawing.id;
                                    graph.doActions([
                                        new DrawAction(drawing)
                                    ])
                                })
                                    .on("mousemove", () => {
                                        if (this._id) {
                                            const point = graph.getPointFromScreen(d3.event.offsetX, d3.event.offsetY);
                                            graph.doActions([
                                                new ReDrawAction(this._id, {
                                                    attrs: {
                                                        x2: {$set: point.x},
                                                        y2: {$set: point.y}
                                                    }
                                                })
                                            ])
                                        }
                                    })
                                    .on("mouseup", () => {
                                        delete this._id;
                                    })
                            }}
                            type={this.type}>
                <line x1={10} y1={10} x2={30} y2={30} stroke={"#888888"}></line>
            </DrawingToolbar>
        );
    }
}

export class CircleToolbar extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func,
        style: PropTypes.object,
        graph: PropTypes.object.isRequired
    };

    get type() {
        return "CircleDrawing";
    }

    render() {
        return (
            <DrawingToolbar style={this.props.style}
                            onClick={() => {
                                const {graph} = this.props;
                                const svg = d3.select(this.props.graph.ele);
                                svg.on("mousedown", () => {
                                    const point = graph.getPointFromScreen(d3.event.offsetX, d3.event.offsetY);
                                    const drawing = new CircleDrawing({
                                        attrs: {
                                            cx: point.x,
                                            cy: point.y
                                        }
                                    })
                                    graph.doActions([
                                        new DrawAction(drawing)
                                    ])
                                })
                            }}
                            type={this.type}>
                <circle cx={20} cy={20} r={8} stroke={"#888888"} fill={"#888888"}></circle>
            </DrawingToolbar>
        );
    }
}

export class LinkToolbar extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func,
        style: PropTypes.object,
        graph: PropTypes.object.isRequired
    };

    get type() {
        return "LinkDrawing";
    }

    getShapeID(ele) {
        try {
            return ele.attributes['shape-id'].nodeValue;
        }
        catch (ex) {
            return null;
        }
    }

    render() {
        return (
            <DrawingToolbar style={this.props.style}
                            onClick={() => {
                                const {graph} = this.props;
                                const svg = d3.select(graph.ele);
                                svg.on("mousedown", () => {
                                    const event = d3.event;
                                    console.log(event.target)
                                    this._sourceID = this.getShapeID(event.target);
                                    console.log(`source id : ${this._sourceID}`)
                                }).on("mouseup", () => {
                                    const event = d3.event;
                                    const targetID = this.getShapeID(event.target);
                                    console.log(`target id : ${targetID}`)
                                    if (this._sourceID && targetID) {
                                        graph.doActions([
                                            new DrawAction(new LinkDrawing({
                                                sourceId: this._sourceID,
                                                targetId: targetID
                                            }))
                                        ])
                                    }
                                    delete this._sourceID;
                                })
                            }}
                            type={this.type}>
                <circle cx={10} cy={10} r={2} stroke={"#888888"} fill={"#888888"}></circle>
                <circle cx={30} cy={30} r={2} stroke={"#888888"} fill={"#888888"}></circle>
                <path d="M 10 10 S 20 10, 20 20 S 20 30, 30 30" stroke={"#888888"} fill={"transparent"}></path>
            </DrawingToolbar>
        );
    }
}

export class ArrowLinkToolbar extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func,
        style: PropTypes.object,
        graph: PropTypes.object.isRequired
    };

    get type() {
        return "ArrowLinkDrawing";
    }

    getShapeID(ele) {
        try {
            return ele.attributes['shape-id'].nodeValue;
        }
        catch (ex) {
            return null;
        }
    }

    render() {
        const arrowPoint = getArrowPoints({x: 20, y: 25}, {x: 30, y: 30}, 5);
        const arrowPath = arrowPoint.map((p, i) => {
            if (i === 0) {
                return `M ${p.x} ${p.y}`;
            }
            return `L ${p.x} ${p.y}`;
        });
        return (
            <DrawingToolbar style={this.props.style}
                            onClick={() => {
                                const {graph} = this.props;
                                const svg = d3.select(graph.ele);
                                svg.on("mousedown", () => {
                                    const event = d3.event;
                                    this._sourceID = this.getShapeID(event.target);
                                }).on("mouseup", () => {
                                    const event = d3.event;
                                    const targetID = this.getShapeID(event.target);
                                    if (this._sourceID && targetID) {
                                        graph.doActions([
                                            new DrawAction(new ArrowLinkDrawing({
                                                sourceId: this._sourceID,
                                                targetId: targetID
                                            }))
                                        ])
                                    }
                                    delete this._sourceID;
                                })
                            }}
                            type={this.type}>
                <path d="M 10 10 S 20 15, 20 20 S 20 25, 30 30" stroke={"#888888"} fill={"transparent"}></path>
                <path d={[...arrowPath, "Z"].join(" ")} stroke={"#888888"} fill={"#888888"}></path>
            </DrawingToolbar>
        );
    }
}

//#endregion

//#region D3Graph
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
     * @property {Function} renderToolbar - 绘图的工具栏
     * @property {Number} scale - 缩放比例,默认是1(1个单位对应一个像素)
     * */
    static propTypes = {
        attrs: PropTypes.object,
        //action
        actions: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.oneOf(Object.keys(actionTypeEnums)).isRequired,
            params: PropTypes.any
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
        selectMode: PropTypes.oneOf(Object.keys(selectModeEnums)),
        //自定义绘制类型
        // customDefinedDrawing: PropTypes.object,
        // onDrawTypeChange: PropTypes.func,
        original: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        }),
        coordinateType: PropTypes.oneOf(Object.keys(coordinateTypeEnum)),
        mode: PropTypes.oneOf(Object.keys(graphModeEnum)),
        playingOption: PropTypes.shape({
            interval: PropTypes.number
        }),
        renderToolbar: PropTypes.func,
        scale: PropTypes.number
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
        selectMode: selectModeEnums.single,
        actions: [],
        original: {
            x: 0,
            y: 0
        },
        coordinateType: coordinateTypeEnum.screen,
        mode: graphModeEnum.none,
        renderToolbar: () => null,
        scale: 1
    }

    get scale() {
        return this.props.scale;
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
        this.playingTimer = null;
    }

    /**
     * 根据id查找对应的图形
     * */
    findShapeById(id) {
        const index = this.shapes.findIndex(f => f.id === id);
        return this.shapes[index];
    }

    getSelectedShapes() {
        return this.selectedShapes
    }

    /**
     * 根据坐标系计算x值
     * */
    getX(value) {
        return this.props.original.x + parseFloat(value) * this.props.scale;
    }

    /**
     * 根据坐标系计算y值
     * */
    getY(value) {
        if (this.props.coordinateType === coordinateTypeEnum.screen) {
            return this.props.original.y + parseFloat(value) * this.props.scale;
        }
        return this.props.original.y - parseFloat(value) * this.props.scale;
    }

    /**
     * 将屏幕坐标转换成对应坐标系坐标
     * */
    getPointFromScreen(screenX, screenY) {
        if (this.props.coordinateType === coordinateTypeEnum.math) {
            return {
                x: (screenX - this.props.original.x) / this.props.scale,
                y: (this.props.original.y - screenY) / this.props.scale
            }
        }
        return {x: screenX / this.props.scale, y: screenY / this.props.scale};
    }

    doActions(actions) {

        //#region draw
        const drawActions = actions.filter(f => f.type === actionTypeEnums.draw);
        if (drawActions.length > 0) {
            console.log(`draw : ${drawActions.map(f => `${f.params.type}(id=${f.params.id})`).join(',')}`)
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

        //#region delete
        const deleteActions = actions.filter(f => f.type === actionTypeEnums.delete);
        if (deleteActions.length > 0) {
            const ids = deleteActions.map(f => f.params);
            console.log(`delete : ${ids.join(",")}`);
            //删除的图形
            const deletedShapes = this.shapes.filter(s => ids.indexOf(s.id) >= 0);
            //删除后的图形
            this.shapes = this.shapes.filter(s => ids.indexOf(s.id) <= 0);
            deletedShapes.forEach(s => {
                if (s.selection) {
                    //删除图形
                    s.selection.remove();
                    delete s.selection;
                }
            })
        }
        //#endregion

        //#region clear
        const clearActions = actions.filter(f => f.type === actionTypeEnums.clear);
        if (clearActions.length > 0) {
            this.doActions(this.shapes.map(f => new DeleteAction(f.id)));
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

    play(actions, playingOps) {
        let actionIndex = 0;
        const next = () => {
            if (actionIndex >= actions.length) {
                return;
            }
            const action = actions[actionIndex];
            this.doActions([action]);
            actionIndex++;
            this.playingTimer = setTimeout(next.bind(this), action.nextInterval ? action.nextInterval : getPath(playingOps, "interval", 1000));
        }
        next();
    }

    stop() {
        if (this.playingTimer) {
            clearTimeout(this.playingTimer);
        }
    }

    render() {
        return (
            <WorkSpace actions={this.props.renderToolbar(this)}>
                <svg ref={ref => this.ele = ref} {...this.props.attrs}>
                </svg>
            </WorkSpace>
        );
    }

    componentWillReceiveProps(nextProps) {
        this.stop();
        if (nextProps.mode === graphModeEnum.draw) {
            this.doActions(nextProps.actions);
        }
        if (nextProps.mode === graphModeEnum.playing) {
            this.play(nextProps.actions, nextProps.playingOption);
        }
    }

    componentDidMount() {
        if (this.props.mode === graphModeEnum.draw) {
            this.doActions(this.props.actions);
        }
        if (this.props.mode === graphModeEnum.playing) {
            this.play(this.props.actions);
        }
    }

    componentWillUnmount() {
        this.stop()
    }
}
//#endregion
