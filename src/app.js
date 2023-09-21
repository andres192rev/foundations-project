const express = require('express');
const app = express();

const PORT = 3000;
const util = require('../util/util');
const myDAO = require('../repository/myDAO');
//const myService = require('../service/myService');

const bodyParser = require('body-parser');
app.use(bodyParser.json());




//route created here does not use base url
app.get('/hello', (req,res) =>{
    res.send("hello world");
})



app.post('/users', util.validateNewAccount, (req, res) => {
    const body = req.body;
    
    if(req.body.valid){
        myDAO.createAccount(util.genUUID(), body.username, body.password, body.role)
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
})



app.post('/login',  (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // we make a request to the database based on the username
    // then validate if it has the correct password
    console.log(`looking for ${username}`);
 
    myDAO.retrieveByUsername(username)
        .then((data) => {
            const userItem = data.Item;
            console.log("found user " + userItem.username);
            if(password === userItem.password){
                // successful login
                // create the jwt
                const token = util.createJWT(userItem.username);

                res.send({
                    message : "Successfully Authenticated",
                    token : token
                })
            }else{
                res.statusCode = 400;
                res.send({
                    message: "Invalid Credentials"
                })
            }
        })
        .catch((err) => {
            console.error(err);
            res.send({
                message: "Failed to authenticate user"
            })
        });
} )



app.listen(PORT, ()=> {
    console.log(`server is runnin on port ${PORT}`);
});