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

//creates new account and makes sure username and password are supplied 
app.post('/user', util.validateNewAccount, (req, res) => {
    const body = req.body;
    
    if(req.body.valid){
        myDAO.createAccount(util.genUUID(), body.username, body.password, body.role)
            .then((data) => {
                
                res.statusCode = 201;
                res.send({
                    message: ("Successfully created account!"),
                    username: body.username,
                    role: body.role,
                    password: body.password
           
                })
            })
            .catch((err) => {
                res.statusCode = 400;
                res.send({
                    message: `Username ${body.username} already exists`
                })
            })
    }else{
        console.log(body);
        res.statusCode = 400;
        res.send({ 
            message: "Invalid Item properties"  
            
        })
    }
})

//logins with valid username check
app.post('/login',  (req,res) => {
    const username = req.body.username;
    const password = req.body.password; 
    body = req.body;

    // we make a request to the database based on the username
    // then validate if it has the correct password
   

    myDAO.retrieveByUsername(username)
        .then((data) => {
            const userItem = data.Item;
            // successful login
            console.log(userItem);
            if(password === userItem.password){
                // create the jwt
                const token = util.createJWT(userItem.username, userItem.role);
                res.statusCode = 202;
                res.send({
                    message : "Success! Creating login token for " + userItem.username,
                    role: userItem.role,
                    token : token
                })
                //wrong password
            }else{
                res.statusCode = 401;
                res.send({
                    message: "Invalid Credentials"
                })
            }
        })
        .catch((err) => {
            res.statusCode = 404;
            res.send({
                message: "No user found"
            })
        });
} )



//creates a ticket with neccessary params amount, description
//adds ticket to database with additional params payload.username and the status 
app.post('/tickets', util.validateNewTicket, (req, res) => {

    try{
        const token = req.headers.authorization.split(' ')[1];

        body = req.body;
        util.verifyTokenAndReturnPayload(token)
            .then((payload) => {
                console.log(payload);
                //only employee can create tickets
                if(payload.role === 'employee'){
                    //only continue if input has been validated
                    if(body.valid){
                        //create ticket
                        ticketID = util.genUUID();
                        myDAO.createTicket(ticketID, payload.username, body.amount
                            ,body.description, body.ticket_status, body.category)
                            .then((data) => {
                                //send confirmation
                                console.log(data);
                                res.statusCode = 201;
                                res.send({
                                    message: `${payload.username} created a ticket!`,
                                    ticket: {
                                        ticket_id: ticketID,
                                        ticket_status: body.ticket_status,
                                        category: body.category,
                                        amount: body.amount,
                                        username: payload.username,
                                        description: body.description
                                    } 
                                })
                            })
                            .catch((err) => {
                                console.log("missing description or amount for ticket");
                              
                            })
                    }
                //wrong payload.role 
                }else{
                    res.statusCode = 403;
                    res.send({
                        message: `Can't create ticket you are not an employee, you are a ${payload.role}`
                    })
                }
            })
            .catch((err) => {
                
                res.statusCode = 401;
                res.send({
                    message: "Failed to Authenticate Token",
                    error: err.message
                })
            })
    }
    catch(err){
        console.log("no token");
        res.statusCode = 401;
        res.send({
            message: "Missing Authorization Headers"
        })
    }
})

//todo check to make sure ticket is valid(exists, status=pending)
//A manager, validated thorugh a jwt in the incoming request headers,
//can update a tickets status to approved or denied using the 
//tickets UUID
app.put('/tickets', util.validateUpdateTicket, (req,res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    body = req.body;

    util.verifyTokenAndReturnPayload(token)
        .then((payload) => {
            console.log(payload);
            /////////////////////////////////////////////////////////////////////////
            ///lets a manager change the status of a ticket to approved or denied////
            if(payload.role === 'manager'){
                //only continue if input has been validated
                if(body.valid){
                    //update the ticket with its id 
                    myDAO.updateTicket(req.query.ticket_id, body.ticket_status)
                    .then((data) => {
                        res.send({
                            message: `updated ticket with status ${body.ticket_status}`,
                            ticket_info: data.Attributes
                        })
                    })
                    //ticket is not pending or doesnt exists
                    .catch((err) => {
                        res.statusCode = 404;
                        res.send({
                            message: "No ticket found with UUID or Pending status"
                        })
                    })
                }else{
                    res.statusCode = 400;
                    res.send({
                        message: `Error with validating ticket input`
                    })
                }
            }else{
                res.statusCode = 401;
                res.send({
                    message: `You are not an manager, you are a ${payload.role}`
                })
            }

            ///////////////////////////////////////////////////////////
            //lets an employee to update their tickets with an image///
            /* ////////////////TODO///////////////////////////////////////
            else if(payload.role === 'employee'){
                ticket_id = body.ticket_id;
                console.log("about to add image to ticket " + ticket_id );
                res.send({
                    message: `getting list: ${list}`
                })
                myDAO.addImageToTicket(ticket_id, body.image)
                .then((data) => {
                    const ticketObj = data.Item;
                    console.log(ticketObj);
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
            } */
        })
        .catch((err) => {
            console.error(err);
            res.statusCode = 401;
            res.send({
                message: "Failed to Authenticate Token"
            })
        })
})


