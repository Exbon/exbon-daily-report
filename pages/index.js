import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import { Button } from '@material-ui/core';
import axios from 'axios';
import Router, { useRouter } from 'next/router';
import 'bootstrap/dist/css/bootstrap.min.css';

import MainTab from '../components/MainTab/MainTab.js';

import { CookiesProvider, useCookies } from 'react-cookie';
import Login from '../components/MainTab/login.js';
import Head from 'next/head';
import 'react-toastify/dist/ReactToastify.css';

const index = () => {
	const router = useRouter();

	const [state, setState] = useState({
		prevTab: 'task-completion',
		prevProject: 0,
		assignedProject: [],
	});

	const [cookies, setCookie, removeCookie] = useCookies('username');
	const [status, setStatus] = useState({
		cookies: {
			username: 0,
			password: 0,
			fullname: '',
			employeeid: 0,
		},
	});

	useEffect(() => {
		if (status.cookies.username !== 0) {
			if (status.cookies.username !== undefined) {
				axios({
					method: 'post',
					url: `/api/daily-report/signin`,
					timeout: 5000, // 5 seconds timeout
					headers: {},
					data: {
						Username: status.cookies.username,
						Password: status.cookies.password,
					},
				}).then((response) => {
					//   setAssignedProject(() => response.data.result.recordsets[1]);
					let tab = 'task-completion';
					let project = 0;
					if (router.query.tab !== undefined) tab = router.query.tab;
					if (router.query.project !== undefined)
						project = router.query.project;

					setState({
						prevTab: tab,
						prevProject: project,
						assignedProject: response.data.result.recordsets[1],
					});
				});
			}
		} else {
			setStatus({
				cookies: {
					username: cookies.username,
					password: cookies.password,
					fullname: cookies.fullname,
					employeeid: cookies.employeeid,
				},
			});
		}
	}, [router.query, status, cookies]);

	const clickGo = () => {
		const projectState = document.getElementById('select-project').value;

		Router.push(`/task-completion?pid=${projectState}`);
	};

	const signin = async (username, password) => {
		await axios({
			method: 'post',
			url: `/api/daily-report/signin`,
			timeout: 5000, // 5 seconds timeout
			headers: {},
			data: {
				Username: username,
				Password: password,
			},
		}).then((response) => {
			if (response.data.result.recordset[0] !== undefined) {
				setCookie('username', username, {
					path: '/',
					maxAge: 3600 * 24 * 30,
				});
				setCookie('password', password, {
					path: '/',
					maxAge: 3600 * 24 * 30,
				});
				setCookie(
					'fullname',
					response.data.result.recordset[0].FullName,
					{
						path: '/',
						maxAge: 3600 * 24 * 30,
					}
				);
				setCookie(
					'employeeid',
					response.data.result.recordset[0].EmployeeID,
					{
						path: '/',
						maxAge: 3600 * 24 * 30,
					}
				);
				setStatus((prevState) => ({
					...prevState,
					cookies: {
						username: username,
						password: password,
						fullname: response.data.result.recordset[0].FullName,
						employeeid:
							response.data.result.recordset[0].EmployeeID,
					},
				}));
			} else {
				alert('Login failed.');
			}
		});
	};

	const logout = () => {
		removeCookie('username', { path: '/' });
		removeCookie('password', { path: '/' });
		removeCookie('fullname', { path: '/' });
		removeCookie('employeeid', { path: '/' });
		setStatus({
			cookies: {
				username: undefined,
				password: 0,
				fullname: '',
				employeeid: 0,
			},
		});
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
			) : (
				<>
					<MainTab
						tapNo={0}
						projectState={0}
						main={true}
						employeeID={status.cookies.employeeid}
						employeeName={status.cookies.fullname}
						logout={logout}
					/>
					<div className={styles['wrapper-select-project']}>
						{state.assignedProject.length > 0 ? (
							<>
								<h3 className={styles['projectID-text']}>
									Project ID
								</h3>

								<select
									id="select-project"
									className={
										styles[
											'wrapper-select-project__select-project'
										]
									}
									defaultValue={state.prevProject}
								>
									{state.assignedProject.map((item) => {
										return (
											<option
												key={item.ProjectID}
												value={item.ProjectID}
												// selected={state.prevProject === item.ProjectID ? true : false}
											>
												{item.JobNumber}
											</option>
										);
									})}
								</select>

								<Button
									// onClick={handleProjectState}
									color="primary"
									className={
										styles['wrapper-select-project__btn-go']
									}
									onClick={clickGo}
								>
									Go
								</Button>
							</>
						) : (
							<p className={styles['test-animation']}>
								You have NO permission.
							</p>
						)}
					</div>
				</>
			)}
		</>
	);
};

export default index;
