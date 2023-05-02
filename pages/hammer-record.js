import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { usePromiseTracker, trackPromise } from 'react-promise-tracker';
import Loader from 'react-loader-spinner';
import SimpleTabs from '../components/MainTab/HammerMainTab';
import NotPermission from '../components/MainTab/NotPermission';
import { CookiesProvider, useCookies } from 'react-cookie';
import Login from '../components/MainTab/login.js';
import Head from 'next/head';
import { useMediaQuery } from 'react-responsive';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Typeahead } from 'react-bootstrap-typeahead';
import styles from './HammerRecord.module.css';
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
import { wrikeConfig } from '../wrikeConfig';

Object.keys(wrikeConfig).forEach((key) => {
	let value = wrikeConfig[key];
	global[key] = value;
});
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

	const { promiseInProgress } = usePromiseTracker();
	const now = new Date().toLocaleString({
		timeZone: 'America/Los_Angeles',
	});
	const [selectedDate, setSelectedDate] = useState(now);
	const [contractors, setContractors] = useState([]);
	const [equipments, setEquipments] = useState([]);
	const [equipmentDeleteList, setEquipmentDeleteList] = useState([]);
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
	const [currentProject, setCurrentProject] = useState();

	useEffect(() => {
		const fetchProject = async () => {
			const res = await axios.get(
				`/api/record/project?pid=${router.query.pid}`,
			);
			setCurrentProject(res.data.result[0][0]);
		};
		fetchProject();
	}, [router.query.pid]);

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
					correctionals[i].OpenedBy !== '' ||
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

	const createWrikeTask = async (
		wrikeUserIDs,
		folderID,
		deficiencyID,
		deficiencyName,
	) => {
		const url = `https://www.wrike.com/api/v4/folders/${folderID}/tasks`;
		const data = {
			title: `Project ${currentProject.JobNumber} ${deficiencyID} ${deficiencyName}`,
			responsibles:
				NODE_ENV === 'development'
					? [DEV_WRIKE_USER_ID, DEV_WRIKE_USER_ID_2]
					: wrikeUserIDs,
			customStatus: 'IEACA7BEJMBXOWV4',
		};
		return await axios
			.post(url, data, {
				headers: {
					Authorization: `${
						NODE_ENV === 'development'
							? DEV_SANGBIN_WRIKE_API_KEY
							: WRIKE_API_KEY
					}`,
					'Content-Type': 'application/json',
				},
			})
			.then(async (res) => {
				const wrikeTaskID = res.data.data[0].id;
				const wrikeURL = res.data.data[0].permalink;

				return wrikeTaskID;
			});
	};

	const save = async () => {
		let promises = [];
		const fetchData = async () => {
			const reportID = (
				await axios.post(`/api/record/daily-report`, {
					ProjectID: router.query.pid,
					Date: formatDate(selectedDate),
					EmployeeID: router.query.eid,
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

			for (let i = 0; i < equipmentDeleteList.length; i++) {
				await axios.delete(`/api/record/daily-report/equipment`, {
					data: { RecordID: equipmentDeleteList[i] },
				});
			}

			if (equipments.length > 0) {
				for (let i = 0; i < equipments.length; i++) {
					if (equipments[i].Equipment !== '') {
						if (equipments[i].hasOwnProperty('exist')) {
							await axios.delete(`/api/record/daily-report/equipment`, {
								data: { RecordID: equipments[i].RecordID },
							});
						}
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
				for (let i = 0; i < correctionals.length; i++) {
					if (correctionals[i].Deficiency !== '') {
						await axios
							.post(`/api/record/daily-report/correctional`, {
								...correctionals[i],
								ReportID: reportID,
							})
							.catch((err) => alert(err));
					}
					if (
						correctionals[i].Deficiency !== '' &&
						!correctionals[i].hasOwnProperty('exist')
					) {
						const saveData = await saveDeficiency(correctionals[i]);
						const wrikeData = await fetchWrikeData();

						console.log('wrikeData', wrikeData[1][0]);

						const wrikeTaskID = await createWrikeTask(
							wrikeData[0],
							wrikeData[1][0].WrikeFolder,
							saveData.DeficiencyID,
							saveData.DeficiencyName,
						);

						const deficiencyData = {
							...correctionals[i],
							DeficiencyID: saveData.DeficiencyID,
							DeficiencyName: saveData.DeficiencyName,
							ProjectName: currentProject.ProjectName,
						};

						const taskData = await updateWrikeTask(wrikeTaskID, deficiencyData);

						const deficiencyLogData = await updateDeficiencyLog({
							...taskData,
							...saveData,
							...currentProject,
						});
					}
				}
			}
		};
		promises.push(fetchData());
		trackPromise(
			Promise.all(promises).then(async () => {
				await fetchAllData();
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

	const updateDeficiencyLog = async (taskData) => {
		return await axios
			.put('/api/record/deficiency-log-wrike', {
				logID: taskData.RecordID,
				projectID: router.query.pid,
				wrikeTaskID: taskData.wrikeTaskID,
				wrikeURL: taskData.wrikeURL,
			})
			.then(async (res) => {
				return res.data.result;
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const saveDeficiency = async (correctional) => {
		return await axios
			.post(`/api/record/deficiency-log`, {
				...correctional,
				ProjectID: projectState,
				EmployeeID: router.query.eid,
			})
			.then((res) => {
				toast.success(
					<div className={styles['alert__complete']}>
						<strong>Deficiency Log Created</strong>
					</div>,
					{
						position: toast.POSITION.BOTTOM_CENTER,
						hideProgressBar: true,
					},
				);
				return fetchDeficiencyLog(res.data.result[0][0].RecordID);
			})
			.catch((err) => alert(err));
	};

	const fetchDeficiencyLog = async (logID) => {
		return await axios
			.get(`/api/record/deficiency-log?logID=${logID}`)
			.then((res) => {
				return res.data.result[0][0];
			})
			.catch((err) => {
				console.log(err);
				toast.error('Log not added');
			});
	};

	const fetchWrikeData = async () => {
		return await axios
			.get(`/api/record/deficiency-log-wrike?pid=${router.query.pid}`)
			.then((res) => {
				return res.data.result;
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const updateWrikeTask = async (wrikeTaskID, deficiencyData) => {
		const url = `https://www.wrike.com/api/v4/tasks/${wrikeTaskID}`;
		const data = {
			description: `<b>WARNING:</b> Do not enter anything important in the task's description, as it can get overwritten.
			<br><br><b>Project Name:</b> ${deficiencyData.ProjectName} 
			<br><br><b>Deficiency ID:</b> ${deficiencyData.DeficiencyID || ''} 
			<br><b>Deficiency Name:</b> ${deficiencyData.DeficiencyName || ''} 
			<br><b>Opened By:</b> ${deficiencyData.OpenedBy || ''} 
			<br><b>Type:</b> ${deficiencyData.Type || ''} 
			<br><b>Related Trade:</b> ${deficiencyData.Trade || ''} 
			<br><br>${
				(deficiencyData.Problem &&
					deficiencyData.Problem.split('\n').join('<br>')) ||
				''
			}<br><br><b>Loss Provision:</b><br>No items recorded`,
		};

		return await axios
			.put(url, data, {
				headers: {
					Authorization: `${
						NODE_ENV === 'development'
							? DEV_SANGBIN_WRIKE_API_KEY
							: WRIKE_API_KEY
					}`,
					'Content-Type': 'application/json',
				},
			})
			.then(async (res) => {
				const wrikeTaskID = res.data.data[0].id;
				const wrikeURL = res.data.data[0].permalink;

				return { wrikeTaskID, wrikeURL };
			});
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
				documentedBy: router.query.fullname,
				contractors: tempContractors,
				inspectors: tempInspections,
				note: notes ? notes[0].Note : '',
				userID: router.query.eid,
			},
		});

		// Download excel after 3 seconds
		setTimeout(() => {
			document
				.getElementById('excelExport')
				.setAttribute(
					'href',
					'/record/ToCustomer_' + router.query.eid + '.xlsx',
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
				userID: router.query.eid,
			},
		});

		// Download excel after 3 seconds
		setTimeout(() => {
			document
				.getElementById('excelExport')
				.setAttribute(
					'href',
					'/record/ToCustomer_' + router.query.eid + '.pdf',
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
			setProjectState(router.query.pid);

			if (projectState !== undefined) {
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
				await fetchAllData();
			} else {
				setData('');
			}
		};

		promises.push(fetchData());
		trackPromise(Promise.all(promises).then(() => {}));
	}, [selectedDate, projectState, status, router.isReady, router.query.pid]);

	const fetchAllData = async () => {
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
				? res.data.result[1].map((item) => {
						return { ...item, exist: true };
				  })
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
			if (equipments[index].hasOwnProperty('RecordID')) {
				setEquipmentDeleteList((prevState) => {
					const newState = [...prevState];
					newState.push(equipments[index].RecordID);
					return newState;
				});
			}
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
			<>
				{/* <SimpleTabs
					tapNo={1}
					projectState={projectState}
					main={false}
					employeeID={router.query.eid}
					employeeName={status.cookies.fullname}
					logout={logout}
					style={{ display: 'none' }}
				/> */}
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
																				borderRadius: '100%',
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
																value={equipment.MoveIn ? equipment.MoveIn : ''}
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
													Correctional Items (Check details in Deficiency Log)
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
															<Autocomplete
																getItemValue={(item) => item.OpenedBy}
																items={[
																	{
																		OpenedBy: 'PIC',
																	},
																	{
																		OpenedBy: 'Customer',
																	},
																	{
																		OpenedBy: 'Subcontractor',
																	},
																	{
																		OpenedBy: 'Project Control',
																	},
																]}
																renderItem={(item, isHighlighted) => (
																	<div
																		style={{
																			background: isHighlighted
																				? 'lightgray'
																				: 'white',
																			paddingLeft: '8px',
																		}}
																	>
																		{item.OpenedBy}
																	</div>
																)}
																value={correctional.OpenedBy}
																onChange={(e) =>
																	handleAutoComplete(
																		e.target.value,
																		'correctionals',
																		'OpenedBy',
																		i,
																	)
																}
																onSelect={(val) =>
																	handleAutoComplete(
																		val,
																		'correctionals',
																		'OpenedBy',
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
