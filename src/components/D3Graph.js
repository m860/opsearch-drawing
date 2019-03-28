/**
 * @todo 实现用户的输入action,输入action是一个中断操作
 * 实现link,arrowLink的label
 * 实现图的drawing
 * @todo 实现transition
 * @todo 实现data action
 *
 * */

import React, {Component, PureComponent} from "react";
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import guid from 'guid'
import WorkSpace from './WorkSpace'
import {get as getPath, set as setPath} from 'object-path'
import update from 'immutability-helper'
import {EventEmitter} from 'fbemitter'
import UserInput from "./UserInput"
import type {InfectionPoint} from "./Types";

//#region event
const emitter = new EventEmitter();
//toolbar 按钮切换
const EVENT_TOOLBAR_CHANGE = "EVENT_TOOLBAR_CHANGE";
//图形的位置发生变化
const EVENT_DRAWING_POSITION_CHANGE = "EVENT_DRAWING_POSITION_CHANGE";
//PathLinkDrawing更新
const EVENT_PATH_LINK_DRAWING_RENDER = "EVENT_PATH_LINK_DRAWING_RENDER";
//#endregion

/**
 * @typedef
 */
type DrawingOptionType = {
    type: $Values<typeof ActionTypeEnums>,
    option: Object
};
/**
 * @typedef
 */
type ActionOptionType = {
    type: string,
    params: Array,
    ops: ?Object
};

interface IDrawing {
    defaultAttrs?: () => Object,
    selectedAttrs?: () => Object,
    render: () => void,
    initialize?: (graph: mixed) => void,
    remove?: () => void,
    toData?: () => Object,
    getLinkPoint?: () => Point,
    moveTo: (vec: Point) => void
}

//#region enums
/**
 * action枚举
 * @readonly
 * @enum {string}
 * */
export const ActionTypeEnums = {
    /**绘画*/
    draw: "draw",
    /**重绘/更新*/
    redraw: "redraw",
    /**选择*/
    select: "select",
    /**反选*/
    unselect: "unselect",
    /**删除*/
    delete: "delete",
    /**清除所有图形*/
    clear: "clear",
    /**移动*/
    move: "move",
    // undo: "undo",
    // /**绘画*/
    // data: "data",
    /**输入*/
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

function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
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
 * 计算link的链接点
 * @param source
 * @param target
 * @return {{p1: {x: *, y: *}, p2: {x: *, y: *}}}
 * @private
 */
function _calculateLinkPoint(source, target) {
    const q1 = source.getLinkPoint();
    const q2 = target.getLinkPoint();
    let p1 = {
        x: q1.x,
        y: q2.y
    };
    let p2 = {
        x: q2.x,
        y: q2.y
    };
    if (source.type === "CircleDrawing"
        || target.type === "TextCircleDrawing") {
        const r1 = source.r;
        p1.x = ((r1 * (q2.x - q1.x)) / Math.sqrt(Math.pow(q1.x - q2.x, 2) + Math.pow(q1.y - q2.y, 2))) + q1.x;
        p1.y = ((r1 * (q2.y - q1.y)) / Math.sqrt(Math.pow(q1.x - q2.x, 2) + Math.pow(q1.y - q2.y, 2))) + q1.y;
    }
    if (target.type === "CircleDrawing"
        || target.type === "TextCircleDrawing") {
        const r2 = target.r;
        p2.x = ((r2 * (q1.x - q2.x)) / Math.sqrt(Math.pow(q1.x - q2.x, 2) + Math.pow(q1.y - q2.y, 2))) + q2.x;
        p2.y = ((r2 * (q1.y - q2.y)) / Math.sqrt(Math.pow(q1.x - q2.x, 2) + Math.pow(q1.y - q2.y, 2))) + q2.y;
    }
    return {
        p1,
        p2
    }
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
        const args = action.params || [];
        const ops = action.ops;
        const func = actionIndex[type];
        if (!func) {
            throw new Error(`action ${type} is not defined`);
        }
        switch (type) {
            case ActionTypeEnums.draw:
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
         * @member {ActionTypeEnums}
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
        /**
         * 是否允许中断操作
         * @type {boolean}
         */
        this.canBreak = false;
    }

    toData() {
        return {
            type: this.type,
            params: this.params.toData ? [this.params.toData()] : this.params
        }
    }
}

/**
 * 用户输入action,中断操作
 */
export class InputAction extends Action {
    /**
     *
     * @param {Array} params
     * @param {String} params[].label
     * @param {String} params[].fieldName
     * @param {any} params[].defaultValue
     * @param {?Object} ops
     */
    constructor(params, ops) {
        super(ActionTypeEnums.input, params, ops);
        this.canBreak = true;
    }
}

actionIndex[ActionTypeEnums.input] = InputAction;

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
        super(ActionTypeEnums.draw, drawingOps, ops)
    }
}

actionIndex[ActionTypeEnums.draw] = DrawAction;

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
        super(ActionTypeEnums.select, shapeId, ops)
    }
}

actionIndex[ActionTypeEnums.select] = SelectAction;

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
        super(ActionTypeEnums.unselect, shapeId, ops)
    }
}

actionIndex[ActionTypeEnums.unselect] = UnSelectAction;

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
        super(ActionTypeEnums.delete, shapeId, ops);
    }
}

actionIndex[ActionTypeEnums.delete] = DeleteAction;

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
        super(ActionTypeEnums.clear, null, ops);
    }
}

actionIndex[ActionTypeEnums.clear] = ClearAction;


/**
 * 重绘action
 * */
export class ReDrawAction extends Action {
    constructor(shapeId, state, ops) {
        super(ActionTypeEnums.redraw, {
            id: shapeId,
            state: state
        }, ops)
    }
}

actionIndex[ActionTypeEnums.redraw] = ReDrawAction;

/**
 * 移动action
 */
export class MoveAction extends Action {
    /**
     * @constructor
     * @param {string} shapeId - 需要移动的图形的id
     * @param {object} vec - 位移
     */
    constructor(shapeId, vec) {
        super(ActionTypeEnums.move, {
            id: shapeId,
            vec: vec
        })
    }
}

actionIndex[ActionTypeEnums.move] = MoveAction;

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
        const attrs = this.combineAttrs(this.defaultAttrs, this.attrs, this.selectedAttrs, null);
        this.updateAttrs(this.selection, attrs);
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
            this.graph.doActionsAsync([
                new SelectAction(this.id)
            ])
        }
    }

    /**
     * 删除图形
     */
    remove() {
        if (this.selection) {
            this.selection.remove();
        }
        this.selection = null;
    }

    combineAttrs(defaultAttrs = {}, attrs = {}, defaultSelectedAttrs, selectedAttrs) {
        let result = Object.assign({},
            defaultAttrs,
            attrs);
        if (this.selected) {
            result = Object.assign({}, result, defaultSelectedAttrs, selectedAttrs);
        }
        if (!isNullOrUndefined(result.x)) {
            result.x = this.graph.toScreenX(result.x);
        }
        if (!isNullOrUndefined(result.y)) {
            result.y = this.graph.toScreenY(result.y);
        }
        if (!isNullOrUndefined(result.x1)) {
            result.x1 = this.graph.toScreenX(result.x1);
        }
        if (!isNullOrUndefined(result.x2)) {
            result.x2 = this.graph.toScreenX(result.x2);
        }
        if (!isNullOrUndefined(result.y1)) {
            result.y1 = this.graph.toScreenY(result.y1);
        }
        if (!isNullOrUndefined(result.y2)) {
            result.y2 = this.graph.toScreenY(result.y2);
        }
        if (!isNullOrUndefined(result.cx)) {
            result.cx = this.graph.toScreenX(result.cx);
        }
        if (!isNullOrUndefined(result.cy)) {
            result.cy = this.graph.toScreenY(result.cy);
        }
        result["shape-id"] = this.id;
        return result;
    }

    /**
     * 将图形数据序列化
     * @return {{type: String, id: String, attrs: Object, text: (String|Function)}}
     */
    toData() {
        return {
            type: this.type,
            option: {
                id: this.id,
                attrs: copy(this.attrs),
                text: this.text
            }
        }
    }

    /**
     * 移动图形到目标位置
     * @param position
     */
    moveTo(vec) {
        //throw new Error("not implementation");
    }
}

