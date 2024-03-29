const mssql = require('mssql');
const dbserver = require('../../../../dbConfig.js');

const getCorrectional = (req, res) => {
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

					const sqlquery = `EXEC [dbo].[usp_dailyreport_Select_DailyReportCorrectional_Dropdown]`;

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
					EXEC [dbo].[usp_dailyreport_Insert_DailyReportCorrectional]
                    @reportID,
                    @deficiency,
                    @openedBy,
                    @type,
                    @trade,
                    @description`;

					request.input('reportID', mssql.Int, body.ReportID);
					request.input('deficiency', mssql.NVarChar, body.Deficiency);
					request.input('openedBy', mssql.NVarChar, body.OpenedBy);
					request.input('type', mssql.NVarChar, body.Type);
					request.input('trade', mssql.NVarChar, body.Trade);
					request.input('description', mssql.NVarChar, body.Description);

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

export default getCorrectional;
