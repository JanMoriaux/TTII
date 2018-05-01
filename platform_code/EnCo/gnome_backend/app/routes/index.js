const deviceRoutes = require('./device_routes');
const dataRoutes = require('./data_routes');
const userRoutes = require('./user_routes');
const testRoutes = require('./test_routes');

module.exports = function(app,db){
    deviceRoutes(app,db);
    dataRoutes(app,db);
    userRoutes(app,db);
    testRoutes(app,db);
}