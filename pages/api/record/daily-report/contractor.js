const mssql = require('mssql');
const dbserver = require('../../../../dbConfig.js');
import { sqlEscape } from '../../../../lib/utils';

const getContractor = (req, res) => {
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

					const sqlquery = `EXEC [Exbon].[dbo].[usp_dailyreport_Select_DailyReportContractor_Dropdown]
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

			case 'POST':
				mssql.connect(dbserver.dbConfig, (err) => {
					if (err) {
						console.error(err);
						return resolve();
					}
					const request = new mssql.Request();

					const sqlquery = `EXEC [Exbon].[dbo].[usp_dailyreport_Insert_DailyReportContractor]
                            @reportID = ${body.ReportID},
                            @contractor = '${sqlEscape(body.Contractor || '')}',
                            @location = '${sqlEscape(body.Location)}',
                            @numSuper = ${body.NumSuper || 0},
                            @numWorker = ${body.NumWorker || 0},
                            @workHours = ${body.WorkHours || 0},
                            @task = '${sqlEscape(body.Task)}'
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
				res.setHeader('Allow', ['GET', 'POST']);
				res.status(405).end(`Method ${method} Not Allowed`);
				res.status(404).end(`Failed`);
				resolve();
		}
	});
};

export default getContractor;
