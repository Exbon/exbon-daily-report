const mssql = require('mssql');
const dbserver = require('../../../dbConfig.js');
import { sqlEscape } from '../../../lib/utils';

const exportExcel = async (req, res) => {
	const { method, query, body } = req;
	return new Promise(async (resolve) => {
		switch (method) {
			case 'POST':
				try {
					const __dirname = 'public/record';
					const Excel = require('exceljs');
					const filename = '/ToCustomer_Form.xlsx';
					const workbook = new Excel.Workbook();

					// read file
					await workbook.xlsx.readFile(__dirname + filename);

					const worksheet = workbook.getWorksheet('To Customer');

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
