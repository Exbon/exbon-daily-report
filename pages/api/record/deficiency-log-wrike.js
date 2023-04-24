const mssql = require('mssql');
const dbserver = require('../../../dbConfig.js');
import { sqlEscape } from '../../../lib/utils';

const handleDeficiencyWrike = (req, res) => {
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
					const sqlquery = `EXEC [usp_dailyreport_Select_DeficiencyLog_Wrike_By_ProjectID]
                            @projectID = ${req.query.pid}
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

			case 'PUT':
				mssql.connect(dbserver.dbConfig, (err) => {
					if (err) {
						console.error(err);
						return resolve();
					}
					const request = new mssql.Request();
					const sqlquery = `EXEC [usp_dailyreport_Update_Project_DeficiencyLog_Wrike]
                                @recordID = ${req.body.logID},
                                @projectID = ${req.body.projectID},
                                @wrikeID = '${req.body.wrikeTaskID}',
                                @wrikeURL = '${req.body.wrikeURL}'
                            `;
					console.log(sqlquery);
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
				res.setHeader('Allow', ['GET', 'PUT']);
				res.status(405).end(`Method ${method} Not Allowed`);
				res.status(404).end(`Failed`);
				resolve();
		}
	});
};

export default handleDeficiencyWrike;
