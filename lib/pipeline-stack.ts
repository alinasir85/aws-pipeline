import { Stack, StackProps }from "aws-cdk-lib";
import { ShellStep, CodePipeline, CodePipelineSource, ManualApprovalStep } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { ApiPipelineStage } from "./stage";

export class ApiPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, id, {
            pipelineName: "ApiPipeline",
            synth: new ShellStep("Synth", {
                input: CodePipelineSource.connection("evangabe/carbonlink-api", "master", {
                    connectionArn: "arn:aws:codestar-connections:us-east-1:417916115807:connection/31f8df03-57d5-48c8-8f6c-16179288a19a"
                }),
                commands: ["npm ci", "npm run build", "npx cdk synth"]
            })
        });

        // Designate Development Stage
        pipeline.addStage(new ApiPipelineStage(this, "development", {
            env: { account: "417916115807", region: "us-east-1" }
        }));

        
        // Designate Production Stage
        // and create Manager Approval step
        pipeline.addStage(new ApiPipelineStage(this, "production", {
            env: { account: "417916115807", region: "us-east-1" }
        }), {
            pre: [ new ManualApprovalStep("PromoteToProduction")]
        });

    }
}
