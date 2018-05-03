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

	get hasActions() {
		if (this.props.actions) {
			return true;
		}
		return false;
	}

	render() {
		return (
			<div style={this.props.style} className={classNames("work-space", this.props.className)}>
				{this.hasActions &&
				<div className="work-space-actions">{this.props.actions}</div>}
				<div className="work-space-content">{this.props.children}</div>
			</div>
		);
	}
}
