const mssql = require("mssql");
const dbserver = require("../../../dbConfig.js");

const getDailyReport = (req, res) => {
  const { method, body } = req;
  return new Promise(resolve => {
    switch (method) {
      case "GET":
        mssql.connect(dbserver.dbConfig, err => {
          if (err) {
            console.error(err);
            return resolve();
          }
          const request = new mssql.Request();

          const query = `EXEC [Exbon].[dbo].[usp_dailyreport_Select_DailyReport]
                        @projectID = ${body.ProjectID},
                        @date = ${body.date}
                        `;

          request.query(query, (err, recordset) => {
            if (err) {
              console.error(err);
              return resolve();
            }
            res.status(200).json({
              message: "Success",
              result: recordset.recordsets,
            });
            return resolve();
          });
        });
        break;

      default:
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        res.status(404).end(`Failed`);
        resolve();
    }
  });
};

export default getDailyReport;
