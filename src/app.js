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
                    message: "Successfully created account!"
                })
            })
            .catch((err) => {
                res.send({
                    message: "Username already exists"
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
 

    //error correct here/////////////
    myDAO.retrieveByUsername(username)
        .then((data) => {
            const userItem = data.Item;
            
            if(password === userItem.password){
                // successful login
                // create the jwt
                const token = util.createJWT(userItem.username, userItem.role);

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


app.post('/tickets', util.validateNewTicket, (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    body = req.body;
    console.log("token " + token);
    
    util.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            console.log(payload);
            if(payload.role === 'employee'){
                //only continue if input has been validated
                if(body.valid){
                    myDAO.createTicket(util.genUUID(), payload.username, body.amount, body.description, body.status);
                    res.send({
                    message: `${payload.username} created a ticket!`
                })
                }else{
                    res.statusCode = 400;
                    res.send({
                        message: `error with validating ticket`
                    })
                }
            }else{
                res.statusCode = 401;
                res.send({
                    message: `You are not an employee, you are a ${payload.role}`
                })
            }
        })
        .catch((err) => {
            console.error(err);
            res.statusCode = 401;
            res.send({
                message: "Failed to Authenticate Token"
            })
        })
})

app.post('/ticket-manager', (req,res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    body = req.body;
    console.log("token " + token);
    
    util.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            console.log(payload);
            if(payload.role === 'manager'){
                //only continue if input has been validated
                if(body.valid){

                    //todo
                    myDAO.manageTicket(payload.username, payload.ticket_id, payload.processed, payload.status);
                    res.send({
                    message: `${payload.username}`
                })
                }else{
                    res.statusCode = 400;
                    res.send({
                        message: `error with validating ticket`
                    })
                }
            }else{
                res.statusCode = 401;
                res.send({
                    message: `You are not an manager, you are a ${payload.role}`
                })
            }
        })
        .catch((err) => {
            console.error(err);
            res.statusCode = 401;
            res.send({
                message: "Failed to Authenticate Token"
            })
        })
})


//TODO: Service Logic
app.get('/ticket-manager', (req,res) => {
   const body = req.body;
   
   myDAO.getAllPendingTickets()
       .then((data) => {
            const list = data.Items; 
            console.log(list);
            res.send({
                message: `getting list: ${list}`
            })

   })
})


app.listen(PORT, ()=> {
    console.log(`server is runnin on port ${PORT}`);
});