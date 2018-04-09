import './sass/test.sass'
import React, {PropTypes, Component} from 'react'
import ReactDOM from 'react-dom'
import TestComponent from './components/TestComponent'

class Example extends Component {
	render() {
		return (
			<div>
				<TestComponent/>
			</div>
		);
	}
}

ReactDOM.render(
	<Example></Example>
	, document.getElementById("view"));