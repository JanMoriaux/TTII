const apiConfig = require("../../config/api_config");
const moment = require("moment");

module.exports = function(app, db) {
  //GET /data/:devId/:type
  //returns history data from sensor with given type
  //for the device with given deviceId 
  //
  //querystring parameters:
  //
  //apiKey: required
  //type: required
  //devId: required 
  //from: optional      1d => get data from last 24 hours
  //                    1w => data from last week           default
  //                    1m => data from last month 
  //
  app.get("/data/:devId/:type", (req, res) => {
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
    db.collection("devices_enco").findOne(query, (err, item) => {
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

    //check the sensor type
    let type = req.params.type;
    if (!type || type === "") {
      if (!res.headersSent) {
        res.status(400);
        console.log("No sensor type in query!\n");
        res.send({ error: "No sensor type in query!" });
        return;
      }
    }
    let collection = getCollectionFromType(type);

    //fetch data according to "from" request string parameter
    let from = req.query.from;
    //defaults to 1 week
    if (!from || (from != "1d" && from != "1w" && from != "1m")) {
      from = "1w";
    }
    let gteDate;
    switch (from) {
      case "1d":
        gteDate = new Date(
          moment
            .utc()
            .subtract(1, "d")
            .format()
        );
        break;
      case "1w":
        gteDate = new Date(
          moment
            .utc()
            .subtract(1, "w")
            .format()
        );
        break;
      case "1m":
        gteDate = new Date(
          moment
            .utc()
            .subtract(1, "M")
            .format()
        );
        break;
    }
    query = {
      time: { $lt: new Date(moment.utc()), $gte: gteDate },
      devId: devId
    };
    db
      .collection(collection)
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

  //GET /data/:devId/latest/:type
  //returns the latest sensor value for the given sensor type
  //
   //querystring parameters:
  //
  //apiKey: required
  //type: required
  //devId: required 
  app.get("/data/:devId/:type/latest", (req, res) => {
    let apiKey = req.query.apiKey;
    //check the apiKey
    if (apiKey != apiConfig.apiKey) {
      if (!res.headersSent) {
        res.status(400);
        res.send({ error: "Invalid API key!" });
      }
    }

    //check the devId
    let devId = req.params.devId;
    let query = { _id: devId };
    db.collection("devices_enco").findOne(query, (err, item) => {
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

     //check the sensor type
     let type = req.params.type;
     if (!type || type === "") {
       if (!res.headersSent) {
         res.status(400);
         console.log("No sensor type in query!\n");
         res.send({ error: "No sensor type in query!" });
         return;
       }
     }
     let collection = getCollectionFromType(type);

    query = { devId: devId };
    db
      .collection(collection)
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

  //POST /data/:type
  //inserts a sensor value into db
  //
  //
  //querystring parameters:
  //
  //apiKey: required
  //type: required
  //body: required {"devId":string,"time":number,"value":number}
  app.post("/data/:type", (req, res) => {
    console.log("\n\n");
    console.log("incoming data transmit:\n");
    console.log(req.body);
    console.log("\n\n");

    let apiKey = req.query.apiKey;
    //check the API_KEY
    if (apiKey != apiConfig.apiKey) {
      if (!res.headersSent) {
        res.status(400);
        console.log("Invalid API key!\n");
        res.send({ error: "Invalid API key!" });
        return;
      }
    }

    //check the sensor type
    let type = req.params.type;
    if (!type || type === "") {
      if (!res.headersSent) {
        res.status(400);
        console.log("No sensor type in query!\n");
        res.send({ error: "No sensor type in query!" });
        return;
      }
    }

    //request body present?
    if (!req.body || req.body === "") {
      if (!res.headersSent) {
        res.status(400);
        console.log("No request body!");
        res.send({ error: "No request body!\n" });
        return;
      }
    }

    //check for valid values
    let devId = req.body.devId;
    let time = req.body.time;
    let value = req.body.value;
    if (
      !devId ||
      devId === "" ||
      !time ||
      time === "" ||
      !value ||
      value == ""
    ) {
      if (!res.headersSent) {
        res.status(400);
        console.log("Invalid request body\n");
        res.send({ error: "Invalid request body" });
        return;
      }
    }

    //check for valid devId
    let query = { _id: devId };
    db.collection("devices_enco").findOne(query, (err, item) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500);
          console.log("Error fetching device\n");
          res.send({ error: "Error fetching device" });
          return;
        }
      } else if (!item) {
        if (!res.headersSent) {
          res.status(404);
          console.log("Device with given id not found\n");
          res.send({ error: "Device with given id not found!" });
          return;
        }
      } else {
        let collection = getCollectionFromType(type);
        req.body.time = new Date(req.body.time);

        db.collection(collection).insert(req.body, (err, records) => {
          if (err) {
            if (!res.headersSent) {
              res.status(500);
              console.log("Error inserting data\n");
              res.send({ error: "Error inserting data!" });
              return;
            }
          } else {
            if (!res.headersSent) {
              res.status(200);
              console.log("OK: " + records.ops[0]._id);
              res.send({ id: records.ops[0]._id });
              return;
            }
          }
        });
      }
    });
  });
};

const getCollectionFromType = type => {
  let collection;
  switch (type) {
    case "temp":
      collection = "tempreadings";
      break;
    case "hum":
      collection = "humreadings";
      break;
    case "air":
      collection = "airreadings";
      break;
    case "light":
      collection = "lightreadings";
      break;
    case "soilcap":
      collection = "soilcapreadings";
      break;
  }
  return collection;
};
