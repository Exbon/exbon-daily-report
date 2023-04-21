const mssql = require('mssql');
const dbserver = require('../../../../dbConfig.js');
import { sqlEscape } from '../../../../lib/utils';

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

					const sqlquery = `EXEC [dbo].[usp_dailyreport_Insert_DailyReportEquipment]
                            @projectID = ${body.ProjectID},
                            @equipment = '${sqlEscape(body.Equipment)}',
                            @vendor = '${sqlEscape(body.Vendor)}',
                            @moveIn = '${body.MoveIn}',
                            @moveOut = '${body.MoveOut}',
                            @note = '${sqlEscape(body.Note)}'
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

			case 'DELETE':
				mssql.connect(dbserver.dbConfig, (err) => {
					if (err) {
						console.error(err);
						return resolve();
					}
					const request = new mssql.Request();

					const sqlquery = `EXEC [dbo].[usp_dailyreport_Delete_DailyReportEquipment]
								@recordID = ${body.RecordID},
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
				res.setHeader('Allow', ['GET', 'POST']);
				res.status(405).end(`Method ${method} Not Allowed`);
				res.status(404).end(`Failed`);
				resolve();
		}
	});
};

export default getEquipment;
