'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LinkDrawing = exports.ArrowLinkDrawing = exports.NumberScaleDrawing = exports.DotDrawing = exports.CircleDrawing = exports.LineDrawing = exports.Drawing = exports.ReDrawAction = exports.UnSelectAction = exports.SelectAction = exports.DrawAction = exports.actionTypeEnums = undefined;

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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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


/**
 * @typedef
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

var drawingIndex = {};
var actionIndex = {};

function registerDrawing(name, drawing) {
	drawingIndex[name] = drawing;
}

function fromDrawing(drawingOps) {
	var func = drawingIndex[drawingOps.type];
	return new func(drawingOps.option);
}

function fromActions(actions) {
	return actions.map(function (action) {
		var type = action.type;
		var args = action.params;
		var func = actionIndex[type];
		if (!func) {
			throw new Error('action ' + type + ' is not defined');
		}
		switch (type) {
			case actionTypeEnums.draw:
				return new (Function.prototype.bind.apply(actionIndex[type], [null].concat(_toConsumableArray(args.map(function (arg) {
					return fromDrawing(arg);
				})))))();
			default:
				return new (Function.prototype.bind.apply(actionIndex[type], [null].concat(_toConsumableArray(args))))();
		}
	});
}

var Point = function Point(x, y) {
	_classCallCheck(this, Point);

	this.x = x;
	this.y = y;
};

var Action = function () {
	_createClass(Action, null, [{
		key: 'fromActions',
		value: function fromActions() {}
	}]);

	function Action(type, params) {
		_classCallCheck(this, Action);

		this.type = type;
		this.params = params;
	}

	return Action;
}();

/**
 * 绘图action
 * */


var DrawAction = exports.DrawAction = function (_Action) {
	_inherits(DrawAction, _Action);

	function DrawAction(drawingOps) {
		_classCallCheck(this, DrawAction);

		return _possibleConstructorReturn(this, (DrawAction.__proto__ || Object.getPrototypeOf(DrawAction)).call(this, actionTypeEnums.draw, drawingOps));
	}

	return DrawAction;
}(Action);

actionIndex[actionTypeEnums.draw] = DrawAction;

/**
 * 选择action
 * */

var SelectAction = exports.SelectAction = function (_Action2) {
	_inherits(SelectAction, _Action2);

	function SelectAction(shapeId) {
		_classCallCheck(this, SelectAction);

		return _possibleConstructorReturn(this, (SelectAction.__proto__ || Object.getPrototypeOf(SelectAction)).call(this, actionTypeEnums.select, shapeId));
	}

	return SelectAction;
}(Action);

actionIndex[actionTypeEnums.select] = SelectAction;

/**
 * 取消选择action
 * */

var UnSelectAction = exports.UnSelectAction = function (_Action3) {
	_inherits(UnSelectAction, _Action3);

	function UnSelectAction(shapeId) {
		_classCallCheck(this, UnSelectAction);

		return _possibleConstructorReturn(this, (UnSelectAction.__proto__ || Object.getPrototypeOf(UnSelectAction)).call(this, actionTypeEnums.unselect, shapeId));
	}

	return UnSelectAction;
}(Action);

actionIndex[actionTypeEnums.unselect] = UnSelectAction;

/**
 * 重绘action
 * */

var ReDrawAction = exports.ReDrawAction = function (_Action4) {
	_inherits(ReDrawAction, _Action4);

	function ReDrawAction(shapeId, state) {
		_classCallCheck(this, ReDrawAction);

		return _possibleConstructorReturn(this, (ReDrawAction.__proto__ || Object.getPrototypeOf(ReDrawAction)).call(this, actionTypeEnums.redraw, {
			id: shapeId,
			state: state
		}));
	}

	return ReDrawAction;
}(Action);

actionIndex[actionTypeEnums.redraw] = ReDrawAction;

/**
 * 绘画接口,所有的绘画类都需要继承这个类并实现相关方法
 * */

