const mssql = require('mssql');
const dbserver = require('../../../../dbConfig.js');

const getEquipment = (req, res) => {
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

					const sqlquery = `EXEC [dbo].[usp_dailyreport_Select_DailyReportEquipment_Dropdown]`;

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
					EXEC [dbo].[usp_dailyreport_Insert_DailyReportEquipment]
                    @projectID,
                    @equipment,
                    @vendor,
                    @moveIn,
                    @moveOut,
                    @note`;

					request.input('projectID', mssql.Int, body.ProjectID);
					request.input('equipment', mssql.NVarChar, body.Equipment);
					request.input('vendor', mssql.NVarChar, body.Vendor);
					request.input('moveIn', mssql.Date, body.MoveIn);
					request.input('moveOut', mssql.Date, body.MoveOut);
					request.input('note', mssql.NVarChar, body.Note);

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

			case 'DELETE':
				mssql.connect(dbserver.dbConfig, (err) => {
					if (err) {
						console.error(err);
						return resolve();
					}
					const request = new mssql.Request();

					const sqlquery = `
					EXEC [dbo].[usp_dailyreport_Delete_DailyReportEquipment]
					@recordID`;

					request.input('recordID', mssql.Int, body.RecordID);

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

export default getEquipment;
