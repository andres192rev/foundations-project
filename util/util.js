const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');

//checks for non empty password and username
function validateNewAccount(req, res, next){
    console.log("validating "  +" "+req.body.username+" "+ req.body.password+" "+ req.body.role);
    if(!req.body.password || !req.body.username ){
        console.log("if");
        req.body.valid = false;
        next();
    }
    else if( !(req.body.role === "employee" || req.body.role === "manager") && (req.body.role) ){
        console.log("iff");
        req.body.valid = false;
        next();
    }
    else{
        console.log("iffa");
        if(!req.body.role){req.body.role = "employee";}
        req.body.valid = true;
        next();
    }
}

function validateLogin(req, res, next){

    if(!req.body.password || !req.body.username || !(typeof req.body.is_admin === 'boolean')){
        console.log(body);
        req.body.valid = false;
        next();
    }else{
        console.log(body);
        req.body.valid = true;
        next();
    }
}

function validateChangeRole(req, res, next){
    body = req.body;
    if(!req.params.username || !(req.body.role === 'manager' || req.body.role === 'employee')){
        console.log(body);
        req.body.valid = false;
        next();
    }else{
        console.log(body);
        req.body.valid = true;
        next();
    }
}



function genUUID(){
    id = uuid.v4();
    console.log(`creating uuid of ${id}`);
    return id;
}


//make sure amount is a real number and not string
function validateNewTicket(req, res, next){
   ///////////////////work on regex////////////////////////////////////////////////////////////////
    var regex = /^\d+\.\d{2}$/;
    console.log("validating new ticket "  +" "+req.body.amount+" "+ req.body.description+" "+ req.body.category);
    if(!req.body.amount || !req.body.description  ){
        res.statusCode = 400;
        res.send({
            message: `Ticket amount and description is necessary`
        })
    }
    //TODO ERROR Message 
    //ensure ticket amount is in following format XX.XX
   
    else if(!regex.test(req.body.amount)){
        res.statusCode = 400;
        res.send({
        message: `Ticket amount in wrong format`
        })
    }
    else{
        if(!req.body.category){req.body.category = "none"}
        req.body.valid = true;
        next();
    }
}


//ensure ticket is not approved or denied 
//ensure ticket exists

function validateUpdateTicket(req, res, next){
    console.log("validating update ticket "  + req.query.ticket_id + " " + req.body.status);
    tixStatus = req.body.ticket_status;
    console.log(tixStatus);
    if(!req.query.ticket_id || !((tixStatus === "denied") || (tixStatus === "approved")) ){
        req.body.valid = false;
        next();
    }else{
        req.body.valid = true;
        next();
    }
}

function createJWT(username, role){
    return jwt.sign({
        username,
        role
    }, 'thisisasecret', {
        expiresIn: '1d'
    })
}

// (header + payload) sign with the secret -> signature "thisisasecret"

/**
 * The JWT will be sent to the client
 * When the client sends the JWT back to the server, the server needs to check if the JWT is valid
 * (header + payload + signature) -> we need to verify that the signature was generated using our secret
 * You cannot forge any of the information inside of the payload or header, becuase the server will know that it was forged
 */

jwt.verify = Promise.promisify(jwt.verify); // Turn jwt.verify into a function that returns a promise

// verify
function verifyTokenAndReturnPayload(token){
    return jwt.verify(token, 'thisisasecret');
}




module.exports = {validateNewAccount, genUUID, validateLogin, validateChangeRole,
    validateNewTicket, verifyTokenAndReturnPayload, createJWT, validateUpdateTicket};