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
					// const {body} = req;

					// read file
					await workbook.xlsx.readFile(__dirname + filename);

					const worksheet = workbook.getWorksheet('To Customer');
					const row5 = worksheet.getRow(5);
					row5.getCell(2).value = 'TEST';

					// write file
					await workbook.xlsx.writeFile(
						__dirname + '/ToCustomer_' + '7784' + '.xlsx',
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
