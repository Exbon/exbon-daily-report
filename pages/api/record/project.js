const mssql = require('mssql');
const dbserver = require('../../../dbConfig.js');
import { sqlEscape } from '../../../lib/utils';

const handleProject = (req, res) => {
	const { method, query, body } = req;
	return new Promise((resolve) => {
		switch (method) {
			case 'GET':
				mssql.connect(dbserver.dbConfig, (err) => {
					if (err) {
						console.error(err);
						return resolve();
					}
					const request = new mssql.Request();

					const sqlquery = `EXEC [dbo].[usp_dailyreport_Select_Project_By_ProjectID]
                        @projectID = ${query.pid}
                        `;
					request.query(sqlquery, (err, recordset) => {
						if (err) {
							console.error(err);
							return resolve();
						}
						res.status(200).json({
							message: 'Success',
							result: recordset.recordsets,
						});
						return resolve();
					});
				});
				break;

			default:
				res.setHeader('Allow', ['GET']);
				res.status(405).end(`Method ${method} Not Allowed`);
				res.status(404).end(`Failed`);
				resolve();
		}
	});
};

export default handleProject;
