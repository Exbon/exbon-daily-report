import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { usePromiseTracker, trackPromise } from 'react-promise-tracker';
import Loader from 'react-loader-spinner';
import SimpleTabs from '../components/MainTab/MainTab';
import NotPermission from '../components/MainTab/NotPermission';
import { CookiesProvider, useCookies } from 'react-cookie';
import Login from '../components/MainTab/login.js';
import Head from 'next/head';
import { useMediaQuery } from 'react-responsive';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Typeahead } from 'react-bootstrap-typeahead';
import styles from './record.module.css';
import { formatDate, formatDateDash } from '../components/main/formatDate';
import Autocomplete from 'react-autocomplete';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import SaveIcon from '@material-ui/icons/Save';
import AddBoxIcon from '@material-ui/icons/AddBox';
import MUIButton from '@material-ui/core/Button';
import DeleteTwoTone from '@material-ui/icons/DeleteTwoTone';
import { RiFileExcel2Fill } from 'react-icons/ri';
import { FaFilePdf } from 'react-icons/fa';

toast.configure();

const Record = () => {
	const resolution1008 = useMediaQuery({
		maxWidth: '1009px',
		minWidth: '602px',
	});

	const resolution602 = useMediaQuery({
		maxWidth: '602px',
	});
	const router = useRouter();
	const [projectState, setProjectState] = useState(undefined);
	const [cookies, setCookie, removeCookie] = useCookies();
	const [status, setStatus] = useState({
		cookies: {
			username: 0,
			password: 0,
			fullname: '',
			employeeid: 0,
		},
		permission: true,
	});
	const [stateAssignedProject, setStateAssignedProject] = useState([
		{ ProjectID: 0 },
	]);
	const [stateNoAssigned, setStateNoAssigned] = useState([]);
	const { promiseInProgress } = usePromiseTracker();
	const now = new Date().toLocaleString({
		timeZone: 'America/Los_Angeles',
	});
	const [selectedDate, setSelectedDate] = useState(now);
	const [contractors, setContractors] = useState([]);
	const [equipments, setEquipments] = useState([]);
	const [inspections, setInspections] = useState([]);
	const [correctionals, setCorrectionals] = useState([]);
	const [notes, setNotes] = useState();
	const [numbers, setNumbers] = useState([]);
	const handleDateChange = (date) => {
		setSelectedDate(date);
	};
	const [dropdownList, setDropdownList] = useState({
		contractorList: [],
		taskList: [],
		equipmentList: [],
		vendorList: [],
		typeList: [],
		relatedTradeList: [],
	});
	const [checkDownload, setCheckDownload] = useState(0);
	const [coloredDate, setColoredDate] = useState([]);
	const [coloredNoWorkDate, setColoredNoWorkDate] = useState([]);

	const validateContractors = () => {
		for (let i = 0; i < contractors.length; i++) {
			if (contractors[i].Contractor === '') {
				if (
					contractors[i].Location !== '' ||
					(contractors[i].NumSuper !== 0 && contractors[i].NumSuper !== '') ||
					(contractors[i].NumWorker !== 0 && contractors[i].NumWorker !== '') ||
					(contractors[i].WorkHours !== 0 && contractors[i].WorkHours !== '') ||
					contractors[i].Task !== ''
				) {
					return {
						status: false,
						message: `Please fill in all fields. Contractor field is empty.`,
					};
				}
			}
		}
		return {
			status: true,
			message: '',
		};
	};
	const validateEquipments = () => {
		// check equipments
		for (let i = 0; i < equipments.length; i++) {
			if (equipments[i].Equipment === '') {
				if (
					equipments[i].MoveIn !== '' ||
					equipments[i].MoveOut !== '' ||
					equipments[i].Vendor !== '' ||
					equipments[i].Note !== ''
				) {
					return {
						status: false,
						message: `Please fill in all fields. Equipment field is empty.`,
					};
				}
			} else {
				if (equipments[i].MoveIn == '')
					return {
						status: false,
						message: `Please fill in all fields. "Move In" in Equipment field is empty.`,
					};
			}
		}
		return {
			status: true,
			message: '',
		};
	};

	const validateInspections = () => {
		// check inspections
		for (let i = 0; i < inspections.length; i++) {
			if (inspections[i].Inspector === '') {
				if (
					inspections[i].Agency !== '' ||
					inspections[i].Location !== '' ||
					inspections[i].Task !== '' ||
					inspections[i].Result !== ''
				) {
					return {
						status: false,
						message: `Please fill in all fields. Inspector field is empty.`,
					};
				}
			}
		}
		return {
			status: true,
			message: '',
		};
	};
	const validateCorretionals = () => {
		// check correctionals
		for (let i = 0; i < correctionals.length; i++) {
			if (correctionals[i].Deficiency === '') {
				if (
					correctionals[i].Type !== '' ||
					correctionals[i].Trade !== '' ||
					correctionals[i].Description !== ''
				) {
					return {
						status: false,
						message: `Please fill in all fields. Deficiency field is empty.`,
					};
				}
			}
		}
		return {
			status: true,
			message: '',
		};
	};

	const showNoWork = () => {
		for (let i = 0; i < contractors.length; i++) {
			if (contractors[i].Contractor !== '') {
				return false;
			}
		}
		return true;
	};

	const save = () => {
		console.log(status.cookies.employeeid);
		let promises = [];
		const fetchData = async () => {
			const reportID = (
				await axios.post(`/api/record/daily-report`, {
					ProjectID: router.query.pid,
					Date: formatDate(selectedDate),
					EmployeeID: status.cookies.employeeid,
					Note: notes ? notes[0].Note : '',
				})
			).data.result[0][0].ReportID;

			if (contractors.length > 0) {
				for (let i = 0; i < contractors.length; i++) {
					if (contractors[i].Contractor !== '') {
						await axios
							.post(`/api/record/daily-report/contractor`, {
								...contractors[i],
								ReportID: reportID,
							})
							.catch((err) => alert(err));
					}
				}
			}

			if (equipments.length > 0) {
				for (let i = 0; i < equipments.length; i++) {
					if (equipments[i].Equipment !== '') {
						await axios
							.post(`/api/record/daily-report/equipment`, {
								...equipments[i],
								ProjectID: projectState,
							})
							.catch((err) => alert(err));
					}
				}
			}

			if (inspections.length > 0) {
				for (let i = 0; i < inspections.length; i++) {
					if (inspections[i].Inspector !== '') {
						await axios
							.post(`/api/record/daily-report/inspection`, {
								...inspections[i],
								ReportID: reportID,
							})
							.catch((err) => alert(err));
					}
				}
			}

			if (correctionals.length > 0) {
				console.log(correctionals);
				for (let i = 0; i < correctionals.length; i++) {
					if (correctionals[i].Deficiency !== '') {
						await axios
							.post(`/api/record/daily-report/correctional`, {
								...correctionals[i],
								ReportID: reportID,
							})
							.catch((err) => alert(err));
					}
					if (correctionals[i].exist != true) {
						console.log('hello');

						await axios
							.post(`/api/record/deficiency-log`, {
								...correctionals[i],
								ProjectID: projectState,
								EmployeeID: status.cookies.employeeid,
							})
							.then((res) => alert('hi'))
							.catch((err) => alert(err));
					}
				}
			}
		};

		promises.push(fetchData());
		trackPromise(
			Promise.all(promises).then(() => {
				toast.success(
					<div className={styles['alert__complete']}>
						<strong>Save Complete</strong>
					</div>,
					{
						position: toast.POSITION.BOTTOM_CENTER,
						hideProgressBar: true,
					},
				);
			}),
		);
	};

	const saveHandler = async () => {
		const validateResponse = [
			validateContractors(),
			validateEquipments(),
			validateInspections(),
			validateCorretionals(),
		];

		const validate = await Promise.all(validateResponse);

		if (validate.every((item) => item.status)) {
			save();
		} else {
			validate.map((item, index) => {
				if (item.status === false) {
					toast.error(
						<div className={styles['alert__complete']}>
							<strong>{item.message}</strong>
						</div>,
						{
							position: toast.POSITION.BOTTOM_CENTER,
							hideProgressBar: true,
						},
					);
				}
			});
		}
	};

	const exportToCustomer = async () => {
		// Start spinner
		setCheckDownload(1);

		// Check first column exist start
		let tempContractors = [];
		contractors.forEach((contractor) => {
			if (contractor.Contractor !== '' && contractor.Contractor !== null)
				tempContractors.push(contractor);
		});

		let tempInspections = [];
		inspections.forEach((inspection) => {
			if (inspection.Inspector !== '' && inspection.Inspector !== null)
				tempInspections.push(inspection);
		});
		// Check first column exist finish

		const currentProject = stateAssignedProject.find(
			(project) => project.ProjectID == projectState,
		);

		// Read, write and save excel
		await axios({
			method: 'post',
			url: '/api/record/excel-export',
			timeout: 15000, // 15 seconds timeout
			headers: {},
			data: {
				projectName: currentProject.ProjectName,
				date: formatDate(selectedDate),
				contractNo: numbers.ContractNumber,
				jobNumber: currentProject.JobNumber,
				taskOrderNo: numbers.TaskOrder ? numbers.TaskOrder : '',
				documentedBy: status.cookies.fullname,
				contractors: tempContractors,
				inspectors: tempInspections,
				note: notes ? notes[0].Note : '',
				userID: status.cookies.employeeid,
			},
		});

		// Download excel after 3 seconds
		setTimeout(() => {
			document
				.getElementById('excelExport')
				.setAttribute(
					'href',
					'/record/ToCustomer_' + status.cookies.employeeid + '.xlsx',
				);
			document.getElementById('excelExport').click();

			// Finish spinner
			setCheckDownload(0);
			toast.success(
				<div className={styles['alert__complete']}>
					<strong>Download Complete</strong>
				</div>,
				{
					position: toast.POSITION.BOTTOM_CENTER,
					hideProgressBar: true,
				},
			);
		}, 3000);
	};

	const exportPDF = async () => {
		// Start spinner
		setCheckDownload(1);

		// Check first column exist start
		let tempContractors = [];
		contractors.forEach((contractor) => {
			if (contractor.Contractor !== '' && contractor.Contractor !== null)
				tempContractors.push(contractor);
		});

		let tempInspections = [];
		inspections.forEach((inspection) => {
			if (inspection.Inspector !== '' && inspection.Inspector !== null)
				tempInspections.push(inspection);
		});
		// Check first column exist finish

		const currentProject = stateAssignedProject.find(
			(project) => project.ProjectID == projectState,
		);

		// Read, write and save excel
		await axios({
			method: 'post',
			url: '/api/record/pdf-export',
			timeout: 15000, // 15 seconds timeout
			headers: {},
			data: {
				projectName: currentProject.ProjectName,
				date: formatDate(selectedDate),
				contractNo: numbers.ContractNumber,
				jobNumber: currentProject.JobNumber,
				taskOrderNo: numbers.TaskOrder ? numbers.TaskOrder : '',
				documentedBy: status.cookies.fullname,
				contractors: tempContractors,
				inspectors: tempInspections,
				note: notes ? notes[0].Note : '',
				userID: status.cookies.employeeid,
			},
		});

		// Download excel after 3 seconds
		setTimeout(() => {
			document
				.getElementById('excelExport')
				.setAttribute(
					'href',
					'/record/ToCustomer_' + status.cookies.employeeid + '.pdf',
				);
			document.getElementById('excelExport').click();

			// Finish spinner
			setCheckDownload(0);
			toast.success(
				<div className={styles['alert__complete']}>
					<strong>Download Complete</strong>
				</div>,
				{
					position: toast.POSITION.BOTTOM_CENTER,
					hideProgressBar: true,
				},
			);
		}, 3000);
	};

	const exportToCustomerHandler = async () => {
		const validateResponse = [
			validateContractors(),
			validateEquipments(),
			validateInspections(),
			validateCorretionals(),
		];

		const validate = await Promise.all(validateResponse);

		if (validate.every((item) => item.status)) {
			exportToCustomer();
		} else {
			validate.map((item, index) => {
				if (item.status === false) {
					toast.error(
						<div className={styles['alert__complete']}>
							<strong>{item.message}</strong>
						</div>,
						{
							position: toast.POSITION.BOTTOM_CENTER,
							hideProgressBar: true,
						},
					);
				}
			});
		}
	};

	const exportPDFHandler = async () => {
		const validateResponse = [
			validateContractors(),
			validateEquipments(),
			validateInspections(),
			validateCorretionals(),
		];

		const validate = await Promise.all(validateResponse);

		if (validate.every((item) => item.status)) {
			exportPDF();
		} else {
			validate.map((item, index) => {
				if (item.status === false) {
					toast.error(
						<div className={styles['alert__complete']}>
							<strong>{item.message}</strong>
						</div>,
						{
							position: toast.POSITION.BOTTOM_CENTER,
							hideProgressBar: true,
						},
					);
				}
			});
		}
	};

	useEffect(() => {
		if (!router.isReady) return;

		let promises = [];

		const fetchData = async () => {
			if (status.cookies.username !== 0) {
				if (status.cookies.username !== undefined) {
					await axios({
						method: 'post',
						url: `/api/daily-report/signin`,
						timeout: 1000000,
						headers: {},
						data: {
							Username: status.cookies.username,
							Password: status.cookies.password,
						},
					})
						.then((response) => {
							const assignedProject = response.data.result.recordsets[1];
							setStateAssignedProject(response.data.result.recordsets[1]);

							if (
								response.data.result.recordsets[1].length > 0 &&
								projectState === undefined
							) {
								if (router.query.pid) {
									setProjectState(router.query.pid);
								} else {
									setProjectState(
										'' + response.data.result.recordsets[1][0].ProjectID,
									);
								}
							}

							if (status.permission === true && projectState !== undefined) {
								let check = 0;
								for (let i = 0; i < assignedProject.length; i++) {
									if (
										assignedProject[i].ProjectID.toString() === projectState
									) {
										check++;
										break;
									}
								}
								if (check === 0) {
									setStatus((prevState) => ({
										...prevState,
										permission: false,
									}));
								}
							}
						})
						.catch((err) => {
							alert(
								'Loading Error.(POST /api/daily-report/signin) \n\nPlease try again.\n\nPlease contact IT if the issue still persists. (Hyunmyung Kim 201-554-6666)\n\n' +
									err,
							);
						});
				}
			} else {
				setStatus((prevState) => ({
					...prevState,
					cookies: {
						username: cookies.username,
						password: cookies.password,
						fullname: cookies.fullname,
						employeeid: cookies.employeeid,
					},
				}));
			}

			if (status.permission === true && projectState !== undefined) {
				router.push(`?pid=${projectState}`);
				const fetchContractorList = await axios(
					`/api/record/daily-report/contractor?pid=${projectState}`,
				);
				const fetchCorrectionalList = await axios(
					`/api/record/daily-report/correctional`,
				);
				const fetchEquipmentList = await axios(
					`/api/record/daily-report/equipment`,
				);
				setDropdownList({
					contractorList: fetchContractorList.data.result[0],
					taskList: fetchContractorList.data.result[1],
					equipmentList: fetchEquipmentList.data.result[0],
					vendorList: fetchEquipmentList.data.result[1],
					typeList: fetchCorrectionalList.data.result[0],
					relatedTradeList: fetchCorrectionalList.data.result[1],
				});

				// setContractorList(fetchContractorList);
				const res = await axios.get(
					`/api/record/daily-report?pid=${router.query.pid}&date=${formatDate(
						selectedDate,
					)}`,
				);
				setContractors(
					res.data.result[0].length > 0
						? res.data.result[0]
						: [
								{
									Contractor: '',
									Location: '',
									NumSuper: '',
									NumWorker: '',
									WorkHours: '',
									Task: '',
								},
						  ],
				);
				setEquipments(
					res.data.result[1].length > 0
						? res.data.result[1]
						: [
								{
									Equipment: '',
									MoveIn: '',
									MoveOut: '',
									Vendor: '',
									Note: '',
								},
						  ],
				);
				setInspections(
					res.data.result[2].length > 0
						? res.data.result[2]
						: [
								{
									Inspector: '',
									Agency: '',
									Location: '',
									Task: '',
									Result: '',
								},
						  ],
				);
				setCorrectionals(
					res.data.result[3].length > 0
						? res.data.result[3].map((item) => {
								return { ...item, exist: true };
						  })
						: [
								{
									Deficiency: '',
									OpenedBy: '',
									Type: '',
									Trade: '',
									Description: '',
								},
						  ],
				);
				setNotes(
					res.data.result[4].length > 0
						? res.data.result[4]
						: [
								{
									NoteID: '',
									Note: '',
								},
						  ],
				);
				setNumbers(res.data.result[5][0]);
				let SelectedDays = [];
				res.data.result[6].forEach((element) => {
					SelectedDays.push(formatDate(element.Date));
				});

				setColoredDate(SelectedDays);

				let SelectedDays2 = [];
				res.data.result[7].forEach((element) => {
					SelectedDays2.push(formatDate(element.Date));
				});

				setColoredNoWorkDate(SelectedDays2);
			} else {
				setData('');
			}
		};

		promises.push(fetchData());
		trackPromise(Promise.all(promises).then(() => {}));
	}, [selectedDate, projectState, status, router.isReady, router.query.pid]);

	useEffect(() => {
		if (typeof stateAssignedProject[0] == 'undefined') {
			setTimeout(() => {
				setStateNoAssigned(true);
			}, 3000);
		} else {
			setStateNoAssigned(false);
		}
	}, [stateAssignedProject]);

	const signin = async (username, password) => {
		await axios({
			method: 'post',
			url: `/api/daily-report/signin`,
			timeout: 1000000,
			headers: {},
			data: {
				Username: username,
				Password: password,
			},
		}).then((response) => {
			if (response.data.result.recordset[0] !== undefined) {
				setCookie('username', username, { path: '/', maxAge: 3600 * 24 * 30 });
				setCookie('password', password, { path: '/', maxAge: 3600 * 24 * 30 });
				setCookie('fullname', response.data.result.recordset[0].FullName, {
					path: '/',
					maxAge: 3600 * 24 * 30,
				});
				setCookie('employeeid', response.data.result.recordset[0].EmployeeID, {
					path: '/',
					maxAge: 3600 * 24 * 30,
				});
				setStatus((prevState) => ({
					...prevState,
					cookies: {
						username: username,
						password: password,
						fullname: response.data.result.recordset[0].FullName,
						employeeid: response.data.result.recordset[0].EmployeeID,
					},
				}));
			} else {
				alert('Login failed.');
			}
		});
	};

	const logout = () => {
		// setData([]);
		removeCookie('username', { path: '/' });
		removeCookie('password', { path: '/' });
		removeCookie('fullname', { path: '/' });
		removeCookie('employeeid', { path: '/' });
		setStatus((prevState) => ({
			permission: true,
			cookies: {
				username: undefined,
				password: 0,
				fullname: '',
				employeeid: 0,
			},
		}));
	};

	const addRowHandler = (type) => {
		if (type === 'contractors') {
			setContractors((prevState) => [
				...prevState,
				{
					Contractor: '',
					Location: '',
					NumSuper: '',
					NumWorker: '',
					WorkHours: '',
					Task: '',
				},
			]);
		} else if (type === 'equipments') {
			setEquipments((prevState) => [
				...prevState,
				{
					Equipment: '',
					MoveIn: '',
					MoveOut: '',
					Vendor: '',
					Note: '',
				},
			]);
		} else if (type === 'inspections') {
			setInspections((prevState) => [
				...prevState,
				{
					Inspector: '',
					Agency: '',
					Location: '',
					Task: '',
					Result: '',
				},
			]);
		} else if (type === 'correctionals') {
			setCorrectionals((prevState) => [
				...prevState,
				{
					Deficiency: '',
					OpenedBy: '',
					Type: '',
					Trade: '',
					Description: '',
				},
			]);
		} else if (type === 'notes') {
			setNotes((prevState) => [
				...prevState,
				{
					NoteID: '',
					Note: '',
				},
			]);
		}
	};

	const handleChange = (e, type, index) => {
		e.persist();

		if (type === 'contractors') {
			setContractors((prevState) => {
				const newState = [...prevState];
				newState[index][e.target.name] = e.target.value;
				return newState;
			});
		} else if (type === 'equipments') {
			setEquipments((prevState) => {
				const newState = [...prevState];
				newState[index][e.target.name] = e.target.value;
				return newState;
			});
		} else if (type === 'inspections') {
			setInspections((prevState) => {
				const newState = [...prevState];
				newState[index][e.target.name] = e.target.value;
				return newState;
			});
		} else if (type === 'correctionals') {
			setCorrectionals((prevState) => {
				const newState = [...prevState];
				newState[index][e.target.name] = e.target.value;
				return newState;
			});
		} else if (type === 'notes') {
			setNotes((prevState) => {
				const newState = [...prevState];
				newState[index][e.target.name] = e.target.value;
				return newState;
			});
		}
	};
	const handleAutoComplete = (val, type, key, index) => {
		if (type === 'contractors') {
			setContractors((prevState) => {
				const newState = [...prevState];
				newState[index][key] = val;
				return newState;
			});
		} else if (type === 'equipments') {
			setEquipments((prevState) => {
				const newState = [...prevState];
				newState[index][key] = val;
				return newState;
			});
		} else if (type === 'correctionals') {
			setCorrectionals((prevState) => {
				const newState = [...prevState];
				newState[index][key] = val;
				return newState;
			});
		}
	};

	const removeRowHandler = (type, index) => {
		if (type === 'contractors') {
			setContractors((prevState) => {
				const newState = [...prevState];
				newState.splice(index, 1);
				return newState;
			});
		} else if (type === 'equipments') {
			setEquipments((prevState) => {
				const newState = [...prevState];
				newState.splice(index, 1);
				return newState;
			});
		} else if (type === 'inspections') {
			setInspections((prevState) => {
				const newState = [...prevState];
				newState.splice(index, 1);
				return newState;
			});
		} else if (type === 'correctionals') {
			setCorrectionals((prevState) => {
				const newState = [...prevState];
				newState.splice(index, 1);
				return newState;
			});
		} else if (type === 'notes') {
			setNotes((prevState) => {
				const newState = [...prevState];
				newState.splice(index, 1);
				return newState;
			});
		}
	};
	console.log(status.cookies);
	return (
		<>
			<Head>
				<title>Daily Report</title>
				<link rel="icon" href="/favicon.ico" />
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width"
				/>
			</Head>
			{status.cookies.username === undefined ||
			status.cookies.employeeid === undefined ? (
				<Login signin={signin} />
			) : !status.permission || stateNoAssigned === true ? (
				<NotPermission path="record" />
			) : (
				<>
					<SimpleTabs
						tapNo={1}
						projectState={projectState}
						main={false}
						employeeID={status.cookies.employeeid}
						employeeName={status.cookies.fullname}
						logout={logout}
						style={{ display: 'none' }}
					/>
					{promiseInProgress || !projectState || checkDownload ? (
						// || !(data.length >= 0)
						<div
							style={{
								marginTop: '30px',
								width: '100%',
								height: '100',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Loader type="Oval" color="#4e88de" height="150" width="150" />
						</div>
					) : (
						<Container id="record" className={styles['container']}>
							<Row>
								<Col>
									<h1 className={styles['title']}>Record</h1>
									<div className={styles['header']}>
										<div className={styles['header__left']}>
											<select
												id="project_dropdown"
												value={projectState}
												onChange={(e) => setProjectState(e.target.value)}
												style={{
													fontFamily: 'Roboto, sans-serif',
													fontSize: 'medium',
													display: 'inline-block',
													color: '#74646e',
													border: '1px solid #c8bfc4',
													borderRadius: '4px',
													boxShadow: 'inset 1px 1px 2px #ddd8dc',
													background: '#fff',
													// zIndex: modalNoWork.isOpen ? "0" : "1",
													position: 'relative',
													height: '30px',
													marginBottom: '3px',
													width: resolution602
														? '450px'
														: resolution1008
														? '500px'
														: '800px',
												}}
											>
												{stateAssignedProject.map((item) => {
													return (
														<option
															value={item.ProjectID}
															key={item.ProjectID}
															projectgroup={item.ProjectGroup}
															projectname={item.ProjectName}
														>
															{item.JobNumber} &emsp;[{item.ProjectGroup}]&ensp;
															{item.ProjectName}
														</option>
													);
												})}
											</select>
											<div
												className="position-relative"
												style={{ width: '190px' }}
											>
												<MuiPickersUtilsProvider utils={DateFnsUtils}>
													<DatePicker
														margin="normal"
														id="datePickerDialog"
														format="MM/dd/yyyy"
														value={selectedDate}
														onChange={handleDateChange}
														className={styles['header__right__date-picker']}
														autoOk={true}
														okLabel=""
														renderDay={(
															day,
															selectedDate,
															isInCurrentMonth,
															dayComponent,
														) => {
															const isSelected =
																isInCurrentMonth &&
																coloredDate.includes(formatDate(day));

															const isSelectedNoWork =
																isInCurrentMonth &&
																coloredNoWorkDate.includes(formatDate(day));
															// You can also use our internal <Day /> component
															return (
																// <Badge badgeContent={isSelected ? "🌚" : undefined}>
																//   {dayComponent}
																// </Badge>
																<div
																	style={
																		isSelected
																			? {
																					backgroundColor: '#ffbb00',
																					borderRadius: '40%',
																			  }
																			: isSelectedNoWork
																			? {
																					backgroundColor: '#ff7374',
																					borderRadius: '40%',
																			  }
																			: undefined
																	}
																>
																	{dayComponent}
																</div>
															);
														}}
													/>
												</MuiPickersUtilsProvider>
											</div>
										</div>
										<div className={styles['header__right']}>
											<MUIButton
												variant="contained"
												color="primary"
												size="small"
												className={styles['header__right__save-btn']}
												startIcon={<SaveIcon />}
												onClick={() => saveHandler()}
											>
												Save
											</MUIButton>
											<MUIButton
												variant="contained"
												color="primary"
												size="small"
												className={styles['header__right__excel-export-btn']}
												startIcon={<RiFileExcel2Fill />}
												onClick={() => exportToCustomerHandler()}
												style={{ marginRight: '10px' }}
											>
												Customer
											</MUIButton>
											{/* <MUIButton
												variant="contained"
												color="primary"
												size="small"
												className={styles['header__right__pdf-export-btn']}
												startIcon={<FaFilePdf />}
												onClick={() => exportPDFHandler()}
												style={{ marginRight: '10px' }}
											>
												Customer
											</MUIButton> */}
										</div>
									</div>
								</Col>
							</Row>
							<>
								<Row>
									<Col>
										<Table>
											<thead>
												<tr>
													<th
														className="text-center border border-gray align-middle border border-gray"
														rowSpan={2}
														minWidth="20%"
														width="20%"
													>
														Contractor
													</th>
													<th
														className="text-center border border-gray align-middle border border-gray"
														rowSpan={2}
														minWidth="20%"
														width="20%"
													>
														Location
													</th>
													<th
														className="text-center border border-gray align-middle border border-gray"
														colSpan={3}
														minWidth="10%"
														width="10%"
													>
														Manpower
													</th>
													<th
														className="text-center border border-gray align-middle border border-gray"
														rowSpan={2}
														minWidth="40%"
														width="40%"
													>
														Task
													</th>

													<th
														className="border-0 fit bg-transparent"
														rowSpan={2}
														minWidth="15%"
														width="15%"
													></th>
												</tr>
												<tr>
													<th className="text-center border border-gray align-middle sub-heading border border-gray">
														No. of Super
													</th>
													<th className="text-center border border-gray align-middle sub-heading border border-gray">
														No. of Workers
													</th>
													<th className="text-center border border-gray align-middle sub-heading border border-gray">
														Work hours
													</th>
												</tr>
											</thead>
											<tbody>
												{contractors.map((contractor, i) => {
													return (
														<tr key={i}>
															<td className="border border-gray">
																<Autocomplete
																	getItemValue={(item) => item.CompanyName}
																	items={dropdownList.contractorList}
																	renderItem={(item, isHighlighted) => (
																		<div
																			style={{
																				background: isHighlighted
																					? 'lightgray'
																					: 'white',
																				paddingLeft: '8px',
																			}}
																		>
																			{item.CompanyName}
																		</div>
																	)}
																	value={contractor.Contractor}
																	onChange={(e) =>
																		handleAutoComplete(
																			e.target.value,
																			'contractors',
																			'Contractor',
																			i,
																		)
																	}
																	onSelect={(val) =>
																		handleAutoComplete(
																			val,
																			'contractors',
																			'Contractor',
																			i,
																		)
																	}
																	menuStyle={{
																		borderRadius: '3px',
																		boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
																		background: 'rgba(255, 255, 255, 0.9)',
																		padding: '2px 0',
																		fontSize: '90%',
																		position: 'fixed',
																		overflow: 'auto',
																		maxHeight: '50%',
																	}}
																></Autocomplete>
															</td>
															<td className="border border-gray">
																<input
																	className="w-100"
																	type="text"
																	value={contractor.Location || ''}
																	name="Location"
																	onChange={(e) =>
																		handleChange(e, 'contractors', i)
																	}
																/>
															</td>
															<td className="border border-gray">
																<input
																	className="w-100 text-right"
																	type="number"
																	value={contractor.NumSuper || ''}
																	name="NumSuper"
																	onChange={(e) =>
																		handleChange(e, 'contractors', i)
																	}
																/>
															</td>
															<td className="border border-gray">
																<input
																	className="w-100"
																	type="number"
																	value={contractor.NumWorker || ''}
																	name="NumWorker"
																	onChange={(e) =>
																		handleChange(e, 'contractors', i)
																	}
																/>
															</td>
															<td className="border border-gray">
																<input
																	className="w-100"
																	type="number"
																	value={contractor.WorkHours || ''}
																	name="WorkHours"
																	onChange={(e) =>
																		handleChange(e, 'contractors', i)
																	}
																/>
															</td>
															<td className="border border-gray">
																<Autocomplete
																	getItemValue={(item) => item.Name}
																	items={dropdownList.taskList}
																	renderItem={(item, isHighlighted) => (
																		<div
																			style={{
																				background: isHighlighted
																					? 'lightgray'
																					: 'white',
																				paddingLeft: '8px',
																			}}
																		>
																			{item.Name}
																		</div>
																	)}
																	value={contractor.Task}
																	onChange={(e) =>
																		handleAutoComplete(
																			e.target.value,
																			'contractors',
																			'Task',
																			i,
																		)
																	}
																	onSelect={(val) =>
																		handleAutoComplete(
																			val,
																			'contractors',
																			'Task',
																			i,
																		)
																	}
																	menuStyle={{
																		borderRadius: '3px',
																		boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
																		background: 'rgba(255, 255, 255, 0.9)',
																		padding: '2px 0',
																		fontSize: '90%',
																		position: 'fixed',
																		overflow: 'auto',
																		maxHeight: '50%',
																	}}
																></Autocomplete>
															</td>

															<td className="padding-0 fit bg-transparent border-0">
																{/* <button
																	onClick={() =>
																		removeRowHandler('contractors', i)
																	}
																	className="border-0 bg-transparent"
																>
																	Remove row
																</button> */}
																<DeleteTwoTone
																	className={styles['table__is-deleted__icon']}
																	onClick={() =>
																		removeRowHandler('contractors', i)
																	}
																/>
															</td>
														</tr>
													);
												})}
												<tr style={{ backgroundColor: 'transparent' }}>
													<td
														colSpan={6}
														className="border border-gray text-center py-2"
													>
														<AddBoxIcon
															className={styles['table__add-icon']}
															onClick={() => addRowHandler('contractors')}
														/>
													</td>
													<td className="border-0 fit bg-transparent">
														<button className="border-0 invisible">
															Remove row
														</button>
													</td>
												</tr>
											</tbody>
											<tfoot>
												<tr>
													<td
														className="text-center border border-gray align-middle heading border border-gray"
														colSpan={2}
													>
														Total
													</td>
													<td className="text-end  palign-middle border border-gray">
														<input
															type="number"
															disabled
															value={contractors.reduce(
																(prev, curr) => prev + Number(curr.NumSuper),
																0,
															)}
															style={{ minWidth: '100px', width: '100px' }}
														/>
													</td>
													<td className="text-end align-middle border border-gray">
														<input
															type="number"
															disabled
															value={contractors.reduce(
																(prev, curr) => prev + Number(curr.NumWorker),
																0,
															)}
															style={{ minWidth: '100px', width: '100px' }}
														/>
													</td>
													<td className="text-end align-middle border border-gray">
														<input
															type="number"
															disabled
															value={contractors.reduce(
																(prev, curr) => prev + Number(curr.WorkHours),
																0,
															)}
															style={{ minWidth: '100px', width: '100px' }}
														/>
													</td>
													<td className="text-center border border-gray align-middle border border-gray">
														{showNoWork() ? 'No on-site work' : ''}
													</td>
													<td className="border-0 fit bg-transparent"></td>
												</tr>
											</tfoot>
										</Table>
									</Col>
								</Row>
								<Row>
									<Col>
										<Table>
											<thead>
												<tr>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '20%',
															width: '20%',
															maxWidth: '20%',
														}}
													>
														Equipment
													</th>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '20%',
															width: '20%',
															maxWidth: '20%',
														}}
													>
														Vendor
													</th>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '135px',
															width: '135px',
															maxWidth: '135px',
														}}
													>
														Move In
													</th>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '135px',
															width: '135px',
															maxWidth: '135px',
														}}
													>
														Move Out
													</th>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: 'auto',
															width: 'auto',
															maxWidth: 'auto',
														}}
													>
														Note
													</th>
													<th className="border-0 fit bg-transparent"></th>
												</tr>
											</thead>
											<tbody>
												{equipments.map((equipment, i) => {
													return (
														<tr key={i}>
															<td className="text-left border border-gray align-middle">
																<Autocomplete
																	getItemValue={(item) => item.Equipment}
																	items={dropdownList.equipmentList}
																	renderItem={(item, isHighlighted) => (
																		<div
																			style={{
																				background: isHighlighted
																					? 'lightgray'
																					: 'white',
																				paddingLeft: '8px',
																			}}
																		>
																			{item.Equipment}
																		</div>
																	)}
																	value={equipment.Equipment}
																	onChange={(e) =>
																		handleAutoComplete(
																			e.target.value,
																			'equipments',
																			'Equipment',
																			i,
																		)
																	}
																	onSelect={(val) =>
																		handleAutoComplete(
																			val,
																			'equipments',
																			'Equipment',
																			i,
																		)
																	}
																	menuStyle={{
																		borderRadius: '3px',
																		boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
																		background: 'rgba(255, 255, 255, 0.9)',
																		padding: '2px 0',
																		fontSize: '90%',
																		position: 'fixed',
																		overflow: 'auto',
																		maxHeight: '50%',
																	}}
																></Autocomplete>
															</td>
															<td className="text-left border border-gray align-middle">
																<Autocomplete
																	getItemValue={(item) => item.VendorName}
																	items={dropdownList.vendorList}
																	renderItem={(item, isHighlighted) => (
																		<div
																			style={{
																				background: isHighlighted
																					? 'lightgray'
																					: 'white',
																				paddingLeft: '8px',
																			}}
																		>
																			{item.VendorName}
																		</div>
																	)}
																	value={equipment.Vendor}
																	onChange={(e) =>
																		handleAutoComplete(
																			e.target.value,
																			'equipments',
																			'Vendor',
																			i,
																		)
																	}
																	onSelect={(val) =>
																		handleAutoComplete(
																			val,
																			'equipments',
																			'Vendor',
																			i,
																		)
																	}
																	menuStyle={{
																		borderRadius: '3px',
																		boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
																		background: 'rgba(255, 255, 255, 0.9)',
																		padding: '2px 0',
																		fontSize: '90%',
																		position: 'fixed',
																		overflow: 'auto',
																		maxHeight: '50%',
																	}}
																></Autocomplete>
															</td>
															<td className="text-center border border-gray align-middle">
																<input
																	style={{
																		minWidth: '130px',
																		width: '130px',
																		maxWidth: '130px',
																	}}
																	className="w-100"
																	type="date"
																	value={
																		equipment.MoveIn ? equipment.MoveIn : ''
																	}
																	name={'MoveIn'}
																	onChange={(e) =>
																		handleChange(e, 'equipments', i)
																	}
																/>
															</td>
															<td className="text-center border border-gray align-middle">
																<input
																	style={{
																		minWidth: '130px',
																		width: '130px',
																		maxWidth: '130px',
																	}}
																	className="w-100"
																	type={'date'}
																	value={
																		equipment.MoveOut ? equipment.MoveOut : ''
																	}
																	name={'MoveOut'}
																	onChange={(e) =>
																		handleChange(e, 'equipments', i)
																	}
																/>
															</td>
															<td className="text-center border border-gray align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={equipment.Note || ''}
																	name={'Note'}
																	onChange={(e) =>
																		handleChange(e, 'equipments', i)
																	}
																/>
															</td>

															<td
																className="padding-0 fit border-0 bg-transparent"
																style={{ backgroundColor: 'transparent' }}
															>
																<DeleteTwoTone
																	className={styles['table__is-deleted__icon']}
																	onClick={() =>
																		removeRowHandler('equipments', i)
																	}
																/>
															</td>
														</tr>
													);
												})}

												<tr
													className="padding-0 border-0 fit"
													style={{ backgroundColor: 'transparent' }}
												>
													<td
														colSpan={5}
														className="border border-gray text-center py-2"
													>
														<AddBoxIcon
															className={styles['table__add-icon']}
															onClick={() => addRowHandler('equipments')}
														/>
													</td>
													<td className="border-0 fit bg-transparent">
														<button className="border-0 invisible">
															Remove row
														</button>
													</td>
												</tr>
											</tbody>
										</Table>
									</Col>
								</Row>

								<Row>
									<Col>
										<Table>
											<thead>
												<tr>
													<th className="border border-gray" colSpan={5}>
														Inspection
													</th>
												</tr>
												<tr>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '20%',
															width: '20%',
															maxWidth: '20%',
														}}
													>
														Name of Inspector
													</th>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '20%',
															width: '20%',
															maxWidth: '20%',
														}}
													>
														Agency
													</th>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '20%',
															width: '20%',
															maxWidth: '20%',
														}}
													>
														Location
													</th>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '20%',
															width: '20%',
															maxWidth: '20%',
														}}
													>
														Task
													</th>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '20%',
															width: '20%',
															maxWidth: '20%',
														}}
													>
														Result
													</th>
													<th className="bg-transparent border-0"></th>
												</tr>
											</thead>
											<tbody>
												{inspections.map((inspection, i) => {
													return (
														<tr key={i}>
															<td className="text-center border border-gray align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={inspection.Inspector || ''}
																	name="Inspector"
																	onChange={(e) =>
																		handleChange(e, 'inspections', i)
																	}
																/>
															</td>
															<td className="text-center border border-gray align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={inspection.Agency || ''}
																	name="Agency"
																	onChange={(e) =>
																		handleChange(e, 'inspections', i)
																	}
																/>
															</td>
															<td className="text-center border border-gray align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={inspection.Location || ''}
																	name="Location"
																	onChange={(e) =>
																		handleChange(e, 'inspections', i)
																	}
																/>
															</td>
															<td className="text-center border border-gray align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={inspection.Task || ''}
																	name="Task"
																	onChange={(e) =>
																		handleChange(e, 'inspections', i)
																	}
																/>
															</td>
															<td className="text-center border border-gray align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={inspection.Result || ''}
																	name="Result"
																	onChange={(e) =>
																		handleChange(e, 'inspections', i)
																	}
																/>
															</td>

															<td
																className="padding-0 fit border-0"
																style={{ backgroundColor: 'transparent' }}
															>
																<DeleteTwoTone
																	className={styles['table__is-deleted__icon']}
																	onClick={() =>
																		removeRowHandler('inspections', i)
																	}
																/>
															</td>
														</tr>
													);
												})}
												<tr
													className="padding-0 fit border-0"
													style={{ backgroundColor: 'transparent' }}
												>
													<td
														colSpan={5}
														className="border border-gray text-center py-2"
													>
														<AddBoxIcon
															className={styles['table__add-icon']}
															onClick={() => addRowHandler('inspections')}
														/>
													</td>
													<td className="border-0 fit bg-transparent">
														<button className="border-0 invisible">
															Remove row
														</button>
													</td>
												</tr>
											</tbody>
										</Table>
									</Col>
								</Row>
								<Row>
									<Col>
										<Table>
											<thead>
												<tr>
													<th className="border border-gray" colSpan={5}>
														Correctional Items
													</th>
													<th className="bg-transparent border-0"></th>
												</tr>
												<tr>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '20%',
															width: '20%',
															maxWidth: '20%',
														}}
													>
														Deficiency Name
													</th>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '20%',
															width: '20%',
															maxWidth: '20%',
														}}
													>
														Opened By
													</th>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '20%',
															width: '20%',
															maxWidth: '20%',
														}}
													>
														Type
													</th>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '20%',
															width: '20%',
															maxWidth: '20%',
														}}
													>
														Related Trade
													</th>
													<th
														className="text-center border border-gray align-middle"
														style={{
															minWidth: '20%',
															width: '20%',
															maxWidth: '20%',
														}}
													>
														Description
													</th>
													<th className="border-0 bg-transparent"></th>
												</tr>
											</thead>
											<tbody>
												{correctionals.map((correctional, i) => {
													return (
														<tr key={i}>
															<td className="text-center border border-gray align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={correctional.Deficiency || ''}
																	name="Deficiency"
																	onChange={(e) =>
																		handleChange(e, 'correctionals', i)
																	}
																/>
															</td>
															<td className="text-left border border-gray align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={correctional.OpenedBy || ''}
																	name="OpenedBy"
																	onChange={(e) =>
																		handleChange(e, 'correctionals', i)
																	}
																/>
															</td>
															<td className="text-left border border-gray align-middle">
																<Autocomplete
																	getItemValue={(item) => item.Type}
																	items={dropdownList.typeList}
																	renderItem={(item, isHighlighted) => (
																		<div
																			style={{
																				background: isHighlighted
																					? 'lightgray'
																					: 'white',
																				paddingLeft: '8px',
																			}}
																		>
																			{item.Type}
																		</div>
																	)}
																	value={correctional.Type}
																	onChange={(e) =>
																		handleAutoComplete(
																			e.target.value,
																			'correctionals',
																			'Type',
																			i,
																		)
																	}
																	onSelect={(val) =>
																		handleAutoComplete(
																			val,
																			'correctionals',
																			'Type',
																			i,
																		)
																	}
																	menuStyle={{
																		borderRadius: '3px',
																		boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
																		background: 'rgba(255, 255, 255, 0.9)',
																		padding: '2px 0',
																		fontSize: '90%',
																		position: 'fixed',
																		overflow: 'auto',
																		maxHeight: '50%',
																	}}
																></Autocomplete>
															</td>
															<td className="text-left border border-gray align-middle">
																<Autocomplete
																	getItemValue={(item) => item.Trade}
																	items={dropdownList.relatedTradeList}
																	renderItem={(item, isHighlighted) => (
																		<div
																			style={{
																				background: isHighlighted
																					? 'lightgray'
																					: 'white',
																				paddingLeft: '8px',
																			}}
																		>
																			{item.Trade}
																		</div>
																	)}
																	value={correctional.Trade || ''}
																	onChange={(e) =>
																		handleAutoComplete(
																			e.target.value,
																			'correctionals',
																			'Trade',
																			i,
																		)
																	}
																	onSelect={(val) =>
																		handleAutoComplete(
																			val,
																			'correctionals',
																			'Trade',
																			i,
																		)
																	}
																	menuStyle={{
																		borderRadius: '3px',
																		boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
																		background: 'rgba(255, 255, 255, 0.9)',
																		padding: '2px 0',
																		fontSize: '90%',
																		position: 'fixed',
																		overflow: 'auto',
																		maxHeight: '50%',
																	}}
																></Autocomplete>
															</td>
															<td className="text-left border border-gray align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={correctional.Description || ''}
																	name="Description"
																	onChange={(e) =>
																		handleChange(e, 'correctionals', i)
																	}
																/>
															</td>
															<td
																className="padding-0 fit border-0"
																style={{ backgroundColor: 'transparent' }}
															>
																<DeleteTwoTone
																	className={styles['table__is-deleted__icon']}
																	onClick={() =>
																		removeRowHandler('correctionals', i)
																	}
																/>
															</td>
														</tr>
													);
												})}

												<tr
													colSpan="5"
													className="padding-0 fit border-0"
													style={{ backgroundColor: 'transparent' }}
												>
													<td
														colSpan={5}
														className="border border-gray text-center py-2"
													>
														<AddBoxIcon
															className={styles['table__add-icon']}
															onClick={() => addRowHandler('correctionals')}
														/>
													</td>
													<td className="border-0 fit bg-transparent">
														<button className="border-0 invisible">
															Remove row
														</button>
													</td>
												</tr>
											</tbody>
										</Table>
									</Col>
								</Row>
								<Row>
									<Col>
										<Table>
											<thead>
												<tr>
													<th className="border border-gray">Note</th>
													<th className="border-0 bg-transparent"></th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td className="text-center border border-gray align-middle">
														<textarea
															className="w-100"
															type="text"
															value={notes ? notes[0].Note : ''}
															name="Note"
															onChange={(e) => handleChange(e, 'notes', 0)}
															multiple={true}
															rows={'3'}
														/>
													</td>
													<td className="border-0 fit bg-transparent">
														<button className="border-0 invisible">
															Remove row
														</button>
													</td>
												</tr>
											</tbody>
										</Table>
									</Col>
								</Row>
							</>
						</Container>
					)}
				</>
			)}
			<a
				id="excelExport"
				href="/export.xlsx"
				download
				style={{ display: 'none' }}
			>
				download
			</a>
		</>
	);
};

export default Record;
