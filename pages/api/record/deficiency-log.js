const mssql = require('mssql');
const dbserver = require('../../../dbConfig.js');
import { sqlEscape } from '../../../lib/utils';

const addDeficiencyLog = (req, res) => {
	const { method, query, body } = req;
	return new Promise((resolve) => {
		switch (method) {
			case 'POST':
				mssql.connect(dbserver.dbConfig, (err) => {
					if (err) {
						console.error(err);
						return resolve();
					}
					const request = new mssql.Request();
					const sqlquery = `EXEC [usp_dailyreport_Insert_Project_DeficiencyLog]
                            @projectID = '${req.body.ProjectID}',
                            @name = '${sqlEscape(req.body.Deficiency)}',
                            @openedBy = '${req.body.OpenedBy}',
                            @type = '${req.body.Type}',
                            @trade = '${req.body.Trade || ''}',
                            @problem = '${
															sqlEscape(req.body.Description) || ''
														}',
                            @userEmployeeID = ${req.body.EmployeeID}
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
				res.setHeader('Allow', ['POST']);
				res.status(405).end(`Method ${method} Not Allowed`);
				res.status(404).end(`Failed`);
				resolve();
		}
	});
};

export default addDeficiencyLog;
