import Timesheet from "./main/Timesheet";
import Task from "./main/Task";
import { useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TabPanel from "./Tab/TabPanel";
import a11yProps from "./Tab/a11yProps";
import Miscellaneous from "./main/Miscellaneous";
import AccountCircle from "@material-ui/icons/AccountCircle";
import styles from "./TabsOfBoth.module.css";

const TabsOfBoth = ({
  tapNumber,
  handleChangeTabs,
  employeeInfo,
  assignedProject,
}) => {
  const [projectState, setProjectState] = useState(0);
  const handleProjectState = () => {
    setProjectState(document.getElementById("select-project").value);
  };
  return (
    <>
      {!projectState ? (
        <>
          <AppBar position="static">
            <Tabs
              value={tapNumber}
              onChange={handleChangeTabs}
              aria-label="tabs"
              variant="scrollable"
              scrollButtons="auto"
              indicatorColor="primary"
            >
              <Tab
                icon={
                  <div className={styles["wrapper-right-tab"]}>
                    <p className={styles["wrapper-right-tab__employee-name"]}>
                      {employeeInfo.FullName}
                    </p>
                    <AccountCircle
                      className={styles["wrapper-right-tab__account-icon"]}
                    />
                  </div>
                }
                disabled
                className={styles["right-tab"]}
              />
            </Tabs>
          </AppBar>
          <div>
            <select id="select-project">
              {assignedProject.map(item => {
                return <option key={item.ProjectID}>{item.ProjectID}</option>;
              })}
            </select>
            <button onClick={handleProjectState}>Go</button>
          </div>
        </>
      ) : (
        <>
          <AppBar position="static">
            <Tabs
              value={tapNumber}
              onChange={handleChangeTabs}
              aria-label="tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Timesheet" {...a11yProps(0)} />
              <Tab label="Tasks" {...a11yProps(1)} />
              <Tab label="Miscellaneous" {...a11yProps(2)} />
              <Tab
                icon={
                  <div className={styles["wrapper-right-tab"]}>
                    <p className={styles["wrapper-right-tab__employee-name"]}>
                      {employeeInfo.FullName}
                    </p>
                    <AccountCircle
                      className={styles["wrapper-right-tab__account-icon"]}
                    />
                  </div>
                }
                disabled
                className={styles["right-tab"]}
              />
            </Tabs>
          </AppBar>
          <TabPanel tapNumber={tapNumber} index={0}>
            <Timesheet
              projectState={projectState}
              setProjectState={setProjectState}
              employeeInfo={employeeInfo}
            />
          </TabPanel>
          <TabPanel tapNumber={tapNumber} index={1}>
            <Task
              projectState={projectState}
              setProjectState={setProjectState}
              employeeInfo={employeeInfo}
            />
          </TabPanel>
          <TabPanel tapNumber={tapNumber} index={2}>
            <Miscellaneous
              projectState={projectState}
              setProjectState={setProjectState}
              employeeInfo={employeeInfo}
            />
          </TabPanel>
        </>
      )}
    </>
  );
};

export default TabsOfBoth;
