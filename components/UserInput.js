"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _objectPath = require("object-path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserInput = function (_PureComponent) {
    _inherits(UserInput, _PureComponent);

    function UserInput(props) {
        _classCallCheck(this, UserInput);

        var _this = _possibleConstructorReturn(this, (UserInput.__proto__ || Object.getPrototypeOf(UserInput)).call(this, props));

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

    _createClass(UserInput, [{
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

                                            var newState = Object.assign({}, _this2.state);
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
                                    _this2.props.onOK(_extends({}, _this2.state.data));
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