const apiConfig = require("../../config/api_config");
const moment = require("moment");

module.exports = function(app, db) {
  //querystring parameters:
  //from (optional)     1d => get data from last 24 hours
  //                    1w => data from last week
  //                    1m => data from last 20 days
  //
  //apiKey
  //
  //returns the data from device with given devId
  //sorted by date descending
  app.get("/data/:devId", (req, res) => {
    let apiKey = req.query.apiKey;
    //check the API_KEY
    if (apiKey != apiConfig.apiKey) {
      if (!res.headersSent) {
        res.status(400);
        res.send({ error: "Invalid API key!" });
      }
    }

    //check the devId
    let devId = req.params.devId;
    let query = { _id: devId };
    db.collection("devices").findOne(query, (err, item) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500);
          res.send({ error: "Error fetching device" });
        }
      }
      if (!item) {
        if (!res.headersSent) {
          res.status(404);
          res.send({ error: "Device with given id not found!" });
        }
      }
    });

    //fetch data according to "from" request string parameter
    let from = req.query.from;
    //defaults to 1 week
    if (!from || (from != "1d" && from != "1w" && from != "1m")) {
      from = "1w";
    }
    let gteDate;
    switch (from) {
      case "1d":
        gteDate = new Date(moment.utc().subtract(1,"d").format());
        break;
        case "1w":
        gteDate = new Date(moment.utc().subtract(1,"w").format());
        break;
        case "1m":
        gteDate = new Date(moment.utc().subtract(1,"M").format());
        break;
    }
    query = { time: { $lt: new Date(moment.utc()), $gte: gteDate }, devId: devId };
    db
      .collection("readings")
      .find(query)
      .sort({ time: -1 })
      .toArray((err, readings) => {
        if (err) {
          if (!res.headersSent) {
            res.status(500);
            res.send({ error: "Error fetching data" });
          }
        }
        if (!readings) {
          if (!res.headersSent) {
            res.status(404);
            res.send("Couldn't retrieve data!");
          }
        }
        if (!res.headersSent) {
          res.status(200);
          res.send(readings);
        }
      });
  });

  //gets the latest reading from the device with given devId
  app.get("/data/:devId/latest", (req, res) => {
    let apiKey = req.query.apiKey;
    //check the API_KEY
    if (apiKey != apiConfig.apiKey) {
      if (!res.headersSent) {
        res.status(400);
        res.send({ error: "Invalid API key!" });
      }
    }

    //check the devId
    let devId = req.params.devId;
    let query = { _id: devId };
    db.collection("devices").findOne(query, (err, item) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500);
          res.send({ error: "Error fetching device" });
        }
      }
      if (!item) {
        if (!res.headersSent) {
          res.status(404);
          res.send({ error: "Device with given id not found!" });
        }
      }
    });

    query = { devId: devId };
    db
      .collection("readings")
      .find(query)
      .sort({ time: -1 })
      .limit(1)
      .toArray((err, reading) => {
        if (err) {
          if (!res.headersSent) {
            res.status(500);
            res.send({ error: "Error fetching data" });
          }
        }
        if (!reading) {
          if (!res.headersSent) {
            res.status(404);
            res.send("Couldn't retrieve data!");
          }
        } else {
          if (!res.headersSent) {
            res.status(200);
            res.send(reading);
          }
        }
      });
  });
};
