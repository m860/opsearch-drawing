import React, {PureComponent} from "react"
import PropTypes from "prop-types"
import {get as getPath, set as setPath} from "object-path"

export default class UserInput extends PureComponent {
    static propTypes = {
        properties: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            fieldName: PropTypes.string,
            defaultValue: PropTypes.any
        })),
        onOK: PropTypes.func
    };
    static defaultProps = {
        onOK: () => null
    }

    constructor(props) {
        super(props);
        let data = {};
        props.properties.forEach(property => {
            setPath(data, property.fieldName, property.defaultValue || "");
        });
        console.log(data);
        this.state = {
            data: data
        };
    }

    render() {
        return (
            <div className="user-input">
                <div>
                    <div className="properties">
                        <ul>
                            {this.props.properties.map((property, index) => {
                                return (
                                    <li key={index}>
                                        <label>{property.label}</label>
                                        <input type="text"
                                               value={this.state.data[property.fieldName]}
                                               onChange={({target: {value}}) => {
                                                   let newState =Object.assign({},this.state);
                                                   setPath(newState.data, property.fieldName, value);
                                                   this.setState(newState);
                                               }}/>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="buttons">
                        <button type="button" onClick={() => {
                            this.props.onOK({...this.state.data})
                        }}>确定
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}