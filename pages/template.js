import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { usePromiseTracker, trackPromise } from "react-promise-tracker";
import Loader from "react-loader-spinner";
import SimpleTabs from "../components/MainTab/MainTab";
import NotPermission from "../components/MainTab/NotPermission";
import { CookiesProvider, useCookies } from "react-cookie";
import Login from "../components/MainTab/login.js";
import Head from "next/head";
import { useMediaQuery } from "react-responsive";

import styles from "./template.module.css";

const Template = () => {
  const resolution1008 = useMediaQuery({
    maxWidth: "1009px",
    minWidth: "602px",
  });

  const resolution602 = useMediaQuery({
    maxWidth: "602px",
  });
  const router = useRouter();
  const [projectState, setProjectState] = useState(undefined);
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
  const [stateAssignedProject, setStateAssignedProject] = useState([
    { ProjectID: 0 },
  ]);
  const [stateNoAssigned, setStateNoAssigned] = useState([]);
  const { promiseInProgress } = usePromiseTracker();

  useEffect(() => {
    if (!router.isReady) return;

    let promises = [];

    const fetchData = async () => {
      if (status.cookies.username !== 0) {
        if (status.cookies.username !== undefined) {
          await axios({
            method: "post",
            url: `/api/daily-report/signin`,
            timeout: 1000000,
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

      if (status.permission === true && projectState !== undefined) {
        router.push(`?pid=${projectState}`);
        
        // axios get
        // setData(....)
         

        
      } else {
        // setData(')
      }
    };

    promises.push(fetchData());
    trackPromise(Promise.all(promises).then(() => {}));
  }, [projectState, status, router.isReady]);

  useEffect(() => {
    if (typeof stateAssignedProject[0] == "undefined") {
      setTimeout(() => {
        setStateNoAssigned(true);
      }, 3000);
    } else {
      setStateNoAssigned(false);
    }
  }, [stateAssignedProject]);

  
  const signin = async (username, password) => {
    await axios({
      method: "post",
      url: `/api/daily-report/signin`,
      timeout: 1000000,
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
    // setData([]);
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

  return (
    <>
        <Head>
            <title>Daily Report</title>
            <link rel="icon" href="/favicon.ico" />
            <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"/>
        </Head>
        {status.cookies.username === undefined ||
         status.cookies.employeeid === undefined ? (
            <Login signin={signin} />
          ) : !status.permission || stateNoAssigned === true ? (
            <NotPermission path="record" />
          ): (<>
                <SimpleTabs
                    tapNo={2} // Needs to be changed
                    projectState={projectState}
                    main={false}
                    employeeID={status.cookies.employeeid}
                    employeeName={status.cookies.fullname}
                    logout={logout}
                    style={{ display: "none" }}
                />
                {promiseInProgress || !projectState 
                // || !(data.length >= 0) 
                ? (
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
                    <Loader type="Oval" color="#4e88de" height="150" width="150" />
                    </div>
                ) : <div id={styles.mainDiv}>
                        <>
                            <h1 className={styles["title"]}>Record</h1>
                            <div className={styles["header"]}>
                                <div className={styles["header__left"]}>
                                    <select
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
                                        // zIndex: modalNoWork.isOpen ? "0" : "1",
                                        position: "relative",
                                        height: "30px",
                                        marginBottom: "3px",
                                        width: resolution602
                                          ? "450px"
                                          : resolution1008
                                          ? "500px"
                                          : "800px",
                                      }}
                                    >
                                      {stateAssignedProject.map(item => {
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
                                </div>
                            </div>
                        </>
                    </div>}
              </>)
         
         
         
         
         
         }
    </>
  )
}

export default Template