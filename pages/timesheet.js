import { useState, useMemo, useEffect } from "react";
import axios from "axios";

import { useTable, useBlockLayout } from "react-table";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import inputTime from "../components/main/inputTime";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import InputMask from "react-input-mask";
import { formatDate } from "../components/main/formatDate";
import styles from "./Timesheet.module.css";
import classNames from "classnames/bind";
import { usePromiseTracker, trackPromise } from "react-promise-tracker";
import Loader from "react-loader-spinner";
import Head from "next/head";

import MainTab from "../components/MainTab/MainTab";

import { CookiesProvider, useCookies } from "react-cookie";
import Login from "../components/MainTab/login.js";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Router, { useRouter } from "next/router";
import NotPermission from "../components/MainTab/NotPermission";

import AddIcon from "@material-ui/icons/Add";

toast.configure();
let afterSundayCheck = true;

const convertInputToTime = time => {
  let match = inputTime.filter(data => data.input === time);
  if (match[0] === undefined) {
    return "error";
  }
  return match[0].time;
};

const Timesheet = () => {
  const router = useRouter();
  const [projectState, setProjectState] = useState(undefined);
  const [stateAssignedProject, setStateAssignedProject] = useState([]);

  const [cookies, setCookie, removeCookie] = useCookies();
  const [status, setStatus] = useState({
    cookies: {
      username: 0,
      password: 0,
      fullname: "",
      employeeid: 0,
    },
    permission: true,
  });

  const getSunday = d => {
    d = new Date(d);
    let day = d.getDay(),
      diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const date_diff_indays = (date1, date2) => {
    return Math.floor(
      (Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()) -
        Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())) /
        (1000 * 60 * 60 * 24)
    );
  };

  const dateCheckEditable = str => {
    const toStr = str.toLocaleString();
    const newStr =
      toStr.split("/")[0] +
      "/" +
      toStr.split("/")[1] +
      "/" +
      toStr.split("/")[2].slice(0, 4);
    const dateFromStr = new Date(newStr);
    const sundayOfSelected = getSunday(dateFromStr);
    const sundayOfToday = getSunday(now);
    if (date_diff_indays(sundayOfToday, sundayOfSelected) >= 0) {
      afterSundayCheck = true;
      return true;
    } else {
      //Turning on the lockout
      afterSundayCheck = false;
      return false;

      //Turning off the lockout
      // afterSundayCheck = true;
      // return true;
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "Employee Name",
        accessor: "EmployeeName",
        width: 200,
      },
      {
        Header: "Task",
        accessor: "Task",
        width: 240,
      },

      {
        Header: "Work Start",
        accessor: "WorkStart",
        width: 160,
      },
      {
        Header: "Meal Start",
        accessor: "MealStart",
        width: 160,
      },
      {
        Header: "Meal End",
        accessor: "MealEnd",
        width: 160,
      },
      {
        Header: "Work End",
        accessor: "WorkEnd",
        width: 160,
      },
      {
        Header: "Labor Hours",
        accessor: "laborHours",
        width: 120,
      },
    ],
    []
  );

  const [data, setData] = useState(() => []);
  // const [dataEmployees, setDataEmployees] = useState(() => []);

  // Create an editable cell renderer
  const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    row,
    updateMyData, // This is a custom function that we supplied to our table instance
  }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue);

    const onCheckHour = e => {
      if (12 < parseInt(e.target.value) || "00" === e.target.value) {
        toast.warning(
          <div className={styles["alert__table__hour-input"]}>
            Only <strong>01 to 12</strong> can be entered into the time hour
            input.
          </div>,
          {
            position: toast.POSITION.BOTTOM_CENTER,
            hideProgressBar: true,
          }
        );
        setValue("  :" + value.slice(3, 5) + value.slice(5, 7));
      } else {
        setValue(e.target.value + ":" + value.slice(3, 5) + value.slice(5, 7));
      }
    };

    const onCheckMin = e => {
      setValue(value.slice(0, 2) + ":" + e.target.value + value.slice(5, 7));
    };

    const onCheckAmPm = e => {
      if (e.target.value === "AM") {
        setValue(value.slice(0, 2) + ":" + value.slice(3, 5) + "AM");
      } else if (e.target.value === "PM") {
        setValue(value.slice(0, 2) + ":" + value.slice(3, 5) + "PM");
      } else {
        setValue(value.slice(0, 2) + ":" + value.slice(3, 5) + e.target.value);
      }
    };

    const onChange = e => {
      setValue(e.target.value);
    };

    // We'll only update the external data when the input is blurred
    const onBlur = e => {
      if (document.getElementById("checkboxForSetSameTime")) {
        if (document.getElementById("checkboxForSetSameTime").checked) {
          updateMyData(index, id, value);
          setSameTime();
        } else {
          updateMyData(index, id, value);
        }
      } else {
        updateMyData(index, id, value); //important bug fix but why?
      }
    };

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    if (
      id === "WorkStart" ||
      id === "MealStart" ||
      id === "MealEnd" ||
      id === "WorkEnd"
    ) {
      return (
        <div className={styles["table__time-wrapper"]}>
          <InputMask
            value={value.slice(0, 2)}
            onChange={onCheckHour}
            onBlur={onBlur}
            className={
              afterSundayCheck
                ? classNames(
                    "table__time-wrapper__target-disabled",
                    styles["table__time-wrapper__hour-input"]
                  )
                : classNames(
                    "table__time-wrapper__target-disabled",
                    styles["table__time-wrapper__hour-input-before-sunday"]
                  )
            }
            mask="29"
            placeholder="01~12"
            formatChars={{
              2: "[0-1]",
              9: "[0-9]",
            }}
            disabled={afterSundayCheck ? false : true}
          />
          :
          <InputMask
            value={value.slice(3, 5)}
            onChange={onCheckMin}
            onBlur={onBlur}
            className={
              afterSundayCheck
                ? classNames(
                    "table__time-wrapper__target-disabled",
                    styles["table__time-wrapper__min-input"]
                  )
                : classNames(
                    "table__time-wrapper__target-disabled",
                    styles["table__time-wrapper__min-input-before-sunday"]
                  )
            }
            placeholder="00~50"
            mask="50"
            formatChars={{
              5: "[0-5]",
            }}
            disabled={afterSundayCheck ? false : true}
          />
          <select
            value={value.slice(5, 7)}
            onChange={onCheckAmPm}
            onBlur={onBlur}
            className={classNames(
              "table__time-wrapper__target-disabled",
              styles["table__ampm-dropdown"]
            )}
            disabled={afterSundayCheck ? false : true}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      );
    } else if (id === "EmployeeName") {
      return (
        <div>
          <span>{value}</span>
        </div>
      );
    } else if (id === "laborHours") {
      let laborDate = (
        (new Date(convertInputToTime(row.values.WorkEnd).replace(" ", "T")) -
          new Date(convertInputToTime(row.values.WorkStart).replace(" ", "T")) -
          (new Date(convertInputToTime(row.values.MealEnd).replace(" ", "T")) -
            new Date(
              convertInputToTime(row.values.MealStart).replace(" ", "T")
            ))) /
        3600000
      ).toFixed(2);
      if (parseFloat(laborDate) < 0) {
        laborDate = (parseFloat(laborDate) + 24).toFixed(2);
      }

      return (
        <div
          className={classNames([
            styles["table__labor-hours-input"],
            "table__labor-hours-input",
          ])}
        >
          {laborDate}
        </div>
      );
    } else if (id === "Task") {
      return (
        <div>
          <span>{value}</span>
        </div>
      );
    }
  };

  // Set our editable cell renderer as the default Cell renderer
  const defaultColumn = {
    Cell: EditableCell,
  };

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    // We also turn on the flag to not reset the page
    setData(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

  // Use the state and functions returned from useTable to build your UI
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
        defaultColumn,
        updateMyData,
      },
      useBlockLayout
    );
  // Render the UI for your table

  const now = new Date().toLocaleString({
    timeZone: "America/Los_Angeles",
  });

  const [selectedDate, setSelectedDate] = useState(now);

  const handleDateChange = date => {
    setSelectedDate(date);
  };

  useEffect(() => {
    let promises = [];
    if (!router.isReady) return;

    const fetchData = async () => {
      if (status.cookies.username !== 0) {
        console.log("test1");
        if (status.cookies.username !== undefined) {
          axios({
            method: "post",
            url: `/api/daily-report/signin`,
            timeout: 5000, // 2 seconds timeout
            headers: {},
            data: {
              Username: status.cookies.username,
              Password: status.cookies.password,
            },
          })
            .then(response => {
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
                    "" + response.data.result.recordsets[1][0].ProjectID
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
                  setStatus(prevState => ({
                    ...prevState,
                    permission: false,
                  }));
                }
              }
            })
            .catch(err => {
              alert(
                "Loading Error.(POST /api/daily-report/signin) \n\nPlease try again.\n\nPlease contact IT if the issue still persists. (Hyunmyung Kim 201-554-6666)\n\n" +
                  err
              );
            });
        }
      } else {
        console.log("test");
        setStatus(prevState => ({
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
        await axios({
          method: "get",
          url: `/api/timesheets?selectedDate=${formatDate(
            selectedDate
          )}&projectID=${projectState}`,
          timeout: 5000, // 5 seconds timeout
          headers: {},
        }).then(response => {
          if (response.data.result[0].length > 0) {
            setData(response.data.result[0]);
          } else {
            setData([]);
          }
        });
      }
    };
    promises.push(fetchData());
    trackPromise(Promise.all(promises).then(() => {}));
  }, [projectState, status, selectedDate, router.isReady]);

  const handleSaveTimesheetBtn = () => {
    let mealTime = (
      (new Date(convertInputToTime(data[0].MealEnd).replace(" ", "T")) -
        new Date(convertInputToTime(data[0].MealStart).replace(" ", "T"))) /
      3600000
    ).toFixed(2);

    if (parseInt(mealTime) > 5 || parseInt(mealTime) < 0) {
      toast.error(
        <div className={styles["alert__complete"]}>
          <strong>CANNOT SAVE</strong>
          <p>Please check the time input.</p>
        </div>,
        {
          position: toast.POSITION.TOP_CENTER,
          hideProgressBar: true,
        }
      );
    } else {
      axios({
        method: "post",
        url: `/api/self-timesheet`,
        timeout: 3000, // 3 seconds timeout
        headers: {},
        data: {
          Date: formatDate(selectedDate),
          EmployeeID: status.cookies.employeeid,
          WorkStart: data[0].WorkStart,
          WorkEnd: data[0].WorkEnd,
          MealStart: data[0].MealStart,
          MealEnd: data[0].MealEnd,
        },
      })
        .then(res => {
          toast.success(
            <div className={styles["alert__complete"]}>
              <strong>Save Complete</strong>
            </div>,
            {
              position: toast.POSITION.BOTTOM_CENTER,
              hideProgressBar: true,
            }
          );
        })
        .catch(err => {
          toast.error(
            <div className={styles["alert__complete"]}>
              <strong>CANNOT SAVE</strong>
              <p>Please check the time input.</p>
            </div>,
            {
              position: toast.POSITION.TOP_CENTER,
              hideProgressBar: true,
            }
          );
        });

      axios({
        method: "post",
        url: `/api/log-daily-reports`,
        timeout: 5000, // 5 seconds timeout
        headers: {},
        data: {
          EmployeeID: status.cookies.employeeid,
          ProjectID: projectState,
          Date: formatDate(selectedDate),
          Category: "Timesheet",
          Action: "update",
        },
      });
    }
  };

  const { promiseInProgress } = usePromiseTracker();

  const signin = async (username, password) => {
    await axios({
      method: "post",
      url: `/api/daily-report/signin`,
      timeout: 5000, // 5 seconds timeout
      headers: {},
      data: {
        Username: username,
        Password: password,
      },
    }).then(response => {
      if (response.data.result.recordset[0] !== undefined) {
        setCookie("username", username, { path: "/", maxAge: 3600 * 24 * 30 });
        setCookie("password", password, { path: "/", maxAge: 3600 * 24 * 30 });
        setCookie("fullname", response.data.result.recordset[0].FullName, {
          path: "/",
          maxAge: 3600 * 24 * 30,
        });
        setCookie("employeeid", response.data.result.recordset[0].EmployeeID, {
          path: "/",
          maxAge: 3600 * 24 * 30,
        });
        setStatus(prevState => ({
          ...prevState,
          cookies: {
            username: username,
            password: password,
            fullname: response.data.result.recordset[0].FullName,
            employeeid: response.data.result.recordset[0].EmployeeID,
          },
        }));
      } else {
        alert("Login failed.");
      }
    });
  };

  const logout = () => {
    setData([]);
    removeCookie("username", { path: "/" });
    removeCookie("password", { path: "/" });
    removeCookie("fullname", { path: "/" });
    removeCookie("employeeid", { path: "/" });
    setStatus(prevState => ({
      permission: true,
      cookies: {
        username: undefined,
        password: 0,
        fullname: "",
        employeeid: 0,
      },
    }));
  };

  const addTimesheetRow = () => {
    setData([
      ...data,
      {
        TimesheetID: 0,
        EmployeeID: 0,
        EmployeeName: "",
        Date: formatDate(selectedDate),
        Task: "",
        WorkStart: data[0] !== undefined ? data[0].WorkStart : "07:00AM",
        MealStart: data[0] !== undefined ? data[0].MealStart : "12:00PM",
        MealEnd: data[0] !== undefined ? data[0].MealEnd : "01:00PM",
        WorkEnd: data[0] !== undefined ? data[0].WorkEnd : "04:00PM",
      },
    ]);
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
            tapNo={3}
            main={false}
            employeeID={status.cookies.employeeid}
            employeeName={status.cookies.fullname}
            logout={logout}
            projectState={router.query.pid}
          />
          <div id={styles.mainDiv}>
            {promiseInProgress ? (
              <div
                style={{
                  width: "100%",
                  height: "100",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Loader type="Audio" color="#4e88de" height="100" width="100" />
              </div>
            ) : (
              <>
                <h1 className={styles["title"]}>Timesheet</h1>

                <div className={styles["header"]}>
                  <div className={styles["header__left"]}>
                    <select
                      id="project-state-id"
                      value={projectState}
                      onChange={e => setProjectState(e.target.value)}
                      style={{
                        marginBottom: "3px",
                        fontFamily: "Roboto, sans-serif",
                        fontSize: "medium",
                        display: "inline-block",
                        color: "#74646e",
                        border: "1px solid #c8bfc4",
                        borderRadius: "4px",
                        boxShadow: "inset 1px 1px 2px #ddd8dc",
                        background: "#fff",
                        zIndex: "1",
                        position: "relative",
                      }}
                    >
                      {stateAssignedProject.map(item => {
                        return (
                          <option
                            value={item.ProjectID}
                            key={item.ProjectID}
                            projectgroup={item.ProjectGroup}
                            projectname={item.ProjectName}
                            contractno={item.ContractNumber}
                          >
                            {item.ProjectID} &emsp;[{item.ProjectGroup}]&ensp;
                            {item.ProjectName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className={styles["header__right"]}>
                    {/* {dateCheckEditable(selectedDate) && ( */}
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        className={
                          dateCheckEditable(selectedDate)
                            ? styles["header__right__save-btn"]
                            : styles["header__right__save-btn-before-sunday"]
                        }
                        onClick={handleSaveTimesheetBtn}
                        startIcon={<SaveIcon />}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        className={
                          dateCheckEditable(selectedDate)
                            ? styles["header__right__add-btn"]
                            : styles["header__right__add-btn-before-sunday"]
                        }
                        onClick={addTimesheetRow}
                        startIcon={<AddIcon />}
                      >
                        Add&nbsp;Row
                      </Button>
                    </>
                    {/* )} */}
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <DatePicker
                        margin="normal"
                        id="datePickerDialog"
                        format="MM/dd/yyyy"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className={styles["header__right__date-picker"]}
                        autoOk={true}
                        okLabel=""
                      />
                    </MuiPickersUtilsProvider>
                    <p className={styles["header__right__label-date-picker"]}>
                      Date
                    </p>
                  </div>
                </div>
                <div className={styles["table"]}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        {headerGroups.map(headerGroup => (
                          <TableRow {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                              <TableCell {...column.getHeaderProps()}>
                                {column.render("Header")}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableHead>
                      <TableBody>
                        {rows.map((row, i) => {
                          prepareRow(row);
                          return (
                            <TableRow {...row.getRowProps()}>
                              {row.cells.map(cell => {
                                return (
                                  <TableCell {...cell.getCellProps()}>
                                    {cell.render("Cell")}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Timesheet;
