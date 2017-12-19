const sourceOutput = 'SourceArtifact';
const pipelineRole = 'arn:aws:iam::644500628210:role/AWS-CodePipeline-Service';
const artifactLocationS3 = 'social-event-build';
const pipelineNamePrefix = 'Social-event-pipeline-';

export function getPipeline(oAuthToken, branch) {
    return {
        pipeline: {
            roleArn: pipelineRole,
            stages: [
                sourceStage(oAuthToken, branch),
                buildStage(),
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
            {
                inputArtifacts: [
                    {
                        name: sourceOutput
                    }
                ],
                name: "Build js",
                actionTypeId: {
                    category: "Deploy",
                    owner: "AWS",
                    version: "1",
                    provider: "CodeDeploy"
                },
                outputArtifacts: [],
                configuration: {
                    ApplicationName: "CodePipelineDemoApplication",
                    DeploymentGroupName: "CodePipelineDemoFleet"
                },
                runOrder: 1
            }
        ]
    }
}