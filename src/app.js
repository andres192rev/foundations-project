//////////////////////////////////////
//////todo
///////////service logic to not edit processed items 

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

//allows a manager to edit the role of a user 
app.put('/user', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    const body = req.body;
    util.verifyTokenAndReturnPayload(token)
    .then((payload) => {
        if(payload.role === 'manager'){
            myDAO.changeUserRole(body.username, body.role);
            res.send({
                message: `${payload.username} changed ${body.username} role to ${body.role}`
            }) 
        }else{
            res.statusCode = 400;
            res.send({
                message: `error with changing ${username} role to ${body.role}`
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

//creates new account and makes sure username and password are supplied 
app.post('/user', util.validateNewAccount, (req, res) => {
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
    body = req.body;
    console.log("body is: " + body);
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

//creates a ticket with neccessary params amount, description
//adds ticket to database with additional params payload.username and the status 
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
                    myDAO.createTicket(util.genUUID(), payload.username, body.amount
                        ,body.description, body.status, body.category);
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


//A manager, validated thorugh a jwt in the incoming request headers,
//can update a tickets status to approved or denied using the 
//tickets UUID
app.put('/tickets', util.validateUpdateTicket, (req,res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    body = req.body;
    console.log("body is: " + body);
    console.log("body.valid is: " + body.valid );
    console.log("body.ticket_id is: " + body.ticket_id );
    
    util.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            console.log(payload);
            //lets a manager change the status of a ticket to approved or denied 
            if(payload.role === 'manager'){
                //only continue if input has been validated
                if(body.valid){

                    //todo
                    myDAO.updateTicket(body.ticket_id, body.status);
                    res.send({
                    message: ` update ticket: ${body.ticket_id}`
                })
                }else{
                    res.statusCode = 400;
                    res.send({
                        message: `error with validating ticket`
                    })
                }
            }
            //lets an employee to update their tickets with an image 
            else if(payload.role === 'employee'){
                console.log("about to add image to ticket " + ticket_id );
                myDAO.addImageToTicket(ticket_id, body.image)
                .then((data) => {
                    const ticketObj = data.Item;
                    console.log(ticketObj);
                    res.send({
                        message: `getting list: ${list}`
                    })
                })
                .catch((err) => {
                    console.error(err);
                    res.statusCode = 401;
                    res.send({
                        message: "Failed to add Image"
                    })
                })
            
            
            
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
/* 
    Gets All pending tickets if user is manager
    Gets all user tickets if user is employee
*/
app.get('/tickets', (req,res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    
    
    
    util.verifyTokenAndReturnPayload(token)
    .then((payload) => {
        console.log(payload);
        if(payload.role === "manager"){
            myDAO.getAllPendingTickets()
            .then((data) => {
                 const list = data.Items; 
                 console.log(list);
                 res.send({
                     message: `getting list: ${list}`
                 })
            })
        }
        else if(payload.role ==="employee"){
            myDAO.getAllUserTickets(payload.username)
            .then((data) => {
                const list = data.Items;
                console.log(list);
                res.send({
                    message: `employee is getting list: ${list}`
                })
            })
            
        }else{
            res.statusCode = 401;
            res.send({
                message: `You are not a valid role, you are a ${payload.role}`
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

//Gets all user tickets filtered by "Category"
app.post('/tickets/type', (req,res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];

    util.verifyTokenAndReturnPayload(token)
    .then((payload) => {
        if(payload.username === 'employee'){
            myDAO.getAllUserTicketsByCategory(req.body.category)
            .then((data) => {
                const list = data.Items;
                console.log(list);
                res.send({
                    message: `employee is getting list: ${list}`
                })
            })
        }else{
            res.statusCode = 401;
            res.send({
                message: `You are not a valid role, you are a ${payload.role}`
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

app.post('/ch')




} )

app.listen(PORT, ()=> {
    console.log(`server is runnin on port ${PORT}`);
});