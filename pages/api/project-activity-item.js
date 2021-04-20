const mssql = require("mssql");
const dbserver = require("../../dbConfig.js");

const projectActivityItemHandler = (req, res) => {
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

          const query = `EXEC [Hammer].[dbo].[ProjectActivityItem_Insert]
          ${body.ActivityID}, '${body.Contractor}', '${body.WorkActivity}', ${body.Super}, ${body.Labor}, '${body.Equipment}', '${body.WorkPerformed}'`;
          /* --Params--
          	@activityID int,

            @contractor nvarchar(100),
            @workActivity nvarchar(100),
            @super float,
            @labor float,
            @equipment nvarchar(100),
            @workPerformed nvarchar(300)
          */

          request.query(query, (err, recordset) => {
            if (err) {
              console.error(err);
              return resolve();
            }
            res.status(200).json({
              message: "Success.",
            });
            return resolve();
          });
        });
        break;

      default:
        res.setHeader("Allow", ["POST", "DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        res.status(404).end(`Failed`);
        resolve();
    }
  });
};

export default projectActivityItemHandler;
