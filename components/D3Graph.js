'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CircleToolbar = exports.LineToolbar = exports.Toolbar = exports.TextDrawing = exports.PathDrawing = exports.LinkDrawing = exports.ArrowLinkDrawing = exports.NumberScaleDrawing = exports.RectDrawing = exports.DotDrawing = exports.CircleDrawing = exports.LineDrawing = exports.Drawing = exports.ReDrawAction = exports.DeleteAction = exports.UnSelectAction = exports.SelectAction = exports.DrawAction = exports.coordinateTypeEnum = exports.graphModeEnum = exports.actionTypeEnums = undefined;

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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
 * @property {string} move - 移动
 * @property {string} undo - 撤销
 * @property {string} data - 数据操作
 * */
var actionTypeEnums = exports.actionTypeEnums = {
	draw: "draw",
	redraw: "redraw",
	select: "select",
	unselect: "unselect",
	delete: "delete",
	move: "move",
	undo: "undo",
	data: "data"
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

/**
 * 反序列化drawing
 * */
function fromDrawing(drawingOps) {
	var func = drawingIndex[drawingOps.type];
	return new func(drawingOps.option);
}

/**
 * 反序列化actions
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
 * 重绘action
 * */

var ReDrawAction = exports.ReDrawAction = function (_Action5) {
	_inherits(ReDrawAction, _Action5);

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
 * */

var Drawing = exports.Drawing = function () {
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
			var attrs = Object.assign({}, this.defaultAttrs, this.attrs, this.selected ? this.selectedAttrs : {});
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
		value: function updateAttrs(attrs) {
			if (this.selection) {
				this.selection.call(function (self) {
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
		key: 'defaultAttrs',
		get: function get() {
			throw new Error('property `defaultAttrs` is not implementation');
		}

		/**
   * 选中时的attribute
   * @readonly
   * @member {Object}
   * */

	}, {
		key: 'selectedAttrs',
		get: function get() {
			throw new Error('property `selectedAttrs` is not implementation');
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

		var _this6 = _possibleConstructorReturn(this, (LineDrawing.__proto__ || Object.getPrototypeOf(LineDrawing)).call(this, option));

		_this6.type = "line";
		return _this6;
	}

	_createClass(LineDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this7 = this;

			_get(LineDrawing.prototype.__proto__ || Object.getPrototypeOf(LineDrawing.prototype), 'initialize', this).call(this, graph);
			this.selection = d3.select(graph.ele).append("line");
			this.selection.on("click", function () {
				_this7.select();
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

		var _this8 = _possibleConstructorReturn(this, (CircleDrawing.__proto__ || Object.getPrototypeOf(CircleDrawing)).call(this, option));

		_this8.type = "circle";
		return _this8;
	}

	_createClass(CircleDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this9 = this;

			_get(CircleDrawing.prototype.__proto__ || Object.getPrototypeOf(CircleDrawing.prototype), 'initialize', this).call(this, graph);
			this.selection = d3.select(graph.ele).append("circle");
			this.selection.on("click", function () {
				_this9.select();
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

		var _this10 = _possibleConstructorReturn(this, (DotDrawing.__proto__ || Object.getPrototypeOf(DotDrawing)).call(this, option));

		_this10.type = "dot";
		return _this10;
	}

	_createClass(DotDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this11 = this;

			_get(DotDrawing.prototype.__proto__ || Object.getPrototypeOf(DotDrawing.prototype), 'initialize', this).call(this, graph);
			this.selection = d3.select(graph.ele).append("circle");
			this.selection.on("click", function () {
				_this11.select();
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

		var _this12 = _possibleConstructorReturn(this, (RectDrawing.__proto__ || Object.getPrototypeOf(RectDrawing)).call(this, option));

		_this12.type = "rect";
		return _this12;
	}

	_createClass(RectDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this13 = this;

			_get(RectDrawing.prototype.__proto__ || Object.getPrototypeOf(RectDrawing.prototype), 'initialize', this).call(this, graph);
			this.selection = d3.select(graph.ele).append("path");
			this.selection.on("click", function () {
				_this13.select();
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

		var _this14 = _possibleConstructorReturn(this, (NumberScaleDrawing.__proto__ || Object.getPrototypeOf(NumberScaleDrawing)).call(this, option));

		_this14.type = "number-scale";
		_this14.original = (0, _objectPath.get)(option, "original", {
			x: 20,
			y: 280
		});
		_this14.xAxisLength = (0, _objectPath.get)(option, "xAxisLength", 360);
		_this14.yAxisLength = (0, _objectPath.get)(option, "yAxisLength", 260);
		//刻度的间距大小
		_this14.scale = (0, _objectPath.get)(option, "scale", 20);
		return _this14;
	}

	_createClass(NumberScaleDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this15 = this;

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
				var p1 = new Point(originalPoint.x + _this15.scale * i, originalPoint.y);
				var p2 = new Point(originalPoint.x + _this15.scale * i, originalPoint.y - 3);
				_this15.selection.append("line").attr("x1", p1.x).attr("y1", p1.y).attr("x2", p2.x).attr("y2", p2.y).attr("fill", "none").attr("stroke", "black").attr("stroke-width", 1);
				_this15.selection.append("text").text(i).attr("x", p1.x).attr("y", p1.y + 10).attr("style", "font-size:10px");
			});
			//yAxis
			this.selection.append("line").attr("x1", originalPoint.x).attr("y1", originalPoint.y).attr("x2", yEndPoint.x).attr("y2", yEndPoint.y).attr("stroke", "black").attr("stroke-width", 1);
			//画y轴的箭头
			this.selection.append("path").attr("d", 'M ' + yEndPoint.x + ' ' + yEndPoint.y + ' L ' + (yEndPoint.x + 5) + ' ' + yEndPoint.y + ' L ' + yEndPoint.x + ' ' + (yEndPoint.y - 15) + ' L ' + (yEndPoint.x - 5) + ' ' + yEndPoint.y + ' Z');
			//画y轴的刻度
			var yScaleCount = Math.floor(Math.abs(yEndPoint.y - originalPoint.y) / this.scale);
			Array.apply(null, { length: yScaleCount }).forEach(function (v, i) {
				var p1 = new Point(originalPoint.x, originalPoint.y - _this15.scale * i);
				var p2 = new Point(originalPoint.x + 3, originalPoint.y - _this15.scale * i);
				_this15.selection.append("line").attr("x1", p1.x).attr("y1", p1.y).attr("x2", p2.x).attr("y2", p2.y).attr("fill", "none").attr("stroke", "black").attr("stroke-width", 1);
				_this15.selection.append("text").text(i).attr("x", p1.x - 15).attr("y", p1.y).attr("style", "font-size:10px");
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
 * */

var ArrowLinkDrawing = exports.ArrowLinkDrawing = function (_Drawing6) {
	_inherits(ArrowLinkDrawing, _Drawing6);

	function ArrowLinkDrawing(option) {
		_classCallCheck(this, ArrowLinkDrawing);

		var _this16 = _possibleConstructorReturn(this, (ArrowLinkDrawing.__proto__ || Object.getPrototypeOf(ArrowLinkDrawing)).call(this, option));

		_this16.type = "arrow-link";
		_this16.sourceId = (0, _objectPath.get)(option, "sourceId");
		if (!_this16.sourceId) {
			throw new Error('ArrowLinkDrawing option require sourceId property');
		}
		_this16.targetId = (0, _objectPath.get)(option, "targetId");
		if (!_this16.targetId) {
			throw new Error('ArrowLinkDrawing option require targetId property');
		}
		_this16.source = null;
		_this16.target = null;
		return _this16;
	}

	_createClass(ArrowLinkDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this17 = this;

			_get(ArrowLinkDrawing.prototype.__proto__ || Object.getPrototypeOf(ArrowLinkDrawing.prototype), 'initialize', this).call(this, graph);
			this.source = this.graph.findShapeById(this.sourceId);
			this.target = this.graph.findShapeById(this.targetId);
			this.selection = d3.select(graph.ele).append("path");
			this.selection.on("click", function () {
				_this17.select();
			});
		}
	}, {
		key: 'render',
		value: function render() {
			//计算link的位置信息
			var p1 = this.source.getLinkPoint();
			var p2 = this.target.getLinkPoint();
			this.attrs = (0, _immutabilityHelper2.default)(this.attrs, {
				d: { $set: this.getArrowLinkPath(p1, p2).join(' ') }
			});
			_get(ArrowLinkDrawing.prototype.__proto__ || Object.getPrototypeOf(ArrowLinkDrawing.prototype), 'render', this).call(this);
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
 * */

var LinkDrawing = exports.LinkDrawing = function (_Drawing7) {
	_inherits(LinkDrawing, _Drawing7);

	function LinkDrawing(option) {
		_classCallCheck(this, LinkDrawing);

		var _this18 = _possibleConstructorReturn(this, (LinkDrawing.__proto__ || Object.getPrototypeOf(LinkDrawing)).call(this, option));

		_this18.type = "link";
		_this18.sourceId = (0, _objectPath.get)(option, "sourceId");
		if (!_this18.sourceId) {
			throw new Error('LinkDrawing option require sourceId property');
		}
		_this18.targetId = (0, _objectPath.get)(option, "targetId");
		if (!_this18.targetId) {
			throw new Error('LinkDrawing option require targetId property');
		}
		_this18.source = null;
		_this18.target = null;
		return _this18;
	}

	_createClass(LinkDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this19 = this;

			_get(LinkDrawing.prototype.__proto__ || Object.getPrototypeOf(LinkDrawing.prototype), 'initialize', this).call(this, graph);
			this.source = this.graph.findShapeById(this.sourceId);
			this.target = this.graph.findShapeById(this.targetId);
			this.selection = d3.select(graph.ele).append("line");
			this.selection.on("click", function () {
				_this19.select();
			});
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

		var _this20 = _possibleConstructorReturn(this, (PathDrawing.__proto__ || Object.getPrototypeOf(PathDrawing)).call(this, option));

		_this20.type = "path";
		_this20.d = (0, _objectPath.get)(option, "d", []);
		return _this20;
	}

	_createClass(PathDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this21 = this;

			_get(PathDrawing.prototype.__proto__ || Object.getPrototypeOf(PathDrawing.prototype), 'initialize', this).call(this, graph);
			this.selection = d3.select(graph.ele).append("path");
			this.selection.on("click", function () {
				_this21.select();
			});
		}
	}, {
		key: 'render',
		value: function render() {
			if (!this.attrs.d) {
				var d = this.d.map(function (point, index) {
					if (index === 0) {
						return 'M ' + point.x + ' ' + point.y;
					}
					return 'L ' + point.x + ' ' + point.y;
				});
				d.push("Z");
				this.attrs.d = d.join(" ");
			}
			console.log(this.attrs.d);
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

		var _this22 = _possibleConstructorReturn(this, (TextDrawing.__proto__ || Object.getPrototypeOf(TextDrawing)).call(this, option));

		_this22.type = "text";
		return _this22;
	}

	_createClass(TextDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this23 = this;

			_get(TextDrawing.prototype.__proto__ || Object.getPrototypeOf(TextDrawing.prototype), 'initialize', this).call(this, graph);
			this.selection = d3.select(graph.ele).append("text");
			this.selection.on("click", function () {
				_this23.select();
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
//#endregion

//#region Toolbar

var Toolbar = exports.Toolbar = function (_PureComponent) {
	_inherits(Toolbar, _PureComponent);

	function Toolbar(props) {
		_classCallCheck(this, Toolbar);

		var _this24 = _possibleConstructorReturn(this, (Toolbar.__proto__ || Object.getPrototypeOf(Toolbar)).call(this, props));

		_this24.listener = null;
		_this24.state = {
			selected: false
		};
		return _this24;
	}

	_createClass(Toolbar, [{
		key: 'render',
		value: function render() {
			var _this25 = this;

			return _react2.default.createElement(
				'svg',
				_extends({}, this.attrs, { onClick: function onClick() {
						var _props;

						emitter.emit(EVENT_TOOLBAR_CHANGE, _this25.props.type);
						_this25.props.onClick && (_props = _this25.props).onClick.apply(_props, arguments);
					}, style: Object.assign({}, this.props.style, this.state.selected ? { backgroundColor: "#D6D6D6" } : {}) }),
				this.props.children
			);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this26 = this;

			this.listener = emitter.addListener(EVENT_TOOLBAR_CHANGE, function (type) {
				_this26.setState({
					selected: type === _this26.props.type
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
	//绘制的类型:如LineDrawing
	type: _propTypes2.default.string.isRequired,
	style: _propTypes2.default.object
};

var LineToolbar = exports.LineToolbar = function (_PureComponent2) {
	_inherits(LineToolbar, _PureComponent2);

	function LineToolbar() {
		_classCallCheck(this, LineToolbar);

		return _possibleConstructorReturn(this, (LineToolbar.__proto__ || Object.getPrototypeOf(LineToolbar)).apply(this, arguments));
	}

	_createClass(LineToolbar, [{
		key: 'render',
		value: function render() {
			var _this28 = this;

			return _react2.default.createElement(
				Toolbar,
				{ style: this.props.style,
					onClick: function onClick() {
						var graph = _this28.props.graph;

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
							_this28._id = drawing.id;
							graph.doActions([new DrawAction(drawing)]);
						}).on("mousemove", function () {
							if (_this28._id) {
								var point = graph.getPointFromScreen(d3.event.offsetX, d3.event.offsetY);
								graph.doActions([new ReDrawAction(_this28._id, {
									attrs: {
										x2: { $set: point.x },
										y2: { $set: point.y }
									}
								})]);
							}
						}).on("mouseup", function () {
							delete _this28._id;
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

var CircleToolbar = exports.CircleToolbar = function (_PureComponent3) {
	_inherits(CircleToolbar, _PureComponent3);

	function CircleToolbar() {
		_classCallCheck(this, CircleToolbar);

		return _possibleConstructorReturn(this, (CircleToolbar.__proto__ || Object.getPrototypeOf(CircleToolbar)).apply(this, arguments));
	}

	_createClass(CircleToolbar, [{
		key: 'render',
		value: function render() {
			var _this30 = this;

			return _react2.default.createElement(
				Toolbar,
				{ style: this.props.style,
					onClick: function onClick() {
						var graph = _this30.props.graph;

						var svg = d3.select(_this30.props.graph.ele);
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

//#endregion

//#region D3Graph
/**
 * 运筹学图形D3
 * */


CircleToolbar.propTypes = {
	onClick: _propTypes2.default.func,
	style: _propTypes2.default.object,
	graph: _propTypes2.default.object.isRequired
};

var D3Graph = function (_PureComponent4) {
	_inherits(D3Graph, _PureComponent4);

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
	function D3Graph(props) {
		_classCallCheck(this, D3Graph);

		var _this31 = _possibleConstructorReturn(this, (D3Graph.__proto__ || Object.getPrototypeOf(D3Graph)).call(this, props));

		_this31.ele = null;
		//画布中已有的图形
		_this31.shapes = [];
		//已经选中的图形的id
		_this31.selectedShapes = [];
		//绘制类型
		// this.definedDrawing = Object.assign({}, builtinDefinedDrawing, this.props.customDefinedDrawing);
		return _this31;
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
					x: screenX - this.props.original.x,
					y: this.props.original.y - screenY
				};
			}
			return { x: screenX, y: screenY };
		}
	}, {
		key: 'doActions',
		value: function doActions(actions) {
			var _this32 = this;

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
					var index = _this32.shapes.findIndex(function (f) {
						return f.id === action.params.id;
					});
					if (index >= 0) {
						_this32.shapes[index] = (0, _immutabilityHelper2.default)(_this32.shapes[index], action.params.state);
						shapes.push(_this32.shapes[index]);
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
						var shape = _this32.findShapeById(id);
						shape.selected = true;
						return shape;
					});
				} else {
					this.selectedShapes = this.selectedShapes.concat(selectActions.map(function (f) {
						var id = f.params;
						var shape = _this32.findShapeById(id);
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
					var shape = _this32.findShapeById(id);
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
		}
	}, {
		key: 'drawShapes',
		value: function drawShapes(shapes) {
			var _this33 = this;

			shapes.forEach(function (shape) {
				//初始化
				if (!shape.ready) {
					shape.initialize(_this33);
				}
				shape.render();
			});
		}
	}, {
		key: 'play',
		value: function play(actions, playingOps) {
			var _this34 = this;

			var actionIndex = 0;
			var next = function next() {
				if (actionIndex >= actions.length) {
					return;
				}
				var action = actions[actionIndex];
				_this34.doActions([action]);
				actionIndex++;
				setTimeout(next.bind(_this34), action.nextInterval ? action.nextInterval : (0, _objectPath.get)(playingOps, "interval", 1000));
			};
			next();
		}
	}, {
		key: 'render',
		value: function render() {
			var _this35 = this;

			return _react2.default.createElement(
				_WorkSpace2.default,
				{ actions: this.props.renderToolbar(this) },
				_react2.default.createElement('svg', _extends({ ref: function ref(_ref) {
						return _this35.ele = _ref;
					} }, this.props.attrs))
			);
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
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