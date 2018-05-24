"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _objectPath = require("object-path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserInput = function (_PureComponent) {
    (0, _inherits3.default)(UserInput, _PureComponent);

    function UserInput(props) {
        (0, _classCallCheck3.default)(this, UserInput);

        var _this = (0, _possibleConstructorReturn3.default)(this, (UserInput.__proto__ || (0, _getPrototypeOf2.default)(UserInput)).call(this, props));

        var data = {};
        props.properties.forEach(function (property) {
            (0, _objectPath.set)(data, property.fieldName, property.defaultValue || "");
        });
        console.log(data);
        _this.state = {
            data: data
        };
        return _this;
    }

    (0, _createClass3.default)(UserInput, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                "div",
                { className: "user-input" },
                _react2.default.createElement(
                    "div",
                    null,
                    _react2.default.createElement(
                        "div",
                        { className: "properties" },
                        _react2.default.createElement(
                            "ul",
                            null,
                            this.props.properties.map(function (property, index) {
                                return _react2.default.createElement(
                                    "li",
                                    { key: index },
                                    _react2.default.createElement(
                                        "label",
                                        null,
                                        property.label
                                    ),
                                    _react2.default.createElement("input", { type: "text",
                                        value: _this2.state.data[property.fieldName],
                                        onChange: function onChange(_ref) {
                                            var value = _ref.target.value;

                                            var newState = (0, _assign2.default)({}, _this2.state);
                                            (0, _objectPath.set)(newState.data, property.fieldName, value);
                                            _this2.setState(newState);
                                        } })
                                );
                            })
                        )
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "buttons" },
                        _react2.default.createElement(
                            "button",
                            { type: "button", onClick: function onClick() {
                                    _this2.props.onOK((0, _extends3.default)({}, _this2.state.data));
                                } },
                            "\u786E\u5B9A"
                        )
                    )
                )
            );
        }
    }]);
    return UserInput;
}(_react.PureComponent);

UserInput.propTypes = {
    properties: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        label: _propTypes2.default.string,
        fieldName: _propTypes2.default.string,
        defaultValue: _propTypes2.default.any
    })),
    onOK: _propTypes2.default.func
};
UserInput.defaultProps = {
    onOK: function onOK() {
        return null;
    }
};
exports.default = UserInput;