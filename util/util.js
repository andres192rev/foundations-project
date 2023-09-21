const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');

//checks for non empty password and username
function validateNewAccount(req, res, next){
    console.log("validating "  +" "+req.body.username+" "+ req.body.password+" "+ req.body.role);
    if(!req.body.password || !req.body.username ){
        req.body.valid = false;
        next();
    }else{
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

function genUUID(){
    id = uuid.v4();
    console.log(`creating uuid of ${id}`);
    return id;
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




module.exports = {validateNewAccount, genUUID, validateLogin, verifyTokenAndReturnPayload, createJWT};