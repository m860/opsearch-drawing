'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _WorkSpace = require('./WorkSpace');

var _WorkSpace2 = _interopRequireDefault(_WorkSpace);

var _objectPath = require('object-path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var InteractionTable = function (_PureComponent) {
	(0, _inherits3.default)(InteractionTable, _PureComponent);

	function InteractionTable(props) {
		(0, _classCallCheck3.default)(this, InteractionTable);

		var _this = (0, _possibleConstructorReturn3.default)(this, (InteractionTable.__proto__ || (0, _getPrototypeOf2.default)(InteractionTable)).call(this, props));

		_this.state = {
			rows: _this.props.tableOption.firstColumn.cells.length + 1,
			columns: _this.props.tableOption.firstRow.cells.length + 1
		};
		return _this;
	}

	(0, _createClass3.default)(InteractionTable, [{
		key: 'render',
		value: function render() {
			var _this2 = this;

			var rows = Array.apply(null, { length: this.state.rows }).map(function (x, i) {
				return i;
			});
			var columns = Array.apply(null, { length: this.state.columns }).map(function (x, i) {
				return i;
			});
			return _react2.default.createElement(
				_WorkSpace2.default,
				{ className: this.props.className,
					actions: [_react2.default.createElement(
						'a',
						{ key: '0',
							onClick: function onClick() {
								return _this2.setState({ rows: _this2.state.rows + 1 });
							},
							href: 'javascript:void(0)' },
						'ADD ROW'
					), _react2.default.createElement(
						'a',
						{ key: '1',
							onClick: function onClick() {
								return _this2.setState({ columns: _this2.state.columns + 1 });
							},
							href: 'javascript:void(0)' },
						'ADD COLUMN'
					)],
					style: this.props.style },
				_react2.default.createElement(
					'table',
					{ style: this.props.tableOption.style,
						className: this.props.tableOption.className },
					_react2.default.createElement(
						'tbody',
						null,
						rows.map(function (rowIndex) {
							return _react2.default.createElement(
								'tr',
								{ key: rowIndex },
								columns.map(function (columnIndex) {
									var key = rowIndex + '-' + columnIndex;
									if (rowIndex === 0 && columnIndex > 0) {
										//render first row
										return _react2.default.createElement(
											'td',
											{ key: key },
											_this2.props.tableOption.firstRow.renderCell((0, _objectPath.get)(_this2.props.tableOption.firstRow, 'cells.' + (columnIndex - 1)), rowIndex, columnIndex)
										);
									}
									if (columnIndex === 0 && rowIndex > 0) {
										//render first column
										return _react2.default.createElement(
											'td',
											{ key: key },
											_this2.props.tableOption.firstColumn.renderCell((0, _objectPath.get)(_this2.props.tableOption.firstColumn, 'cells.' + (rowIndex - 1)), rowIndex, columnIndex)
										);
									}
									if (rowIndex > 0 && columnIndex > 0) {
										return _react2.default.createElement(
											'td',
											{ key: key },
											_this2.props.tableOption.renderCell((0, _objectPath.get)(_this2.props.tableOption, 'cells.' + rowIndex + '.' + columnIndex), rowIndex, columnIndex)
										);
									}
									return _react2.default.createElement('td', { key: key });
								})
							);
						})
					)
				)
			);
		}
	}]);
	return InteractionTable;
}(_react.PureComponent);

InteractionTable.propTypes = {
	style: _propTypes2.default.object,
	className: _propTypes2.default.string,
	tableOption: _propTypes2.default.shape({
		className: _propTypes2.default.string,
		style: _propTypes2.default.object,
		firstRow: _propTypes2.default.shape({
			renderCell: _propTypes2.default.func,
			cells: _propTypes2.default.array
		}).isRequired,
		firstColumn: _propTypes2.default.shape({
			renderCell: _propTypes2.default.func,
			cells: _propTypes2.default.array
		}).isRequired,
		renderCell: _propTypes2.default.func,
		cells: _propTypes2.default.arrayOf(_propTypes2.default.array)
	}).isRequired
};
exports.default = InteractionTable;