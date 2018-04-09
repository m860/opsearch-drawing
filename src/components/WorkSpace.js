import React, {PureComponent} from "react";
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class WorkSpace extends PureComponent {
	static propTypes = {
		children: PropTypes.any,
		actions: PropTypes.any,
		className: PropTypes.string,
		style: PropTypes.object
	};

	render() {
		return (
			<div style={this.props.style} className={classNames("work-space", this.props.className)}>
				<div className="work-space-actions">{this.props.actions}</div>
				<div className="work-space-content">{this.props.children}</div>
			</div>
		);
	}
}
