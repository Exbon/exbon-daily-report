const mssql = require('mssql');
const dbserver = require('../../../../dbConfig.js');

const getInspection = (req, res) => {
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

					const sqlquery = `EXEC [Exbon].[dbo].[usp_dailyreport_Insert_DailyReportInspection]
                              @reportID = ${body.ReportID},
                              @inspector = '${body.Inspector}',
                              @agency = '${body.Agency}',
                              @location = '${body.Location}',
                              @task = '${body.Task}',
                              @result = '${body.Result}'
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

export default getInspection;