var Drawing = exports.Drawing = function () {
	function Drawing(option) {
		_classCallCheck(this, Drawing);

		this.id = (0, _objectPath.get)(option, "id", _guid2.default.raw());
		this.attrs = (0, _objectPath.get)(option, "attrs", {});
		this.text = (0, _objectPath.get)(option, "text", "");
		this.selection = null;
		this.type = null;
		this.graph = null;
		this.ready = false;
		this.selected = false;
	}

	/**
  * 默认的attribute
  * */


	_createClass(Drawing, [{
		key: 'render',


		/**
   * 绘制,更新selection相关
   * */
		value: function render() {
			var attrs = Object.assign({}, this.defaultAttrs, this.attrs, this.selected ? this.selectedAttrs : {});
			if (attrs.x1) {
				attrs.x1 = this.graph.getX(attrs.x1);
			}
			if (attrs.x2) {
				attrs.x2 = this.graph.getX(attrs.x2);
			}
			if (attrs.y1) {
				attrs.y1 = this.graph.getY(attrs.y1);
			}
			if (attrs.y2) {
				attrs.y2 = this.graph.getY(attrs.y2);
			}
			if (attrs.cx) {
				attrs.cx = this.graph.getX(attrs.cx);
			}
			if (attrs.cy) {
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

		var _this5 = _possibleConstructorReturn(this, (LineDrawing.__proto__ || Object.getPrototypeOf(LineDrawing)).call(this, option));

		_this5.type = "line";
		return _this5;
	}

	_createClass(LineDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this6 = this;

			_get(LineDrawing.prototype.__proto__ || Object.getPrototypeOf(LineDrawing.prototype), 'initialize', this).call(this, graph);
			this.selection = d3.select(graph.ele).append("line");
			this.selection.on("click", function () {
				_this6.select();
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

		var _this7 = _possibleConstructorReturn(this, (CircleDrawing.__proto__ || Object.getPrototypeOf(CircleDrawing)).call(this, option));

		_this7.type = "circle";
		return _this7;
	}

	_createClass(CircleDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this8 = this;

			_get(CircleDrawing.prototype.__proto__ || Object.getPrototypeOf(CircleDrawing.prototype), 'initialize', this).call(this, graph);
			this.selection = d3.select(graph.ele).append("circle");
			this.selection.on("click", function () {
				_this8.select();
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

		var _this9 = _possibleConstructorReturn(this, (DotDrawing.__proto__ || Object.getPrototypeOf(DotDrawing)).call(this, option));

		_this9.type = "dot";
		return _this9;
	}

	_createClass(DotDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this10 = this;

			_get(DotDrawing.prototype.__proto__ || Object.getPrototypeOf(DotDrawing.prototype), 'initialize', this).call(this, graph);
			this.selection = d3.select(graph.ele).append("circle");
			this.selection.on("click", function () {
				_this10.select();
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

var RectDrawing = function (_Drawing4) {
	_inherits(RectDrawing, _Drawing4);

	function RectDrawing() {
		_classCallCheck(this, RectDrawing);

		return _possibleConstructorReturn(this, (RectDrawing.__proto__ || Object.getPrototypeOf(RectDrawing)).apply(this, arguments));
	}

	_createClass(RectDrawing, [{
		key: 'render',
		value: function render(svg) {
			return svg.append('path');
		}
	}, {
		key: 'renderToolbar',
		value: function renderToolbar(context, drawType, index) {
			return _react2.default.createElement(
				'a',
				{ key: index, href: 'javascript:void(0)', onClick: function onClick() {
						d3.select(context.ele).on('mousedown', function () {
							this._id = _guid2.default.raw();
							this._mouseDownEvent = d3.event;
							context.doActions([new DrawAction({
								id: this._id,
								type: drawType.type,
								attrs: Object.assign({
									d: 'M ' + d3.event.offsetX + ' ' + d3.event.offsetY + ' l 0 0 z'
								}, drawType.defaultAttrs)
							})]);
						}).on('mousemove', function () {
							if (this._id && this._mouseDownEvent && drawType.type === "rect") {
								var width = d3.event.offsetX - this._mouseDownEvent.offsetX;
								var height = d3.event.offsetY - this._mouseDownEvent.offsetY;
								console.log('width:' + width + ',height:' + height);
								var d = ['M ' + this._mouseDownEvent.offsetX + ' ' + this._mouseDownEvent.offsetY, 'L ' + d3.event.offsetX + ' ' + this._mouseDownEvent.offsetY, 'L ' + d3.event.offsetX + ' ' + d3.event.offsetY, 'L ' + this._mouseDownEvent.offsetX + ' ' + d3.event.offsetY, 'z'];
								//update
								context.doActions([new ReDrawAction(this._id, {
									attrs: {
										d: { $set: d.join(' ') }
									}
								})]);
							}
						}).on("mouseup", function () {
							delete this._id;
							delete this._mouseDownEvent;
						});
					} },
				'Rect'
			);
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

		var _this12 = _possibleConstructorReturn(this, (NumberScaleDrawing.__proto__ || Object.getPrototypeOf(NumberScaleDrawing)).call(this, option));

		_this12.type = "number-scale";
		_this12.grid = (0, _objectPath.get)(option, "grid", {
			top: 20,
			bottom: 20,
			left: 20,
			right: 20
		});
		return _this12;
	}

	_createClass(NumberScaleDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			_get(NumberScaleDrawing.prototype.__proto__ || Object.getPrototypeOf(NumberScaleDrawing.prototype), 'initialize', this).call(this, graph);
			var width = graph.ele.clientWidth;
			var height = graph.ele.clientHeight;
			this.selection = d3.select(graph.ele).append("g");
			//xAxis
			this.selection.append("line").attr("x1", this.grid.left).attr("y1", height - this.grid.bottom).attr("x2", width - this.grid.right).attr("y2", height - this.grid.bottom).attr("stroke", "black").attr("stroke-width", "1px");
			//yAxis
			this.selection.append("line").attr("x1", this.grid.left).attr("y1", height - this.grid.bottom).attr("x2", this.grid.left).attr("y2", this.grid.top).attr("stroke", "black").attr("stroke-width", 1);
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

		var _this13 = _possibleConstructorReturn(this, (ArrowLinkDrawing.__proto__ || Object.getPrototypeOf(ArrowLinkDrawing)).call(this, option));

		_this13.type = "arrow-link";
		_this13.sourceId = (0, _objectPath.get)(option, "sourceId");
		if (!_this13.sourceId) {
			throw new Error('ArrowLinkDrawing option require sourceId property');
		}
		_this13.targetId = (0, _objectPath.get)(option, "targetId");
		if (!_this13.targetId) {
			throw new Error('ArrowLinkDrawing option require targetId property');
		}
		_this13.source = null;
		_this13.target = null;
		return _this13;
	}

	_createClass(ArrowLinkDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this14 = this;

			_get(ArrowLinkDrawing.prototype.__proto__ || Object.getPrototypeOf(ArrowLinkDrawing.prototype), 'initialize', this).call(this, graph);
			this.source = this.graph.findShapeById(this.sourceId);
			this.target = this.graph.findShapeById(this.targetId);
			this.selection = d3.select(graph.ele).append("path");
			this.selection.on("click", function () {
				_this14.select();
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

		var _this15 = _possibleConstructorReturn(this, (LinkDrawing.__proto__ || Object.getPrototypeOf(LinkDrawing)).call(this, option));

		_this15.type = "link";
		_this15.sourceId = (0, _objectPath.get)(option, "sourceId");
		if (!_this15.sourceId) {
			throw new Error('LinkDrawing option require sourceId property');
		}
		_this15.targetId = (0, _objectPath.get)(option, "targetId");
		if (!_this15.targetId) {
			throw new Error('LinkDrawing option require targetId property');
		}
		_this15.source = null;
		_this15.target = null;
		return _this15;
	}

	_createClass(LinkDrawing, [{
		key: 'initialize',
		value: function initialize(graph) {
			var _this16 = this;

			_get(LinkDrawing.prototype.__proto__ || Object.getPrototypeOf(LinkDrawing.prototype), 'initialize', this).call(this, graph);
			this.source = this.graph.findShapeById(this.sourceId);
			this.target = this.graph.findShapeById(this.targetId);
			this.selection = d3.select(graph.ele).append("line");
			this.selection.on("click", function () {
				_this16.select();
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

var TextDrawing = function (_Drawing8) {
	_inherits(TextDrawing, _Drawing8);

	function TextDrawing() {
		_classCallCheck(this, TextDrawing);

		return _possibleConstructorReturn(this, (TextDrawing.__proto__ || Object.getPrototypeOf(TextDrawing)).apply(this, arguments));
	}

	_createClass(TextDrawing, [{
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


var D3Graph = function (_PureComponent) {
	_inherits(D3Graph, _PureComponent);

	/**
  * @property {object} attrs - svg的属性
  * @property {Array} actions - 所有的操作
  * @property {single|multiple} selectMode [single] - 选择模式,是多选还是单选
  * @property {object} original - 坐标原点,默认值{x:0,y:0}
  * @property {screen|math} coordinateType - 坐标系,默认值是屏幕坐标系
  * */
	function D3Graph(props) {
		_classCallCheck(this, D3Graph);

		var _this18 = _possibleConstructorReturn(this, (D3Graph.__proto__ || Object.getPrototypeOf(D3Graph)).call(this, props));

		_this18.ele = null;
		//画布中已有的图形
		_this18.shapes = [];
		//已经选中的图形的id
		_this18.selectedShapes = [];
		//绘制类型
		// this.definedDrawing = Object.assign({}, builtinDefinedDrawing, this.props.customDefinedDrawing);
		return _this18;
	}

	_createClass(D3Graph, [{
		key: 'findShapeById',
		value: function findShapeById(id) {
			var index = this.shapes.findIndex(function (f) {
				return f.id === id;
			});
			return this.shapes[index];
		}
	}, {
		key: 'getX',
		value: function getX(value) {
			return this.props.original.x + parseFloat(value);
		}
	}, {
		key: 'getY',
		value: function getY(value) {
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

	}, {
		key: 'doActions',
		value: function doActions(actions) {
			var _this19 = this;

			console.log('do actions ...');
			//#region draw
			var drawActions = actions.filter(function (f) {
				return f.type === actionTypeEnums.draw;
			});
			if (drawActions.length > 0) {
				console.log('draw : ' + drawActions.map(function (f) {
					return f.params.type;
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
					var index = _this19.shapes.findIndex(function (f) {
						return f.id === action.params.id;
					});
					if (index >= 0) {
						_this19.shapes[index] = (0, _immutabilityHelper2.default)(_this19.shapes[index], action.params.state);
						shapes.push(_this19.shapes[index]);
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
						var shape = _this19.findShapeById(id);
						shape.selected = true;
						return shape;
					});
				} else {
					this.selectedShapes = this.selectedShapes.concat(selectActions.map(function (f) {
						var id = f.params;
						var shape = _this19.findShapeById(id);
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
					var shape = _this19.findShapeById(id);
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
		}
	}, {
		key: 'drawShapes',
		value: function drawShapes(shapes) {
			var _this20 = this;

			shapes.forEach(function (shape) {
				//初始化
				if (!shape.ready) {
					shape.initialize(_this20);
				}
				shape.render();
			});
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


	}, {
		key: 'render',
		value: function render() {
			var _this21 = this;

			return _react2.default.createElement(
				_WorkSpace2.default,
				null,
				_react2.default.createElement('svg', _extends({ ref: function ref(_ref) {
						return _this21.ele = _ref;
					} }, this.props.attrs))
			);
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			this.doActions(nextProps.actions);
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.doActions(this.props.actions);
		}
	}]);

	return D3Graph;
}(_react.PureComponent);

D3Graph.propTypes = {
	attrs: _propTypes2.default.object,
	//action
	actions: _propTypes2.default.arrayOf(_propTypes2.default.shape({
		type: _propTypes2.default.oneOf(Object.keys(actionTypeEnums)).isRequired,
		params: _propTypes2.default.oneOfType([
		//draw
		_propTypes2.default.shape({
			id: _propTypes2.default.string.isRequired,
			type: _propTypes2.default.string.isRequired,
			attrs: _propTypes2.default.object,
			text: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func])
		}),
		//select
		_propTypes2.default.string])
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
	selectMode: _propTypes2.default.oneOf(['single', 'multiple']),
	//自定义绘制类型
	// customDefinedDrawing: PropTypes.object,
	onDrawTypeChange: _propTypes2.default.func,
	original: _propTypes2.default.shape({
		x: _propTypes2.default.number,
		y: _propTypes2.default.number
	}),
	coordinateType: _propTypes2.default.oneOf(['screen', 'math'])
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
	selectMode: "single",
	onDrawTypeChange: function onDrawTypeChange() {
		return null;
	},
	actions: [],
	original: {
		x: 0,
		y: 0
	},
	coordinateType: "screen"
};
exports.default = D3Graph;