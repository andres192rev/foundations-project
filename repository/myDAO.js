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





module.exports = {createAccount,retrieveByUsername};