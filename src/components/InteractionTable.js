import React, {PureComponent} from "react";
import PropTypes from 'prop-types'
import WorkSpace from './WorkSpace'
import {get as getPath} from 'object-path'


export default class InteractionTable extends PureComponent {
	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		tableOption: PropTypes.shape({
			className: PropTypes.string,
			style: PropTypes.object,
			firstRow: PropTypes.shape({
				renderCell: PropTypes.func,
				cells: PropTypes.array
			}).isRequired,
			firstColumn: PropTypes.shape({
				renderCell: PropTypes.func,
				cells: PropTypes.array
			}).isRequired,
			renderCell: PropTypes.func,
			cells: PropTypes.arrayOf(PropTypes.array)
		}).isRequired
	};

	constructor(props) {
		super(props);
		this.state = {
			rows: this.props.tableOption.firstColumn.cells.length + 1,
			columns: this.props.tableOption.firstRow.cells.length + 1
		};
	}

	render() {
		const rows = Array.apply(null, {length: this.state.rows}).map((x, i) => i);
		const columns = Array.apply(null, {length: this.state.columns}).map((x, i) => i);
		return (
			<WorkSpace className={this.props.className}
					   actions={[
						   <a key="0"
							  onClick={() => this.setState({rows: this.state.rows + 1})}
							  href="javascript:void(0)">ADD ROW</a>,
						   <a key="1"
							  onClick={() => this.setState({columns: this.state.columns + 1})}
							  href="javascript:void(0)">ADD COLUMN</a>
					   ]}
					   style={this.props.style}>
				<table style={this.props.tableOption.style}
					   className={this.props.tableOption.className}>
					<tbody>
					{rows.map(rowIndex => {
						return (
							<tr key={rowIndex}>
								{columns.map(columnIndex => {
									const key = `${rowIndex}-${columnIndex}`;
									if (rowIndex === 0 && columnIndex > 0) {
										//render first row
										return (
											<td key={key}>{this.props.tableOption.firstRow.renderCell(getPath(this.props.tableOption.firstRow, `cells.${columnIndex - 1}`), rowIndex, columnIndex)}</td>
										);
									}
									if (columnIndex === 0 && rowIndex > 0) {
										//render first column
										return (
											<td key={key}>{this.props.tableOption.firstColumn.renderCell(getPath(this.props.tableOption.firstColumn, `cells.${rowIndex - 1}`), rowIndex, columnIndex)}</td>
										);
									}
									if (rowIndex > 0 && columnIndex > 0) {
										return (
											<td key={key}>{this.props.tableOption.renderCell(getPath(this.props.tableOption, `cells.${rowIndex}.${columnIndex}`), rowIndex, columnIndex)}</td>
										);
									}
									return <td key={key}></td>;
								})}
							</tr>
						);
					})}
					</tbody>
				</table>
			</WorkSpace>
		);
	}
}
