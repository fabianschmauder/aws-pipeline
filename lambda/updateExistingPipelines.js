'use strict';

const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
    const codepipeline = new AWS.CodePipeline();

    codepipeline.listPipelines({}, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
        callback(err,data);
    });


};
