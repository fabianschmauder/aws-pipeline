'use strict';
import {getPipeline} from "./pipeline";

console.log('Start function');

const AWS = require('aws-sdk');
const oAuthToken = process.env.OAuthTOken;

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    const message = event.Records[0].Sns.Message;
    console.log('From SNS:', message);
    const commitInfo = JSON.parse(message);
    console.log('From SNS ref:', commitInfo.ref.replace('refs/heads/', ''));


    if(commitInfo.created) {

        const codepipeline = new AWS.CodePipeline();
        const params = getPipeline(commitInfo.ref.replace('refs/heads/', ''),oAuthToken);

        codepipeline.createPipeline(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        });
        //TODO create stack

    }
    if(commitInfo.deleted){


        //TODO delete pipeline and stack
    }


    callback(null, message);
};
