'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ArrowLinkToolbar = exports.LinkToolbar = exports.CircleToolbar = exports.LineToolbar = exports.NoneToolbar = exports.DrawingToolbar = exports.Toolbar = exports.TextCircleDrawing = exports.TextDrawing = exports.PathDrawing = exports.LinkDrawing = exports.ArrowLinkDrawing = exports.NumberScaleDrawing = exports.RectDrawing = exports.DotDrawing = exports.CircleDrawing = exports.LineDrawing = exports.Drawing = exports.ReDrawAction = exports.ClearAction = exports.DeleteAction = exports.UnSelectAction = exports.SelectAction = exports.DrawAction = exports.coordinateTypeEnum = exports.graphModeEnum = exports.actionTypeEnums = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.fromDrawing = fromDrawing;
exports.fromActions = fromActions;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);

var _guid = require('guid');

var _guid2 = _interopRequireDefault(_guid);

var _WorkSpace = require('./WorkSpace');

var _WorkSpace2 = _interopRequireDefault(_WorkSpace);

var _objectPath = require('object-path');

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _fbemitter = require('fbemitter');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * @todo 实现用户的输入action,输入action是一个中断操作
                                                                                                                                                                                                     * 实现link,arrowLink的label
                                                                                                                                                                                                     * @todo 实现图的drawing
                                                                                                                                                                                                     * @todo 实现transition
                                                                                                                                                                                                     * @todo 实现data action
                                                                                                                                                                                                     *
                                                                                                                                                                                                     * */

//#region event
var emitter = new _fbemitter.EventEmitter();
//toolbar 按钮切换
var EVENT_TOOLBAR_CHANGE = "EVENT_TOOLBAR_CHANGE";
//#endregion

