'use strict';

const pipelineJson = require('./pipeline.js');
const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
    const commitInfo = getCommitInfo(event);

    switch (determineAction(commitInfo)){
        case 'BRANCH_CREATED':
            createPipeline(determineBranch(commitInfo),callback);
            break;
        case 'BRANCH_DELETED':
            deletePipeline(determineBranch(commitInfo));
            break;
        default:
            callback(null, "nothing to do!")
    }

};

function getCommitInfo(event) {
    if(event.createTest){
        return {
            ref:"testbranch",
            created:true
        };
    }
    return JSON.parse(event.Records[0].Sns.Message);
}

function determineAction(commitInfo) {
    if(commitInfo.created)
        return 'BRANCH_CREATED';
    if(commitInfo.deleted)
        return 'BRANCH_DELETED';
    return 'COMMIT_TO_BRANCH';
}

function determineBranch(commitInfo) {
    return commitInfo.ref.replace('refs/heads/', '');
}

function createPipeline(branch,callback) {
    console.log('create pipeline for branch '+branch);
    const codepipeline = new AWS.CodePipeline();
    const params = pipelineJson(process.env.O_AUTH_TOKEN,branch);

    codepipeline.createPipeline(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
        callback(err,data);
    });
}

function deletePipeline(branch) {
    //TODO delete pipeline
}
