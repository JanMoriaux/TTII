const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const ttn = require("ttn");
const dbConfig = require("./config/db");
const ttnService = require("./app/ttn_service/ttn_service");



const app = express();

const port = 8000;
const ip = "192.168.0.132";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//start the ttn background service
//ttnService.data();
//ttnService.devices();

MongoClient.connect(dbConfig.url, (err, database) => {
  if (err) return console.log(err);

  require("./app/routes")(app, database);

  var server = app.listen(port, () => {
    console.log("We are live on " + port);
  });
});
