const uuid = require('uuid');


function validateNewAccount(req, res, next){

    if(!req.body.password || !req.body.username || !(typeof req.body.is_admin === 'boolean')){
        req.body.valid = false;
        next();
    }else{
        req.body.valid = true;
        next();
    }
}

function genUUID(){
    id = uuid.v4();
    console.log(`creating uuid of ${id}`);
    return id;
}


module.exports = {validateNewAccount, genUUID};