/* 
    Gets All pending tickets if user is manager
    Gets all user tickets if user is employee
*/
app.get('/tickets', (req,res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    util.verifyTokenAndReturnPayload(token)
    .then((payload) => {
        console.log(payload);
        //if the user requesting is a manager show them pending requests only 
        if(payload.role === "manager" && req.query.status == "pending"){
            myDAO.getAllPendingTickets()
            .then((data) => {
                 const list = data.Items; 
                 console.log(list);
                 res.statusCode = 200;
                 res.send({
                    message: "retrieved all pending tickets",
                    list
                 })
            })
        }
        else if (payload.role === "manager" && !(req.query.status == "pending")){
            res.statusCode = 404;
            res.send({
            message: "You are a manager but have wrong query parameter status:pending"
            })
        }

        //todo
        /////////////////////////////////////////////////////////////////////////
        //////////////////////Employee Requests//////////////////////////////////
        //if theyre an employee show them their tickets only 
        else if(payload.role ==="employee"){

            //dont allow user to access others tickets
            if(req.query.username != payload.username){
                res.statusCode = 403;
                res.send({
                    message: `Error. User ${payload.username} is trying to access ${req.query.username}'s  list of tickets:`
                })
            }
            //if category query included GET  a users tickets based on category
            else if(req.query.username === payload.username && req.query.category){
                myDAO.getAllUserTicketsByCategory(req.query.category, payload.username)
                .then((data) => {
                    const list = data.Items;
                    console.log(list);
                    res.send({
                        message: `Getting ${payload.username}'s tickets of type ${req.query.category}`,
                        list
                    })
                })
                .catch((err) => {
                    console.log(err);
                    res.statusCode = 404;
                    res.send({
                        message: "no User found"
                    })
                })
            }
            //if the employee is on the right page show them the tickets
            else if(req.query.username === payload.username){
                myDAO.getAllUserTickets(payload.username)
                .then((data) => {
                    const list = data.Items;
                    console.log(list);
                    res.send({
                        message: `Getting ${payload.username}'s list of tickets:`,
                        list
                    })
                })
                .catch((err) => {
                    res.statusCode = 404;
                    res.send({
                        message: "no user found"
                    })
                })
            }
            
        }
        else{
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


//allows a manager to edit the role of a user 
app.patch('/users/:username/', util.validateChangeRole, (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // ['Bearer', '<token>'];
    const body = req.body;
    const parms = req.params.username;

    util.verifyTokenAndReturnPayload(token)
    .then((payload) => {
        if(req.body.valid){
            //only a manager can edit roles
            if(payload.role === 'manager' && body.role){
                myDAO.changeUserRole(parms, body.role)
                .then((data) => {
                    res.send({
                        message: `${payload.username} changed ${parms} role to ${body.role}`
                    })
                })
                .catch((err) => {
       
                    res.statusCode = 404;
                    res.send({
                        message: "Error username does exist"
                    })
                })
            }
            else{
                res.statusCode = 400;
                res.send({
                    message: `Error you are ${payload.role}. Must be a manager to change role`
                })
            }
        }
        else{
            res.statusCode = 400;
            res.send({
                message: `Error ${body.role} not valid`
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



app.listen(PORT, ()=> {
    console.log(`server is runnin on port ${PORT}`);
});