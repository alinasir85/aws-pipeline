import {Stack, StackProps} from "aws-cdk-lib";
import {CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep} from "aws-cdk-lib/pipelines";
import {Construct} from "constructs";
import {ApiPipelineStage} from "./stage";
import {Topic} from "aws-cdk-lib/aws-sns";
import {LoggingLevel, SlackChannelConfiguration} from "aws-cdk-lib/aws-chatbot";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {DetailType, NotificationRule} from "aws-cdk-lib/aws-codestarnotifications";

export class ApiPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const pipeline = new CodePipeline(this, id, {
      pipelineName: "ApiPipeline",
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.connection("alinasir85/aws-pipeline", "main", {
          connectionArn: "arn:aws:codestar-connections:us-east-1:417916115807:connection/79e35c0d-3af7-4c34-8d97-360384ddf94a"
        }),
        commands: ["npm ci", "npm run build", "npx cdk synth"]
      })
    });
    // Designate Development Stage
    pipeline.addStage(new ApiPipelineStage(this, "development", {
      env: { account: "417916115807", region: "us-east-1" },
    }));
    // Designate Production Stage
    // and create Manager Approval step
    pipeline.addStage(new ApiPipelineStage(this, "production", {
      env: { account: "417916115807", region: "us-east-1" },
    }), {
      pre: [ new ManualApprovalStep("PromoteToProduction")]
    });
    // Build the pipeline
    pipeline.buildPipeline();


    // Add the AWS Slack channel to pipeline to send notifications
    const topic = new Topic(this, "SlackAlertsTopic", {
      topicName: "SlackAlertsTopic",
    });
    const chatbot = new SlackChannelConfiguration(this, "SlackChatbot", {
      slackChannelConfigurationName: "SlackChatbotConfigs",
      slackWorkspaceId: "T05MG082E3W",
      slackChannelId: "C05MAK4R353",
      notificationTopics: [topic],
      loggingLevel: LoggingLevel.INFO,
      logRetention: RetentionDays.ONE_DAY
    });
    const chatbotRules = new NotificationRule(this, "SlackNotifications", {
      detailType: DetailType.BASIC,
      source: pipeline.pipeline,
      events: ["codepipeline-pipeline-pipeline-execution-failed", "codepipeline-pipeline-pipeline-execution-succeeded", "codepipeline-pipeline-manual-approval-needed"],
      targets: [chatbot]
    });
  }
}