/**
 * @typedef
 * */


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
var actionTypeEnums = exports.actionTypeEnums = {
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
var selectModeEnums = {
    single: "single",
    multiple: "multiple"
};

var graphModeEnum = exports.graphModeEnum = {
    none: "none",
    draw: "draw",
    playing: "playing"
};
var coordinateTypeEnum = exports.coordinateTypeEnum = {
    "screen": "screen",
    "math": "math"
    //#endregion

};var drawingIndex = {};
var actionIndex = {};

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

function getArrowPoints(startPoint, endPoint) {
    var distance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;

    var diffX = startPoint.x - endPoint.x;
    var diffY = startPoint.y - endPoint.y;
    var a = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
    var q1x = endPoint.x + distance * (diffX + diffY) / a;
    var q1y = endPoint.y + distance * (diffY - diffX) / a;
    var q3x = endPoint.x + distance * (diffX - diffY) / a;
    var q3y = endPoint.y + distance * (diffX + diffY) / a;
    return [new Point(endPoint.x, endPoint.y), new Point(q1x, q1y), new Point(q3x, q3y)];
}

/**
 * 反序列化drawing
 * */
function fromDrawing(drawingOps) {
    var func = drawingIndex[drawingOps.type];
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
function fromActions(actions) {
    return actions.map(function (action) {
        var type = action.type;
        var args = action.params;
        var ops = action.ops;
        var func = actionIndex[type];
        if (!func) {
            throw new Error('action ' + type + ' is not defined');
        }
        switch (type) {
            case actionTypeEnums.draw:
                return new (Function.prototype.bind.apply(actionIndex[type], [null].concat(_toConsumableArray(args.map(function (arg) {
                    return fromDrawing(arg);
                }, ops)))))();
            default:
                return new (Function.prototype.bind.apply(actionIndex[type], [null].concat(_toConsumableArray(args), [ops])))();
        }
    });
}

var Point = function Point(x, y) {
    _classCallCheck(this, Point);

    this.x = x;
    this.y = y;
};

//#region Action
/**
 * action基类
 * */


var Action = function Action(type, params, ops) {
    _classCallCheck(this, Action);

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
    this.nextInterval = (0, _objectPath.get)(ops, "nextInterval", null);
};

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


var DrawAction = exports.DrawAction = function (_Action) {
    _inherits(DrawAction, _Action);

    function DrawAction(drawingOps, ops) {
        _classCallCheck(this, DrawAction);

        return _possibleConstructorReturn(this, (DrawAction.__proto__ || Object.getPrototypeOf(DrawAction)).call(this, actionTypeEnums.draw, drawingOps, ops));
    }

    return DrawAction;
}(Action);

actionIndex[actionTypeEnums.draw] = DrawAction;

/**
 * 选择action
 *
 * @example
 *
 * <D3Graph actions={[new SelectAction('SHAPE_ID')]}/>
 *
 * */

var SelectAction = exports.SelectAction = function (_Action2) {
    _inherits(SelectAction, _Action2);

    function SelectAction(shapeId, ops) {
        _classCallCheck(this, SelectAction);

        return _possibleConstructorReturn(this, (SelectAction.__proto__ || Object.getPrototypeOf(SelectAction)).call(this, actionTypeEnums.select, shapeId, ops));
    }

    return SelectAction;
}(Action);

actionIndex[actionTypeEnums.select] = SelectAction;

/**
 * 取消选择action
 *
 * @example
 *
 * <D3Graph actions={[new UnSelectAction('SHAPE_ID')]}/>
 *
 * */

var UnSelectAction = exports.UnSelectAction = function (_Action3) {
    _inherits(UnSelectAction, _Action3);

    function UnSelectAction(shapeId, ops) {
        _classCallCheck(this, UnSelectAction);

        return _possibleConstructorReturn(this, (UnSelectAction.__proto__ || Object.getPrototypeOf(UnSelectAction)).call(this, actionTypeEnums.unselect, shapeId, ops));
    }

    return UnSelectAction;
}(Action);

actionIndex[actionTypeEnums.unselect] = UnSelectAction;

/**
 * 删除图形action
 *
 * @example
 *
 * <D3Graph actions={[new DeleteAction('SHAPE_ID')]}/>
 *
 * */

var DeleteAction = exports.DeleteAction = function (_Action4) {
    _inherits(DeleteAction, _Action4);

    function DeleteAction(shapeId, ops) {
        _classCallCheck(this, DeleteAction);

        return _possibleConstructorReturn(this, (DeleteAction.__proto__ || Object.getPrototypeOf(DeleteAction)).call(this, actionTypeEnums.delete, shapeId, ops));
    }

    return DeleteAction;
}(Action);

actionIndex[actionTypeEnums.delete] = DeleteAction;

/**
 * 清除所有的图形action
 *
 * @example
 *
 * <D3Graph actions={[new ClearAction()]}/>
 *
 * */

var ClearAction = exports.ClearAction = function (_Action5) {
    _inherits(ClearAction, _Action5);

    function ClearAction(ops) {
        _classCallCheck(this, ClearAction);

        return _possibleConstructorReturn(this, (ClearAction.__proto__ || Object.getPrototypeOf(ClearAction)).call(this, actionTypeEnums.clear, null, ops));
    }

    return ClearAction;
}(Action);

actionIndex[actionTypeEnums.clear] = ClearAction;

/**
 * 重绘action
 * */

var ReDrawAction = exports.ReDrawAction = function (_Action6) {
    _inherits(ReDrawAction, _Action6);

    function ReDrawAction(shapeId, state, ops) {
        _classCallCheck(this, ReDrawAction);

        return _possibleConstructorReturn(this, (ReDrawAction.__proto__ || Object.getPrototypeOf(ReDrawAction)).call(this, actionTypeEnums.redraw, {
            id: shapeId,
            state: state
        }, ops));
    }

    return ReDrawAction;
}(Action);

actionIndex[actionTypeEnums.redraw] = ReDrawAction;
//#endregion

//#region Drawing
/**
 * 绘画接口,所有的绘画类都需要继承这个类并实现相关方法
 * @todo 添加 TextCircleDrawing 实现图(有向图/无向图)节点的绘制
 * */

var Drawing = exports.Drawing = function () {

    /**
     * @constructor
     *
     * @param {Object} option
     * @param {?String} option.id - 默认是guid
     * @param {?Object} option.attrs
     * @param {?Function|?String} option.text
     *
     * */
    function Drawing(option) {
        _classCallCheck(this, Drawing);

        /**
         * 图形的id,如果没有提供会生成一个guid
         * @member {String}
         * */
        this.id = (0, _objectPath.get)(option, "id", _guid2.default.raw());
        /**
         * 图形的attrs
         * @member {Object}
         * */
        this.attrs = (0, _objectPath.get)(option, "attrs", {});
        /**
         * 对应svg元素的text
         * @member {String|Function}
         * */
        this.text = (0, _objectPath.get)(option, "text", "");
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


    _createClass(Drawing, [{
        key: 'render',


        /**
         * 绘制,更新selection相关
         * */
        value: function render() {
            this.updateAttrs(this.selection, this.combineAttrs(this.defaultAttrs, this.attrs, this.selectedAttrs, null));
            if (this.text) {
                this.selection.text(this.text);
            }
        }

        /**
         * 获取link的点的位置信息
         * */

    }, {
        key: 'getLinkPoint',
        value: function getLinkPoint() {
            throw new Error('method `getLinkPoint` is not implementation');
        }

        /**
         * 初始化drawing,创建selection,监听事件需要在里面实现
         * */

    }, {
        key: 'initialize',
        value: function initialize(graph) {
            this.graph = graph;
            this.ready = true;
        }

        /**
         * 批量更新attrs
         * */

    }, {
        key: 'updateAttrs',
        value: function updateAttrs(selection, attrs) {
            if (selection) {
                selection.call(function (self) {
                    for (var key in attrs) {
                        self.attr(key, attrs[key]);
                    }
                });
            }
        }

        /**
         * 选中当前图形
         * */

    }, {
        key: 'select',
        value: function select() {
            if (this.graph) {
                this.graph.doActions([new SelectAction(this.id)]);
            }
        }
    }, {
        key: 'combineAttrs',
        value: function combineAttrs() {
            var defaultAttrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var defaultSelectedAttrs = arguments[2];
            var selectedAttrs = arguments[3];

            var result = Object.assign({}, defaultAttrs, attrs, this.selected ? Object.assign({}, defaultSelectedAttrs, selectedAttrs) : {});
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
            return result;
        }
    }, {
        key: 'defaultAttrs',
        get: function get() {
            return {};
        }

        /**
         * 选中时的attribute
         * @readonly
         * @member {Object}
         * */

    }, {
        key: 'selectedAttrs',
        get: function get() {
            return {};
        }
    }]);

    return Drawing;
}();

/**
 * 绘画线
 * */


var LineDrawing = exports.LineDrawing = function (_Drawing) {
    _inherits(LineDrawing, _Drawing);

    function LineDrawing(option) {
        _classCallCheck(this, LineDrawing);

        var _this7 = _possibleConstructorReturn(this, (LineDrawing.__proto__ || Object.getPrototypeOf(LineDrawing)).call(this, option));

        _this7.type = "line";
        return _this7;
    }

    _createClass(LineDrawing, [{
        key: 'initialize',
        value: function initialize(graph) {
            var _this8 = this;

            _get(LineDrawing.prototype.__proto__ || Object.getPrototypeOf(LineDrawing.prototype), 'initialize', this).call(this, graph);
            this.selection = d3.select(graph.ele).append("line");
            this.selection.on("click", function () {
                _this8.select();
            });
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

    }, {
        key: 'defaultAttrs',
        get: function get() {
            return {
                fill: "transparent",
                stroke: "black",
                "stroke-width": "3px"
            };
        }
    }, {
        key: 'selectedAttrs',
        get: function get() {
            return {
                stroke: "red"
            };
        }
    }]);

    return LineDrawing;
}(Drawing);

registerDrawing("LineDrawing", LineDrawing);

/**
 * 绘画圈
 * */

var CircleDrawing = exports.CircleDrawing = function (_Drawing2) {
    _inherits(CircleDrawing, _Drawing2);

    function CircleDrawing(option) {
        _classCallCheck(this, CircleDrawing);

        var _this9 = _possibleConstructorReturn(this, (CircleDrawing.__proto__ || Object.getPrototypeOf(CircleDrawing)).call(this, option));

        _this9.type = "circle";
        return _this9;
    }

    _createClass(CircleDrawing, [{
        key: 'initialize',
        value: function initialize(graph) {
            var _this10 = this;

            _get(CircleDrawing.prototype.__proto__ || Object.getPrototypeOf(CircleDrawing.prototype), 'initialize', this).call(this, graph);
            this.selection = d3.select(graph.ele).append("circle");
            this.selection.on("click", function () {
                _this10.select();
            });
        }
    }, {
        key: 'getLinkPoint',
        value: function getLinkPoint() {
            return new Point(parseFloat(this.attrs.cx), parseFloat(this.attrs.cy));
        }
    }, {
        key: 'defaultAttrs',
        get: function get() {
            return {
                fill: "transparent",
                stroke: "black",
                r: "10px",
                "stroke-width": "1px"
            };
        }
    }, {
        key: 'selectedAttrs',
        get: function get() {
            return {
                stroke: "red"
            };
        }
    }]);

    return CircleDrawing;
}(Drawing);

registerDrawing("CircleDrawing", CircleDrawing);

/**
 * 绘制点
 * */

var DotDrawing = exports.DotDrawing = function (_Drawing3) {
    _inherits(DotDrawing, _Drawing3);

    function DotDrawing(option) {
        _classCallCheck(this, DotDrawing);

        var _this11 = _possibleConstructorReturn(this, (DotDrawing.__proto__ || Object.getPrototypeOf(DotDrawing)).call(this, option));

        _this11.type = "dot";
        return _this11;
    }

    _createClass(DotDrawing, [{
        key: 'initialize',
        value: function initialize(graph) {
            var _this12 = this;

            _get(DotDrawing.prototype.__proto__ || Object.getPrototypeOf(DotDrawing.prototype), 'initialize', this).call(this, graph);
            this.selection = d3.select(graph.ele).append("circle");
            this.selection.on("click", function () {
                _this12.select();
            });
        }
    }, {
        key: 'defaultAttrs',
        get: function get() {
            return {
                fill: "black",
                stroke: "black",
                r: "5px"
            };
        }
    }, {
        key: 'selectedAttrs',
        get: function get() {
            return {
                stroke: "red"
            };
        }
    }]);

    return DotDrawing;
}(Drawing);

registerDrawing("DotDrawing", DotDrawing);

/**
 * 绘画矩形
 * */

var RectDrawing = exports.RectDrawing = function (_Drawing4) {
    _inherits(RectDrawing, _Drawing4);

    function RectDrawing(option) {
        _classCallCheck(this, RectDrawing);

        var _this13 = _possibleConstructorReturn(this, (RectDrawing.__proto__ || Object.getPrototypeOf(RectDrawing)).call(this, option));

        _this13.type = "rect";
        return _this13;
    }

    _createClass(RectDrawing, [{
        key: 'initialize',
        value: function initialize(graph) {
            var _this14 = this;

            _get(RectDrawing.prototype.__proto__ || Object.getPrototypeOf(RectDrawing.prototype), 'initialize', this).call(this, graph);
            this.selection = d3.select(graph.ele).append("path");
            this.selection.on("click", function () {
                _this14.select();
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

    }, {
        key: 'defaultAttrs',
        get: function get() {
            return {};
        }
    }, {
        key: 'selectedAttrs',
        get: function get() {
            return {};
        }
    }]);

    return RectDrawing;
}(Drawing);

registerDrawing("RectDrawing", RectDrawing);

/**
 * 绘制刻度
 * */

var NumberScaleDrawing = exports.NumberScaleDrawing = function (_Drawing5) {
    _inherits(NumberScaleDrawing, _Drawing5);

    function NumberScaleDrawing(option) {
        _classCallCheck(this, NumberScaleDrawing);

        var _this15 = _possibleConstructorReturn(this, (NumberScaleDrawing.__proto__ || Object.getPrototypeOf(NumberScaleDrawing)).call(this, option));

        _this15.type = "number-scale";
        _this15.original = (0, _objectPath.get)(option, "original", {
            x: 20,
            y: 280
        });
        _this15.xAxisLength = (0, _objectPath.get)(option, "xAxisLength", 360);
        _this15.yAxisLength = (0, _objectPath.get)(option, "yAxisLength", 260);
        //刻度的间距大小
        _this15.scale = (0, _objectPath.get)(option, "scale", 20);
        return _this15;
    }

    _createClass(NumberScaleDrawing, [{
        key: 'initialize',
        value: function initialize(graph) {
            var _this16 = this;

            _get(NumberScaleDrawing.prototype.__proto__ || Object.getPrototypeOf(NumberScaleDrawing.prototype), 'initialize', this).call(this, graph);
            // const width = graph.ele.clientWidth;
            // const height = graph.ele.clientHeight;
            this.selection = d3.select(graph.ele).append("g");
            var originalPoint = Object.assign({}, this.original);
            var xEndPoint = new Point(this.original.x + this.xAxisLength, this.original.y);
            var yEndPoint = new Point(this.original.x, this.original.y - this.yAxisLength);
            //xAxis
            this.selection.append("line").attr("x1", originalPoint.x).attr("y1", originalPoint.y).attr("x2", xEndPoint.x).attr("y2", xEndPoint.y).attr("stroke", "black").attr("stroke-width", "1px");
            //画x轴的箭头
            this.selection.append("path").attr("d", 'M ' + xEndPoint.x + ' ' + xEndPoint.y + ' L ' + xEndPoint.x + ' ' + (xEndPoint.y + 5) + ' L ' + (xEndPoint.x + 15) + ' ' + xEndPoint.y + ' L ' + xEndPoint.x + ' ' + (xEndPoint.y - 5) + ' Z');
            // 画x轴的刻度
            var xScaleCount = Math.floor(Math.abs(xEndPoint.x - originalPoint.x) / this.scale);
            Array.apply(null, { length: xScaleCount }).forEach(function (v, i) {
                var p1 = new Point(originalPoint.x + _this16.scale * i, originalPoint.y);
                var p2 = new Point(originalPoint.x + _this16.scale * i, originalPoint.y - 3);
                _this16.selection.append("line").attr("x1", p1.x).attr("y1", p1.y).attr("x2", p2.x).attr("y2", p2.y).attr("fill", "none").attr("stroke", "black").attr("stroke-width", 1);
                _this16.selection.append("text").text(i).attr("x", p1.x).attr("y", p1.y + 10).attr("style", "font-size:10px");
            });
            //yAxis
            this.selection.append("line").attr("x1", originalPoint.x).attr("y1", originalPoint.y).attr("x2", yEndPoint.x).attr("y2", yEndPoint.y).attr("stroke", "black").attr("stroke-width", 1);
            //画y轴的箭头
            this.selection.append("path").attr("d", 'M ' + yEndPoint.x + ' ' + yEndPoint.y + ' L ' + (yEndPoint.x + 5) + ' ' + yEndPoint.y + ' L ' + yEndPoint.x + ' ' + (yEndPoint.y - 15) + ' L ' + (yEndPoint.x - 5) + ' ' + yEndPoint.y + ' Z');
            //画y轴的刻度
            var yScaleCount = Math.floor(Math.abs(yEndPoint.y - originalPoint.y) / this.scale);
            Array.apply(null, { length: yScaleCount }).forEach(function (v, i) {
                var p1 = new Point(originalPoint.x, originalPoint.y - _this16.scale * i);
                var p2 = new Point(originalPoint.x + 3, originalPoint.y - _this16.scale * i);
                _this16.selection.append("line").attr("x1", p1.x).attr("y1", p1.y).attr("x2", p2.x).attr("y2", p2.y).attr("fill", "none").attr("stroke", "black").attr("stroke-width", 1);
                _this16.selection.append("text").text(i).attr("x", p1.x - 15).attr("y", p1.y).attr("style", "font-size:10px");
            });
        }
    }, {
        key: 'defaultAttrs',
        get: function get() {
            return {};
        }
    }, {
        key: 'selectedAttrs',
        get: function get() {
            return {};
        }
    }]);

    return NumberScaleDrawing;
}(Drawing);

registerDrawing("NumberScaleDrawing", NumberScaleDrawing);

/**
 * 绘制带箭头的link
 * @todo 实现label的修改
 * */

var ArrowLinkDrawing = exports.ArrowLinkDrawing = function (_Drawing6) {
    _inherits(ArrowLinkDrawing, _Drawing6);

    /**
     * @constructor
     *
     * @param {object} option
     * @param {string} option.sourceId - link的源id
     * @param {string} option.targetId - link的目标id
     * @param {string|function} option.label - link的label
     * @param {object} option.labelAttrs - label的attributes
     * */
    function ArrowLinkDrawing(option) {
        _classCallCheck(this, ArrowLinkDrawing);

        var _this17 = _possibleConstructorReturn(this, (ArrowLinkDrawing.__proto__ || Object.getPrototypeOf(ArrowLinkDrawing)).call(this, option));

        _this17.type = "arrow-link";
        _this17.sourceId = (0, _objectPath.get)(option, "sourceId");
        if (!_this17.sourceId) {
            throw new Error('ArrowLinkDrawing option require sourceId property');
        }
        _this17.targetId = (0, _objectPath.get)(option, "targetId");
        if (!_this17.targetId) {
            throw new Error('ArrowLinkDrawing option require targetId property');
        }
        _this17.source = null;
        _this17.target = null;
        _this17.label = (0, _objectPath.get)(option, "label");
        _this17.labelAttrs = (0, _objectPath.get)(option, "labelAttrs");
        _this17.labelSelection = null;
        return _this17;
    }

    _createClass(ArrowLinkDrawing, [{
        key: 'initialize',
        value: function initialize(graph) {
            var _this18 = this;

            _get(ArrowLinkDrawing.prototype.__proto__ || Object.getPrototypeOf(ArrowLinkDrawing.prototype), 'initialize', this).call(this, graph);
            this.source = this.graph.findShapeById(this.sourceId);
            this.target = this.graph.findShapeById(this.targetId);
            this.selection = d3.select(graph.ele).append("path");
            this.selection.on("click", function () {
                _this18.select();
            });
            this.labelSelection = d3.select(graph.ele).append("text");
        }
    }, {
        key: 'renderLabel',
        value: function renderLabel(x, y) {
            if (this.labelSelection) {
                if (this.label) {
                    this.labelSelection.text(this.label);
                }
                var attrs = Object.assign({
                    x: this.graph.getX(x),
                    y: this.graph.getY(y)
                }, this.labelAttrs);
                this.updateAttrs(this.labelSelection, attrs);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            //计算link的位置信息
            var p1 = this.source.getLinkPoint();
            var p2 = this.target.getLinkPoint();
            this.attrs = (0, _immutabilityHelper2.default)(this.attrs, {
                d: { $set: this.getArrowLinkPath(p1, p2, 10 / this.graph.scale).join(' ') }
            });
            _get(ArrowLinkDrawing.prototype.__proto__ || Object.getPrototypeOf(ArrowLinkDrawing.prototype), 'render', this).call(this);
            var hx = Math.abs(p1.x - p2.x) / 2;
            var hy = Math.abs(p1.y - p2.y) / 2;
            var labelX = Math.min(p1.x, p2.x) + hx;
            var labelY = Math.min(p1.y, p2.y) + hy;
            this.renderLabel(labelX, labelY);
        }
    }, {
        key: 'getArrowLinkPath',
        value: function getArrowLinkPath(startPoint, endPoint) {
            var distance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;


            var diffX = startPoint.x - endPoint.x;
            var diffY = startPoint.y - endPoint.y;
            var a = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
            var q1x = endPoint.x + distance * (diffX + diffY) / a;
            var q1y = endPoint.y + distance * (diffY - diffX) / a;
            var q2x = endPoint.x + diffX * distance / a;
            var q2y = endPoint.y + diffY * distance / a;
            var q3x = endPoint.x + distance * (diffX - diffY) / a;
            var q3y = endPoint.y + distance * (diffX + diffY) / a;
            return ['M ' + this.graph.getX(startPoint.x) + ' ' + this.graph.getY(startPoint.y), 'L ' + this.graph.getX(q2x) + ' ' + this.graph.getY(q2y), 'L ' + this.graph.getX(q1x) + ' ' + this.graph.getY(q1y), 'L ' + this.graph.getX(endPoint.x) + ' ' + this.graph.getY(endPoint.y), 'L ' + this.graph.getX(q3x) + ' ' + this.graph.getY(q3y), 'L ' + this.graph.getX(q2x) + ' ' + this.graph.getY(q2y), 'L ' + this.graph.getX(startPoint.x) + ' ' + this.graph.getY(startPoint.y), 'Z'];
        }
    }, {
        key: 'defaultAttrs',
        get: function get() {
            return {
                fill: "black",
                stroke: "black"
            };
        }
    }, {
        key: 'selectedAttrs',
        get: function get() {
            return {
                stroke: "red"
            };
        }
    }]);

    return ArrowLinkDrawing;
}(Drawing);

registerDrawing("ArrowLinkDrawing", ArrowLinkDrawing);

/**
 * 绘制link
 * @todo 添加label
 * @todo 实现label的修改
 * */

var LinkDrawing = exports.LinkDrawing = function (_Drawing7) {
    _inherits(LinkDrawing, _Drawing7);

    /**
     * @constructor
     *
     * @param {object} option
     * @param {string} option.sourceId - link的源id
     * @param {string} option.targetId - link的目标id
     * @param {string|function} option.label - link的label
     * @param {object} option.labelAttrs - label的attributes
     * */
    function LinkDrawing(option) {
        _classCallCheck(this, LinkDrawing);

        var _this19 = _possibleConstructorReturn(this, (LinkDrawing.__proto__ || Object.getPrototypeOf(LinkDrawing)).call(this, option));

        _this19.type = "link";
        _this19.sourceId = (0, _objectPath.get)(option, "sourceId");
        if (!_this19.sourceId) {
            throw new Error('LinkDrawing option require sourceId property');
        }
        _this19.targetId = (0, _objectPath.get)(option, "targetId");
        if (!_this19.targetId) {
            throw new Error('LinkDrawing option require targetId property');
        }
        _this19.source = null;
        _this19.target = null;
        _this19.label = (0, _objectPath.get)(option, "label");
        _this19.labelAttrs = (0, _objectPath.get)(option, "labelAttrs");
        _this19.labelSelection = null;
        return _this19;
    }

    _createClass(LinkDrawing, [{
        key: 'initialize',
        value: function initialize(graph) {
            var _this20 = this;

            _get(LinkDrawing.prototype.__proto__ || Object.getPrototypeOf(LinkDrawing.prototype), 'initialize', this).call(this, graph);
            this.source = this.graph.findShapeById(this.sourceId);
            this.target = this.graph.findShapeById(this.targetId);
            this.selection = d3.select(graph.ele).append("line");
            this.selection.on("click", function () {
                _this20.select();
            });
            this.labelSelection = d3.select(graph.ele).append("text");
        }
    }, {
        key: 'renderLabel',
        value: function renderLabel(x, y) {
            if (this.labelSelection) {
                if (this.label) {
                    this.labelSelection.text(this.label);
                }
                var attrs = Object.assign({
                    x: this.graph.getX(x),
                    y: this.graph.getY(y)
                }, this.labelAttrs);
                this.updateAttrs(this.labelSelection, attrs);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            //计算link的位置信息
            var p1 = this.source.getLinkPoint();
            var p2 = this.target.getLinkPoint();
            this.attrs = (0, _immutabilityHelper2.default)(this.attrs, {
                x1: { $set: p1.x },
                y1: { $set: p1.y },
                x2: { $set: p2.x },
                y2: { $set: p2.y }
            });
            _get(LinkDrawing.prototype.__proto__ || Object.getPrototypeOf(LinkDrawing.prototype), 'render', this).call(this);
            var hx = Math.abs(p1.x - p2.x) / 2;
            var hy = Math.abs(p1.y - p2.y) / 2;
            var labelX = Math.min(p1.x, p2.x) + hx;
            var labelY = Math.min(p1.y, p2.y) + hy;
            this.renderLabel(labelX, labelY);
        }
    }, {
        key: 'defaultAttrs',
        get: function get() {
            return {
                fill: "none",
                "stroke-width": "2px",
                stroke: "black"
            };
        }
    }, {
        key: 'selectedAttrs',
        get: function get() {
            return {
                stroke: "red"
            };
        }
    }]);

    return LinkDrawing;
}(Drawing);

registerDrawing("LinkDrawing", LinkDrawing);

/**
 * 绘画Path
 * */

var PathDrawing = exports.PathDrawing = function (_Drawing8) {
    _inherits(PathDrawing, _Drawing8);

    function PathDrawing(option) {
        _classCallCheck(this, PathDrawing);

        var _this21 = _possibleConstructorReturn(this, (PathDrawing.__proto__ || Object.getPrototypeOf(PathDrawing)).call(this, option));

        _this21.type = "path";
        _this21.d = (0, _objectPath.get)(option, "d", []);
        return _this21;
    }

    _createClass(PathDrawing, [{
        key: 'initialize',
        value: function initialize(graph) {
            var _this22 = this;

            _get(PathDrawing.prototype.__proto__ || Object.getPrototypeOf(PathDrawing.prototype), 'initialize', this).call(this, graph);
            this.selection = d3.select(graph.ele).append("path");
            this.selection.on("click", function () {
                _this22.select();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this23 = this;

            if (!this.attrs.d) {
                var d = this.d.map(function (point, index) {
                    if (index === 0) {
                        return 'M ' + _this23.graph.getX(point.x) + ' ' + _this23.graph.getY(point.y);
                    }
                    return 'L ' + _this23.graph.getX(point.x) + ' ' + _this23.graph.getY(point.y);
                });
                d.push("Z");
                this.attrs.d = d.join(" ");
            }
            _get(PathDrawing.prototype.__proto__ || Object.getPrototypeOf(PathDrawing.prototype), 'render', this).call(this);
        }
    }, {
        key: 'defaultAttrs',
        get: function get() {
            return {};
        }
    }, {
        key: 'selectedAttrs',
        get: function get() {
            return {};
        }
    }]);

    return PathDrawing;
}(Drawing);

registerDrawing("PathDrawing", PathDrawing);

/**
 * 绘制text
 * */

var TextDrawing = exports.TextDrawing = function (_Drawing9) {
    _inherits(TextDrawing, _Drawing9);

    function TextDrawing(option) {
        _classCallCheck(this, TextDrawing);

        var _this24 = _possibleConstructorReturn(this, (TextDrawing.__proto__ || Object.getPrototypeOf(TextDrawing)).call(this, option));

        _this24.type = "text";
        return _this24;
    }

    _createClass(TextDrawing, [{
        key: 'initialize',
        value: function initialize(graph) {
            var _this25 = this;

            _get(TextDrawing.prototype.__proto__ || Object.getPrototypeOf(TextDrawing.prototype), 'initialize', this).call(this, graph);
            this.selection = d3.select(graph.ele).append("text");
            this.selection.on("click", function () {
                _this25.select();
            });
        }
    }, {
        key: 'defaultAttrs',
        get: function get() {
            return {
                fill: "black",
                "font-size": "20px"
            };
        }
    }, {
        key: 'selectedAttrs',
        get: function get() {
            return {
                fill: "red"
            };
        }
    }]);

    return TextDrawing;
}(Drawing);

registerDrawing("TextDrawing", TextDrawing);

var TextCircleDrawing = exports.TextCircleDrawing = function (_Drawing10) {
    _inherits(TextCircleDrawing, _Drawing10);

    _createClass(TextCircleDrawing, [{
        key: 'defaultCircleAttrs',
        get: function get() {
            return {
                r: 20,
                fill: "transparent",
                stroke: "black"
            };
        }
    }, {
        key: 'defaultCircleSelectedAttrs',
        get: function get() {
            return {
                fill: "transparent",
                stroke: "red"
            };
        }
    }, {
        key: 'defaultTextAttrs',
        get: function get() {
            return {
                "text-anchor": "middle",
                "dominant-baseline": "middle"
            };
        }
    }, {
        key: 'defaultTextSelectedAttrs',
        get: function get() {
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
         *
         * */

    }]);

    function TextCircleDrawing(option) {
        _classCallCheck(this, TextCircleDrawing);

        /**
         * 绘制的类型
         * @member {String}
         * */
        var _this26 = _possibleConstructorReturn(this, (TextCircleDrawing.__proto__ || Object.getPrototypeOf(TextCircleDrawing)).call(this, option));

        _this26.type = "text-circle";
        /**
         * 圆圈的属性
         * @member {Object}
         * @private
         * */
        _this26.circleAttrs = (0, _objectPath.get)(option, "circleAttrs", {});
        /**
         * 圆圈选中的属性
         * @member {Object}
         * @private
         * */
        _this26.circleSelectedAttrs = (0, _objectPath.get)(option, "circleSelectedAttrs", {});
        /**
         * 文本的属性
         * @member {Object}
         * @private
         * */
        _this26.textAttrs = (0, _objectPath.get)(option, "textAttrs", {});
        /**
         * 文本选中的属性
         * @member {Object}
         * @private
         * */
        _this26.textSelectedAttrs = (0, _objectPath.get)(option, "textSelectedAttrs", {});
        /**
         * 文本的selection
         * @member {D3.Selection}
         * @private
         * */
        _this26.textSelection = null;
        /**
         * 圆圈的selection
         * @member {D3.Selection}
         * @private
         * */
        _this26.circleSelection = null;
        return _this26;
    }

    _createClass(TextCircleDrawing, [{
        key: 'initialize',
        value: function initialize(graph) {
            _get(TextCircleDrawing.prototype.__proto__ || Object.getPrototypeOf(TextCircleDrawing.prototype), 'initialize', this).call(this, graph);
            this.selection = d3.select(graph.ele).append("g");
            //add  circle
            this.circleSelection = this.selection.append("circle");
            //add text
            this.textSelection = this.selection.append("text");
            this.selection.on("click", this.select.bind(this));
        }
    }, {
        key: 'render',
        value: function render() {
            this.textSelection.text(this.text);
            var circleAttrs = this.combineAttrs(this.defaultCircleAttrs, this.circleAttrs, this.defaultCircleSelectedAttrs, this.circleSelectedAttrs);
            var textAttrs = this.combineAttrs(this.defaultTextAttrs, this.textAttrs, this.defaultTextSelectedAttrs, this.textSelectedAttrs);
            textAttrs.x = circleAttrs.cx;
            textAttrs.y = circleAttrs.cy;
            this.updateAttrs(this.textSelection, textAttrs);
            this.updateAttrs(this.circleSelection, circleAttrs);
        }
    }, {
        key: 'getLinkPoint',
        value: function getLinkPoint() {
            var circleAttrs = this.combineAttrs(this.defaultCircleAttrs, this.circleAttrs, this.defaultCircleSelectedAttrs, this.circleSelectedAttrs);
            return new Point(circleAttrs.cx, circleAttrs.cy);
        }
    }]);

    return TextCircleDrawing;
}(Drawing);

registerDrawing("TextCircleDrawing", TextCircleDrawing);
//#endregion

//#region Toolbar

var Toolbar = exports.Toolbar = function (_PureComponent) {
    _inherits(Toolbar, _PureComponent);

    function Toolbar() {
        _classCallCheck(this, Toolbar);

        return _possibleConstructorReturn(this, (Toolbar.__proto__ || Object.getPrototypeOf(Toolbar)).apply(this, arguments));
    }

    _createClass(Toolbar, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'svg',
                _extends({}, this.attrs, {
                    onClick: this.props.onClick,
                    style: this.props.style }),
                this.props.children
            );
        }
    }, {
        key: 'attrs',
        get: function get() {
            return {
                width: 40,
                height: 40
            };
        }
    }]);

    return Toolbar;
}(_react.PureComponent);

Toolbar.propTypes = {
    children: _propTypes2.default.any,
    onClick: _propTypes2.default.func,
    style: _propTypes2.default.object
};

var DrawingToolbar = exports.DrawingToolbar = function (_PureComponent2) {
    _inherits(DrawingToolbar, _PureComponent2);

    function DrawingToolbar(props) {
        _classCallCheck(this, DrawingToolbar);

        var _this28 = _possibleConstructorReturn(this, (DrawingToolbar.__proto__ || Object.getPrototypeOf(DrawingToolbar)).call(this, props));

        _this28.listener = null;
        _this28.state = {
            selected: false
        };
        return _this28;
    }

    _createClass(DrawingToolbar, [{
        key: 'render',
        value: function render() {
            var _this29 = this;

            return _react2.default.createElement(
                Toolbar,
                {
                    style: Object.assign({}, this.props.style, this.state.selected ? { backgroundColor: "#D6D6D6" } : {}),
                    type: this.props.type,
                    onClick: function onClick() {
                        var _props;

                        emitter.emit(EVENT_TOOLBAR_CHANGE, _this29.props.type);
                        _this29.props.onClick && (_props = _this29.props).onClick.apply(_props, arguments);
                    } },
                this.props.children
            );
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this30 = this;

            this.listener = emitter.addListener(EVENT_TOOLBAR_CHANGE, function (type) {
                _this30.setState({
                    selected: type === _this30.props.type
                });
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.listener) {
                this.listener.remove();
            }
        }
    }]);

    return DrawingToolbar;
}(_react.PureComponent);

DrawingToolbar.propTypes = {
    children: _propTypes2.default.any,
    onClick: _propTypes2.default.func,
    //绘制的类型:如LineDrawing
    type: _propTypes2.default.string,
    style: _propTypes2.default.object
};

var NoneToolbar = exports.NoneToolbar = function (_PureComponent3) {
    _inherits(NoneToolbar, _PureComponent3);

    function NoneToolbar() {
        _classCallCheck(this, NoneToolbar);

        return _possibleConstructorReturn(this, (NoneToolbar.__proto__ || Object.getPrototypeOf(NoneToolbar)).apply(this, arguments));
    }

    _createClass(NoneToolbar, [{
        key: 'render',
        value: function render() {
            var _this32 = this;

            return _react2.default.createElement(
                DrawingToolbar,
                { style: this.props.style,
                    onClick: function onClick() {
                        var graph = _this32.props.graph;

                        var svg = d3.select(graph.ele);
                        svg.on("mousedown", null).on("mousemove", null).on("mouseup", null);
                    },
                    type: this.type },
                _react2.default.createElement(
                    'text',
                    { y: 20, fontSize: 12 },
                    'none'
                )
            );
        }
    }, {
        key: 'type',
        get: function get() {
            return "";
        }
    }]);

    return NoneToolbar;
}(_react.PureComponent);

NoneToolbar.propTypes = {
    onClick: _propTypes2.default.func,
    style: _propTypes2.default.object,
    graph: _propTypes2.default.object.isRequired
};

var LineToolbar = exports.LineToolbar = function (_PureComponent4) {
    _inherits(LineToolbar, _PureComponent4);

    function LineToolbar() {
        _classCallCheck(this, LineToolbar);

        return _possibleConstructorReturn(this, (LineToolbar.__proto__ || Object.getPrototypeOf(LineToolbar)).apply(this, arguments));
    }

    _createClass(LineToolbar, [{
        key: 'render',
        value: function render() {
            var _this34 = this;

            return _react2.default.createElement(
                DrawingToolbar,
                { style: this.props.style,
                    onClick: function onClick() {
                        var graph = _this34.props.graph;

                        var svg = d3.select(graph.ele);
                        svg.on("mousedown", function () {
                            var point = graph.getPointFromScreen(d3.event.offsetX, d3.event.offsetY);
                            var drawing = new LineDrawing({
                                attrs: {
                                    x1: point.x,
                                    y1: point.y,
                                    x2: point.x,
                                    y2: point.y
                                }
                            });
                            _this34._id = drawing.id;
                            graph.doActions([new DrawAction(drawing)]);
                        }).on("mousemove", function () {
                            if (_this34._id) {
                                var point = graph.getPointFromScreen(d3.event.offsetX, d3.event.offsetY);
                                graph.doActions([new ReDrawAction(_this34._id, {
                                    attrs: {
                                        x2: { $set: point.x },
                                        y2: { $set: point.y }
                                    }
                                })]);
                            }
                        }).on("mouseup", function () {
                            delete _this34._id;
                        });
                    },
                    type: this.type },
                _react2.default.createElement('line', { x1: 10, y1: 10, x2: 30, y2: 30, stroke: "#888888" })
            );
        }
    }, {
        key: 'type',
        get: function get() {
            return "LineDrawing";
        }
    }]);

    return LineToolbar;
}(_react.PureComponent);

LineToolbar.propTypes = {
    onClick: _propTypes2.default.func,
    style: _propTypes2.default.object,
    graph: _propTypes2.default.object.isRequired
};

var CircleToolbar = exports.CircleToolbar = function (_PureComponent5) {
    _inherits(CircleToolbar, _PureComponent5);

    function CircleToolbar() {
        _classCallCheck(this, CircleToolbar);

        return _possibleConstructorReturn(this, (CircleToolbar.__proto__ || Object.getPrototypeOf(CircleToolbar)).apply(this, arguments));
    }

    _createClass(CircleToolbar, [{
        key: 'render',
        value: function render() {
            var _this36 = this;

            return _react2.default.createElement(
                DrawingToolbar,
                { style: this.props.style,
                    onClick: function onClick() {
                        var graph = _this36.props.graph;

                        var svg = d3.select(_this36.props.graph.ele);
                        svg.on("mousedown", function () {
                            var point = graph.getPointFromScreen(d3.event.offsetX, d3.event.offsetY);
                            var drawing = new CircleDrawing({
                                attrs: {
                                    cx: point.x,
                                    cy: point.y
                                }
                            });
                            graph.doActions([new DrawAction(drawing)]);
                        });
                    },
                    type: this.type },
                _react2.default.createElement('circle', { cx: 20, cy: 20, r: 8, stroke: "#888888", fill: "#888888" })
            );
        }
    }, {
        key: 'type',
        get: function get() {
            return "CircleDrawing";
        }
    }]);

    return CircleToolbar;
}(_react.PureComponent);

CircleToolbar.propTypes = {
    onClick: _propTypes2.default.func,
    style: _propTypes2.default.object,
    graph: _propTypes2.default.object.isRequired
};

var LinkToolbar = exports.LinkToolbar = function (_PureComponent6) {
    _inherits(LinkToolbar, _PureComponent6);

    function LinkToolbar() {
        _classCallCheck(this, LinkToolbar);

        return _possibleConstructorReturn(this, (LinkToolbar.__proto__ || Object.getPrototypeOf(LinkToolbar)).apply(this, arguments));
    }

    _createClass(LinkToolbar, [{
        key: 'getShapeID',
        value: function getShapeID(ele) {
            try {
                return ele.attributes['shape-id'].nodeValue;
            } catch (ex) {
                return null;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this38 = this;

            return _react2.default.createElement(
                DrawingToolbar,
                { style: this.props.style,
                    onClick: function onClick() {
                        var graph = _this38.props.graph;

                        var svg = d3.select(graph.ele);
                        svg.on("mousedown", function () {
                            var event = d3.event;
                            _this38._sourceID = _this38.getShapeID(event.target);
                        }).on("mouseup", function () {
                            var event = d3.event;
                            var targetID = _this38.getShapeID(event.target);
                            if (_this38._sourceID && targetID) {
                                graph.doActions([new DrawAction(new LinkDrawing({
                                    sourceId: _this38._sourceID,
                                    targetId: targetID
                                }))]);
                            }
                            delete _this38._sourceID;
                        });
                    },
                    type: this.type },
                _react2.default.createElement('circle', { cx: 10, cy: 10, r: 2, stroke: "#888888", fill: "#888888" }),
                _react2.default.createElement('circle', { cx: 30, cy: 30, r: 2, stroke: "#888888", fill: "#888888" }),
                _react2.default.createElement('path', { d: 'M 10 10 S 20 10, 20 20 S 20 30, 30 30', stroke: "#888888", fill: "transparent" })
            );
        }
    }, {
        key: 'type',
        get: function get() {
            return "LinkDrawing";
        }
    }]);

    return LinkToolbar;
}(_react.PureComponent);

LinkToolbar.propTypes = {
    onClick: _propTypes2.default.func,
    style: _propTypes2.default.object,
    graph: _propTypes2.default.object.isRequired
};

var ArrowLinkToolbar = exports.ArrowLinkToolbar = function (_PureComponent7) {
    _inherits(ArrowLinkToolbar, _PureComponent7);

    function ArrowLinkToolbar() {
        _classCallCheck(this, ArrowLinkToolbar);

        return _possibleConstructorReturn(this, (ArrowLinkToolbar.__proto__ || Object.getPrototypeOf(ArrowLinkToolbar)).apply(this, arguments));
    }

    _createClass(ArrowLinkToolbar, [{
        key: 'getShapeID',
        value: function getShapeID(ele) {
            try {
                return ele.attributes['shape-id'].nodeValue;
            } catch (ex) {
                return null;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this40 = this;

            var arrowPoint = getArrowPoints({ x: 20, y: 25 }, { x: 30, y: 30 }, 5);
            var arrowPath = arrowPoint.map(function (p, i) {
                if (i === 0) {
                    return 'M ' + p.x + ' ' + p.y;
                }
                return 'L ' + p.x + ' ' + p.y;
            });
            return _react2.default.createElement(
                DrawingToolbar,
                { style: this.props.style,
                    onClick: function onClick() {
                        var graph = _this40.props.graph;

                        var svg = d3.select(graph.ele);
                        svg.on("mousedown", function () {
                            var event = d3.event;
                            _this40._sourceID = _this40.getShapeID(event.target);
                        }).on("mouseup", function () {
                            var event = d3.event;
                            var targetID = _this40.getShapeID(event.target);
                            if (_this40._sourceID && targetID) {
                                graph.doActions([new DrawAction(new ArrowLinkDrawing({
                                    sourceId: _this40._sourceID,
                                    targetId: targetID
                                }))]);
                            }
                            delete _this40._sourceID;
                        });
                    },
                    type: this.type },
                _react2.default.createElement('path', { d: 'M 10 10 S 20 15, 20 20 S 20 25, 30 30', stroke: "#888888", fill: "transparent" }),
                _react2.default.createElement('path', { d: [].concat(_toConsumableArray(arrowPath), ["Z"]).join(" "), stroke: "#888888", fill: "#888888" })
            );
        }
    }, {
        key: 'type',
        get: function get() {
            return "ArrowLinkDrawing";
        }
    }]);

    return ArrowLinkToolbar;
}(_react.PureComponent);

//#endregion

//#region D3Graph
/**
 * 运筹学图形D3
 * */


ArrowLinkToolbar.propTypes = {
    onClick: _propTypes2.default.func,
    style: _propTypes2.default.object,
    graph: _propTypes2.default.object.isRequired
};

var D3Graph = function (_PureComponent8) {
    _inherits(D3Graph, _PureComponent8);

    _createClass(D3Graph, [{
        key: 'scale',

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
        get: function get() {
            return this.props.scale;
        }
    }]);

    function D3Graph(props) {
        _classCallCheck(this, D3Graph);

        var _this41 = _possibleConstructorReturn(this, (D3Graph.__proto__ || Object.getPrototypeOf(D3Graph)).call(this, props));

        _this41.ele = null;
        //画布中已有的图形
        _this41.shapes = [];
        //已经选中的图形的id
        _this41.selectedShapes = [];
        //绘制类型
        // this.definedDrawing = Object.assign({}, builtinDefinedDrawing, this.props.customDefinedDrawing);
        _this41.playingTimer = null;
        return _this41;
    }

    /**
     * 根据id查找对应的图形
     * */


    _createClass(D3Graph, [{
        key: 'findShapeById',
        value: function findShapeById(id) {
            var index = this.shapes.findIndex(function (f) {
                return f.id === id;
            });
            return this.shapes[index];
        }
    }, {
        key: 'getSelectedShapes',
        value: function getSelectedShapes() {
            return this.selectedShapes;
        }

        /**
         * 根据坐标系计算x值
         * */

    }, {
        key: 'getX',
        value: function getX(value) {
            return this.props.original.x + parseFloat(value) * this.props.scale;
        }

        /**
         * 根据坐标系计算y值
         * */

    }, {
        key: 'getY',
        value: function getY(value) {
            if (this.props.coordinateType === coordinateTypeEnum.screen) {
                return this.props.original.y + parseFloat(value) * this.props.scale;
            }
            return this.props.original.y - parseFloat(value) * this.props.scale;
        }

        /**
         * 将屏幕坐标转换成对应坐标系坐标
         * */

    }, {
        key: 'getPointFromScreen',
        value: function getPointFromScreen(screenX, screenY) {
            if (this.props.coordinateType === coordinateTypeEnum.math) {
                return {
                    x: (screenX - this.props.original.x) / this.props.scale,
                    y: (this.props.original.y - screenY) / this.props.scale
                };
            }
            return { x: screenX / this.props.scale, y: screenY / this.props.scale };
        }
    }, {
        key: 'doActions',
        value: function doActions(actions) {
            var _this42 = this;

            //#region draw
            var drawActions = actions.filter(function (f) {
                return f.type === actionTypeEnums.draw;
            });
            if (drawActions.length > 0) {
                console.log('draw : ' + drawActions.map(function (f) {
                    return f.params.type + '(id=' + f.params.id + ')';
                }).join(','));
                this.shapes = this.shapes.concat(drawActions.map(function (data) {
                    return data.params;
                }));
                this.drawShapes(this.shapes);
            }
            //#endregion

            //#region redraw
            var redrawActions = actions.filter(function (f) {
                return f.type === actionTypeEnums.redraw;
            });
            if (redrawActions.length > 0) {
                console.log('redraw : ' + redrawActions.map(function (f) {
                    return f.params.id;
                }).join(','));
                var shapes = [];
                redrawActions.forEach(function (action) {
                    var index = _this42.shapes.findIndex(function (f) {
                        return f.id === action.params.id;
                    });
                    if (index >= 0) {
                        _this42.shapes[index] = (0, _immutabilityHelper2.default)(_this42.shapes[index], action.params.state);
                        shapes.push(_this42.shapes[index]);
                    }
                });
                this.drawShapes(shapes);
            }
            //#endregion

            //#region select
            var selectActions = actions.filter(function (f) {
                return f.type === actionTypeEnums.select;
            });
            if (selectActions.length > 0) {
                console.log(this.props.selectMode + ' select : ' + selectActions.map(function (f) {
                    return f.params;
                }).join(','));
                if (this.props.selectMode === selectModeEnums.single) {
                    this.doActions(this.selectedShapes.map(function (shape) {
                        return new UnSelectAction(shape.id);
                    }));
                    this.selectedShapes = selectActions.map(function (f) {
                        var id = f.params;
                        var shape = _this42.findShapeById(id);
                        shape.selected = true;
                        return shape;
                    });
                } else {
                    this.selectedShapes = this.selectedShapes.concat(selectActions.map(function (f) {
                        var id = f.params;
                        var shape = _this42.findShapeById(id);
                        shape.selected = true;
                        return shape;
                    }));
                }
                this.drawShapes(this.selectedShapes);
            }
            //#endregion

            //#region unselect
            var unSelectActions = actions.filter(function (f) {
                return f.type === actionTypeEnums.unselect;
            });
            if (unSelectActions.length > 0) {
                console.log('unselect : ' + unSelectActions.map(function (f) {
                    return f.params;
                }).join(','));
                var unSelectShape = unSelectActions.map(function (f) {
                    var id = f.params;
                    var shape = _this42.findShapeById(id);
                    shape.selected = false;
                    return shape;
                });
                this.selectedShapes = this.selectedShapes.filter(function (f) {
                    return unSelectActions.findIndex(function (ff) {
                        return ff.id !== f.id;
                    }) >= 0;
                });
                this.drawShapes(unSelectShape);
            }
            //#endregion

            //#region delete
            var deleteActions = actions.filter(function (f) {
                return f.type === actionTypeEnums.delete;
            });
            if (deleteActions.length > 0) {
                var ids = deleteActions.map(function (f) {
                    return f.params;
                });
                console.log('delete : ' + ids.join(","));
                //删除的图形
                var deletedShapes = this.shapes.filter(function (s) {
                    return ids.indexOf(s.id) >= 0;
                });
                //删除后的图形
                this.shapes = this.shapes.filter(function (s) {
                    return ids.indexOf(s.id) <= 0;
                });
                deletedShapes.forEach(function (s) {
                    if (s.selection) {
                        //删除图形
                        s.selection.remove();
                        delete s.selection;
                    }
                });
            }
            //#endregion

            //#region clear
            var clearActions = actions.filter(function (f) {
                return f.type === actionTypeEnums.clear;
            });
            if (clearActions.length > 0) {
                this.doActions(this.shapes.map(function (f) {
                    return new DeleteAction(f.id);
                }));
            }
            //#endregion
        }
    }, {
        key: 'drawShapes',
        value: function drawShapes(shapes) {
            var _this43 = this;

            shapes.forEach(function (shape) {
                //初始化
                if (!shape.ready) {
                    shape.initialize(_this43);
                }
                shape.render();
            });
        }
    }, {
        key: 'play',
        value: function play(actions, playingOps) {
            var _this44 = this;

            var actionIndex = 0;
            var next = function next() {
                if (actionIndex >= actions.length) {
                    return;
                }
                var action = actions[actionIndex];
                _this44.doActions([action]);
                actionIndex++;
                _this44.playingTimer = setTimeout(next.bind(_this44), action.nextInterval ? action.nextInterval : (0, _objectPath.get)(playingOps, "interval", 1000));
            };
            next();
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (this.playingTimer) {
                clearTimeout(this.playingTimer);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this45 = this;

            return _react2.default.createElement(
                _WorkSpace2.default,
                { actions: this.props.renderToolbar(this) },
                _react2.default.createElement('svg', _extends({ ref: function ref(_ref) {
                        return _this45.ele = _ref;
                    } }, this.props.attrs))
            );
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.stop();
            if (nextProps.mode === graphModeEnum.draw) {
                this.doActions(nextProps.actions);
            }
            if (nextProps.mode === graphModeEnum.playing) {
                this.play(nextProps.actions, nextProps.playingOption);
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.mode === graphModeEnum.draw) {
                this.doActions(this.props.actions);
            }
            if (this.props.mode === graphModeEnum.playing) {
                this.play(this.props.actions);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.stop();
        }
    }]);

    return D3Graph;
}(_react.PureComponent);
//#endregion


D3Graph.propTypes = {
    attrs: _propTypes2.default.object,
    //action
    actions: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        type: _propTypes2.default.oneOf(Object.keys(actionTypeEnums)).isRequired,
        params: _propTypes2.default.any
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
    selectMode: _propTypes2.default.oneOf(Object.keys(selectModeEnums)),
    //自定义绘制类型
    // customDefinedDrawing: PropTypes.object,
    // onDrawTypeChange: PropTypes.func,
    original: _propTypes2.default.shape({
        x: _propTypes2.default.number,
        y: _propTypes2.default.number
    }),
    coordinateType: _propTypes2.default.oneOf(Object.keys(coordinateTypeEnum)),
    mode: _propTypes2.default.oneOf(Object.keys(graphModeEnum)),
    playingOption: _propTypes2.default.shape({
        interval: _propTypes2.default.number
    }),
    renderToolbar: _propTypes2.default.func,
    scale: _propTypes2.default.number
};
D3Graph.defaultProps = {
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
    renderToolbar: function renderToolbar() {
        return null;
    },
    scale: 1
};
exports.default = D3Graph;