const AWS = require('aws-sdk');
// set  you aws region
AWS.config.update({
    region: 'us-west-2'
});
const docClient = new AWS.DynamoDB.DocumentClient();



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
    description, ticket_status = "pending", category="none" ){
 
    const params = {
        TableName: 'tickets',
        Item: {
            ticket_id,
            username,
            amount,
            description,
            ticket_status,
            category
        },
        ReturnValues: "ALL_OLD"
    }
    return docClient.put(params).promise();
}


//line 67 may be a problem  combine with AND
function updateTicket(ticket_id, ticket_status){
    const params = {
        TableName: 'tickets',
        Key: {
            ticket_id
        },
        UpdateExpression: 'set #n = :value',
        ConditionExpression: "attribute_exists(ticket_id)",
        ConditionExpression: "contains (#i, :p)",
        ExpressionAttributeNames:{
            '#n': 'ticket_status',
            "#i": 'ticket_status'
        },
        ExpressionAttributeValues:{
            ':value': ticket_status,
            ':p': 'pending'
        },
        ReturnValues: "ALL_NEW"
    }
    return docClient.update(params).promise();
}


//setup Global secondary index to increase scan speed 
//using same partition key  but different sort key on the field status
function getAllPendingTickets(){
    const params = {
        TableName: "tickets",
        IndexName:"ticket_status-index",
        KeyConditionExpression: '#c = :value',
        ExpressionAttributeNames: {
            '#c': 'ticket_status'
        },
        ExpressionAttributeValues:{
            ':value': 'pending'
        }
    }

    return docClient.query(params).promise();
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

function getAllUserTicketsByCategory(category, username){
    const params = {
        TableName: "tickets",
        FilterExpression: '#c = :value AND #u = :name',
        
        ExpressionAttributeNames: {
            "#c": 'category',
            "#u": 'username'
        },
        ExpressionAttributeValues: {
            ':value' : category,
            ':name' : username
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
        ConditionExpression: "attribute_exists(username)",
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

/* function editAccount(username){
    const params = {
        TableName: 'foundations_project_1',
        Key: {
            username
        },
        UpdateExpression: 'set #n = :value',
        ConditionExpression: "attribute_exists(username)",
        ConditionExpression: "contains (#i, :p)",
        ExpressionAttributeNames:{
            '#n': 'ticket_status',
            "#i": 'ticket_status'
        },
        ExpressionAttributeValues:{
            ':value': ticket_status,
            ':p': 'pending'
        },
        ReturnValues: "ALL_NEW"
    }
    return docClient.update(params).promise();
}
 */

module.exports = {createAccount,retrieveByUsername, createTicket,
    getAllPendingTickets, updateTicket, getAllUserTickets,
    getAllUserTicketsByCategory, changeUserRole, addImageToTicket };