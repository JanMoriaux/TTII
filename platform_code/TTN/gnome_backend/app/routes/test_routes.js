const apiConfig = require("../../config/api_config");

module.exports = function(app, db) {
  app.get("/test", (req, res) => {
    res.status(200);
    res.send();
  });
};
