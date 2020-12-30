import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useTable, useBlockLayout } from "react-table";
import DateFnsUtils from "@date-io/date-fns";
import { formatDate } from "./formatDate";
import TextField from "@material-ui/core/TextField";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { deepOrange, blue } from "@material-ui/core/colors";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import { toast } from "react-toastify";
import styles from "./Task.module.css";
import { useSelector, useDispatch } from "react-redux";
import { usePromiseTracker, trackPromise } from "react-promise-tracker";
import Loader from "react-loader-spinner";
import EventBusyIcon from "@material-ui/icons/EventBusy";
import Modal from "react-modal";
import EditTwoToneIcon from "@material-ui/icons/EditTwoTone";
import DeleteTwoToneIcon from "@material-ui/icons/DeleteTwoTone";
toast.configure();
const themeForWorkDate = createMuiTheme({
  palette: {
    primary: deepOrange,
  },

  typography: {
    fontSize: 12,
    textAlign: "center",
  },
});

const themeForNoWork = createMuiTheme({
  palette: {
    primary: {
      main: blue["300"],
    },
  },

  typography: {
    fontSize: 12,
    textAlign: "center",
  },
});

const Task = ({
  projectState,
  setProjectState,
  employeeInfo,
  setPreviousProject,
}) => {
  const deleteQueue = useSelector((state) => state.deleteQueue);
  const dispatch = useDispatch();

  const addUpdateQueue = (value) =>
    dispatch({
      type: "ADDUPDATEQUEUE",
      addUpdateQueue: value,
    });

  const initializeUpdateQueue = () =>
    dispatch({
      type: "INITIALIZEUPDATEQUEUE",
    });

  const initializeDeleteQueue = () =>
    dispatch({
      type: "INITIALIZEDELETEQUEUE",
    });

  const columns = useMemo(
    () => [
      {
        Header: "Section",
        accessor: "Section",
        width: 65,
      },
      {
        Header: "Summary Task",
        accessor: "Trade",
        width: 160,
      },

      {
        Header: "Task",
        accessor: "TaskName",
        width: 360,
      },
      {
        Header: "Resource",
        accessor: "Company",
        width: 260,
      },
      {
        Header: "Start Date",
        accessor: "StartDate",
        width: 100,
      },
      {
        Header: "Finish Date",
        accessor: "FinishDate",
        width: 100,
      },
      {
        Header: "Request Start Date",
        accessor: "ReqStartDate",
        width: 100,
      },
      {
        Header: "Request Finish Date",
        accessor: "ReqFinishDate",
        width: 100,
      },
      // {
      //   Header: "Finish Date",
      //   accessor: "FinishDate",
      //   width: 90,
      // },
      {
        Header: "Previous Work %",
        accessor: "PreviousWork",
        width: 70,
      },
      {
        Header: "Current Work %",
        accessor: "CurrentWork",
        width: 70,
      },
      // {
      //   Header: "Message",
      //   accessor: "Trade",
      //   align: "center",
      //   width: 377,
      // },
    ],
    []
  );

  const [data, setData] = useState(() => []);
  const [noWork, setNoWork] = useState(() => []);

  const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    row,
    updateMyData, // This is a custom function that we supplied to our table instance
  }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue);

    const onChange = (e) => {
      setValue(e.target.value);
    };

    const onChangePercent = (e) => {
      if (e.nativeEvent.data) {
        if (
          e.nativeEvent.data !== "0" &&
          e.nativeEvent.data !== "1" &&
          e.nativeEvent.data !== "2" &&
          e.nativeEvent.data !== "3" &&
          e.nativeEvent.data !== "4" &&
          e.nativeEvent.data !== "5" &&
          e.nativeEvent.data !== "6" &&
          e.nativeEvent.data !== "7" &&
          e.nativeEvent.data !== "8" &&
          e.nativeEvent.data !== "9"
        ) {
          setValue("0");
        } else if (e.nativeEvent.data === "0") {
          if (e.target.value === "100") {
            setValue("100");
          } else if (e.target.value.includes("2")) {
            setValue("20");
          } else if (e.target.value.includes("3")) {
            setValue("30");
          } else if (e.target.value.includes("4")) {
            setValue("40");
          } else if (e.target.value.includes("5")) {
            setValue("50");
          } else if (e.target.value.includes("6")) {
            setValue("60");
          } else if (e.target.value.includes("7")) {
            setValue("70");
          } else if (e.target.value.includes("8")) {
            setValue("80");
          } else if (e.target.value.includes("9")) {
            setValue("90");
          } else {
            setValue("0");
          }
        } else if (e.nativeEvent.data === "1") {
          setValue("10");
        } else if (e.nativeEvent.data === "2") {
          setValue("20");
        } else if (e.nativeEvent.data === "3") {
          setValue("30");
        } else if (e.nativeEvent.data === "4") {
          setValue("40");
        } else if (e.nativeEvent.data === "5") {
          setValue("50");
        } else if (e.nativeEvent.data === "6") {
          setValue("60");
        } else if (e.nativeEvent.data === "7") {
          setValue("70");
        } else if (e.nativeEvent.data === "8") {
          setValue("80");
        } else if (e.nativeEvent.data === "9") {
          setValue("90");
        } else if (e.nativeEvent.data === ".") {
          setValue("0");
        }
      } else {
        if (e.nativeEvent.data === undefined) {
          setValue(e.target.value);
        } else {
          setValue("0");
        }
      }
    };

    const onChangeDatePicker = (e) => {
      setValue(e);
    };

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
      updateMyData(index, id, value);
    };

    const onBlurForCurrentWork = (e) => {
      updateMyData(index, id, value);
    };

    const handleModalWorkDate = (
      Company,
      TaskID,
      TaskName,
      StartDate,
      FinishDate
    ) => {
      updateModalWorkDate(Company, TaskID, TaskName, StartDate, FinishDate);
    };

    const preventNegativeNumber = (e) => {
      if (e.key === "-" || e.key === "+" || e.key === ".") {
        setValue("0");
      }
    };

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);
    // if (id === "RecordID") {
    //   return (
    //     <>
    //       <ReportIcon
    //         color="secondary"
    //         className={styles["table__report-icon"]}
    //         data-tip="Praesent non nunc mollis, fermentum neque at"
    //       />
    //       <ReactTooltip />
    //     </>
    //   );
    if (id === "Trade") {
      return (
        <div className={styles["table__trade-wrapper"]}>
          <span className={styles["table__trade-wrapper__data"]}>{value}</span>
        </div>
      );
    } else if (id === "Section") {
      return (
        <div className={styles["table__section-wrapper"]}>
          <span className={styles["table__section-wrapper__data"]}>
            {value}
          </span>
        </div>
      );
    } else if (id === "Company") {
      return (
        <div className={styles["table__company-wrapper"]}>
          <span className={styles["table__company-wrapper__data"]}>
            {value}
          </span>
        </div>
      );
    } else if (id === "TaskName") {
      return (
        <div className={styles["table__task-name-wrapper"]}>
          <span className={styles["table__task-name-wrapper__data"]}>
            {value}
          </span>
        </div>
      );
    } else if (id === "StartDate") {
      return (
        <div className={styles["table__start-date-wrapper"]}>
          <span
            className={styles["table__start-date-wrapper__data"]}
            onClick={() =>
              handleModalWorkDate(
                row.original.Company,
                row.original.TaskID,
                row.original.TaskName,
                row.original.StartDate,
                row.original.FinishDate
              )
            }
          >
            {value}
          </span>
        </div>
      );
    } else if (id === "FinishDate") {
      return (
        <div className={styles["table__finish-date-wrapper"]}>
          <span
            className={styles["table__finish-date-wrapper__data"]}
            onClick={() =>
              handleModalWorkDate(
                row.original.Company,
                row.original.TaskID,
                row.original.TaskName,
                row.original.StartDate,
                row.original.FinishDate
              )
            }
          >
            {value}
          </span>
        </div>
      );
    } else if (id === "ReqStartDate") {
      return (
        <div className={styles["table__req-start-date-wrapper"]}>
          <span className={styles["table__req-start-date-wrapper__data"]}>
            {value}
          </span>
        </div>
      );
    } else if (id === "ReqFinishDate") {
      return (
        <div className={styles["table__req-finish-date-wrapper"]}>
          <span className={styles["table__req-finish-date-wrapper__data"]}>
            {value}
          </span>
        </div>
      );
    } else if (id === "PreviousWork") {
      return (
        <div className={styles["table__previous-work-wrapper"]}>
          <span className={styles["table__previous-work-wrapper__data"]}>
            {value} %
          </span>
        </div>
      );
    } else if (id === "CurrentWork") {
      let previousWork;
      row.allCells.forEach((horizontalLine) => {
        if (horizontalLine.column.Header === "Previous Work %") {
          previousWork = horizontalLine.value;
        }
      });
      return (
        <div className={styles["table__current-work-wrapper"]}>
          <span className={styles["table__current-work-wrapper__data"]}>
            {value === null ? (
              <input
                className={
                  styles["table__current-work-wrapper__input__previous-work"]
                }
                value={previousWork}
                type="number"
                onChange={onChangePercent}
                onBlur={onBlurForCurrentWork}
                min="0"
                max="100"
                step="10"
                onKeyDown={preventNegativeNumber}
              ></input>
            ) : (
              <input
                className={
                  styles["table__current-work-wrapper__input__current-work"]
                }
                value={value}
                type="number"
                onChange={onChangePercent}
                onBlur={onBlurForCurrentWork}
                min="0"
                max="100"
                step="10"
                onKeyDown={preventNegativeNumber}
              ></input>
            )}
            %
          </span>
        </div>
      );
    }
  };

  // Set our editable cell renderer as the default Cell renderer
  const defaultColumn = {
    Cell: EditableCell,
  };

  const updateMyData = (rowIndex, columnId, value) => {
    // We also turn on the flag to not reset the page
    setData((old) =>
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

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      updateMyData,
    },
    useBlockLayout
  );

  const now = new Date().toLocaleString({
    timeZone: "America/Los_Angeles",
  });

  const [selectedDate, setSelectedDate] = useState(now);

  const dateCheckEditable = (str) => {
    const getSunday = (d) => {
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

    const toStr = str.toLocaleString();

    const newStr =
      toStr.split("/")[0] +
      "/" +
      toStr.split("/")[1] +
      "/" +
      toStr.split("/")[2];

    const dateFromStr = new Date(newStr);
    const sundayOfSelected = getSunday(dateFromStr);
    const sundayOfToday = getSunday(now);

    if (date_diff_indays(sundayOfToday, sundayOfSelected) >= 0) return true;
    else return false;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSaveBtn = () => {
    let promises = [];
    const fetchData = async () => {
      for (let i = 0; i < data.length; i++) {
        if (
          !(
            data[i].CurrentWork === null ||
            data[i].CurrentWork === "" ||
            data[i].CurrentWork.toString() === data[i].PreviousWork.toString()
          )
        ) {
          promises.push(
            axios({
              method: "put",
              url: `/api/project-tasks-progress`,
              timeout: 5000,
              headers: {},
              data: {
                TaskID: data[i].TaskID,
                Date: document.getElementById("datePickerDialog").value,
                WorkCompleted: data[i].CurrentWork,
              },
            })
          );
        }
      }
    };

    trackPromise(fetchData());
    trackPromise(
      Promise.all(promises).then(() => {
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
    );

    axios({
      method: "post",
      url: `/api/log-daily-reports`,
      timeout: 5000, // 5 seconds timeout
      headers: {},
      data: {
        EmployeeID: employeeInfo.EmployeeID,
        ProjectID: projectState,
        Date: formatDate(selectedDate),
        Category: "Tasks",
        Action: "update",
      },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      let result1 = await axios({
        method: "get",
        url: `/api/project-tasks-progress?selectedDate=${formatDate(
          selectedDate
        )}&projectID=${projectState}`,
        timeout: 5000, // 5 seconds timeout
        headers: {},
      });

      setData(result1.data);

      let result2 = await axios({
        method: "get",
        url: `/api/project-no-work?projectID=${projectState}`,
        timeout: 5000, // 5 seconds timeout
        headers: {},
      });

      setNoWork(result2.data);

      setPreviousProject(projectState);
    };

    trackPromise(fetchData());
    initializeDeleteQueue();
    initializeUpdateQueue();
  }, [selectedDate]);

  const { promiseInProgress } = usePromiseTracker();

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };

  // Set No Work
  const customStylesNoWork = {
    content: {
      top: "40%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };

  const customStylesSaveNoWork = {
    content: {
      top: "40%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };

  const [modalNoWork, setModalNoWork] = useState({ isOpen: false });

  const [modalSaveNoWork, setModalSaveNoWork] = useState({
    isOpen: false,
    Type: "",
    RecordID: 0,
    StartDate: new Date("2010/01/01"),
    FinishDate: new Date("2010/01/01"),
    Reason: "",
  });

  const openModalNoWork = () => {
    setModalNoWork({ isOpen: true });
  };

  const closeModalNoWork = () => {
    setModalNoWork({ isOpen: false });
  };

  const editNoWork = (recordID) => {
    let StartDate;
    let FinishDate;
    for (let i = 0; i < noWork.length; i++) {
      if (noWork[i].RecordID === recordID) {
        StartDate = noWork[i].StartDate;
        FinishDate = noWork[i].FinishDate;
        break;
      }
    }
    setModalSaveNoWork({
      isOpen: true,
      Type: "edit",
      RecordID: recordID,
      StartDate,
      FinishDate,
      Reason: "",
    });
  };

  const deleteNoWork = (recordID) => {
    let StartDate;
    let FinishDate;
    for (let i = 0; i < noWork.length; i++) {
      if (noWork[i].RecordID === recordID) {
        StartDate = noWork[i].StartDate;
        FinishDate = noWork[i].FinishDate;
        break;
      }
    }
    setModalSaveNoWork({
      isOpen: true,
      Type: "delete",
      RecordID: recordID,
      StartDate,
      FinishDate,
      Reason: "",
    });
  };

  const addNoWork = () => {
    let StartDate;
    let FinishDate;
    StartDate = formatDate(
      new Date().toLocaleString({
        timeZone: "America/Los_Angeles",
      })
    );
    FinishDate = formatDate(
      new Date().toLocaleString({
        timeZone: "America/Los_Angeles",
      })
    );

    setModalSaveNoWork({
      isOpen: true,
      Type: "new",
      RecordID: 0,
      StartDate,
      FinishDate,
      Reason: "",
    });
  };

  const closeModalSaveNoWork = () => {
    setModalSaveNoWork((prevState) => ({ ...prevState, isOpen: false }));
  };

  const handleStartDateOfSaveNoWork = (StartDate) => {
    setModalSaveNoWork((prevState) => ({ ...prevState, StartDate }));
  };

  const handleEndDateOfSaveNoWork = (FinishDate) => {
    setModalSaveNoWork((prevState) => ({ ...prevState, FinishDate }));
  };

  const handleReasonOfSaveNoWork = (event) => {
    const reason = event.target.value;
    setModalSaveNoWork((prevState) => ({ ...prevState, Reason: reason }));
  };

  const saveNoWorkDays = (type) => {
    let reason = modalSaveNoWork.Reason;
    if (reason === "") {
      reason = null;
    }

    if (type === "new") {
      const fetchData = async () => {
        let result = await axios({
          method: "POST",
          url: `/api/project-date-change-request`,
          timeout: 5000, // 5 seconds timeout
          headers: {},
          data: {
            EmployeeID: employeeInfo.EmployeeID,
            ProjectID: projectState,
            RequestType: "No Work",
            RequestID: null,
            StartDate: modalSaveNoWork.StartDate,
            EndDate: modalSaveNoWork.FinishDate,
            Reason: reason,
          },
        });
      };

      fetchData();
    } else if (type === "edit") {
      const fetchData = async () => {
        let result = await axios({
          method: "POST",
          url: `/api/project-date-change-request`,
          timeout: 5000, // 5 seconds timeout
          headers: {},
          data: {
            EmployeeID: employeeInfo.EmployeeID,
            ProjectID: projectState,
            RequestType: "No Work Modify",
            RequestID: modalSaveNoWork.RecordID,
            StartDate: modalSaveNoWork.StartDate,
            EndDate: modalSaveNoWork.FinishDate,
            Reason: reason,
          },
        });
      };

      fetchData();
    } else if (type === "delete") {
      const fetchData = async () => {
        let result = await axios({
          method: "POST",
          url: `/api/project-date-change-request`,
          timeout: 5000, // 5 seconds timeout
          headers: {},
          data: {
            EmployeeID: employeeInfo.EmployeeID,
            ProjectID: projectState,
            RequestType: "No Work Delete",
            RequestID: modalSaveNoWork.RecordID,
            StartDate: modalSaveNoWork.StartDate,
            EndDate: modalSaveNoWork.FinishDate,
            Reason: reason,
          },
        });
      };

      fetchData();
    }
    toast.info(
      <div className={styles["alert__complete"]}>
        <strong>Request has been submitted.</strong>
      </div>,
      {
        position: toast.POSITION.BOTTOM_CENTER,
        hideProgressBar: true,
      }
    );
    setModalSaveNoWork((prevState) => ({ ...prevState, isOpen: false }));
  };

  // Work Date
  const [modalWorkDate, setModalWorkDate] = useState({
    isOpen: false,
    Company: "",
    TaskID: "",
    TaskName: "",
    StartDate: new Date("2010/01/01"),
    FinishDate: new Date("2010/01/01"),
  });

  const afterOpenModalWorkDate = () => {
    // references are now sync'd and can be accessed.
  };

  const closeModalWorkDate = () => {
    setModalWorkDate((prevState) => ({ ...prevState, isOpen: false }));
  };

  const handleStartDateOfWorkDate = (StartDate) => {
    setModalWorkDate((prevState) => ({ ...prevState, StartDate }));
  };

  const handleEndDateOfWorkDate = (FinishDate) => {
    setModalWorkDate((prevState) => ({ ...prevState, FinishDate }));
  };

  const updateModalWorkDate = (
    Company,
    TaskID,
    TaskName,
    StartDate,
    FinishDate
  ) => {
    setModalWorkDate({
      isOpen: true,
      Company,
      TaskID,
      TaskName,
      StartDate,
      FinishDate,
    });
  };

  const requestModalWorkDate = () => {
    const fetchData = async () => {
      let result = await axios({
        method: "POST",
        url: `/api/project-date-change-request`,
        timeout: 5000, // 5 seconds timeout
        headers: {},
        data: {
          EmployeeID: employeeInfo.EmployeeID,
          ProjectID: projectState,
          RequestType: "Task",
          RequestID: modalWorkDate.TaskID,
          StartDate: modalWorkDate.StartDate,
          EndDate: modalWorkDate.FinishDate,
          Note: null,
        },
      });
    };

    trackPromise(fetchData());
    closeModalWorkDate();
    toast.info(
      <div className={styles["alert__complete"]}>
        <strong>Request has been submitted.</strong>
      </div>,
      {
        position: toast.POSITION.BOTTOM_CENTER,
        hideProgressBar: true,
      }
    );
  };

  // const addRequestModalNoWork = () => {
  //   let reason = modalNoWork.Reason;
  //   if (reason === "") {
  //     reason = null;
  //   }
  //   const fetchData = async () => {
  //     let result = await axios({
  //       method: "POST",
  //       url: `/api/project-date-change-request`,
  //       timeout: 5000, // 5 seconds timeout
  //       headers: {},
  //       data: {
  //         EmployeeID: employeeInfo.EmployeeID,
  //         ProjectID: projectState,
  //         RequestType: "No Work",
  //         RequestID: null,
  //         StartDate: modalNoWork.StartDate,
  //         EndDate: modalNoWork.FinishDate,
  //         Reason: reason,
  //       },
  //     });
  //   };

  //   fetchData();
  //   toast.info(
  //     <div className={styles["alert__complete"]}>
  //       <strong>Add Request has been submitted.</strong>
  //     </div>,
  //     {
  //       position: toast.POSITION.BOTTOM_CENTER,
  //       hideProgressBar: true,
  //     }
  //   );
  // };

  // const modifyRequestModalNoWork = () => {
  //   let reason = modalNoWork.Reason;
  //   if (reason === "") {
  //     reason = null;
  //   }
  //   const fetchData = async () => {
  //     let result = await axios({
  //       method: "POST",
  //       url: `/api/project-date-change-request`,
  //       timeout: 5000, // 5 seconds timeout
  //       headers: {},
  //       data: {
  //         EmployeeID: employeeInfo.EmployeeID,
  //         ProjectID: projectState,
  //         RequestType: "No Work Modify",
  //         RequestID: modalNoWork.RecordID,
  //         StartDate: modalNoWork.StartDate,
  //         EndDate: modalNoWork.FinishDate,
  //         Reason: reason,
  //       },
  //     });
  //   };

  //   fetchData();
  //   toast.info(
  //     <div className={styles["alert__complete"]}>
  //       <strong>Modify Request has been submitted.</strong>
  //     </div>,
  //     {
  //       position: toast.POSITION.BOTTOM_CENTER,
  //       hideProgressBar: true,
  //     }
  //   );
  // };

  // const deleteRequestModalNoWork = () => {
  //   let reason = modalNoWork.Reason;
  //   if (reason === "") {
  //     reason = null;
  //   }
  //   const fetchData = async () => {
  //     let result = await axios({
  //       method: "POST",
  //       url: `/api/project-date-change-request`,
  //       timeout: 5000, // 5 seconds timeout
  //       headers: {},
  //       data: {
  //         EmployeeID: employeeInfo.EmployeeID,
  //         ProjectID: projectState,
  //         RequestType: "No Work Delete",
  //         RequestID: modalNoWork.RecordID,
  //         StartDate: modalNoWork.StartDate,
  //         EndDate: modalNoWork.FinishDate,
  //         Reason: reason,
  //       },
  //     });
  //   };

  //   fetchData();
  //   toast.info(
  //     <div className={styles["alert__complete"]}>
  //       <strong>Delete Request has been submitted.</strong>
  //     </div>,
  //     {
  //       position: toast.POSITION.BOTTOM_CENTER,
  //       hideProgressBar: true,
  //     }
  //   );
  // };

  return (
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
          <Loader type="ThreeDots" color="#2BAD60" height="100" width="100" />
        </div>
      ) : (
        <>
          <div className={styles["header"]}>
            <div className={styles["header__left"]}>
              <h2 className={styles["header__left__title"]}>Task Completion</h2>

              <h3 className={styles["header__left__project-id"]}>
                Project ID :{" "}
                <span
                  onClick={() => {
                    setProjectState(0);
                  }}
                  className={styles["header__left__project-id__value"]}
                >
                  {projectState}
                </span>
              </h3>
            </div>
            {/* {dateCheckEditable(selectedDate) && ( */}
            <div className={styles["header__right"]}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                className={styles["header__right__save-btn"]}
                startIcon={<SaveIcon />}
                onClick={handleSaveBtn}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<EventBusyIcon />}
                className={styles["header__right__no-work-btn"]}
                onClick={openModalNoWork}
              >
                Set No Work Days
              </Button>
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
              <p className={styles["header__right__label-date-picker"]}>Date</p>
              <Modal
                isOpen={modalNoWork.isOpen}
                onRequestClose={closeModalNoWork}
                style={customStylesNoWork}
                className={styles["modal-no-work"]}
              >
                {/* <p className={styles["test"]}>
                  (This is a test, so NOT working yet. )
                </p> */}
                <div className={styles["modal-no-work__wrapper-title"]}>
                  <h4 className={styles["modal-no-work__wrapper-title__title"]}>
                    Set No Work Days
                  </h4>
                </div>
                <div className={styles["modal-no-work__wrapper-table"]}>
                  <table
                    className={styles["modal-no-work__wrapper-table__table"]}
                  >
                    <thead>
                      <tr>
                        <td>Dates</td>
                        <td>Reason</td>
                        <td>Edit</td>
                        <td>Delete</td>
                      </tr>
                    </thead>
                    <tbody>
                      {noWork.map((item) => {
                        return (
                          <tr key={item.RecordID}>
                            <td>
                              {formatDate(item.StartDate)} ~{" "}
                              {formatDate(item.FinishDate)}
                            </td>
                            <td>{item.Note}</td>
                            <td
                              className={
                                styles[
                                  "modal-no-work__wrapper-table__wrapper-icon-edit"
                                ]
                              }
                              onClick={() => editNoWork(item.RecordID)}
                            >
                              <EditTwoToneIcon
                                className={
                                  styles[
                                    "modal-no-work__wrapper-table__wrapper-icon-edit__icon-edit"
                                  ]
                                }
                              />
                            </td>
                            <td
                              className={
                                styles[
                                  "modal-no-work__wrapper-table__wrapper-icon-delete"
                                ]
                              }
                              onClick={() => deleteNoWork(item.RecordID)}
                            >
                              <DeleteTwoToneIcon
                                className={
                                  styles[
                                    "modal-no-work__wrapper-table__wrapper-icon-edit__icon-delete"
                                  ]
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}

                      <tr>
                        <td>
                          <div
                            className={
                              styles[
                                "modal-no-work__wrapper-table__wrapper-btn-new"
                              ]
                            }
                            onClick={addNoWork}
                          >
                            <Button>(+) NEW</Button>
                          </div>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className={styles["modal-no-work__wrapper-btn-close"]}>
                    <Button
                      className={
                        styles["modal-no-work__wrapper-btn-close__btn-close"]
                      }
                      onClick={closeModalNoWork}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </Modal>

              <Modal
                isOpen={modalSaveNoWork.isOpen}
                onRequesClose={closeModalSaveNoWork}
                style={customStylesSaveNoWork}
              >
                <div className={styles["modal-save-no-work__wrapper-content"]}>
                  <h4
                    className={
                      styles["modal-save-no-work__wrapper-content__title"]
                    }
                  >
                    {modalSaveNoWork.Type}
                  </h4>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <ThemeProvider theme={themeForNoWork}>
                      <DatePicker
                        disableToolbar
                        variant="inline"
                        disabled={
                          modalSaveNoWork.Type === "delete" ? true : false
                        }
                        value={modalSaveNoWork.StartDate}
                        onChange={handleStartDateOfSaveNoWork}
                        format="MM/dd/yyyy"
                        label="Start Date"
                        className={
                          styles[
                            "modal-save-no-work__wrapper-content__start-date"
                          ]
                        }
                        autoOk={true}
                      />
                      <DatePicker
                        disableToolbar
                        variant="inline"
                        disabled={
                          modalSaveNoWork.Type === "delete" ? true : false
                        }
                        value={modalSaveNoWork.FinishDate}
                        onChange={handleEndDateOfSaveNoWork}
                        format="MM/dd/yyyy"
                        label="End Date"
                        className={
                          styles[
                            "modal-save-no-work__wrapper-content__end-date"
                          ]
                        }
                        autoOk={true}
                      />
                    </ThemeProvider>
                  </MuiPickersUtilsProvider>
                </div>
                <div
                  className={
                    styles["modal-save-no-work__wrapper-content__bottom"]
                  }
                >
                  <div
                    className={
                      styles[
                        "modal-save-no-work__wrapper-content__bottom__wrapper-note"
                      ]
                    }
                  >
                    <TextField
                      label="Reason"
                      multiline
                      rows={2}
                      onChange={handleReasonOfSaveNoWork}
                      value={modalSaveNoWork.Reason || ""}
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </div>
                  <Button
                    variant="outlined"
                    size="small"
                    className={
                      styles[
                        "modal-save-no-work__wrapper-content__bottom__btn-save"
                      ]
                    }
                    onClick={() => saveNoWorkDays(modalSaveNoWork.Type)}
                  >
                    SAVE
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    className={
                      styles[
                        "modal-save-no-work__wrapper-content__bottom__btn-cancel"
                      ]
                    }
                    onClick={closeModalSaveNoWork}
                  >
                    Cancel
                  </Button>
                </div>
              </Modal>

              {/* <Modal
                isOpen={modalNoWork.isOpen}
                onAfterOpen={afterOpenModalNoWork}
                onRequestClose={closeModalNoWork}
                style={customStylesNoWork}
                contentLabel="Example Modal"
                className={styles["modal-no-work"]}
              >
                <div className={styles["modal-no-work__wrapper-title"]}>
                  <h4 className={styles["modal-no-work__wrapper-title__title"]}>
                    Set No Work Days
                  </h4>
                </div>
                <div className={styles["modal-no-work__wrapper-content"]}>
                  <div
                    className={styles["modal-no-work__wrapper-content__left"]}
                  >
                    {noWork.map(item => {
                      return (
                        <>
                          <div
                            className={
                              styles[
                                "modal-no-work__wrapper-content__left__fixed-date"
                              ]
                            }
                            key={item.RecordID}
                            id={`NoWorkRecordID-${item.RecordID}`}
                            onClick={() =>
                              handleClickDateOfNoWork(item.RecordID)
                            }
                            data-tip={item.Note}
                            data-for="NoWorkNote"
                          >
                            {formatDate(item.StartDate) +
                              " ~ " +
                              formatDate(item.FinishDate)}
                          </div>
                          <ReactTooltip
                            id="NoWorkNote"
                            multiline={true}
                            effect="solid"
                            border={true}
                            type={"light"}
                            place="left"
                            textColor="#8b8585"
                            borderColor="#948f97"
                          />
                        </>
                      );
                    })}
                    <div
                      className={
                        styles[
                          "modal-no-work__wrapper-content__left__wrapper-btn-new"
                        ]
                      }
                    >
                      <Button
                        className={
                          styles[
                            "modal-no-work__wrapper-content__left__wrapper-btn-new__btn-new"
                          ]
                        }
                        id={`NoWorkRecordID-NEW`}
                        onClick={() => handleClickDateOfNoWork("NEW")}
                      >
                        NEW
                      </Button>
                    </div>
                  </div>
                  <div
                    className={styles["modal-no-work__wrapper-content__right"]}
                  >
                    {!modalNoWork.RecordID ? (
                      <p
                        className={
                          styles[
                            "modal-no-work__wrapper-content__right__RecordID-0"
                          ]
                        }
                      >
                        Select the date from the left.
                      </p>
                    ) : (
                      <>
                        <div
                          className={
                            styles[
                              "modal-no-work__wrapper-content__right__wrapper-date-picker"
                            ]
                          }
                        >
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <ThemeProvider theme={themeForNoWork}>
                              <DatePicker
                                // value={value.length === undefined ? value : value.split("-")}
                                value={modalNoWork.StartDate}
                                onChange={handleStartDateOfNoWork}
                                format="MM/dd/yyyy"
                                label="Start Date"
                                className={
                                  styles[
                                    "modal-no-work__wrapper-content__right__wrapper-date-picker__start-date"
                                  ]
                                }
                              />
                              <DatePicker
                                // value={value.length === undefined ? value : value.split("-")}
                                value={modalNoWork.FinishDate}
                                onChange={handleEndDateOfNoWork}
                                format="MM/dd/yyyy"
                                label="End Date"
                                className={
                                  styles[
                                    "modal-no-work__wrapper-content__right__wrapper-date-picker__end-date"
                                  ]
                                }
                              />
                            </ThemeProvider>
                          </MuiPickersUtilsProvider>
                        </div>
                        <div
                          className={
                            styles[
                              "modal-no-work__wrapper-content__right__wrapper-btn"
                            ]
                          }
                        >
                          <div
                            className={
                              styles[
                                "modal-no-work__wrapper-content__right__wrapper-note"
                              ]
                            }
                          >
                            <TextField
                              label="Reason"
                              multiline
                              rows={2}
                              onChange={handleChangeReason}
                              value={modalNoWork.Reason || ""}
                              variant="outlined"
                              fullWidth
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                          </div>
                          {modalNoWork.RecordID === "NEW" ? (
                            <>
                              <Button
                                variant="outlined"
                                size="small"
                                className={
                                  styles[
                                    "modal-no-work__wrapper-content__right__wrapper-btn__btn-add"
                                  ]
                                }
                                onClick={addRequestModalNoWork}
                              >
                                Add
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outlined"
                                size="small"
                                className={
                                  styles[
                                    "modal-no-work__wrapper-content__right__wrapper-btn__btn-modify"
                                  ]
                                }
                                onClick={modifyRequestModalNoWork}
                              >
                                Modify
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                className={
                                  styles[
                                    "modal-no-work__wrapper-content__right__wrapper-btn__btn-delete"
                                  ]
                                }
                                onClick={deleteRequestModalNoWork}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles["modal-no-work__footer"]}>
                  <Button
                    variant="contained"
                    className={styles["modal-no-work__footer__btn-close"]}
                    onClick={closeModalNoWork}
                  >
                    Close
                  </Button>
                </div>
              </Modal> */}
            </div>
            {/* )} */}
          </div>

          <div className={styles["table"]}>
            <table {...getTableProps()}>
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <td {...column.getHeaderProps()}>
                        {column.render("Header")}
                      </td>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row, i) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className={styles["table__row"]}>
                      {row.cells.map((cell) => {
                        return (
                          <td {...cell.getCellProps()}>
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        isOpen={modalWorkDate.isOpen}
        onAfterOpen={afterOpenModalWorkDate}
        onRequestClose={closeModalWorkDate}
        style={customStyles}
        contentLabel="Example Modal"
        className={styles["modal-start-date"]}
      >
        <div className={styles["modal-start-date__wrapper"]}>
          <div className={styles["modal-start-date__wrapper-title"]}>
            <h4 className={styles["modal-start-date__wrapper-title__title"]}>
              Change Task Date
            </h4>
            <h4
              className={
                styles["modal-start-date__wrapper-title__sub-title-task-name"]
              }
            >
              {modalWorkDate.TaskName}
            </h4>
            <h5
              className={
                styles[
                  "modal-start-date__wrapper-title__sub-title-company-name"
                ]
              }
            >
              by {modalWorkDate.Company}
            </h5>
          </div>
          <div className={styles["modal-start-date__wrapper-date-picker"]}>
            <h4
              className={styles["modal-start-date__wrapper-date-picker__label"]}
            >
              Start Date
            </h4>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <ThemeProvider theme={themeForWorkDate}>
                <DatePicker
                  disableToolbar
                  variant="inline"
                  value={modalWorkDate.StartDate}
                  onChange={handleStartDateOfWorkDate}
                  format="MM/dd/yyyy"
                  className={
                    styles["modal-start-date__wrapper-date-picker__start-date"]
                  }
                  autoOk={true}
                />
              </ThemeProvider>
            </MuiPickersUtilsProvider>
          </div>
          <div className={styles["modal-start-date__wrapper-btn"]}>
            <Button
              variant="contained"
              size="small"
              onClick={requestModalWorkDate}
              className={styles["modal-start-date__wrapper-btn__btn-request"]}
            >
              Request
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={closeModalWorkDate}
              className={styles["modal-start-date__wrapper-btn__btn-cancel"]}
            >
              Cancel
            </Button>
          </div>
          {/* <p className={styles["test"]}>(This is a test, so NOT working yet. )</p> */}
        </div>
      </Modal>
    </div>
  );
};

export default Task;
