// dd/mm/yyyy
export const formatDate = (date) => {
	if (!date) {
		return '';
	}
	let datePart = date.split('T')[0].match(/\d+/g),
		year = datePart[0].substring(2), // get only two digits
		month = datePart[1],
		day = datePart[2];

	return month + '/' + day + '/' + year;
};
