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


function createAccount(uuid, username , password, is_admin){

    const params = {
        TableName: 'foundations_project1',
        Item: {
            uuid,
            username,
            password,
            is_admin
        }
    }

    return docClient.put(params).promise();
};


function login(username, password){
    const params = {
        TableName: 'foundations_project1',
        key:{
            uuid
        }
    }
    return docClient.get(params).promise();
}






module.exports = {createAccount, login};