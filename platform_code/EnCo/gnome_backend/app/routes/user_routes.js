const apiConfig = require("../../config/api_config");

module.exports = function(app, db) {
  app.post("/users/login", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if(!username || username === "" || !password || password === ""){
        if (!res.headersSent) {
        res.status(401);
        res.send({error: "Invalid username or password"});
        return;
        }
    } 
    else{
        let query = {
            username: new RegExp(username, "i"),
            password: password
        }

        db.collection("users").findOne(query,(err,item) => {
            if(err){
                if (!res.headersSent) {
                    res.status(500);
                    res.send({ error: "Error authenticating user" });
                    return;
                  }
            }
            else if(!item){
                if(!res.headersSent){
                    res.status(401);
                    res.send({error: "Invalid username or password"});
                    return;
                }    
            }
            else{
                if(!res.headersSent){
                    res.status(200);
                    res.send({apiKey: apiConfig.apiKey});
                    return;
                }    
            }
        })
    }}
  );
};