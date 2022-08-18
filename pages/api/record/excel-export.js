const mssql = require('mssql');
const dbserver = require('../../../dbConfig.js');
import { sqlEscape } from '../../../lib/utils';

const exportExcel = async (req, res) => {
	const { method, query, body } = req;
	return new Promise(async (resolve) => {
		switch (method) {
			case 'POST':
				try {
					// projectName: currentProject.ProjectName,
					// date: formatDate(selectedDate),
					// contractNo: '???',
					// jobNumber: currentProject.JobNumber,
					// taskOrderNo: '???',
					// documentedBy: status.cookies.fullname,
					// contractors: tempContractors,
					// inspectors: tempInspections,
					// note: note ? note.Note : '',
					// userID: status.cookies.employeeid,

					const __dirname = 'public/record';
					const Excel = require('exceljs');
					const filename = '/ToCustomer_Form.xlsx';
					const workbook = new Excel.Workbook();

					// read file
					await workbook.xlsx.readFile(__dirname + filename);

					const worksheet = workbook.getWorksheet('To Customer');

					const row2 = worksheet.getRow(2);
					row2.getCell(2).value = body.projectName;
					row2.getCell(6).value = body.date;

					const row3 = worksheet.getRow(3);
					row3.getCell(2).value = body.contractNo;
					row3.getCell(6).value = body.jobNumber;

					const row4 = worksheet.getRow(4);
					row4.getCell(2).value = body.taskOrderNo;
					row4.getCell(6).value = body.documentedBy;

					// worksheet.duplicateRow(13, 3, true);
					worksheet.duplicateRow(19, 3, true);
					// write file
					await workbook.xlsx.writeFile(
						__dirname + '/ToCustomer_' + body.userID + '.xlsx',
					);

					console.log('body', body);

					return res.status(200).json('success');
				} catch (err) {
					console.log(err);
					return res.status(500).json(err);
				}

			default:
				res.setHeader('Allow', ['POST']);
				res.status(405).end(`Method ${method} Not Allowed`);
				res.status(404).end(`Failed`);
				resolve();
		}
	});
};

export default exportExcel;
