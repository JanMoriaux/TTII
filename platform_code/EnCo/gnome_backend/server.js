const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const dbConfig = require("./config/db");
const enco = require("./app/enco_service/enco_service");

const app = express();
const port = 80;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//start a service updating the enco device list 
enco.updateDevices();

MongoClient.connect(dbConfig.url, (err, database) => {
  if (err) return console.log(err);

  require("./app/routes")(app, database);

  var server = app.listen(port, () => {
    console.log("We are live on " + port);
  });
});
