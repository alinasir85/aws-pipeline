import {Stack, StackProps} from "aws-cdk-lib";
import {CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep} from "aws-cdk-lib/pipelines";
import {Construct} from "constructs";
import {ApiPipelineStage} from "./stage";
import {DetailType, NotificationRule} from "aws-cdk-lib/aws-codestarnotifications";

interface ExtendedStackProps extends StackProps {
    branchName: string;
    stage: string;
}

export class ApiPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props: ExtendedStackProps) {
        super(scope, id, props);
        const pipeline = new CodePipeline(this, id, {
            pipelineName: `${props.stage}-Pipeline`,
            synth: new ShellStep("Synth", {
                input: CodePipelineSource.connection("alinasir85/aws-pipeline", props.branchName, {
                    connectionArn: "arn:aws:codestar-connections:us-east-1:417916115807:connection/79e35c0d-3af7-4c34-8d97-360384ddf94a"
                }),
                commands: ["npm ci", "npm run build", "npx cdk synth"]
            })
        });
        if (props.stage === 'dev') {
            pipeline.addStage(new ApiPipelineStage(this, "dev", {
                env: {account: "417916115807", region: "us-east-1"},
            }));
        } else if (props.stage === 'prod') {
            pipeline.addStage(new ApiPipelineStage(this, "prod", {
                env: {account: "417916115807", region: "us-east-1"},
            }), {
                pre: [new ManualApprovalStep("PromoteToProduction")]
            });
        }
        pipeline.buildPipeline();

/*        const chatbotRules = new NotificationRule(this, `${props.stage}-SlackNotifications`, {
            detailType: DetailType.BASIC,
            source: pipeline.pipeline,
            events: ["codepipeline-pipeline-pipeline-execution-failed", "codepipeline-pipeline-pipeline-execution-succeeded", "codepipeline-pipeline-manual-approval-needed"],
            targets: [props.chatbot]
        });*/
    }
}
