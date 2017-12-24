const sourceOutput = 'SourceArtifact';
const npmBuildOutput = 'npm-build-output';
const mavenBuildOutput = 'maven-build-output';
const pipelineRole = 'arn:aws:iam::644500628210:role/AWS-CodePipeline-Service';
const artifactLocationS3 = 'social-event-build';
const pipelineNamePrefix = 'social-event-pipeline-';

function getJsonPipeline(oAuthToken, branch) {
    return {
        pipeline: {
            roleArn: pipelineRole,
            stages: [
                sourceStage(oAuthToken, branch),
                buildStage(),
                deployStage(branch),
            ],
            artifactStore: {
                type: "S3",
                location: artifactLocationS3
            },
            name: pipelineNamePrefix + branch,
            version: 1
        }
    }
}

function sourceStage(oAuthToken, branch) {
    return {
        name: "Source",
        actions: [
            {
                name: 'ApplicationSource',
                actionTypeId:
                    {
                        category: 'Source',
                        owner: 'ThirdParty',
                        provider: 'GitHub',
                        version: '1'
                    },
                runOrder: 1,
                configuration:
                    {
                        Branch: branch,
                        OAuthToken: oAuthToken,
                        Owner: 'fabianschmauder',
                        PollForSourceChanges: 'true',
                        Repo: 'social-event'
                    },
                outputArtifacts: [{name: sourceOutput}],
                inputArtifacts: []
            }
        ]
    }
}

function buildStage() {
    return {
        name: "Build",
        actions: [
            buildNpm(),
            buildMaven()
        ]
    };
}

function buildNpm(){
    return {
        inputArtifacts: [
            {
                name: sourceOutput
            }
        ],
        name: "npm",
        actionTypeId: {
            category: "Build",
            owner: "AWS",
            version: "1",
            provider: "CodeBuild"
        },
        outputArtifacts: [{
            name: npmBuildOutput
        }],
        configuration: {
            ProjectName: "social-event-npm"
        },
        runOrder: 1
    };
}

function buildMaven(){
    return {
        inputArtifacts: [
            {
                name: sourceOutput
            }
        ],
        name: "maven",
        actionTypeId: {
            category: "Build",
            owner: "AWS",
            version: "1",
            provider: "CodeBuild"
        },
        outputArtifacts: [{
            name: mavenBuildOutput
        }],
        configuration: {
            ProjectName: "run-buildspec-base"
        },
        runOrder: 1
    };
}


function deployStage(branch) {
    return  {
        name: "Deploy",
        actions: [
            {
                name: "createUpdateStack",
                "actionTypeId": {
                    category: "Deploy",
                    owner: "AWS",
                    provider: "CloudFormation",
                    version: "1"
                },
                runOrder: 1,
                configuration: {
                    ActionMode: "CREATE_UPDATE",
                    RoleArn:"arn:aws:iam::644500628210:role/CodeStarWorker-social-event-CloudFormation",
                    StackName: "social-event-stack-"+branch,
                    TemplatePath: npmBuildOutput+"::template-export.json"
                },
                outputArtifacts: [],
                inputArtifacts: [
                    {
                        name: npmBuildOutput
                    }
                ]
            }
        ]
    }
}

module.exports =  getJsonPipeline;