const ttnConf = require("../../config/ttn_config");
const ttn = require("ttn");
const MongoClient = require("mongodb").MongoClient;
const dbConfig = require("../../config/db");

const fetchDeviceInterval =  60 * 60 * 1000; 

module.exports = {
    //start listening for device uplink messages
    data: () => ttn.data(ttnConf.appId, ttnConf.accessKey)
    .then(function (dataClient) {
        dataClient.on("uplink", function (devID, payload) {
            //console.log("Received uplink from ", devID)
            //console.log(payload)
            var time = payload.metadata.time;
            let reading = {
                devId: payload.dev_id,
                data: payload.payload_fields,
                time: new Date(time)
            }
            MongoClient.connect(dbConfig.url, (err, database) => {
                if (err) throw err;
                database.collection("readings").insert(reading);
              });
        })
    })
    .catch(function (error) {
        console.error(error);
    }),
    //periodically gets all devices from the ttn application 
    devices: () => setInterval(function(){
        ttn.application(ttnConf.appId, ttnConf.accessKey)
        .then(function(applicationClient) {
            return applicationClient.devices();
        })
        .then(function(devices){
            console.log(devices);
            for(let device of devices){
                device._id = device.devId;
                MongoClient.connect(dbConfig.url, (err, database) => {
                    if (err) throw err;
                    database.collection("devices").update({_id: device._id},device,{upsert: true});
                  });
            }
        }).catch(function(err){
            console.error(err);
        })
    }, fetchDeviceInterval)
}
