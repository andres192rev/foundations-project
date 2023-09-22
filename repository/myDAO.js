const AWS = require('aws-sdk');
// set  you aws region
AWS.config.update({
    region: 'us-west-2'
});
const docClient = new AWS.DynamoDB.DocumentClient();



/* // create a dynamoDB client
const dynamoDB = new AWS.DynamoDB();
// print a list of the tables
dynamoDB.listTables({}, (err, data) => {
    if(err){
        console.error('Error', err);
    }else{
        console.log('Tables:', data.TableNames);
    }
}); */


function createAccount(uuid, username , password, role ="employee"){
    console.log("creating account  " +" "+username+" "+ password+" "+ role);

    const params = {
        TableName: 'foundations_project_1',
        ConditionExpression: 'attribute_not_exists(username)',
        Item: {
            uuid,
            username,
            password,
            role
        }

    }

    return docClient.put(params).promise();
};

function retrieveByUsername(username){
    const params = {
        TableName: 'foundations_project_1',
        Key: {
            username
        }
    }
    return docClient.get(params).promise();
}


function createTicket(ticket_id, username, amount, 
    description, status = "pending", category="none" ){
 
    const params = {
        TableName: 'tickets',
        Item: {
            ticket_id,
            username,
            amount,
            description,
            status,
            category
        }
    }
    return docClient.put(params).promise();
}



function updateTicket(ticket_id, status){
    const params = {
        TableName: 'tickets',
        Key: {
            ticket_id
        },
        UpdateExpression: 'set #n = :value',
        ExpressionAttributeNames:{
            '#n': 'status'
        },
        ExpressionAttributeValues:{
            ':value': status
        }
    }
    return docClient.update(params).promise();
}


//setup local secondary index to increase scan speed 
//using same partition key  but different sort key on the field status
function getAllPendingTickets(){
    const params = {
        TableName: "tickets",
        FilterExpression: '#c = :value',
        ExpressionAttributeNames: {
            '#c': 'status'
        },
        ExpressionAttributeValues:{
            ':value': 'pending'
        }
    }

    return docClient.scan(params).promise();
}

function getAllUserTickets(username){
    const params = {
        TableName: "tickets",
        FilterExpression: '#c = :value',
        ExpressionAttributeNames: {
            '#c': 'username'
        },
        ExpressionAttributeValues:{
            ':value': username
        }
    }

    return docClient.scan(params).promise();
}

function getAllUserTicketsByCategory(category){
    const params = {
        TableName: "tickets",
        FilterExpression: '#c = :value',
        ExpressionAttributeNames: {
            "#c": 'category'
        },
        ExpressionAttributeValues: {
            ':value' : category
        }
    }
    return docClient.scan(params).promise();
}

function changeUserRole(username, role ){
    const params = {
        TableName: "foundations_project_1",
        Key:{
            username
        },
        UpdateExpression: 'set #n = :value',
        ExpressionAttributeNames:{
            '#n': 'role'
        },
        ExpressionAttributeValues:{
            ':value': role
        }
    }
    return docClient.update(params).promise();
}

function addImageToTicket(ticket_id, image ){
    const params = {
        TableName: "foundations_project_1",
        Key:{
            ticket_id
        },
        UpdateExpression: 'set #n = :value',
        ExpressionAttributeNames:{
            '#n': 'image'
        },
        ExpressionAttributeValues:{
            ':value': image
        }
    }
    return docClient.update(params).promise();
}

module.exports = {createAccount,retrieveByUsername, createTicket,
    getAllPendingTickets, updateTicket, getAllUserTickets,
    getAllUserTicketsByCategory, changeUserRole, addImageToTicket };