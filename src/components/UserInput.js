import React, {PureComponent} from "react"
import PropTypes from "prop-types"
import {get as getPath} from "object-path"

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
        this.state = {
            data: {}
        };
    }

    render() {
        return (
            <div>
                <div>
                    <ul>
                        {this.props.properties.map((property, index) => {
                            return (
                                <li key={index}>
                                    <label>{property.label}</label>
                                    <input type="text"
                                           value={getPath(this.state.data, `${property.fieldName}`)}
                                           onChange={({target: {value}}) => {
                                               this.setState({
                                                   [property.fieldName]: value
                                               })
                                           }}
                                           defaultValue={property.defaultValue}/>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div>
                    <button type="button" onClick={() => {
                        this.props.onOK({...this.state.data})
                    }}>确定
                    </button>
                </div>
            </div>
        );
    }
}