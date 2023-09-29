const mssql = require('mssql');
const dbserver = require('../../../../dbConfig.js');

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

					const sqlquery = `
					EXEC [dbo].[usp_dailyreport_Select_DailyReportContractor_Dropdown]
					@projectID`;

					request.input('projectID', mssql.Int, query.pid);

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
					EXEC [dbo].[usp_dailyreport_Insert_DailyReportContractor]
                    @reportID,
                    @contractor,
                    @location,
                    @numSuper,
                    @numWorker,
                    @workHours,
                    @task`;

					request.input('reportID', mssql.Int, body.ReportID);
					request.input('contractor', mssql.NVarChar, body.Contractor || '');
					request.input('location', mssql.NVarChar, body.Location);
					request.input('numSuper', mssql.Int, body.NumSuper || 0);
					request.input('numWorker', mssql.Int, body.NumWorker || 0);
					request.input('workHours', mssql.Float, body.WorkHours || 0);
					request.input('task', mssql.NVarChar, body.Task);

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
