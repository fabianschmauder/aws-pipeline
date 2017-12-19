'use strict';
const AWS = require('aws-sdk');
const codepipeline = new AWS.CodePipeline();

exports.handler = (event, context, callback) => {
    codepipeline.getPipeline({
        name: event.name
    }, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data.pipeline);      // successful response
        callback(err, data.pipeline);
    });
}
