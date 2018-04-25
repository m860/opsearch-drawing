'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Drawing = exports.ReDrawAction = exports.UnSelectAction = exports.SelectAction = exports.DrawAction = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
var actionTypeEnums = {
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

/**
 * 绘图action
 * */

var DrawAction = exports.DrawAction = function DrawAction(params) {
	_classCallCheck(this, DrawAction);

	this.params = params;
	this.type = actionTypeEnums.draw;
};

/**
 * 选择action
 * */


var SelectAction = exports.SelectAction = function SelectAction(id) {
	_classCallCheck(this, SelectAction);

	this.params = id;
	this.type = actionTypeEnums.select;
};

/**
 * 取消选择action
 * */


var UnSelectAction = exports.UnSelectAction = function UnSelectAction(id) {
	_classCallCheck(this, UnSelectAction);

	this.params = id;
	this.type = actionTypeEnums.unselect;
};

/**
 * 重绘action
 * */


var ReDrawAction = exports.ReDrawAction = function ReDrawAction(id, state) {
	_classCallCheck(this, ReDrawAction);

	this.type = actionTypeEnums.redraw;
	this.params = {
		id: id,
		state: state
	};
};

/**
 * 绘画接口
 * */


var Drawing = exports.Drawing = function () {
	function Drawing() {
		_classCallCheck(this, Drawing);
	}

	_createClass(Drawing, [{
		key: 'render',
		value: function render() {
			throw new Error('method `render` is not implementation');
		}
	}, {
		key: 'getLinkPoint',
		value: function getLinkPoint() {
			throw new Error('method `getLinkPoint` is not implementation');
		}
	}, {
		key: 'defaultAttrs',
		get: function get() {
			throw new Error('property `defaultAttrs` is not implementation');
		}
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


var LineDrawing = function (_Drawing) {
	_inherits(LineDrawing, _Drawing);

	function LineDrawing() {
		_classCallCheck(this, LineDrawing);

		return _possibleConstructorReturn(this, (LineDrawing.__proto__ || Object.getPrototypeOf(LineDrawing)).apply(this, arguments));
	}

	_createClass(LineDrawing, [{
		key: 'render',
		value: function render(svg) {
			return svg.append("line");
		}
	}, {
		key: 'renderToolbar',
		value: function renderToolbar(context, drawType, index) {
			return _react2.default.createElement(
				'a',
				{ key: index,
					onClick: function onClick() {
						console.log('click');
						d3.select(context.ele).on("mousedown", function () {
							this._id = _guid2.default.raw();
							context.doActions([new DrawAction({
								id: this._id,
								type: drawType.type,
								attrs: Object.assign({
									x1: d3.event.offsetX,
									y1: d3.event.offsetY,
									x2: d3.event.offsetX,
									y2: d3.event.offsetY
								}, drawType.defaultAttrs)
							})]);
						}).on("mousemove", function () {
							if (drawType.type === "line" && this._id) {
								context.doActions([new ReDrawAction(this._id, {
									attrs: {
										x2: { $set: d3.event.offsetX },
										y2: { $set: d3.event.offsetY }
									}
								})]);
							}
						}).on("mouseup", function () {
							delete this._id;
						});
					},
					href: 'javascript:void(0)' },
				'Line'
			);
		}
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

/**
 * 绘画圈
 * */


var CircleDrawing = function (_Drawing2) {
	_inherits(CircleDrawing, _Drawing2);

	function CircleDrawing() {
		_classCallCheck(this, CircleDrawing);

		return _possibleConstructorReturn(this, (CircleDrawing.__proto__ || Object.getPrototypeOf(CircleDrawing)).apply(this, arguments));
	}

	_createClass(CircleDrawing, [{
		key: 'render',
		value: function render(svg) {
			return svg.append("circle");
		}
	}, {
		key: 'renderToolbarCircleButton',
		value: function renderToolbarCircleButton(context, drawType, index) {
			return _react2.default.createElement(
				'a',
				{ key: index,
					onClick: function onClick() {
						d3.select(context.ele).on("mousedown", function () {
							this._id = _guid2.default.raw();
							context.doActions([new DrawAction({
								id: this._id,
								type: drawType.type,
								attrs: Object.assign({
									cx: d3.event.offsetX,
									cy: d3.event.offsetY
								}, drawType.defaultAssignment)
							})]);
						}).on("mouseup", function () {
							delete this._id;
						});
					},
					href: 'javascript:void(0)' },
				'Circle'
			);
		}
	}, {
		key: 'getLinkPoint',
		value: function getLinkPoint(sourceShape, targetShape, targetDrawing) {
			return {
				x: sourceShape.attrs.cx,
				y: sourceShape.attrs.cy
			};
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

/**
 * 绘画矩形
 * */


var RectDrawing = function (_Drawing3) {
	_inherits(RectDrawing, _Drawing3);

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

var builtinDrawType = {
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
		render: function render(svg) {
			return svg.append("line");
		}
	},
	text: {
		defaultAttrs: {
			fill: "black",
			"font-size": "20px"
		},
		selectedAttrs: {
			fill: "red"
		},
		render: function render(svg) {
			return svg.append("text");
		}
	}
};

/**
 * 运筹学图形D3
 * */

var InteractionGraph = function (_PureComponent) {
	_inherits(InteractionGraph, _PureComponent);

	/**
  * @property {Array} actions - 所有的操作
  * @property {Object} defaultAttrs - 默认的图形的样式
  * @property {Object} selectedAttrs - 图形被选中时候的样式
  * @property {single|multiple} selectMode - 选择模式,是多选还是单选
  * */
	function InteractionGraph(props) {
		_classCallCheck(this, InteractionGraph);

		var _this4 = _possibleConstructorReturn(this, (InteractionGraph.__proto__ || Object.getPrototypeOf(InteractionGraph)).call(this, props));

		_this4.ele = null;
		//画布中已有的图形
		_this4.shapes = [];
		//已经选中的图形的id
		_this4.selectedShapes = [];
		//绘制类型
		_this4.definedDrawing = Object.assign({}, builtinDrawType, _this4.props.customDrawType);
		return _this4;
	}

	_createClass(InteractionGraph, [{
		key: 'findShapeById',
		value: function findShapeById(id) {
			var index = this.shapes.findIndex(function (f) {
				return f.id === id;
			});
			return this.shapes[index];
		}
	}, {
		key: 'updateShape',
		value: function updateShape(id, shape) {
			var index = this.shapes.findIndex(function (f) {
				return f.id === id;
			});
			this.shapes[index] = (0, _immutabilityHelper2.default)(this.shapes[index], shape);
			this.drawShapes(this.shapes);
		}
	}, {
		key: 'doActions',
		value: function doActions(actions) {
			var _this5 = this;

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
					var index = _this5.shapes.findIndex(function (f) {
						return f.id === action.params.id;
					});
					if (index >= 0) {
						_this5.shapes[index] = (0, _immutabilityHelper2.default)(_this5.shapes[index], action.params.state);
						shapes.push(_this5.shapes[index]);
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
					// this.unSelect(this.selectedShapeId);
					this.doActions(this.selectedShapes.map(function (id) {
						return new UnSelectAction(id);
					}));
					this.selectedShapes = selectActions.map(function (f) {
						return f.params;
					});
				} else {
					this.selectedShapes = this.selectedShapes.concat(selectActions.map(function (f) {
						return f.params;
					}));
				}
				this.select(this.selectedShapes);
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
				var ids = unSelectActions.map(function (f) {
					return f.params;
				});
				this.unSelect(ids);
			}
			//#endregion
		}
	}, {
		key: 'select',
		value: function select(ids) {
			var _this6 = this;

			ids.forEach(function (id) {
				var shape = _this6.findShapeById(id);
				if (shape) {
					if (shape.selection) {
						var attrs = (0, _objectPath.get)(_this6.definedDrawing, shape.type + '.selectedAttrs', {});
						console.log('select attrs', attrs);
						shape.selection.call(function (self) {
							for (var key in attrs) {
								self.attr(key, attrs[key]);
							}
						});
					}
				}
			});
		}
	}, {
		key: 'unSelect',
		value: function unSelect(ids) {
			var shapes = this.shapes.filter(function (f) {
				return ids.indexOf(f.id) >= 0;
			});
			this.drawShapes(shapes);
		}
	}, {
		key: 'drawShapes',
		value: function drawShapes(shapes) {
			var _this7 = this;

			var svg = d3.select(this.ele);
			shapes.forEach(function (shape) {
				var drawing = _this7.definedDrawing[shape.type];
				if (drawing) {
					switch (shape.type) {
						case "link":
							//计算link的相关属性
							_this7.linkShape(shape, drawing);
							break;
					}
					//#region create selection
					if (!shape.selection) {
						// create element
						shape.selection = drawing.render.call(_this7, svg);
						//listene click event
						shape.selection.on('click', function () {
							_this7.doActions([new SelectAction(shape.id)]);
						});
					}
					//#endregion


					//#region deal with svg common property
					//update attrs
					shape.selection.call(function (self) {
						_this7.updateShapeAttrs(self, shape.type, Object.assign({}, drawing.defaultAttrs, shape.attrs));
					});
					//update text
					if (shape.text) {
						shape.selection.text(shape.text);
					}
					//#endregion
				} else {
					console.warn('draw type `' + shape.type + '` is not defined');
				}
			});
			// this.drawLines(shapes.filter(f => f.type === drawTypeEnums.line));
			// this.drawDots(shapes.filter(f => f.type === drawTypeEnums.dot));
			// this.drawCircles(shapes.filter(f => f.type === drawTypeEnums.circle));
			// this.drawTexts(shapes.filter(f => f.type === drawTypeEnums.text));
		}
	}, {
		key: 'getLinkPosition',
		value: function getLinkPosition(shape) {
			var drawing = this.definedDrawing[shape.type];
			if (drawing) {
				return drawing.getLinkPoint(shape);
			}
			throw new Error('draw type `' + shape.type + '` is not defined');
		}
	}, {
		key: 'linkShape',
		value: function linkShape(shape) {
			var source = this.findShapeById(shape.source);
			var target = this.findShapeById(shape.target);
			if (source && target) {
				var sourcePos = this.getLinkPosition(source);
				var targetPos = this.getLinkPosition(target);
				shape.attrs.x1 = sourcePos.x;
				shape.attrs.y1 = sourcePos.y;
				shape.attrs.x2 = targetPos.x;
				shape.attrs.y2 = targetPos.y;
			}
		}
	}, {
		key: 'updateShapeAttrs',
		value: function updateShapeAttrs(ele, drawType, attrs) {
			var newAttrs = Object.assign({}, (0, _objectPath.get)(this.props.defaultAttrs, drawType, {}), attrs);
			for (var key in newAttrs) {
				ele.attr(key, newAttrs[key]);
			}
		}
	}, {
		key: 'render',
		value: function render() {
			var _this8 = this;

			return _react2.default.createElement(
				_WorkSpace2.default,
				{ actions: Object.keys(this.definedDrawing).map(function (key, index) {
						var drawType = _this8.definedDrawing[key];
						if (drawType) {
							if (drawType.renderToolbar) {
								return drawType.renderToolbar(_this8, _extends({
									type: key
								}, drawType), index);
							}
						}
						return null;
					}) },
				_react2.default.createElement('svg', { ref: function ref(_ref) {
						return _this8.ele = _ref;
					},
					style: this.props.style,
					width: this.props.width,
					height: this.props.height })
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
			// this.initialSVG();
			this.doActions(this.props.actions);
		}
	}]);

	return InteractionGraph;
}(_react.PureComponent);

InteractionGraph.propTypes = {
	width: _propTypes2.default.number,
	height: _propTypes2.default.number,
	style: _propTypes2.default.object,
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
	customDrawType: _propTypes2.default.object,
	onDrawTypeChange: _propTypes2.default.func
};
InteractionGraph.defaultProps = {
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
	onDrawTypeChange: function onDrawTypeChange() {
		return null;
	}
};
exports.default = InteractionGraph;