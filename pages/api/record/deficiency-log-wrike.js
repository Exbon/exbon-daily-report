const mssql = require('mssql');
const dbserver = require('../../../dbConfig.js');

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
					const sqlquery = `
					EXEC [usp_dailyreport_Select_DeficiencyLog_Wrike_By_ProjectID]
                    @projectID`;

					request.input('projectID', mssql.Int, req.query.pid);

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
					const sqlquery = `
					EXEC [usp_dailyreport_Update_Project_DeficiencyLog_Wrike]
                    @recordID,
                    @projectID,
                    @wrikeID,
                    @wrikeURL`;

					request.input('recordID', mssql.Int, req.body.logID);
					request.input('projectID', mssql.Int, req.body.projectID);
					request.input('wrikeID', mssql.NVarChar, req.body.wrikeTaskID);
					request.input('wrikeURL', mssql.NVarChar, req.body.wrikeURL);

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
