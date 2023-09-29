const mssql = require('mssql');
const dbserver = require('../../../dbConfig.js');

const addDeficiencyLog = (req, res) => {
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
					EXEC [usp_dailyreport_Select_Project_DeficiencyLog_By_RecordID]
					@recordID`;

					request.input('recordID', mssql.Int, req.query.logID);

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
					EXEC [usp_dailyreport_Insert_Project_DeficiencyLog]
                    @projectID,
                    @name,
                    @openedBy,
                    @type,
                    @trade,
                    @problem,
                    @userEmployeeID`;

					request.input('projectID', mssql.Int, req.body.ProjectID);
					request.input('name', mssql.VarChar, req.body.Deficiency);
					request.input('openedBy', mssql.NVarChar, req.body.OpenedBy);
					request.input('type', mssql.NVarChar, req.body.Type);
					request.input('trade', mssql.NVarChar, req.body.Trade || '');
					request.input('problem', mssql.NVarChar, req.body.Description || '');
					request.input('userEmployeeID', mssql.Int, req.body.EmployeeID);

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
				res.setHeader('Allow', ['POST', 'GET']);
				res.status(405).end(`Method ${method} Not Allowed`);
				res.status(404).end(`Failed`);
				resolve();
		}
	});
};

export default addDeficiencyLog;
