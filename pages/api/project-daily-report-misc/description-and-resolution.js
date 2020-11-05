const mssql = require("mssql");
const dbserver = require("../../../dbConfig.js");

const descriptionAndResolutionHandler = (req, res) => {
  const { method, body } = req;
  return new Promise(resolve => {
    switch (method) {
      case "POST":
        mssql.connect(dbserver.dbConfig, err => {
          if (err) {
            console.error(err);
            return resolve();
          }
          const request = new mssql.Request();

          const query = `EXEC [Hammer].[dbo].[ProjectDailyReportMisc_DescriptionAndResolution_Insert]
          ${body.ProjectID}, '${body.Date}', '${body.InspectionDescription}', '${body.InspectionResolution}'`;
          /* --Params--
          	@projectID	int,
            @date	date,
            @inspectionDescription nvarchar(1000),
            @inspectionResolution nvarchar(1000)
          */

          request.query(query, (err, recordset) => {
            if (err) {
              console.error(err);
              return resolve();
            }
            res.status(200).json({
              message: "Success, the record of Miscellaneous has been created.",
            });
            return resolve();
          });
        });
        break;

      default:
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        res.status(404).end(`Failed`);
        resolve();
    }
  });
};

export default descriptionAndResolutionHandler;
