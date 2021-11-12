import { useState, useMemo, useEffect } from "react";
import axios from "axios";

import {
  useTable,
  useBlockLayout,
  useGroupBy,
  useExpanded,
  useSortBy,
} from "react-table";
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
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import Autocomplete from "react-autocomplete";

import AddCircleIcon from "@material-ui/icons/AddCircle";

import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

import moment from "moment";
import Modal from "react-modal";

toast.configure();
let afterSundayCheck = true;
let dataEmployees = [];
let dataTasks = [];
let dataLatest = [];
let tid = 0;

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
  const [checkDisableAddEmployeeButton, setCheckDisableAddEmployeeButton] =
    useState(false);
  const [stateAssignedProject, setStateAssignedProject] = useState([
    { ProjectID: 0 },
  ]);
  const [stateNoAssigned, setStateNoAssigned] = useState([]);
  const [checkState, setCheckState] = useState(true);
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
        width: 280,
        aggregate: "count",
        // Aggregated: ({ value }) => `${value} Names`,
        canGroupBy: true,
        isGrouped: true,
      },
      {
        Header: "Task",
        accessor: "TaskID",
        width: 340,
        canGroupBy: false,
      },

      {
        Header: "Start Time",
        accessor: "Start",
        width: 160,
        canGroupBy: false,
      },

      {
        Header: "End Time",
        accessor: "Finish",
        width: 160,
        canGroupBy: false,
      },
      {
        Header: "Labor Hours",
        accessor: "Length",
        width: 120,
        aggregate: "sum",
        Aggregated: ({ value, row }) => {
          let sumLabor = 0;
          let min = [];
          let max = [];
          let meal = { start: 0, finish: 0 };

          row.leafRows.forEach(element => {
            min.push(
              new Date(
                convertInputToTime(element.values.Start).replace(" ", "T")
              )
            );
            max.push(
              new Date(
                convertInputToTime(element.values.Finish).replace(" ", "T")
              )
            );
            if (element.values.TaskID === -2) {
              meal.start = new Date(
                convertInputToTime(element.values.Start).replace(" ", "T")
              );

              meal.finish = new Date(
                convertInputToTime(element.values.Finish).replace(" ", "T")
              );
            }
          });

          sumLabor = (
            (Math.max(...max) - Math.min(...min) - (meal.finish - meal.start)) /
            3600000
          ).toFixed(2);

          // row.leafRows.forEach(element => {
          //   let x = parseFloat(
          //     (
          //       (new Date(
          //         convertInputToTime(element.values.Finish).replace(" ", "T")
          //       ) -
          //         new Date(
          //           convertInputToTime(element.values.Start).replace(" ", "T")
          //         )) /
          //       3600000
          //     ).toFixed(2)
          //   );
          //   if (x < 0) x += 24;
          //   sumLabor += x;
          // });

          return (
            <div
              className={classNames([
                styles["table__labor-hours-input"],
                "table__labor-hours-input",
              ])}
            >
              {sumLabor} (total)
            </div>
          );
        },
        canGroupBy: false,
      },
      {
        Header: "Action", //Delete Timesheet
        accessor: "TimesheetID",
        width: 90,
        canGroupBy: false,
      },
    ],
    []
  );

  const [data, setData] = useState(() => []);
  const [dataView, setDataView] = useState(() => []);
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

    const onChangeSelectEmployee = e => {
      setValue(e.target.value);
      row.leafRows.forEach(element => {
        updateEmployeeData(element.values.TimesheetID, id, e.target.value);
      });
    };

    // We'll only update the external data when the input is blurred
    const onBlur = e => {
      updateMyData(row.values.TimesheetID, id, e.target.value);
    };

    const onBlurForTime = e => {
      updateMyData(row.values.TimesheetID, id, value);
    };

    const onBlurForEmployee = e => {
      checkAddEmployeeStatus();
      row.leafRows.forEach(element => {
        updateEmployeeData(element.values.TimesheetID, id, e.target.value);
      });
    };

    const onBlurForTasks = e => {
      updateMyData(row.values.TimesheetID, id, parseInt(e.target.value));
    };

    const clickDeleteTimesheet = value => {
      //value = TimesheetID
      deleteTimesheetRow(row.values.TimesheetID);
    };

    const clickAddTimesheet = name => {
      addEmployeeRow(name);
    };

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    if (id === "Start" || id === "Finish") {
      if (value === null) return <></>;
      return (
        <div className={styles["table__time-wrapper"]}>
          <InputMask
            value={value.slice(0, 2)}
            onChange={onCheckHour}
            onBlur={onBlurForTime}
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
            onBlur={onBlurForTime}
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
            onBlur={onBlurForTime}
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
    } else if (id === "TimesheetID") {
      if (afterSundayCheck === true) {
        if (row.values.Finish === null) {
          return (
            <AddCircleIcon
              className={styles["table__add-icon"]}
              onClick={() => clickAddTimesheet(row.values.EmployeeName)}
            ></AddCircleIcon>
          );
        }
        return (
          <div className={styles["table__delete-input"]}>
            <DeleteForeverIcon
              color="action"
              className={styles["table__delete-icon"]}
              value={value}
              onClick={() => clickDeleteTimesheet(value)}
            ></DeleteForeverIcon>
          </div>
        );
      } else return <></>;
    } else if (id === "EmployeeName") {
      if (value === null) return <></>;
      return (
        <select
          style={{
            fontFamily: "Roboto, sans-serif",
            fontSize: "0.9rem",
            display: "inline-block",
            color: "#241f22",
            border: "1px solid #c8bfc4",
            borderRadius: "4px",
            boxShadow: "inset 1px 1px 2px #ddd8dc",
            background: "#fff",
            zIndex: "0",
            position: "relative",
            width: "200px",
            height: "25px",
          }}
          value={value}
          onChange={onChangeSelectEmployee}
          onBlur={onBlurForEmployee}
        >
          <option value="0">----------Choose here----------</option>
          {dataEmployees.map(item => {
            return (
              <option value={item.EmployeeName} key={item.EmployeeID}>
                {item.EmployeeName}
              </option>
            );
          })}
        </select>
      );
    } else if (id === "TaskID") {
      if (value === null) return <></>;
      return (
        <select
          style={{
            fontFamily: "Roboto, sans-serif",
            fontSize: "0.9rem",
            display: "inline-block",
            color: "#74646e",
            border: "1px solid #c8bfc4",
            borderRadius: "4px",
            boxShadow: "inset 1px 1px 2px #ddd8dc",
            background: "#fff",
            zIndex: "0",
            position: "relative",
            width: "300px",
            height: "25px",
          }}
          value={value}
          onChange={onChange}
          onBlur={onBlurForTasks}
        >
          <option value="0">
            --------------------Choose here--------------------
          </option>
          {dataTasks.map(item => {
            return (
              <option
                value={item.TaskID}
                key={item.TaskID}
                taskname={item.Name}
              >
                {item.Name}
              </option>
            );
          })}
        </select>
      );
    } else if (id === "Length") {
      if (row.leafRows !== undefined) {
        let sumLabor = 0;
        row.leafRows.forEach(element => {
          sumLabor += (
            (new Date(convertInputToTime(element.Finish).replace(" ", "T")) -
              new Date(convertInputToTime(element.Start).replace(" ", "T"))) /
            3600000
          ).toFixed(2);
        });

        if (parseFloat(sumLabor) < 0) {
          sumLabor = (parseFloat(sumLabor) + 24).toFixed(2);
        }

        return (
          <div
            className={classNames([
              styles["table__labor-hours-input"],
              "table__labor-hours-input",
            ])}
          >
            {sumLabor}
          </div>
        );
      } else {
        let laborDate = (
          (new Date(convertInputToTime(row.values.Finish).replace(" ", "T")) -
            new Date(convertInputToTime(row.values.Start).replace(" ", "T"))) /
          3600000
        ).toFixed(2);
        if (parseFloat(laborDate) < 0) {
          laborDate = (parseFloat(laborDate) + 24).toFixed(2);
        }
        if (row.values.Task === "Meal") {
          laborDate *= -1;
          laborDate = laborDate.toFixed(2);
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
      }
    }
  };

  // Set our editable cell renderer as the default Cell renderer
  const defaultColumn = {
    Cell: EditableCell,
  };

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (TimesheetID, columnId, value) => {
    // We also turn on the flag to not reset the page
    setData(old =>
      old.map((row, index) => {
        if (row.TimesheetID === TimesheetID) {
          return {
            ...old[index],
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

  const updateEmployeeData = (TimesheetID, columnId, value) => {
    // We also turn on the flag to not reset the page

    setData(old =>
      old.map((row, index) => {
        if (row.TimesheetID === TimesheetID) {
          return {
            ...old[index],
            [columnId]: value,
            ["EmployeeID"]: convertEmployeeNameToID(value),
          };
        }
        return row;
      })
    );
  };

  const updateTaskData = (TimesheetID, columnId, value) => {
    // We also turn on the flag to not reset the page
    setData(old =>
      old.map((row, index) => {
        if (row.TimesheetID === TimesheetID) {
          return {
            ...old[index],
            [columnId]: value,
            ["TaskID"]: convertTaskNameToID(value),
          };
        }
        return row;
      })
    );
  };

  const convertTaskNameToID = name => {
    let task = dataTasks.find(task => name === task.Name);
    if (task) {
      return task.TaskID;
    } else {
      return 0;
    }
  };

  const convertEmployeeNameToID = name => {
    let employee = dataEmployees.find(
      employee => name === employee.EmployeeName
    );
    if (employee) {
      return employee.EmployeeID;
    } else {
      return 0;
    }
  };

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGroupBy,
    state: { groupBy, expanded },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      updateMyData,
      autoResetExpanded: false,
    },
    useBlockLayout,
    useGroupBy,
    useExpanded
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

      if (
        status.permission === true &&
        projectState !== undefined &&
        selectedDate !== undefined
      ) {
        router.push(`?pid=${projectState}`);
        await axios({
          method: "get",
          url: `/api/timesheets?selectedDate=${formatDate(
            selectedDate
          )}&projectID=${projectState}`,
          timeout: 5000, // 5 seconds timeout
          headers: {},
        }).then(result => {
          setGroupBy(["EmployeeID"]);

          setData(result.data.result[0]);
          dataEmployees = result.data.result[1];
          dataTasks = result.data.result[2];
          dataLatest = result.data.result[3];
        });
      }
    };
    promises.push(fetchData());
    trackPromise(Promise.all(promises).then(() => {}));
  }, [projectState, status, selectedDate, router.isReady]);

  // useEffect(() => {
  //   if (checkState) {
  //     for (
  //       let i = 12;
  //       i <
  //       document.getElementsByClassName("table__time-wrapper__target-disabled")
  //         .length;
  //       i++
  //     ) {
  //       document
  //         .getElementsByClassName("table__time-wrapper__target-disabled")
  //         [i].setAttribute("disabled", true);
  //       document
  //         .getElementsByClassName("table__time-wrapper__target-disabled")
  //         [i].classList.add("table__time-wrapper__target-disabled--disabled");
  //     }
  //   } else {
  //     for (
  //       let i = 12;
  //       i <
  //       document.getElementsByClassName("table__time-wrapper__target-disabled")
  //         .length;
  //       i++
  //     ) {
  //       document
  //         .getElementsByClassName("table__time-wrapper__target-disabled")
  //         [i].removeAttribute("disabled");
  //       document
  //         .getElementsByClassName("table__time-wrapper__target-disabled")
  //         [i].classList.remove(
  //           "table__time-wrapper__target-disabled--disabled"
  //         );
  //     }
  //   }
  // }, [data]);

  const handleSaveTimesheetBtn = async () => {
    let promises = [];
    let checkSave = 0;

    const fetchData = async () => {
      let checkEmployeeName = data.find(element => element.EmployeeID === 0);
      let checkTaskName = data.find(element => element.TaskID === 0);
      let checkTime = 0;
      for (
        let i = 0;
        i < document.getElementsByClassName("table__labor-hours-input").length;
        i++
      ) {
        if (
          document.getElementsByClassName("table__labor-hours-input")[i]
            .innerText === "NaN"
        )
          checkTime++;
      }
      if (checkEmployeeName) {
        checkSave += 1;
        toast.error(
          <div className={styles["alert__table__employee-input"]}>
            Unable to save. <br /> Please check <strong>Employee Name </strong>.
          </div>,
          {
            position: toast.POSITION.BOTTOM_CENTER,
            hideProgressBar: true,
          }
        );
        return null;
      } else if (checkTime) {
        checkSave += 1;
        toast.error(
          <div className={styles["alert__table__time-wrapper"]}>
            Unable to save. <br /> Please check the <strong>time input </strong>
            .
          </div>,
          {
            position: toast.POSITION.BOTTOM_CENTER,
            hideProgressBar: true,
          }
        );
        return null;
      } else if (checkTaskName) {
        checkSave += 1;
        toast.error(
          <div className={styles["alert__table__employee-input"]}>
            Unable to save. <br /> Please check <strong>Task Name </strong>.
          </div>,
          {
            position: toast.POSITION.BOTTOM_CENTER,
            hideProgressBar: true,
          }
        );
        return null;
      }

      await axios({
        method: "delete",
        url: `/api/timesheets`,
        timeout: 3000, // 3 seconds timeout
        headers: {},
        data: {
          ProjectID: projectState,
          Date: formatDate(selectedDate),
        },
      });

      data.forEach(async element => {
        await axios({
          method: "post",
          url: `/api/timesheets`,
          timeout: 3000, // 3 seconds timeout
          headers: {},
          data: {
            ProjectID: projectState,
            Date: formatDate(selectedDate),
            EmployeeID: element.EmployeeID,
            TaskID: element.TaskID,
            Start: element.Start,
            End: element.Finish,
          },
          //   @projectID int,
          //   @date date,
          //   @employeeID int,
          //   @taskID int,
          //   @start time(0),
          //   @end time(0)
        }).catch(err => {
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
      });
    };
    trackPromise(fetchData());
    trackPromise(
      Promise.all(promises).then(() => {
        if (checkSave === 0) {
          toast.success(
            <div className={styles["alert__complete"]}>
              <strong>Save Complete</strong>
            </div>,
            {
              position: toast.POSITION.BOTTOM_CENTER,
              hideProgressBar: true,
            }
          );
        }
      })
    );
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
    setData(data => [
      ...data,
      {
        TimesheetID: "new" + ++tid,
        EmployeeID: 0,
        EmployeeName: "",
        Date: formatDate(selectedDate),
        TaskID: 0,
        Start: "07:00AM",
        Finish: "04:00PM",
      },
    ]);
  };

  const addEmployeeRow = name => {
    setData(data => [
      ...data,
      {
        TimesheetID: "new" + ++tid,
        EmployeeID: convertEmployeeNameToID(name),
        EmployeeName: name,
        Date: formatDate(selectedDate),
        TaskID: 0,
        Start: "07:00AM",
        Finish: "04:00PM",
      },
    ]);
  };

  useEffect(() => {
    setGroupBy(["EmployeeName"]);
    checkAddEmployeeStatus();

    let tempData = [];
    data.forEach(element => {
      tempData.push({
        Name: element.EmployeeName,
        Start: element.TaskID === -2 ? 0 : toMilli(element.Start),
        Finish: element.TaskID === -2 ? 0 : toMilli(element.Finish),
        IsMeal: element.IsMeal,
        MealStart: element.TaskID === -2 ? toMilli(element.Start) : 0,
        MealFinish: element.TaskID === -2 ? toMilli(element.Finish) : 0,
      });
    });

    let realData = [];
    for (let i = 0; i < tempData.length; i++) {
      if (i === 0) {
        realData.push({
          Name: tempData[i].Name,
          Start: tempData[i].Start,
          Finish: tempData[i].Finish,
          MealStart: tempData[i].MealStart,
          MealFinish: tempData[i].MealFinish,
        });
      }
      let check = 0;
      for (let j = 0; j < realData.length; j++) {
        if (tempData[i].Name === realData[j].Name) {
          realData[j].Start =
            realData[j].Start > tempData[i].Start && tempData[i].Start !== 0
              ? tempData[i].Start
              : realData[j].Start;
          realData[j].Finish =
            (realData[j].Finish > tempData[i].Finish ||
              tempData[i].Finish === 0) &&
            realData[j].Finish !== 0
              ? realData[j].Finish
              : tempData[i].Finish;
          realData[j].MealStart =
            realData[j].MealStart > tempData[i].MealStart &&
            tempData[i].MealStart !== 0
              ? tempData[i].MealStart
              : realData[j].MealStart;
          realData[j].MealFinish =
            (realData[j].MealFinish > tempData[i].MealFinish ||
              tempData[i].MealFinish === 0) &&
            realData[j].MealFinish !== 0
              ? realData[j].MealFinish
              : tempData[i].MealFinish;
          check += 1;
        }
      }
      if (check === 0) {
        realData.push({
          Name: tempData[i].Name,
          Start: tempData[i].Start,
          Finish: tempData[i].Finish,
          MealStart: tempData[i].MealStart,
          MealFinish: tempData[i].MealFinish,
        });
      }
    }
    setDataView(realData);
  }, [data]);

  const checkAddEmployeeStatus = () => {
    let check = 0;
    data.forEach(element => {
      if (element.EmployeeID === 0) {
        check = 1;
      }
    });
    if (check) {
      setCheckDisableAddEmployeeButton(true);
    } else {
      setCheckDisableAddEmployeeButton(false);
    }
  };

  const checkChange = event => {
    if (event.target.checked) {
      for (
        let i = 12;
        i <
        document.getElementsByClassName("table__time-wrapper__target-disabled")
          .length;
        i++
      ) {
        document
          .getElementsByClassName("table__time-wrapper__target-disabled")
          [i].setAttribute("disabled", true);
        document
          .getElementsByClassName("table__time-wrapper__target-disabled")
          [i].classList.add("table__time-wrapper__target-disabled--disabled");
      }
      setSameTime();
    } else {
      for (
        let i = 12;
        i <
        document.getElementsByClassName("table__time-wrapper__target-disabled")
          .length;
        i++
      ) {
        document
          .getElementsByClassName("table__time-wrapper__target-disabled")
          [i].removeAttribute("disabled");
        document
          .getElementsByClassName("table__time-wrapper__target-disabled")
          [i].classList.remove(
            "table__time-wrapper__target-disabled--disabled"
          );
      }
    }
    setCheckState(event.target.checked);
  };

  const deleteTimesheetRow = TimesheetID => {
    setData(old =>
      old.filter(element => {
        return element.TimesheetID !== TimesheetID;
      })
    );
  };

  const setSameTime = () => {
    setData(old =>
      old.map((row, index) => {
        return {
          ...old[index],
          Start: old[0].Start,
          Finish: old[0].Finish,
        };
      })
    );
  };

  useEffect(() => {
    if (typeof stateAssignedProject[0] == "undefined") {
      setTimeout(() => {
        setStateNoAssigned(true);
      }, 3000);
    } else {
      setStateNoAssigned(false);
    }
  }, [stateAssignedProject]);

  const clickGetTheLatestData = () => {
    if (dataLatest.length !== 0) {
      setData(dataLatest);
    } else {
      toast.warning(
        <div className={styles["alert__table__hour-input"]}>
          No data found.
        </div>,
        {
          position: toast.POSITION.TOP_CENTER,
          hideProgressBar: true,
        }
      );
    }
  };

  const toMilli = dataTime => {
    return new Date(convertInputToTime(dataTime).replace(" ", "T"));
  };

  const [modalIsOpen, setIsOpen] = React.useState(false);
  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <>
      {console.log("data")}
      {console.log(data)}
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
        <NotPermission path="timesheet" />
      ) : (
        <>
          <MainTab
            tapNo={2}
            main={false}
            employeeID={status.cookies.employeeid}
            employeeName={status.cookies.fullname}
            logout={logout}
            projectState={router.query.pid}
          />
          <div id={styles.mainDiv}>
            {promiseInProgress || !projectState ? (
              <div
                style={{
                  marginTop: "30px",
                  width: "100%",
                  height: "100",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Loader type="Oval" color="#fab906" height="150" width="150" />
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
                        fontFamily: "Roboto, sans-serif",
                        fontSize: "medium",
                        display: "inline-block",
                        color: "#74646e",
                        border: "1px solid #c8bfc4",
                        borderRadius: "4px",
                        boxShadow: "inset 1px 1px 2px #ddd8dc",
                        background: "#fff",
                        zIndex: "0",
                        position: "relative",
                        maxWidth: "390px",
                        height: "30px",
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
                            {item.JobNumber} &emsp;[{item.ProjectGroup}]&ensp;
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
                        id="add-employee-button-id"
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
                        disabled={checkDisableAddEmployeeButton}
                      >
                        Add&nbsp;Employee
                      </Button>
                      <Button
                        onClick={clickGetTheLatestData}
                        variant="contained"
                        size="small"
                        className={
                          dateCheckEditable(selectedDate)
                            ? styles["header__right__save-btn"]
                            : styles["header__right__save-btn-before-sunday"]
                        }
                        disabled={afterSundayCheck ? false : true}
                        style={{
                          background: "#25a37d",
                          color: "#ffffff",
                          marginRight: "10px",
                        }}
                      >
                        Import Last Timesheet
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        className={
                          dateCheckEditable(selectedDate)
                            ? styles["header__right__save-btn"]
                            : styles["header__right__save-btn-before-sunday"]
                        }
                        disabled={afterSundayCheck ? false : true}
                        style={{
                          background: "#43b6d3",
                          color: "#ffffff",
                          marginRight: "10px",
                        }}
                        onClick={setSameTime}
                      >
                        Set Same Time of All
                      </Button>
                      {/* <FormControlLabel
                        control={
                          <Checkbox
                            checked={checkState}
                            onChange={checkChange}
                            name="checkbox"
                            color="secondary"
                            id="checkboxForSetSameTime"
                          />
                        }
                        label="Set Same Time of All"
                        className={
                          dateCheckEditable(selectedDate)
                            ? styles["header__right__checkbox"]
                            : styles["header__right__checkbox-before-sunday"]
                        }
                      /> */}
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
                                {/* {column.canGroupBy ? (
                                  // If the column can be grouped, let's add a toggle
                                  <span {...column.getGroupByToggleProps()}>
                                    {column.isGrouped ? "🛑 " : "👊 "}
                                  </span>
                                ) : null} */}
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
                                    {cell.isGrouped ? (
                                      // If it's a grouped cell, add an expander and row count
                                      <>
                                        <span
                                          {...row.getToggleRowExpandedProps()}
                                        >
                                          {row.isExpanded ? (
                                            <div style={{ float: "left" }}>
                                              <ArrowDropDownIcon
                                                className={styles["arrow-btn"]}
                                              />
                                            </div>
                                          ) : (
                                            <div style={{ float: "left" }}>
                                              <ArrowRightIcon
                                                className={styles["arrow-btn"]}
                                              />
                                            </div>
                                          )}
                                        </span>{" "}
                                        {cell.render("Cell")} (
                                        {row.subRows.length})
                                      </>
                                    ) : cell.isAggregated ? (
                                      // If the cell is aggregated, use the Aggregated
                                      // renderer for cell
                                      cell.render("Aggregated")
                                    ) : cell.isPlaceholder ? null : ( // For cells with repeated values, render null
                                      // Otherwise, just render the regular cell
                                      cell.render("Cell")
                                    )}
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
                {dataView.length === 0 ? (
                  <></>
                ) : (
                  <div className={styles["second-table"]}>
                    <h3
                      style={{
                        textAlign: "center",
                        fontFamily: "sans-serif",
                        color: "#9d9ce7",
                      }}
                    >
                      Timesheet Summary
                    </h3>
                    <table {...getTableProps()}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Start</th>
                          <th>Finish</th>
                          <th>Meal Start</th>
                          <th>Meal Finish</th>
                          <th>Labor Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataView.map(cell => {
                          return (
                            <tr key={cell.Name}>
                              <td>{cell.Name}</td>
                              <td style={{ textAlign: "right", width: "80px" }}>
                                {moment(cell.Start).format("LT") ===
                                moment(cell.Finish).format("LT")
                                  ? ""
                                  : moment(cell.Start).format("LT")}
                              </td>
                              <td style={{ textAlign: "right", width: "80px" }}>
                                {moment(cell.Start).format("LT") ===
                                moment(cell.Finish).format("LT")
                                  ? ""
                                  : moment(cell.Finish).format("LT")}
                              </td>
                              <td style={{ textAlign: "right", width: "80px" }}>
                                {moment(cell.MealStart).format("LT") ===
                                moment(cell.MealFinish).format("LT")
                                  ? ""
                                  : moment(cell.MealStart).format("LT")}
                              </td>
                              <td style={{ textAlign: "right", width: "80px" }}>
                                {moment(cell.MealStart).format("LT") ===
                                moment(cell.MealFinish).format("LT")
                                  ? ""
                                  : moment(cell.MealFinish).format("LT")}
                              </td>
                              <td style={{ textAlign: "right", width: "90px" }}>
                                {(
                                  (cell.Finish -
                                    cell.Start -
                                    (cell.MealFinish - cell.MealStart)) /
                                  3600000
                                ).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className={styles["tablet-button-wrapper"]}>
                  <Button
                    className={styles["tablet-button"]}
                    onClick={openModal}
                    variant="contained"
                    size="small"
                  >
                    Summary
                  </Button>
                </div>
                <Modal
                  isOpen={modalIsOpen}
                  onRequestClose={closeModal}
                  // style={customStylesModal}
                >
                  <h2
                    style={{
                      textAlign: "center",
                      fontFamily: "sans-serif",
                      color: "#1c73e6",
                    }}
                  >
                    Timesheet Summary
                  </h2>
                  <div className={styles["modal-table"]}>
                    <table {...getTableProps()}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Start</th>
                          <th>Finish</th>
                          <th>Meal Start</th>
                          <th>Meal Finish</th>
                          <th>Labor Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataView.map(cell => {
                          return (
                            <tr key={cell.Name}>
                              <td>{cell.Name}</td>
                              <td style={{ textAlign: "right", width: "80px" }}>
                                {moment(cell.Start).format("LT")}
                              </td>
                              <td style={{ textAlign: "right", width: "80px" }}>
                                {moment(cell.Finish).format("LT")}
                              </td>
                              <td style={{ textAlign: "right", width: "80px" }}>
                                {moment(cell.MealStart).format("LT")}
                              </td>
                              <td style={{ textAlign: "right", width: "80px" }}>
                                {moment(cell.MealFinish).format("LT")}
                              </td>
                              <td style={{ textAlign: "right", width: "90px" }}>
                                {(
                                  (cell.Finish -
                                    cell.Start -
                                    (cell.MealFinish - cell.MealStart)) /
                                  3600000
                                ).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Modal>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Timesheet;
