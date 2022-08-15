import React from 'react';
import Table from 'react-bootstrap/Table';

const Test = () => {
	return (
		<Table striped bordered hover>
			<thead>
				<tr>
					<th rowSpan={2}>CONTRACTOR</th>
					<th rowSpan={2}>LOCATION</th>
					<th colSpan={3}>MANPOWER</th>
					<th rowSpan={2}>TASK</th>
				</tr>
				<tr>
					<th>TOTAL</th>
					<th>ACTIVE</th>
					<th>INACTIVE</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
			</tbody>
		</Table>
	);
};

export default Test;
