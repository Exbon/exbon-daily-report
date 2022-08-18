const mssql = require('mssql');
const dbserver = require('../../../dbConfig.js');
import { sqlEscape } from '../../../lib/utils';

// prettier-ignore
const exportExcel = async (req, res) => {
	const { method, query, body } = req;
	return new Promise(async (resolve) => {
		switch (method) {
			case 'POST':
				try {
					// From API
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

					// Read file
					const __dirname = 'public/record';
					const Excel = require('exceljs');
					const filename = '/ToCustomer_Form.xlsx';
					const workbook = new Excel.Workbook();
					await workbook.xlsx.readFile(__dirname + filename);
					const worksheet = workbook.getWorksheet('To Customer');

					// Declare variable
					const contractorsLength = body.contractors.length;
					const inspectorsLength = body.inspectors.length;
					const startContractorsLine = 7; // in excel form
					let endContractorsLine = 14; // in excel form
					const targetContractorsLine = startContractorsLine + 6; // in excel form
					const countRowsContractors = 8; // in excel form
					const countRowsInspectors = 3; // in excel form
					let startInspectorsLine = 18; // in excel form
					let targetInspectorsLine = 19; // in excel form
					let startNoteLine = 22; // in excel form

					// If needed, add rows for contractors
					if (contractorsLength > countRowsContractors) {
						worksheet.duplicateRow(
							targetContractorsLine, // Target line to duplicate
							contractorsLength - countRowsContractors, // How many lines
							true, // Insert or not
						);
							
						endContractorsLine += contractorsLength - countRowsContractors;
						startInspectorsLine += contractorsLength - countRowsContractors
						targetInspectorsLine += contractorsLength - countRowsContractors;
						startNoteLine += contractorsLength - countRowsContractors;
					}

					// If needed, add rows for inspectors
					if (inspectorsLength > countRowsInspectors) {
						worksheet.duplicateRow(
							targetInspectorsLine, // Target line to duplicate
							inspectorsLength - countRowsInspectors, // How many lines
							true, // Insert or not
						);
						startNoteLine += inspectorsLength - countRowsInspectors;
					}

					const row2 = worksheet.getRow(2);
					row2.getCell(2).value = body.projectName;
					row2.getCell(6).value = body.date;

					const row3 = worksheet.getRow(3);
					row3.getCell(2).value = body.contractNo;
					row3.getCell(6).value = body.jobNumber;

					const row4 = worksheet.getRow(4);
					row4.getCell(2).value = body.taskOrderNo;
					row4.getCell(6).value = body.documentedBy;

					const rowTotalContractorsLine = worksheet.getRow(endContractorsLine + 1);
					rowTotalContractorsLine.getCell(3).value = {formula: '=SUM(C' + startContractorsLine + ':C' + endContractorsLine + ')'};
					rowTotalContractorsLine.getCell(4).value = {formula: '=SUM(D' + startContractorsLine + ':D' + endContractorsLine + ')'};

					const contractors = body.contractors;
					
					for(let i = 0; i < contractorsLength; i++)
					{
						worksheet.getRow(startContractorsLine + i).getCell(1).value = contractors[i].Contractor;
						worksheet.getRow(startContractorsLine + i).getCell(2).value = contractors[i].Location;
						worksheet.getRow(startContractorsLine + i).getCell(3).value = parseInt(contractors[i].NumSuper);
						worksheet.getRow(startContractorsLine + i).getCell(4).value = parseInt(contractors[i].NumWorker);
						worksheet.getRow(startContractorsLine + i).getCell(5).value = contractors[i].Task;
					}

					const inspectors = body.inspectors;
					for(let i = 0; i < inspectorsLength; i++)
					{
						worksheet.getRow(startInspectorsLine + i).getCell(1).value = inspectors[i].Inspector;
						worksheet.getRow(startInspectorsLine + i).getCell(2).value = inspectors[i].Agency;
						worksheet.getRow(startInspectorsLine + i).getCell(3).value = inspectors[i].Location;
						worksheet.getRow(startInspectorsLine + i).getCell(5).value = inspectors[i].Task;
						worksheet.getRow(startInspectorsLine + i).getCell(7).value = inspectors[i].Result;
					}

					worksheet.getRow(startNoteLine).getCell(1).value = body.note;

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
