const mssql = require('mssql');
const dbserver = require('../../dbConfig.js');

const selfTimesheetHandler = (req, res) => {
	const { method, body } = req;
	return new Promise((resolve) => {
		switch (method) {
			case 'GET':
				mssql.connect(dbserver.dbConfig, (err) => {
					if (err) {
						console.error(err);
						return resolve();
					}
					const request = new mssql.Request();

					const selectedDate = req.query.selectedDate;
					const eid = req.query.eid;

					const query = `EXEC [dbo].[Timesheet_Self_Select]
          '${selectedDate}', ${eid}`;
					/* --Params--
            @date  date,
	          @employeeID int
          */

					request.query(query, (err, recordset) => {
						if (err) {
							console.error(err);
							return resolve();
						}
						res.status(200).json({
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

					const query = `EXEC [dbo].[Timesheet_Self_DeleteAndInsert]
          ${body.ProjectID}, ${body.EmployeeID}, '${body.Date}', '${body.WorkStart}', '${body.WorkEnd}', '${body.MealStart}', '${body.MealEnd}' `;
					/* --Params--
            @projectID int,
            @employeeID int,
            @date date,
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
							message: 'Success, the timesheet has been created.',
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

export default selfTimesheetHandler;