/**
 * 绘画线
 * */
export class LineDrawing extends Drawing {
    /**
     * 线的默认attribute
     * @static
     * @type {Object}
     */
    static defaultAttrs = {
        fill: "transparent",
        stroke: "black",
        "stroke-width": "3px"
    };
    /**
     * 线选中的attribute
     * @static
     * @type {Object}
     */
    static selectedAttrs = {
        stroke: "red"
    };

    constructor(option) {
        super(option);
        this.type = "LineDrawing";
    }

    get defaultAttrs() {
        return LineDrawing.defaultAttrs;
    }

    get selectedAttrs() {
        return LineDrawing.selectedAttrs;
    }

    initialize(graph) {
        super.initialize(graph);
        this.selection = d3.select(graph.ele).append("line");
        this.selection.on("mouseover", (a, b, eles) => {
            if (eles.length > 0) {
                const e = d3.select(eles[0]);
                const width = parseFloat(e.attr("stroke-width"));
                if (width < 8) {
                    this._originalWidth = width;
                    e.attr("stroke-width", 8)
                }
            }
        }).on("mouseout", (a, b, eles) => {
            if (eles.length > 0) {
                if (this._originalWidth) {
                    const e = d3.select(eles[0]);
                    e.attr("stroke-width", this._originalWidth);
                    delete this._originalWidth;
                }
            }
        })
    }

    moveTo(vec) {
        if (this.selection) {
            this.attrs.x1 += vec.x;
            this.attrs.x2 += vec.x;
            this.attrs.y1 += vec.y;
            this.attrs.y2 += vec.y;
            this.selection
                .attr("x1", this.graph.toScreenX(this.attrs.x1))
                .attr("y1", this.graph.toScreenY(this.attrs.y1))
                .attr("x2", this.graph.toScreenX(this.attrs.x2))
                .attr("y2", this.graph.toScreenY(this.attrs.y2));
            emitter.emit(EVENT_DRAWING_POSITION_CHANGE, this);
        }
    }
}

registerDrawing("LineDrawing", LineDrawing);

/**
 * 绘画圈
 * */
export class CircleDrawing extends Drawing {
    /**
     * 圈的默认attribute
     * @static
     * @type {Object}
     */
    static defaultAttrs = {
        fill: "transparent",
        stroke: "black",
        r: "10px",
        "stroke-width": "1px"
    };
    /**
     * 圈选中的attribute
     * @static
     * @type {Object}
     */
    static selectedAttrs = {
        stroke: "red"
    };

    constructor(option) {
        super(option);
        this.type = "CircleDrawing";
    }

    get defaultAttrs() {
        return CircleDrawing.defaultAttrs;
    }

    get selectedAttrs() {
        return CircleDrawing.selectedAttrs;
    }

    get r() {
        return parseFloat(this.selection.attr("r"));
    }

    initialize(graph) {
        super.initialize(graph);
        this.selection = d3.select(graph.ele).append("circle");
    }

    getLinkPoint() {
        const x = parseFloat(this.attrs.cx);
        const y = parseFloat(this.attrs.cy);
        return new Point(x, y);
    }

    moveTo(vec) {
        if (this.selection) {
            this.attrs.cx += vec.x;
            this.attrs.cy += vec.y;
            this.selection
                .attr("cx", this.graph.toScreenX(this.attrs.cx))
                .attr("cy", this.graph.toScreenY(this.attrs.cy));
            emitter.emit(EVENT_DRAWING_POSITION_CHANGE, this);
        }
    }
}

registerDrawing("CircleDrawing", CircleDrawing);

/**
 * 绘制点
 * */
export class DotDrawing extends Drawing {
    /**
     * 点默认的attribute
     * @static
     * @type {Object}
     */
    static defaultAttrs = {
        fill: "black",
        stroke: "black",
        r: "5px"
    };
    /**
     * 点选中的attribute
     * @static
     * @type {Object}
     */
    static selectedAttrs = {
        stroke: "red"
    };

    constructor(option) {
        super(option);
        this.type = "DotDrawing";
    }

    get defaultAttrs() {
        return DotDrawing.defaultAttrs;
    }

    get selectedAttrs() {
        return DotDrawing.selectedAttrs;
    }

    initialize(graph) {
        super.initialize(graph);
        this.selection = d3.select(graph.ele).append("circle");
    }

    moveTo(vec) {
        if (this.selection) {
            this.attrs.cx += vec.x;
            this.attrs.cy += vec.y;
            this.selection
                .attr("cx", this.graph.toScreenX(this.attrs.cx))
                .attr("cy", this.graph.toScreenY(this.attrs.cy));
            emitter.emit(EVENT_DRAWING_POSITION_CHANGE, this);
        }
    }
}

registerDrawing("DotDrawing", DotDrawing);

/**
 * 绘画矩形
 * */
export class RectDrawing extends Drawing {
    /**
     * 矩形默认的attribute
     * @static
     * @type {Object}
     */
    static defaultAttrs = {};
    /**
     * 矩形选中的attribute
     * @static
     * @type {Object}
     */
    static selectedAttrs = {};

    constructor(option) {
        super(option);
        this.type = "RectDrawing"
    }

    get defaultAttrs() {
        return RectDrawing.defaultAttrs;
    }

    get selectedAttrs() {
        return RectDrawing.selectedAttrs;
    }

    initialize(graph) {
        super.initialize(graph);
        this.selection = d3.select(graph.ele).append("path");
    }
}

registerDrawing("RectDrawing", RectDrawing);

/**
 * 绘制刻度
 * */
