const mssql = require('mssql');
const dbserver = require('../../../dbConfig.js');
import { sqlEscape } from '../../../lib/utils';

const getDailyReport = (req, res) => {
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

					const sqlquery = `
					EXEC [dbo].[usp_dailyreport_Select_DailyReport]
                    @projectID,
                    @date`;

					request.input('projectID', mssql.Int, query.pid);
					request.input('date', mssql.Date, query.date);

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

			case 'POST':
				mssql.connect(dbserver.dbConfig, (err) => {
					if (err) {
						console.error(err);
						return resolve();
					}
					const request = new mssql.Request();
					const sqlquery = `
					EXEC [dbo].[usp_dailyreport_DeleteAndInsert_DailyReport]
                    @projectID,
                    @date,
					@userID,
					@note`;

					request.input('projectID', mssql.Int, body.ProjectID);
					request.input('date', mssql.Date, body.Date);
					request.input('userID', mssql.Int, body.EmployeeID);
					request.input('note', mssql.NVarChar, body.Note ? body.Note : '');

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
				res.setHeader('Allow', ['GET', 'POST']);
				res.status(405).end(`Method ${method} Not Allowed`);
				res.status(404).end(`Failed`);
				resolve();
		}
	});
};

export default getDailyReport;
