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
import { Container, Row, Col, Table } from 'react-bootstrap';
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

import styles from './record.module.css';
import { formatDate } from '../lib/utils';
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
	const [data, setData] = useState();
	const [paramPID, setParamPID] = useState(router.query.pid);
	const [contractors, setContractors] = useState([]);
	const [equipments, setEquipments] = useState([]);
	const [inspections, setInspections] = useState([]);
	const [correctionals, setCorrectionals] = useState([]);
	const [notes, setNotes] = useState([]);
	const handleDateChange = (date) => {
		setSelectedDate(date);
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
				const res = await axios.get(
					`/api/record/daily-report?pid=${router.query.pid}&date=${
						selectedDate.split(',')[0]
					}`,
				);
				setContractors(res.data.result[0]);
				setEquipments(res.data.result[1]);
				setInspections(res.data.result[2]);
				setCorrectionals(res.data.result[3]);
				setNotes(res.data.result[4]);
				console.log(res.data.result);
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
					ContractorID: '',
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
					EquipmentID: '',
					Location: '',
					Num: '',
					Task: '',
				},
			]);
		} else if (type === 'inspections') {
			setInspections((prevState) => [
				...prevState,
				{
					InspectionID: '',
					Agency: '',
					NuLocation: '',
					Task: '',
					Result: '',
				},
			]);
		} else if (type === 'correctionals') {
			setCorrectionals((prevState) => [
				...prevState,
				{
					CorrectionalID: '',
					Location: '',
					Num: '',
					Task: '',
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
				console.log('newState', newState);
				console.log('e.target.name', e);
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
						tapNo={2}
						projectState={projectState}
						main={false}
						employeeID={status.cookies.employeeid}
						employeeName={status.cookies.fullname}
						logout={logout}
						style={{ display: 'none' }}
					/>
					{promiseInProgress || !projectState ? (
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
						<Container id="record">
							<>
								<h1 className={styles['title']}>Record</h1>
								<div className={styles['header']}>
									<div className={styles['header__left']}>
										<select
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
											/>
										</MuiPickersUtilsProvider>
									</div>
								</div>
								<Row>
									<Col>
										<Table striped hover>
											<thead>
												<tr>
													<th
														className="text-center align-middle border border-dark"
														rowSpan={2}
													>
														CONTRACTOR
													</th>
													<th
														className="text-center align-middle border border-dark"
														rowSpan={2}
													>
														LOCATION
													</th>
													<th
														className="text-center align-middle border border-dark"
														colSpan={3}
													>
														MANPOWER
													</th>
													<th
														className="text-center align-middle border border-dark"
														rowSpan={2}
													>
														TASK
													</th>

													<th className="border-0 fit" rowSpan={2}></th>
												</tr>
												<tr>
													<th className="text-center align-middle sub-heading border border-dark">
														NO. OF SUPER
													</th>
													<th className="text-center align-middle sub-heading border border-dark">
														NO. OF WORKERS
													</th>
													<th className="text-center align-middle sub-heading border border-dark">
														WORK HOURS
													</th>
												</tr>
											</thead>
											<tbody>
												{contractors.map((contractor, i) => {
													return (
														<tr key={i}>
															<td className="border border-dark">
																<input
																	className="w-100"
																	type="text"
																	value={contractor.Contractor}
																	name="Contractor"
																	onChange={(e) =>
																		handleChange(e, 'contractors', i)
																	}
																/>
															</td>
															<td className="border border-dark">
																<input
																	className="w-100"
																	type="text"
																	value={contractor.Location}
																	name="Location"
																	onChange={(e) =>
																		handleChange(e, 'contractors', i)
																	}
																/>
															</td>
															<td className="border border-dark">
																<input
																	className="w-100"
																	type="number"
																	value={contractor.NumSuper}
																	name="NumSuper"
																	onChange={(e) =>
																		handleChange(e, 'contractors', i)
																	}
																/>
															</td>
															<td className="border border-dark">
																<input
																	className="w-100"
																	type="number"
																	value={contractor.NumWorker}
																	name="NumWorker"
																	onChange={(e) =>
																		handleChange(e, 'contractors', i)
																	}
																/>
															</td>
															<td className="border border-dark">
																<input
																	className="w-100"
																	type="number"
																	value={contractor.WorkHours}
																	name="WorkHours"
																	onChange={(e) =>
																		handleChange(e, 'contractors', i)
																	}
																/>
															</td>
															<td className="border border-dark">
																<input
																	className="w-100"
																	type="text"
																	value={contractor.Task}
																	name="Task"
																	onChange={(e) =>
																		handleChange(e, 'contractors', i)
																	}
																/>
															</td>
															{contractors.length === i + 1 ? (
																<td
																	className="padding-0 fit"
																	style={{ backgroundColor: 'transparent' }}
																>
																	<button
																		onClick={() => addRowHandler('contractors')}
																		className="border-0 bg-transparent"
																	>
																		Add Row
																	</button>
																</td>
															) : null}
														</tr>
													);
												})}
											</tbody>
											<tfoot>
												<tr>
													<td
														className="text-center align-middle heading border border-dark"
														colSpan={2}
													>
														TOTAL
													</td>
													<td className="text-center align-middle border border-dark">
														{contractors.reduce(
															(prev, curr) => prev + Number(curr.NumSuper),
															0,
														)}
													</td>
													<td className="text-center align-middle border border-dark">
														{contractors.reduce(
															(prev, curr) => prev + Number(curr.NumWorker),
															0,
														)}
													</td>
													<td className="text-center align-middle border border-dark">
														{contractors.reduce(
															(prev, curr) => prev + Number(curr.WorkHours),
															0,
														)}
													</td>
													<td className="text-center align-middle border border-dark"></td>
												</tr>
											</tfoot>
										</Table>
									</Col>
								</Row>
								<Row>
									<Col>
										<Table
											className="border border-dark"
											striped
											bordered
											hover
										>
											<thead>
												<tr>
													<th className="text-center align-middle">
														EQUIPMENT
													</th>
													<th className="text-center align-middle">VENDOR</th>
													<th className="text-center align-middle">MOVE IN</th>
													<th className="text-center align-middle">MOVE OUT</th>
													<th className="text-center align-middle">NOTE</th>
													<th className="border-0 fit"></th>
												</tr>
											</thead>
											<tbody>
												{equipments.map((equipment, i) => {
													return (
														<tr key={i}>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={equipment.Equipment}
																	name={equipment.Equipment}
																	onChange={(e) =>
																		handleChange(e, 'equipments', i)
																	}
																/>
															</td>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={equipment.Vendor}
																	name={equipment.Vendor}
																	onChange={(e) =>
																		handleChange(e, 'equipments', i)
																	}
																/>
															</td>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="date"
																	value={formatDate(equipment.MoveIn)}
																	name={'MoveIn'}
																	onChange={(e) =>
																		handleChange(e, 'equipments', i)
																	}
																/>
															</td>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type={'date'}
																	value={formatDate(equipment.MoveOut)}
																	name={'MoveOut'}
																	onChange={(e) =>
																		handleChange(e, 'equipments', i)
																	}
																/>
															</td>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={equipment.Note}
																	name={equipment.Note}
																	onChange={(e) =>
																		handleChange(e, 'equipments', i)
																	}
																/>
															</td>
															{equipments.length === i + 1 ? (
																<td
																	className="padding-0 fit"
																	style={{ backgroundColor: 'transparent' }}
																>
																	<button
																		onClick={() => addRowHandler('equipments')}
																		className="border-0 bg-transparent"
																	>
																		Add Row
																	</button>
																</td>
															) : null}
														</tr>
													);
												})}
											</tbody>
										</Table>
									</Col>
								</Row>

								<Row>
									<Col>
										<Table
											className="border border-dark"
											striped
											bordered
											hover
										>
											<thead>
												<tr>
													<th colSpan={5}>Inspection</th>
												</tr>
												<tr>
													<th className="text-center align-middle">
														Name of Inspector
													</th>
													<th className="text-center align-middle">Agency</th>
													<th className="text-center align-middle">Location</th>
													<th className="text-center align-middle">Task</th>
													<th className="text-center align-middle">Result</th>
													<th></th>
												</tr>
											</thead>
											<tbody>
												{inspections.map((inspection, i) => {
													return (
														<tr key={i}>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={inspection.Inspector}
																	name="Inspector"
																	onChange={(e) =>
																		handleChange(e, 'inspections', i)
																	}
																/>
															</td>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={inspection.Agency}
																	name="Agency"
																	onChange={(e) =>
																		handleChange(e, 'inspections', i)
																	}
																/>
															</td>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={inspection.Location}
																	name="Location"
																	onChange={(e) =>
																		handleChange(e, 'inspections', i)
																	}
																/>
															</td>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={inspection.Task}
																	name="Task"
																	onChange={(e) =>
																		handleChange(e, 'inspections', i)
																	}
																/>
															</td>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={inspection.Result}
																	name="Result"
																	onChange={(e) =>
																		handleChange(e, 'inspections', i)
																	}
																/>
															</td>
															{inspections.length === i + 1 ? (
																<td
																	className="padding-0 fit"
																	style={{ backgroundColor: 'transparent' }}
																>
																	<button
																		onClick={() => addRowHandler('inspections')}
																		className="border-0 bg-transparent"
																	>
																		Add Row
																	</button>
																</td>
															) : null}
														</tr>
													);
												})}
											</tbody>
										</Table>
									</Col>
								</Row>
								<Row>
									<Col>
										<Table
											className="border border-dark"
											striped
											bordered
											hover
										>
											<thead>
												<tr>
													<th colSpan={5}>Correctional Items</th>
												</tr>
												<tr>
													<th className="text-center align-middle">
														Deficiency Name
													</th>
													<th className="text-center align-middle">Type</th>
													<th className="text-center align-middle">
														Related Trade
													</th>
													<th className="text-center align-middle">
														Description
													</th>
													<th></th>
												</tr>
											</thead>
											<tbody>
												{correctionals.map((correctional, i) => {
													return (
														<tr key={i}>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={correctional.Deficiency}
																	name="Deficiency"
																	onChange={(e) =>
																		handleChange(e, 'correctionals', i)
																	}
																/>
															</td>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={correctional.Type}
																	name="Type"
																	onChange={(e) =>
																		handleChange(e, 'correctionals', i)
																	}
																/>
															</td>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={correctional.Trade}
																	name="Trade"
																	onChange={(e) =>
																		handleChange(e, 'correctionals', i)
																	}
																/>
															</td>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={correctional.Description}
																	name="Description"
																	onChange={(e) =>
																		handleChange(e, 'correctionals', i)
																	}
																/>
															</td>
															{correctionals.length === i + 1 ? (
																<td
																	className="padding-0 fit"
																	style={{ backgroundColor: 'transparent' }}
																>
																	<button
																		onClick={() => addRowHandler('inspections')}
																		className="border-0 bg-transparent"
																	>
																		Add Row
																	</button>
																</td>
															) : null}
														</tr>
													);
												})}
											</tbody>
										</Table>
									</Col>
								</Row>
								<Row>
									<Col>
										<Table
											className="border border-dark"
											striped
											bordered
											hover
										>
											<thead>
												<tr>
													<th>Note</th>
												</tr>
											</thead>
											<tbody>
												{notes.map((note, i) => {
													return (
														<tr key={i}>
															<td className="text-center align-middle">
																<input
																	className="w-100"
																	type="text"
																	value={note.Note}
																	name="Note"
																	onChange={(e) => handleChange(e, 'notes', i)}
																/>
															</td>
															{notes.length === i + 1 ? (
																<td
																	className="padding-0 fit"
																	style={{ backgroundColor: 'transparent' }}
																>
																	<button
																		onClick={() => addRowHandler('notes')}
																		className="border-0 bg-transparent"
																	>
																		Add Row
																	</button>
																</td>
															) : null}
														</tr>
													);
												})}
											</tbody>
										</Table>
									</Col>
								</Row>
							</>
						</Container>
					)}
				</>
			)}
		</>
	);
};

export default Record;
