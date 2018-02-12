// Solidfish LAMBDA for Habit App

'use strict';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    if (event.httpMethod !== null && event.httpMethod !== undefined) {
        if (String(event.httpMethod) == 'POST') {
            var action = 'tempted';
            if (event.body !== null && event.body !== undefined) {
                action = event.body;
            }
            addRecord(action).then(() => {
                var response = {
                    statusCode: 200,
                    headers: {
                        "status" : "success"
                    },
                    body: 'Added Record with action: ' + action
                };
                callback(null, response);
            }).catch((error) => {
                callback(null, 'ERROR: Unable to add record to database. ' + error.message);
            });
        } else {
            getRecords().then((records) => {
                var response = {
                    statusCode: 200,
                    headers: {
                        "status" : "success"
                    },
                    body: JSON.stringify(records)
                };
                callback(null, response);
            }).catch((error) => {
                callback(null, 'ERROR: Unable to get records from database. ' + error.message);
            });
        }
    } else {
        callback(null, 'ERROR: Unable to determine HTTP Method. Invalid lambda function call.');
    }
};

function addRecord(action) {
    var date = new Date();
    var utcDate = new Date(date.toUTCString());
    utcDate.setHours(utcDate.getHours()-8);
    var pst = new Date(utcDate);
    return ddb.put({
        TableName: 'Habit',
        Item: {
            DateTime: pst.toISOString(),
            Date: dateToYMD(pst),
            Action: action
        },
    }).promise();
}

function getRecords() {
    return ddb.scan({
        TableName: 'Habit'
    }).promise();
}

function dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return '' + y + (m<=9 ? '0' + m : m) + (d <= 9 ? '0' + d : d);
}