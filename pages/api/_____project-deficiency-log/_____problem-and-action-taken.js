const mssql = require('mssql');
const dbserver = require('../../../dbConfig.js');

const problemAndActionTakenHandler = (req, res) => {
	const { method, body } = req;
	return new Promise((resolve) => {
		switch (method) {
			case 'POST':
				mssql.connect(dbserver.dbConfig, (err) => {
					if (err) {
						console.error(err);
						return resolve();
					}
					const request = new mssql.Request();

					const query = `
					EXEC [dbo].[ProjectDeficiencyLog_ProblemAndActionTaken_Insert]
					@projectID,
					@date,
					@problem,
					@actionTaken`;

					request.input('projectID', mssql.Int, body.ProjectID);
					request.input('date', mssql.Date, body.Date);
					request.input('problem', mssql.NVarChar, body.Problem);
					request.input('actionTaken', mssql.NVarChar, body.ActionTaken);

					request.query(query, (err, recordset) => {
						if (err) {
							console.error(err);
							return resolve();
						}
						res.status(200).json({
							message: 'Success, the record of DeficiencyLog has been created.',
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

export default problemAndActionTakenHandler;