export class NumberScaleDrawing extends Drawing {
    /**
     * @constructor
     * @param {object} [option]
     * @param {?{x:number,y:number}} [option.original={x:20,y:280}] - 刻度尺的原点位置,此原点的位置必须和D3Graph的original的原点位置保持一致
     * @param {?number} [option.xAxisLength=360] - x轴的长度
     * @param {?number} [option.yAxisLength=260] - y轴的长度
     * @param {?number} [option.scale=20] - 刻度尺中每个刻度对应多少个像素
     */
    constructor(option) {
        super(option);
        this.type = "NumberScaleDrawing";
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
        let preTextPositionWithX = 0;
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
            const dis = p1.x - preTextPositionWithX;
            if (dis >= 20) {
                preTextPositionWithX = p1.x;
                this.selection.append("text")
                    .text(i)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("x", p1.x)
                    .attr("y", p1.y + 10)
                    .attr("style", "font-size:10px");
            }
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
        let preTextPositionWithY = this.original.y;
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
            const dis = preTextPositionWithY - p1.y;
            if (dis >= 20) {
                preTextPositionWithY = p1.y;
                this.selection.append("text")
                    .text(i)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("x", p1.x - 15)
                    .attr("y", p1.y)
                    .attr("style", "font-size:10px");
            }
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
     * 带箭头link的默认attribute
     * @static
     * @type {Object}
     */
    static defaultAttrs = {
        fill: "black",
        stroke: "black"
    };
    /**
     * 带箭头link的选中attribute
     * @static
     * @type {Object}
     */
    static selectedAttrs = {
        stroke: "red"
    };

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
        this.type = "ArrowLinkDrawing";
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
        this.listeners = [];
        this.distance = getPath(option, "distance", 5);
    }

    get defaultAttrs() {
        return ArrowLinkDrawing.defaultAttrs;
    }

    get selectedAttrs() {
        return ArrowLinkDrawing.selectedAttrs;
    }

    initialize(graph) {
        super.initialize(graph);
        this.source = this.graph.findShapeById(this.sourceId);
        this.target = this.graph.findShapeById(this.targetId);
        this.selection = d3.select(graph.ele).append("path");
        this.selection.on("mouseover", (a, b, eles) => {
            if (eles.length > 0) {
                const e = d3.select(eles[0]);
                const width = parseFloat(e.attr("stroke-width"));

                if (width < 8 || isNaN(width)) {
                    this._originalWidth = width;
                    e.attr("stroke-width", 8)
                }
            }
        }).on("mouseout", (a, b, eles) => {
            if (eles.length > 0) {
                const e = d3.select(eles[0]);
                if (this._originalWidth) {
                    e.attr("stroke-width", this._originalWidth);
                }
                else if (isNaN(this._originalWidth)) {
                    e.attr("stroke-width", null);
                }
                delete this._originalWidth;
            }
        });
        this.labelSelection = d3.select(graph.ele).append("text");
        this.listeners.push(
            emitter.addListener(EVENT_DRAWING_POSITION_CHANGE, shape => {
                if (shape.id === this.sourceId || shape.id === this.targetId) {
                    this.render();
                }
            })
        )
    }

    remove() {
        super.remove();
        if (this.labelSelection) {
            this.labelSelection.remove();
        }
        this.listeners.forEach(listener => listener.remove());
        this.labelSelection = null;
        emitter.emit(`remove:${this.id}`);
    }

    renderLabel(x, y) {
        if (this.labelSelection) {
            if (this.label) {
                this.labelSelection.text(this.label);
            }
            const attrs = Object.assign({
                x: this.graph.toScreenX(x),
                y: this.graph.toScreenY(y)
            }, this.labelAttrs);
            this.updateAttrs(this.labelSelection, attrs);
        }
    }

    render() {
        //计算link的位置信息
        const {p1, p2} = _calculateLinkPoint(this.source, this.target);
        this.attrs = update(this.attrs, {
            d: {$set: this.getArrowLinkPath(p1, p2, this.distance / this.graph.scale).join(' ')}
        });
        super.render();
        const hx = Math.abs(p1.x - p2.x) / 2;
        const hy = Math.abs(p1.y - p2.y) / 2;
        const labelX = Math.min(p1.x, p2.x) + hx;
        const labelY = Math.min(p1.y, p2.y) + hy;
        this.renderLabel(labelX, labelY);
        emitter.emit(`render:${this.id}`);
    }

    /**
     * 获取箭头链接的路径
     * @param startPoint - 开始点
     * @param endPoint - 结束点
     * @param distance - 箭头的长度,长度越短箭头越小
     * @returns {string[]}
     */
    getArrowLinkPath(startPoint, endPoint, distance = 10) {
        const diffX = startPoint.x - endPoint.x;
        const diffY = startPoint.y - endPoint.y;
        const a = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
        const ex = diffX / a;
        const ey = diffY / a;

        const q2x = endPoint.x + ex * distance;
        const q2y = endPoint.y + ey * distance;

        const fx = Math.cos(Math.PI / 2) * ex + Math.sin(Math.PI / 2) * ey;
        const fy = -Math.sin(Math.PI / 2) * ex + Math.cos(Math.PI / 2) * ey;
        const q1x = q2x + fx * distance * 0.5;
        const q1y = q2y + fy * distance * 0.5;

        const gx = Math.cos(-Math.PI / 2) * ex + Math.sin(-Math.PI / 2) * ey;
        const gy = -Math.sin(-Math.PI / 2) * ex + Math.cos(-Math.PI / 2) * ey;
        const q3x = q2x + gx * distance * 0.5;
        const q3y = q2y + gy * distance * 0.5;

        return [
            `M ${this.graph.toScreenX(startPoint.x)} ${this.graph.toScreenY(startPoint.y)}`,
            `L ${this.graph.toScreenX(q2x)} ${this.graph.toScreenY(q2y)}`,
            `L ${this.graph.toScreenX(q1x)} ${this.graph.toScreenY(q1y)}`,
            `L ${this.graph.toScreenX(endPoint.x)} ${this.graph.toScreenY(endPoint.y)}`,
            `L ${this.graph.toScreenX(q3x)} ${this.graph.toScreenY(q3y)}`,
            `L ${this.graph.toScreenX(q2x)} ${this.graph.toScreenY(q2y)}`,
            `L ${this.graph.toScreenX(startPoint.x)} ${this.graph.toScreenY(startPoint.y)}`,
            'Z'
        ];
    }

    toData() {
        return {
            type: this.type,
            option: {
                id: this.id,
                sourceId: this.sourceId,
                targetId: this.targetId,
                label: this.label,
                labelAttrs: this.labelAttrs,
                distance: this.distance
            }
        }
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
     * link的默认attribute
     * @static
     * @type {Object}
     */
    static defaultAttrs = {
        fill: "none",
        "stroke-width": "2px",
        stroke: "black"
    };
    /**
     * link的选中attribute
     * @static
     * @type {Object}
     */
    static selectedAttrs = {
        stroke: "red"
    };

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
        this.type = "LinkDrawing";
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
        this.listeners = [];
    }

    get defaultAttrs() {
        return LinkDrawing.defaultAttrs;
    }

    get selectedAttrs() {
        return LinkDrawing.selectedAttrs;
    }

    initialize(graph) {
        super.initialize(graph);
        this.source = this.graph.findShapeById(this.sourceId);
        this.target = this.graph.findShapeById(this.targetId);
        this.selection = d3.select(graph.ele).append("line");
        this.selection.on("mouseover", (a, b, eles) => {
            if (eles.length > 0) {
                const e = d3.select(eles[0]);
                const width = parseFloat(e.attr("stroke-width"));
                if (width < 8) {
                    this._originalWidth = width;
                    e.attr("stroke-width", 8)
                }
            }
        }).on("mouseout", (a, b, eles) => {
            if (eles.length > 0) {
                if (this._originalWidth) {
                    const e = d3.select(eles[0]);
                    e.attr("stroke-width", this._originalWidth);
                    delete this._originalWidth;
                }
            }
        });
        this.labelSelection = d3.select(graph.ele).append("text");
        this.listeners.push(
            emitter.addListener(EVENT_DRAWING_POSITION_CHANGE, shape => {
                if (shape.id === this.sourceId || shape.id === this.targetId) {
                    this.render();
                }
            })
        )
    }

