const fetch = require("node-fetch");
const MongoClient = require("mongodb").MongoClient;
const dbConfig = require("../../config/db");

const client_id = "g66fp1_H41ZihdQFkN25AYnyZ9Ia";
const client_secret = "d9_Yb5medmyISkGV3pmfbitnnBwa";

//checks for new devices every INTERVAL
const INTERVAL = 6 * 60 * 60 *1000;

let token;

const refreshToken = () => {
  return fetch(
    `https://api.enco.io/token?grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}&scope=openid`,
    { method: "POST" }
  )
    .then(response => response.json())
    .then(json => {
      return json;
    })
    .catch(err => console.log(err));
};

const fetchDevicesInDb = async () => {
  return await MongoClient.connect(dbConfig.url, async (err, database) => {
    if (err) throw err;
    return await database
      .collection("devices_enco")
      .find({}, { _id: 1 })
      .toArray((err, result) => {
        if (err) console.log(err);
        else if (result) {
          return result;
        }
      });
  });
};

const updateDevices = async () => {
  //refresh the device list every six hours
  setInterval(async () => {
    if (!token || token.expires_in < 100) {
      token = await refreshToken();
      //console.log(token);
    }
    fetch(`https://api.enco.io/seaas/0.0.1/device/list?public=false`, {
      headers: new fetch.Headers({
        Authorization: `Bearer ${token.access_token}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      })
    })
      .then(response => {
        return response.json();
      })
      .then(async json => {
        let devices = json;
        let devIdsOnEnco = [];
        //upsert all devices from the enco platform
        for (let device of devices) {
          devIdsOnEnco.push(device.deviceId);
          MongoClient.connect(dbConfig.url, (err, database) => {
            if (err) throw err;
            database
              .collection("devices_enco")
              .update({ _id: device.deviceId }, device, { upsert: true });
          });
        }
        //delete devices not found on enco
        MongoClient.connect(dbConfig.url, (err, database) => {
          if (err) throw err;
          database
            .collection("devices_enco")
            .find({}, { _id: 1 })
            .toArray((err, devIdsInDb) => {
              if (err) console.log(err);
              else if (devIdsInDb) {
                for(let devIdInDb of devIdsInDb){
                  let id = devIdInDb._id;
                  if(devIdsOnEnco.indexOf(id) < 0){
                    MongoClient.connect(dbConfig.url, (err, database) => {
                      if (err) throw err;
                      database
                        .collection("devices_enco")
                        .remove({ _id: id }, true);
                    });
                  }
                }
              }
            });
        });
      })
      .catch(err => console.log(err));
  }, INTERVAL);
};

module.exports = {
  updateDevices: () => updateDevices()
};
