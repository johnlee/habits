// Solidfish LAMBDA for Habit App

'use strict';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
    var response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: null
    };

    if (event.httpMethod !== null && event.httpMethod !== undefined) {
        if (String(event.httpMethod) == 'POST') {
            if (event.body !== null && event.body !== undefined) {
                var body = JSON.parse(event.body);
                var action = body.action;
                var comments = " ";
                if (body.comments && body.comments.length > 1) {
                    comments = body.comments;
                }
                var date = body.date || dateToYMD(dateNow());

                switch (action) {
                    case "attempt":
                        addHabit(action, comments, date).then(() => {
                            // Update Summary
                            response.body = "Successfully recorded attempt";
                            getSummary(date).then((record) => {
                                if (Object.keys(record).length != 0) {
                                    var count = parseInt(record.Item.Attempts);
                                    count = count + 1;
                                    updateSummary(record.Item.Date, record.Item.Status, count);
                                } else {
                                    updateSummary(date, " ", 1);A
                                }
                            });
                            callback(null, response);
                        }).catch((error) => {
                            response.body = "ERROR: Unable to add record. " + error.message;
                            callback(null, response);
                        });
                        break;
                    case "fail":
                        response.body = "Successfully recorded fail";
                        getSummary(date).then((record) => {
                            if (Object.keys(record).length != 0) {
                                updateSummary(record.Item.Date, "fail", record.Item.Attempts);
                            } else {
                                updateSummary(date, "fail", 1);
                            }
                            callback(null, response);
                        }).catch((error) => {
                            response.body = "ERROR: Unable to get summary record. " + error.message;
                            callback(null, response);
                        });
                        break;
                    case "success":
                        response.body = "Successfully recorded success";
                        getSummary(date).then((record) => {
                            if (Object.keys(record).length != 0) {
                                updateSummary(record.Item.Date, "success", record.Item.Attempts);
                            } else {
                                updateSummary(date, "success", 0);
                            }
                            callback(null, response);
                        }).catch((error) => {
                            response.body = "ERROR: Unable to get summary record. " + error.message;
                            callback(null, response);
                        });
                        break;
                    default:
                        response.headers = { "status": "failed" };
                        response.body = "ERROR - invalid action type";
                        callback(null, response);
                }
            }
        } else if (String(event.httpMethod) == 'GET') {
            getSummaryAll().then((records) => {
                var habits = records.Items;
                habits.sort(function (a, b) { return b.Date - a.Date; });
                records.Items = habits;
                response.body = JSON.stringify(records);
                callback(null, response);
            }).catch((error) => {
                response.body = "ERROR: Unable to get records from database. " + error.message;
                callback(null, response);
            });
        } else {
            response.body = "ERROR: Unsupported HTTP Method of " + event.httpMethod;
            response.statusCode = 405;
            callback(null, response);
        }
    } else {
        response.body = "ERROR: Unable to determine HTTP Method. Invalid lambda function call.";
        response.statusCode = 500;
        callback(null, response);
    }
};

function addHabit(action, comments, date) {
    var pst = dateNow();
    return ddb.put({
        TableName: 'Habits',
        Item: {
            DateTime: pst.toISOString(),
            Date: parseInt(date),
            Action: action,
            Comments: comments
        },
    }).promise();
}

function updateSummary(date, status, count) {
    return ddb.update({
        TableName: "HabitsSummary",
        Key: { Date: parseInt(date) },
        UpdateExpression: 'set #s = :s, Attempts = :c',
        ExpressionAttributeNames: { '#s': 'Status' },
        ExpressionAttributeValues: {
            ':s': status,
            ':c': count
        }
    }).promise();
}

function getSummary(date) {
    return ddb.get({
        TableName: 'HabitsSummary',
        Key: {
            Date: parseInt(date)
        }
    }).promise();
}

function getSummaryAll() {
    return ddb.scan({
        TableName: 'HabitsSummary'
    }).promise();
}

function dateNow() {
    var date = new Date();
    var utcDate = new Date(date.toUTCString());
    utcDate.setHours(utcDate.getHours() - 8);
    return new Date(utcDate);
}

function dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return '' + y + (m <= 9 ? '0' + m : m) + (d <= 9 ? '0' + d : d);
}