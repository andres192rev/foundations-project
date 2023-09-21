

//set up express
const express = require('express');
const router = express.Router();


/*
ROUTES
*/

//
router.get('/', (req,res) => {
    res.send('the  root route');
});

router.get('/login', (req,res) => {
    res.send('2nd level');
})

router.post('/users', (req, res) => {
    res.send("creating account");
});




module.exports = router;