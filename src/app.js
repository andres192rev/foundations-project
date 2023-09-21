const express = require('express');
const app = express();
const PORT = 3000;
const util = require('../util/util');
const myDAO = require('../repository/myDAO');
//const myService = require('../service/myService');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

//import the router 
const myRouter = require('../routes/myRoutes');
//use the router with our roues 


// sets the base url 
app.use('/api',myRouter);



//route created here does not use base url
app.get('/hello', (req,res) =>{
    res.send("hello world");
})



app.post('/users', util.validateNewAccount, (req, res) => {
    const body = req.body;
    
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
})



app.listen(PORT, ()=> {
    console.log(`server is runnin on port ${PORT}`);
});