    remove() {
        super.remove();
        if (this.labelSelection) {
            this.labelSelection.remove();
        }
        this.labelSelection = null;
        this.listeners.forEach(listener => listener.remove());
        emitter.emit(`remove:${this.id}`);
    }

    renderLabel(x, y) {
        if (this.labelSelection) {
            if (this.label) {
                this.labelSelection.text(this.label);
            }
            const attrs = Object.assign({
                x: this.graph.toScreenX(x),
                y: this.graph.toScreenY(y)
            }, this.labelAttrs);
            this.updateAttrs(this.labelSelection, attrs);
        }
    }

    render() {
        //计算link的位置信息
        // const p1 = this.source.getLinkPoint();
        // const p2 = this.target.getLinkPoint();
        const {p1, p2} = _calculateLinkPoint(this.source, this.target);
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
        emitter.emit(`render:${this.id}`);
    }

    toData() {
        return {
            type: this.type,
            option: {
                id: this.id,
                sourceId: this.sourceId,
                targetId: this.targetId,
                label: this.label
            }
        }
    }
}

registerDrawing("LinkDrawing", LinkDrawing);

/**
 * @TODO 重新计算连接线的起始点位置
 */
export class PathLinkDrawing extends Drawing {
    infectionPoints: Array<InfectionPoint> = [];

    constructor(option) {
        super(option);
        this.attrs = Object.assign({
            fill: "transparent",
            stroke: "black"
        }, this.attrs);
        this.type = "PathLinkDrawing";
        if (!option.sourceId) {
            throw new Error("option.sourceId is required");
        }
        if (!option.targetId) {
            throw new Error(`option.targetId is required`);
        }
        this.sourceId = option.sourceId;
        this.targetId = option.targetId;
        this.source = null;
        this.target = null;
        this.listeners = [];
        if (option.points) {
            this.infectionPoints = option.points.map(item => {
                return {
                    ele: null,
                    x: item.x,
                    y: item.y
                };
            })
        }
    }


    initialize(...args) {
        super.initialize(...args);
        this.infectionPoints.forEach((item: InfectionPoint) => {
            item.ele = d3.select(this.graph.ele).append("circle");
            item.ele.attr("fill", "black")
                .attr("stroke", "black")
                .attr("r", 5)
                .attr("shape-type", "infection-point")
                .attr("drawing-id", this.id)
                .attr("cx", this.graph.toScreenX(item.x))
                .on("mouseover", function () {
                    d3.select(this).attr("cursor", "move")
                })
                .on("mouseout", function () {
                    d3.select(this).attr("cursor", "default")
                })
                .attr("cy", this.graph.toScreenY(item.y));
        })
        this.source = this.graph.findShapeById(this.sourceId);
        this.target = this.graph.findShapeById(this.targetId);
        this.selection = d3.select(this.graph.ele).append("path");
        this.listeners.push(
            emitter.addListener(EVENT_DRAWING_POSITION_CHANGE, shape => {
                if (shape.id === this.sourceId || shape.id === this.targetId) {
                    this.render();
                }
            })
        );
        this.listeners.push(
            emitter.addListener(EVENT_PATH_LINK_DRAWING_RENDER, (id) => {
                if (id === this.id) {
                    this.render();
                }
            })
        )
    }

    remove() {
        super.remove();
        this.infectionPoints.forEach(item => {
            item.ele.on("mousemove", null)
                .on("mouseout", null);
            item.ele.remove();
        });
        this.listeners.forEach(listener => listener.remove());
        emitter.emit(`remove:${this.id}`);
    }

    getPath(points) {
        let arr = [];
        points.forEach((point, index) => {
            if (index === 0) {
                arr.push(`M ${this.graph.toScreenX(point.x)} ${this.graph.toScreenY(point.y)}`);
            }
            else {
                arr.push(`L ${this.graph.toScreenX(point.x)} ${this.graph.toScreenY(point.y)}`);
            }
        });
        return arr.join(" ");
    }

    getInfectionPoints() {
        return this.infectionPoints.map(item => {
            if (item.ele) {
                const x = parseFloat(item.ele.attr("cx"));
                const y = parseFloat(item.ele.attr("cy"));
                return {x, y};
            }
            return {x: item.x, y: item.y}
        });
    }

    render() {
        //计算link的位置信息
        // const p1 = this.source.getLinkPoint();
        // const p2 = this.target.getLinkPoint();
        console.log('render')
        const {p1, p2} = _calculateLinkPoint(this.source, this.target);
        let points = [p1, ...this.getInfectionPoints(), p2];
        this.attrs = update(this.attrs, {
            d: {$set: this.getPath(points)}
        });
        super.render();
        emitter.emit(`render:${this.id}`);
        // const hx = Math.abs(p1.x - p2.x) / 2;
        // const hy = Math.abs(p1.y - p2.y) / 2;
        // const labelX = Math.min(p1.x, p2.x) + hx;
        // const labelY = Math.min(p1.y, p2.y) + hy;
        // this.renderLabel(labelX, labelY);
        // emitter.emit(`render:${this.id}`);
    }

    toData() {
        return {
            type: this.type,
            option: {
                id: this.id,
                sourceId: this.sourceId,
                targetId: this.targetId,
                points: this.getInfectionPoints()
            }
        }
    }
}

registerDrawing("PathLinkDrawing", PathLinkDrawing);

/**
 * 绘画Path
 * */
export class PathDrawing extends Drawing {
    /**
     * path默认的attribute
     * @static
     * @type {Object}
     */
    static defaultAttrs = {};
    /**
     * path选中的attribute
     * @static
     * @type {Object}
     */
    static selectedAttrs = {};

    constructor(option) {
        super(option);
        this.type = "PathDrawing";
        this.d = getPath(option, "d", []);
    }

    get defaultAttrs() {
        return PathDrawing.defaultAttrs;
    }

    get selectedAttrs() {
        return PathDrawing.selectedAttrs;
    }

    initialize(graph) {
        super.initialize(graph);
        this.selection = d3.select(graph.ele).append("path");
    }

