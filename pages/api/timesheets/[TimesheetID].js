const mssql = require('mssql');
const dbserver = require('../../../dbConfig.js');

const TimesheetIDHandler = (req, res) => {
	const {
		query: { TimesheetID },
		body,
		method,
	} = req;

	return new Promise((resolve) => {
		switch (method) {
			// case "GET":
			//   mssql.connect(dbserver.dbConfig, err => {
			//     if (err) {
			//       console.error(err);
			//       return resolve();
			//     }
			//     const request = new mssql.Request();

			//     const query = `SELECT [TimesheetID]
			//                     FROM [dbo].[Timesheet]
			//                     WHERE TimesheetID = ${TimesheetID}`;

			//     request.query(query, (err, recordset) => {
			//       if (err) {
			//         console.error(err);
			//         return resolve();
			//       }

			//       res.status(200).json(recordset.rowsAffected);
			//       return resolve();
			//     });
			//   });
			//   break;
			case 'PUT':
				mssql.connect(dbserver.dbConfig, (err) => {
					if (err) {
						console.error(err);
						return resolve();
					}
					const request = new mssql.Request();

					const query = `EXEC [dbo].[Timesheet_UpdateByTimesheetID]
          ${TimesheetID}, ${body.EmployeeID}, "${body.Position}", "${body.WorkStart}",  "${body.WorkEnd}", "${body.MealStart}", "${body.MealEnd}"`;
					/* --Params--
          @timesheetID int,
          @employeeID int,
          @position nvarchar(100),
          @workStart time(0),
          @workEnd time(0),
          @mealStart time(0),
          @mealEnd time(0)
          */

					request.query(query, (err, recordset) => {
						if (err) {
							console.error(err);
							return resolve();
						}

						res.status(200).json({
							message: 'Success, the timesheet has been updated.',
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

					const query = `EXEC [dbo].[Timesheet_DeleteByTimesheetID]
                          ${TimesheetID}`;
					/* --Params--
          @timesheetID int
          */

					request.query(query, (err, recordset) => {
						if (err) {
							console.error(err);
							return resolve();
						}

						res.status(200).json({
							message: 'Success, the timesheet has been deleted.',
						});
						return resolve();
					});
				});
				break;
			default:
				res.setHeader('Allow', ['PUT', 'DELETE']);
				res.status(405).end(`Method ${method} Not Allowed`);
				res.status(500).end('This is an error');
				return resolve();
		}
	});
};
export default TimesheetIDHandler;
