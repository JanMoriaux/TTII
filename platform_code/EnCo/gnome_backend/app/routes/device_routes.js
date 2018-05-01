const apiConfig = require("../../config/api_config");

module.exports = function(app, db) {
  app.get("/devices", (req, res) => {
    let apiKey = req.query.apiKey;
    //check the API_KEY
    if (apiKey != apiConfig.apiKey) {
      if (!res.headersSent) {
        res.status(400);
        res.send({ error: "Invalid API key!" });
      }
    }

    db
      .collection("devices_enco")
      .find()
      .toArray((err, item) => {
        if (err) {
          if (!res.headersSent) {
            res.status(500);
            res.send({ error: "Error fetching device list" });
          }
        } else {
          if (!res.headersSent) {
            res.status(200);
            res.send(item);
          }
        }
      });
  });
};
