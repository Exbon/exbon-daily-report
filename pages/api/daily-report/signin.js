const mssql = require('mssql');
const dbserver = require('../../../dbConfig.js');
import { sha256 } from 'js-sha256';

const signinHandler = (req, res) => {
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

					const hexString = body.Password;
					const buffer = Buffer.from(hexString.slice(2), 'hex');

					const query = `EXEC [dbo].[DailyReport_SignIn]
								   @username,
								   @password`;

					request.input('username', mssql.VarChar, body.Username);
					request.input('password', mssql.VarBinary, buffer);

					request.query(query, (err, recordset) => {
						if (err) {
							console.error(err);
							return resolve();
						}
						res.status(200).json({
							result: recordset,
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

export default signinHandler;
