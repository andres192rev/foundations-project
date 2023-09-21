const uuidUtil = require('uuid');
const myDAO = require('../repository/myDAO');
const util = require('../util/util');
const bodyParser = require('body-parser');
bodyParser.json();

/* myDAO.createAccount(uuidUtil.v4(), 'username', 'password', false)
     .then((data) => {
         console.log('Adding Item Successful');
     }).catch((err) => {
         console.log('An Error Occurred!');
        console.error(err);
    }); */





function createAccount(req,res){
    const body = req.body;
    console.log(body + " create account loop");
    if(req.body.valid){
        myDAO.createAccount(util.genUUID(), body.username, body.password, body.is_admin)
            .then((data) => {
                res.send({
                    message: "Successfully Added Item!"
                })
            })
            .catch((err) => {
                res.send({
                    message: "Failed to Add Item!"
                })
            })
    }else{
        console.log(body);
        res.send({
            message: "Invalid Item properties"
            
        })
    }
}

module.exports = {createAccount};