    render() {
        if (!this.attrs.d) {
            let d = this.d.map((point, index) => {
                if (index === 0) {
                    return `M ${this.graph.toScreenX(point.x)} ${this.graph.toScreenY(point.y)}`
                }
                return `L ${this.graph.toScreenX(point.x)} ${this.graph.toScreenY(point.y)}`;
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
export class TextDrawing extends Drawing implements IDrawing {
    /**
     * 文本默认的attribute
     * @static
     * @type {Object}
     */
    static defaultAttrs = {
        fill: "black",
        "font-size": "20px"
    };
    /**
     * 文本选中的attribute
     * @static
     * @type {Object}
     */
    static selectedAttrs = {
        fill: "red"
    };

    constructor(option) {
        super(option);
        this.type = "TextDrawing";
    }

    get defaultAttrs() {
        return TextDrawing.defaultAttrs;
    }

    get selectedAttrs() {
        return TextDrawing.selectedAttrs;
    }

    initialize(graph) {
        super.initialize(graph);
        this.selection = d3.select(graph.ele).append("text");
    }

    moveTo(vec: Point) {
        if (this.selection) {
            this.attrs.x += vec.x;
            this.attrs.y += vec.y;
            this.selection.attr("x", this.graph.toScreenX(this.attrs.x))
                .attr("y", this.graph.toScreenY(this.attrs.y));
            emitter.emit(EVENT_DRAWING_POSITION_CHANGE, this);
        }
    }
}

registerDrawing("TextDrawing", TextDrawing)

/**
 * 绘制带文本的圆圈
 */
export class TextCircleDrawing extends Drawing {
    /**
     * 圈的默认attribute
     * @static
     * @type {Object}
     */
    static defaultCircleAttrs = {
        r: 20,
        fill: "transparent",
        stroke: "black"
    };
    /**
     * 圈的选中attribute
     * @static
     * @type {Object}
     */
    static circleSelectedAttrs = {
        fill: "transparent",
        stroke: "red"
    };
    /**
     * 文本的默认attribute
     * @static
     * @type {Object}
     */
    static defaultTextAttrs = {
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        fill: "black"
    };
    /**
     * 文本选中的attribute
     * @static
     * @type {Object}
     */
    static textSelectedAttrs = {
        fill: "red"
    };

    get defaultCircleAttrs() {
        return TextCircleDrawing.defaultCircleAttrs;
    }

    get defaultCircleSelectedAttrs() {
        return TextCircleDrawing.circleSelectedAttrs;
    }

    get defaultTextAttrs() {
        return TextCircleDrawing.defaultTextAttrs;
    }

    get defaultTextSelectedAttrs() {
        return TextCircleDrawing.textSelectedAttrs;
    }

    get r() {
        return parseFloat(this.circleSelection.attr("r"));
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
        this.type = "TextCircleDrawing";
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
        const x = parseFloat(this.circleAttrs.cx);
        const y = parseFloat(this.circleAttrs.cy);
        return new Point(x, y);
    }

    toData() {
        return {
            type: this.type,
            option: {
                id: this.id,
                text: this.text,
                circleAttrs: copy(this.circleAttrs),
                textAttrs: copy(this.textAttrs),
            }
        }
    }

    moveTo(vec) {
        if (this.selection) {
            this.circleAttrs.cx += vec.x;
            this.circleAttrs.cy += vec.y;
            this.circleSelection.attr("cx", this.graph.toScreenX(this.circleAttrs.cx))
                .attr("cy", this.graph.toScreenY(this.circleAttrs.cy));
            this.textSelection.attr("x", this.graph.toScreenX(this.circleAttrs.cx))
                .attr("y", this.graph.toScreenY(this.circleAttrs.cy));
            emitter.emit(EVENT_DRAWING_POSITION_CHANGE, this);
        }
    }
}

registerDrawing("TextCircleDrawing", TextCircleDrawing);

export class LinkTextDrawing extends Drawing implements IDrawing {
    constructor(option) {
        super(option);
        this.type = "LinkTextDrawing";
        this.linkID = getPath(option, "linkID", null);
        if (!this.linkID) {
            throw new Error(`linkID is required`);
        }
        // this.source = null;
        // this.target = null;
        this.listeners = [];
    }

    initialize(graph) {
        super.initialize(graph);
        this.selection = d3.select(graph.ele).append("text");
        // const link = graph.findShapeById(this.linkID);
        // if (link) {
        //     this.source = link.source;
        //     this.target = link.target;
        // }
        //监听link的rerender
        this.listeners.push(
            emitter.addListener(`remove:${this.linkID}`, () => {
                this.remove()
            })
        );
        this.listeners.push(
            emitter.addListener(`render:${this.linkID}`, () => {
                this.render();
            })
        )
    }

    // moveTo(vec: Point) {
    //     if (this.selection) {
    //         this.attrs.x += vec.x;
    //         this.attrs.y += vec.y;
    //         this.selection.attr("x", this.graph.toScreenX(this.attrs.x))
    //             .attr("y", this.graph.toScreenY(this.attrs.y));
    //         emitter.emit(EVENT_DRAWING_POSITION_CHANGE, this);
    //     }
    // }

    render() {
        const link = this.graph.findShapeById(this.linkID);
        if (link) {
            const {p1, p2} = _calculateLinkPoint(link.source, link.target);
            const hx = Math.abs(p1.x - p2.x) / 2;
            const hy = Math.abs(p1.y - p2.y) / 2;
            const labelX = Math.min(p1.x, p2.x) + hx;
            const labelY = Math.min(p1.y, p2.y) + hy;
            this.attrs.x = this.graph.toScreenX(labelX);
            this.attrs.y = this.graph.toScreenY(labelY);
            console.log(`render <LinkTextDrawing/> x:${this.attrs.x},y:${this.attrs.y}`)
        }
        super.render();
    }

    remove() {
        super.remove();
        this.listeners.forEach(listener => listener.remove());
    }
}

registerDrawing("LinkTextDrawing", LinkTextDrawing);


//#endregion

//#region Toolbar
export class Toolbar extends PureComponent {
    static propTypes = {
        children: PropTypes.any,
        onClick: PropTypes.func,
        style: PropTypes.object,
        attrs: PropTypes.object
    };

    static defaultProps = {
        attrs: {
            width: 40,
            height: 40
        }
    };

    render() {
        return (
            <svg {...this.props.attrs}
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
        style: PropTypes.object,
        attrs: PropTypes.object
    };

    static getShapeID = (event) => {
        const ele = event.target;
        if (ele.attributes) {
            const node = ele.attributes["shape-id"];
            if (node) {
                return node.nodeValue;
            }
        }
        return null
    }

    static findShape = (graph, ele) => {
        if (ele.attributes) {
            const shapeId = ele.attributes["shape-id"] ? ele.attributes["shape-id"].value : null;
            if (shapeId) {
                return graph.findShapeById(shapeId);
            }
        }
        return null;
    }

    /**
     * Toolbar的handler
     * @type {{setNoneHandler: DrawingToolbar.handlers.setNoneHandler, setLineDrawHandler: DrawingToolbar.handlers.setLineDrawHandler, setCircleDrawHandler: DrawingToolbar.handlers.setCircleDrawHandler, setLinkDrawHandler: DrawingToolbar.handlers.setLinkDrawHandler, setArrowLinkDrawHandler: DrawingToolbar.handlers.setArrowLinkDrawHandler, setTextCircleDrawHandler: DrawingToolbar.handlers.setTextCircleDrawHandler, setMoveHandler: DrawingToolbar.handlers.setMoveHandler}}
     */
    static handlers = {
        /**
         * 移除到画布的所有操作
         * @param graph
         */
        setNoneHandler: function (graph) {
            graph.removeAllSvgEvent();
            const svg = d3.select(graph.ele);
            svg.on("click", () => {
                const target = d3.event.target;
                if (target) {
                    if (target.attributes) {
                        const shapeId = target.attributes["shape-id"] ? target.attributes["shape-id"].value : null;
                        if (shapeId) {
                            const shape = graph.findShapeById(shapeId);
                            if (shape) {
                                shape.select();
                            }
                        }
                    }
                }
            })
        },
        /**
         * 画线
         * @param graph
         */
        setLineDrawHandler: function (graph) {
            graph.removeAllSvgEvent();
            const svg = d3.select(graph.ele);
            svg.on("mousedown", () => {
                const point = {
                    x: graph.toLocalX(d3.event.offsetX),
                    y: graph.toLocalY(d3.event.offsetY)
                };
                const drawing = new LineDrawing({
                    attrs: {
                        x1: point.x,
                        y1: point.y,
                        x2: point.x,
                        y2: point.y
                    }
                });
                this._id = drawing.id;
                graph.doActionsAsync([
                    new DrawAction(drawing)
                ])
            })
                .on("mousemove", () => {
                    if (this._id) {
                        const point = {
                            x: graph.toLocalX(d3.event.offsetX),
                            y: graph.toLocalY(d3.event.offsetY)
                        };
                        graph.doActionsAsync([
                            new ReDrawAction(this._id, {
                                attrs: {
                                    x2: point.x,
                                    y2: point.y
                                }
                            })
                        ])
                    }
                })
                .on("mouseup", () => {
                    delete this._id;
                })
        },
        /**
         * 画圈
         * @param graph
         */
        setCircleDrawHandler: function (graph) {
            graph.removeAllSvgEvent();
            const svg = d3.select(graph.ele);
            svg.on("mousedown", async () => {
                const point = {
                    x: graph.toLocalX(d3.event.offsetX),
                    y: graph.toLocalY(d3.event.offsetY)
                };
                const drawing = new CircleDrawing({
                    attrs: {
                        cx: point.x,
                        cy: point.y
                    }
                })
                await graph.doActionsAsync([
                    new DrawAction(drawing)
                ])
            })
        },
        /**
         * 画link
         * @param graph
         */
        setLinkDrawHandler: function (graph) {
            graph.removeAllSvgEvent();
            const svg = d3.select(graph.ele);
            svg.on("mousedown", () => {
                const event = d3.event;
                this._sourceID = DrawingToolbar.getShapeID(event);
            }).on("mouseup", () => {
                const event = d3.event;
                const targetID = DrawingToolbar.getShapeID(event);
                if (this._sourceID && targetID) {
                    graph.doActionsAsync([
                        new DrawAction(new LinkDrawing({
                            sourceId: this._sourceID,
                            targetId: targetID
                        }))
                    ])
                }
                delete this._sourceID;
            })
        },
        /**
         * 画带箭头的link
         * @param graph
         */
        setArrowLinkDrawHandler: function (graph) {
            graph.removeAllSvgEvent();
            const svg = d3.select(graph.ele);
            svg.on("mousedown", () => {
                const event = d3.event;
                this._sourceID = DrawingToolbar.getShapeID(event);
            }).on("mouseup", () => {
                const event = d3.event;
                const targetID = DrawingToolbar.getShapeID(event);
                if (this._sourceID && targetID) {
                    graph.doActionsAsync([
                        new DrawAction(new ArrowLinkDrawing({
                            sourceId: this._sourceID,
                            targetId: targetID
                        }))
                    ])
                }
                delete this._sourceID;
            })
        },
        /**
         * 画带圈的文本
         * @param graph
         */
        setTextCircleDrawHandler: function (graph) {
            graph.removeAllSvgEvent();
            const svg = d3.select(graph.ele);
            svg.on("mousedown", async () => {
                const point = {
                    x: graph.toLocalX(d3.event.offsetX),
                    y: graph.toLocalY(d3.event.offsetY)
                };
                const drawing = new TextCircleDrawing({
                    circleAttrs: {
                        cx: point.x,
                        cy: point.y
                    },
                    text: "A"
                })
                await graph.doActionsAsync([
                    new DrawAction(drawing)
                ])
            })
        },
        /**
         * 移动
         * @param graph
         */
        setMoveHandler: function (graph) {
            graph.removeAllSvgEvent();
            const svg = d3.select(graph.ele);
            svg.on("mousedown", () => {
                const target = d3.event.target;
                if (target) {
                    this._target = d3.select(target);
                    const shape = DrawingToolbar.findShape(graph, target);
                    const shapeType = this._target.attr("shape-type");
                    if (shape) {
                        this._mouseDownPoint = {
                            x: graph.toLocalX(d3.event.offsetX),
                            y: graph.toLocalY(d3.event.offsetY)
                        };
                        this._shape = shape;
                    }
                    else if (shapeType === "infection-point") {
                        this._mouseDownPoint = {
                            x: graph.toLocalX(d3.event.offsetX),
                            y: graph.toLocalY(d3.event.offsetY)
                        };
                    }
                }

            })
                .on("mousemove", () => {
                    if (this._mouseDownPoint) {
                        const point = {
                            x: graph.toLocalX(d3.event.offsetX),
                            y: graph.toLocalY(d3.event.offsetY)
                        };
                        const vec = {
                            x: point.x - this._mouseDownPoint.x,
                            y: point.y - this._mouseDownPoint.y
                        };
                        this._mouseDownPoint = point;
                        const shapeType = this._target.attr("shape-type");
                        if (this._shape) {
                            this._shape.moveTo(vec);
                        }
                        else if (shapeType === "infection-point") {
                            const x = parseFloat(this._target.attr("cx"));
                            const y = parseFloat(this._target.attr("cy"));
                            this._target.attr("cx", x + vec.x).attr("cy", y + vec.y);
                            const drawingID = this._target.attr("drawing-id");
                            emitter.emit(EVENT_PATH_LINK_DRAWING_RENDER, drawingID);
                        }
                    }
                })
                .on("mouseup", () => {
                    if (this._mouseDownPoint) {
                        const vec = {
                            x: graph.toLocalX(d3.event.offsetX) - this._mouseDownPoint.x,
                            y: graph.toLocalY(d3.event.offsetY) - this._mouseDownPoint.y
                        };
                        delete this._mouseDownPoint;
                        const shapeType = this._target.attr("shape-type");
                        if (this._shape) {
                            this._shape.moveTo(vec);
                            delete this._shape;
                        }
                        else if (shapeType === "infection-point") {
                            const x = parseFloat(this._target.attr("cx"));
                            const y = parseFloat(this._target.attr("cy"));
                            this._target.attr("cx", x + vec.x).attr("cy", y + vec.y);
                            const drawingID = this._target.attr("drawing-id");
                            emitter.emit(EVENT_PATH_LINK_DRAWING_RENDER, drawingID);
                        }
                    }
                    delete this._target;
                })
        }
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
                style={Object.assign({cursor: "pointer"}, this.props.style, this.state.selected ? {backgroundColor: "#D6D6D6"} : {})}
                type={this.props.type}
                attrs={this.props.attrs}
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
                            attrs={{
                                ...Toolbar.defaultProps.attrs,
                                viewBox: "0 0 512.001 512.001"
                            }}
                            onClick={DrawingToolbar.handlers.setNoneHandler.bind(this, this.props.graph)}
                            type={this.type}>
                <path
                    style={{transform: "scale(0.5)", transformOrigin: "center"}}
                    d="M429.742,319.31L82.49,0l-0.231,471.744l105.375-100.826l61.89,141.083l96.559-42.358l-61.89-141.083L429.742,319.31z M306.563,454.222l-41.62,18.259l-67.066-152.879l-85.589,81.894l0.164-333.193l245.264,225.529l-118.219,7.512L306.563,454.222z"/>
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
                            onClick={DrawingToolbar.handlers.setLineDrawHandler.bind(this, this.props.graph)}
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
                            onClick={DrawingToolbar.handlers.setCircleDrawHandler.bind(this, this.props.graph)}
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

    // getShapeID(event) {
    //     const {path} = event;
    //     for (let i = 0; i < path.length; i++) {
    //         const ele = path[i];
    //         console.dir(ele)
    //         if (ele && ele.attributes) {
    //             const node = ele.attributes["shape-id"];
    //             if (node) {
    //                 return node.nodeValue;
    //             }
    //         }
    //     }
    //     return null
    // }

    render() {
        return (
            <DrawingToolbar style={this.props.style}
                            onClick={DrawingToolbar.handlers.setLinkDrawHandler.bind(this, this.props.graph)}
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
                            onClick={DrawingToolbar.handlers.setArrowLinkDrawHandler.bind(this, this.props.graph)}
                            type={this.type}>
                <path d="M 10 10 S 20 15, 20 20 S 20 25, 30 30" stroke={"#888888"} fill={"transparent"}></path>
                <path d={[...arrowPath, "Z"].join(" ")} stroke={"#888888"} fill={"#888888"}></path>
            </DrawingToolbar>
        );
    }
}

export class TextCircleToolbar extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func,
        style: PropTypes.object,
        graph: PropTypes.object.isRequired
    };

    get type() {
        return "TextCircleDrawing";
    }

    render() {
        return (
            <DrawingToolbar style={this.props.style}
                            onClick={DrawingToolbar.handlers.setTextCircleDrawHandler.bind(this, this.props.graph)}
                            type={this.type}>
                <circle cx={20} cy={20} r={14} stroke={"black"} fill={"transparent"}></circle>
                <text x={20} y={20} fill={"black"} style={{fontSize: 12}} textAnchor={"middle"}
                      dominantBaseline={"middle"}>A
                </text>
            </DrawingToolbar>
        );
    }
}

export class MoveToolbar extends PureComponent {
    static propTypes = {
        style: PropTypes.object,
        graph: PropTypes.object.isRequired
    };

    render() {
        return (
            <DrawingToolbar style={this.props.style}
                            onClick={DrawingToolbar.handlers.setMoveHandler.bind(this, this.props.graph)}
                            attrs={{
                                ...Toolbar.defaultProps.attrs,
                                viewBox: "0 0 32 32"
                            }}>
                <g transform="translate(20,20) scale(0.5,0.5) translate(-20,-20)">
                    <polygon points="18,20 18,26 22,26 16,32 10,26 14,26 14,20" fill="#4E4E50"/>
                    <polygon points="14,12 14,6 10,6 16,0 22,6 18,6 18,12" fill="#4E4E50"/>
                    <polygon points="12,18 6,18 6,22 0,16 6,10 6,14 12,14" fill="#4E4E50"/>
                    <polygon points="20,14 26,14 26,10 32,16 26,22 26,18 20,18" fill="#4E4E50"/>
                </g>
            </DrawingToolbar>
        );
    }
}

//#endregion

//#region D3Graph
/**
 * 运筹学图形D3
 * */
export default class D3Graph extends Component {
    /**
     * @property {object} attrs - svg的属性
     * @property {Array} actions - 所有的操作
     * @property {single|multiple} selectMode [single] - 选择模式,是多选还是单选
     * @property {object} original - 坐标原点(屏幕坐标),默认值{x:0,y:0}
     * @property {screen|math} coordinateType [screen] - 坐标系,默认值是屏幕坐标系
     * @property {none|playing} mode - 模式,默认是:none,如果是playing,则是样式模式,会一步一步的演示绘图过程
     * @property {Function} renderToolbar - 绘图的工具栏
     * @property {?Number} scale [1] - 缩放比例,默认是1(1个单位对应一个像素)
     * @property {?Number} interval [1] - action的执行时间间隔
     * @property {?Function} onAction [null] - action的回调函数,函数包含一个参数 action
     * */
    static propTypes = {
        attrs: PropTypes.object,
        //action
        actions: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.oneOf(Object.keys(ActionTypeEnums)).isRequired,
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
        scale: PropTypes.number,
        interval: PropTypes.number,
        onAction: PropTypes.func
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
        scale: 1,
        interval: 1,
        onAction: null
    }

    get scale() {
        return this.state.scale;
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
        //播放的索引
        this.playingIndex = 0;
        //正在播放的action
        this.playingActions = [];
        //播放选项
        this.playingOption = null;
        //执行action的timter
        this.timer = null;
        this.state = {
            //inputAction的属性
            inputProperties: [],
            //是否显示用户输入
            showUserInput: false,
            //所有的action
            actions: [],
            //action执行的时间间隔
            interval: props.interval,
            //比例尺
            scale: props.scale,
            //原点
            original: props.original,
            //坐标系类型
            coordinateType: props.coordinateType,
            attrs: props.attrs
        };
    }

    /**
     * 根据id查找对应的图形
     * @private
     * */
    findShapeById(id) {
        const index = this.shapes.findIndex(f => f.id === id);
        return this.shapes[index];
    }

    getSelectedShapes() {
        return this.selectedShapes
    }

    /**
     * 将输入的坐标转换成屏幕坐标
     * @property {number} value - 如果坐标是屏幕坐标系就输入屏幕坐标,如果是数学坐标系就输入数学坐标
     * @private
     * */
    toScreenX(value) {
        return this.state.original.x + parseFloat(value) * this.state.scale;
    }

    /**
     * 将输入的坐标转成屏幕坐标
     * @property {number} value - 如果坐标是屏幕坐标系就输入屏幕坐标,如果是数学坐标系就输入数学坐标
     * @private
     * */
    toScreenY(value) {
        if (this.state.coordinateType === coordinateTypeEnum.screen) {
            return this.state.original.y + parseFloat(value) * this.state.scale;
        }
        return this.state.original.y - parseFloat(value) * this.state.scale;
    }

    /**
     * 将屏幕坐标转换成图形对应的坐标
     * @private
     * @param screenX
     * @return {number}
     */
    toLocalX(screenX) {
        if (this.state.coordinateType === coordinateTypeEnum.math) {
            return (screenX - this.state.original.x) / this.state.scale;
        }
        return screenX / this.state.scale;
    }

    /**
     * 将屏幕坐标转换成图形对应的坐标
     * @private
     * @param screenY
     * @return {number}
     */
    toLocalY(screenY) {
        if (this.state.coordinateType === coordinateTypeEnum.math) {
            return (this.state.original.y - screenY) / this.state.scale;
        }
        return screenY / this.state.scale;
    }

    async doActionsAsync(actions) {
        const action = actions.shift();
        if (action) {
            await this.doActionAsync(action);
            if (!action.canBreak) {
                //next
                this.timer = setTimeout(async () => {
                    await this.doActionsAsync(actions);
                }, action.nextInterval ? action.nextInterval : this.state.interval);
            }
            else {
                //保存后续的action,等待继续执行
                this._leftActions = actions;
            }
        }
    }

    async doActionAsync(action) {
        switch (action.type) {
            case ActionTypeEnums.draw: {
                this.shapes.push(action.params);
                this.drawShapes([action.params]);
                break;
            }
            case ActionTypeEnums.redraw: {
                const index = this.shapes.findIndex(f => f.id === action.params.id);
                if (index >= 0) {
                    if (action.params.state) {
                        for (let key in action.params.state) {
                            switch (Object.prototype.toString.call(this.shapes[index][key])) {
                                case "[object Object]":
                                    this.shapes[index][key] = Object.assign({}, this.shapes[index][key], action.params.state[key])
                                    // state[key] = {$set: };
                                    break;
                                default:
                                    this.shapes[index][key] = action.params.state[key];
                            }
                        }
                    }
                    this.drawShapes([this.shapes[index]]);
                }
                break;
            }
            case ActionTypeEnums.select: {
                const id = action.params;
                let shape = this.findShapeById(id);
                if (shape.selected) {
                    await this.doActionAsync(new UnSelectAction(id));
                }
                else {
                    shape.selected = true;
                    if (this.props.selectMode === selectModeEnums.single) {
                        //将已选中的shape取消选中
                        this.selectedShapes.map(f => f.id).forEach(async i => {
                            await this.doActionAsync(new UnSelectAction(i));
                        });
                        this.selectedShapes = [shape];
                    }
                    else {
                        this.selectedShapes.push(shape);
                    }
                }
                this.drawShapes([shape]);
                break;
            }
            case ActionTypeEnums.unselect: {
                const id = action.params;
                let shape = this.findShapeById(id);
                shape.selected = false;
                this.selectedShapes = this.selectedShapes.filter(f => f.id !== id);
                this.drawShapes([shape]);
                break;
            }
            case ActionTypeEnums.delete: {
                const id = action.params;
                //删除的图形
                const shape = this.shapes.find(s => s.id === id);
                //删除后的图形
                this.shapes = this.shapes.filter(s => s.id !== id);
                // if (shape.selection) {
                //     shape.selection.remove();
                //     delete shape.selection;
                // }
                if (shape) {
                    shape.remove();
                }
                break;
            }
            case ActionTypeEnums.clear: {
                this.shapes.forEach(async shape => {
                    await this.doActionAsync(new DeleteAction(shape.id))
                });
                this.selectedShapes = [];
                break;
            }
            case ActionTypeEnums.input: {
                //显示用户输入
                await this.showUserInputPromise(action);
                break;
            }
            case ActionTypeEnums.move: {
                const shape = this.shapes.find(f => f.id === action.params.id);
                if (shape) {
                    shape.moveTo(action.params.vec);
                }
                break;
            }
        }
        this.setState(
            update(this.state, {
                actions: {$push: [action]}
            }),
            () => {
                if (this.props.onAction) {
                    this.props.onAction(action);
                }
            }
        );
    }

    /**
     * 显示用户输入
     * @private
     * @param action
     */
    showUserInputPromise(action) {
        return new Promise((resolve) => {
            this.setState({
                showUserInput: true,
                inputProperties: action.params
            }, () => {
                resolve();
            })
        });
    }

    /**
     * 隐藏用户输入并执行下一个action
     * @private
     */
    hideUserInput(nextActionOption) {
        const params = this.state.inputProperties.map(property => {
            return {
                path: property.fieldName,
                value: getPath(nextActionOption, property.fieldName)
            }
        })
        this.setState({
            showUserInput: false,
            inputProperties: []
        }, async () => {
            //执行下一个action
            if (this._leftActions.length > 0) {
                params.forEach(p => {
                    setPath(this._leftActions[0].params, p.path, p.value)
                });
            }
            await this.doActionsAsync(this._leftActions);
        })
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

    /**
     * 获取图形数据
     *
     * @deprecated 请使用`getDrawingActions`代替
     * @return {*[]}
     */
    getDrawingData() {
        console.warn(`getDrawingData 方法将在下一个版本删除掉,请使用 getDrawingActions 代替`);
        const actions = this.state.actions.filter(f => f.type === ActionTypeEnums.draw);
        return actions.map((item) => {
            const shape = this.findShapeById(item.params.id);
            return {
                type: item.type,
                params: (shape && shape.toData) ? [shape.toData()] : [item.params.toData()]
            }
        });
    }

    /**
     * 获取所有绘图的action
     * @return {*[]}
     */
    getDrawingActions() {
        const actions = this.state.actions.filter(f => f.type === ActionTypeEnums.draw);
        return actions.map((item) => {
            const shape = this.findShapeById(item.params.id);
            return {
                type: item.type,
                params: (shape && shape.toData) ? [shape.toData()] : [item.params.toData()]
            }
        });
    }

    /**
     * 清除画布,这个方法除了会把画布上的内容清除以外还会重置内部的action状态
     */
    async clear() {
        await this.doActionAsync(new ClearAction());
        this.setState({
            actions: []
        });
    }

    play(actions, playingOps) {
        this.playingActions = actions;
        this.playingIndex = 0;
        this.playingOption = playingOps;
        // let actionIndex = 0;
        // const next = () => {
        //     if (actionIndex >= actions.length) {
        //         return;
        //     }
        //     const action = actions[actionIndex];
        //     /**
        //      * 如果action允许中断操作则停止play
        //      */
        //     if (action.canBreak) {
        //         return;
        //     }
        //     this.doActions([action]);
        //     actionIndex++;
        //     this.playingTimer = setTimeout(next.bind(this), action.nextInterval ? action.nextInterval : getPath(playingOps, "interval", 1000));
        // }
        // next();
        this.playNextAction();
    }

    /**
     * 执行下一个下一个action
     * @private
     */
    playNextAction() {
        if (this.playingIndex >= this.playingActions.length) {
            return;
        }
        const action = this.playingActions[this.playingIndex];
        this.doActionsAsync([action]);
        if (action.canBreak) {
            return;
        }
        this.playingIndex++;
        this.playingTimer = setTimeout(this.playNextAction.bind(this), action.nextInterval ? action.nextInterval : getPath(this.playingOption, "interval", 1000));
    }

    stop() {
        if (this.playingTimer) {
            clearTimeout(this.playingTimer);
        }
    }

    render() {
        return (
            <WorkSpace actions={this.props.renderToolbar(this)}>
                <svg ref={ref => this.ele = ref} {...this.state.attrs}>
                </svg>
                {this.state.showUserInput && <UserInput properties={this.state.inputProperties}
                                                        onOK={(value) => {
                                                            //执行下一个action,并把用户的输入参数参入到下一个action
                                                            this.hideUserInput(value);
                                                        }}/>}
            </WorkSpace>
        );
    }

    componentWillReceiveProps(nextProps) {
        let newState = {};
        if (nextProps.attrs) {
            newState.attrs = nextProps.attrs;
        }
        if (nextProps.coordinateType !== this.state.coordinateType) {
            newState.coordinateType = nextProps.coordinateType;
        }
        if (this.state.interval !== nextProps.interval) {
            newState.interval = nextProps.interval;
        }
        if (this.state.scale !== nextProps.scale) {
            newState.scale = nextProps.scale;
        }
        if (this.state.original.x !== nextProps.original.x || this.state.original.y !== nextProps.original.y) {
            newState.original = nextProps.original;
        }
        const doActions = () => {
            if (nextProps.actions.length > 0) {
                this.doActionsAsync(nextProps.actions);
            }
        }
        const keys = Object.keys(newState);
        if (keys.length > 0) {
            this.setState(newState, doActions);
        }
        else {
            doActions();
        }
    }

    async componentDidMount() {
        await this.doActionsAsync(this.props.actions);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    removeAllSvgEvent() {
        const svg = d3.select(this.ele);
        svg.on("click", null)
            .on("mousedown", null)
            .on("mousemove", null)
            .on("mouseup", null)
    }
}
//#endregion
