import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {ApiPipelineStack} from "./pipeline-stack";
import {Topic} from "aws-cdk-lib/aws-sns";
import {LoggingLevel, SlackChannelConfiguration} from "aws-cdk-lib/aws-chatbot";
import {RetentionDays} from "aws-cdk-lib/aws-logs";

export class ApiStatefulStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
/*    const topic = new Topic(this, `ChatbotTopic`, {
      topicName: `SlackTopic`,
    });
    const chatbot = new SlackChannelConfiguration(this, `SlackChatbot`, {
      slackChannelConfigurationName: `SlackChannelConfigs`,
      slackWorkspaceId: "T05MG082E3W",
      slackChannelId: "C05MAK4R353",
      notificationTopics: [topic],
      loggingLevel: LoggingLevel.INFO,
      logRetention: RetentionDays.ONE_DAY
    });*/

    const devPipeline = new ApiPipelineStack(scope, "devPipeline", {
      env: { account: "417916115807", region: "us-east-1" },
      branchName: 'develop',
      stage: 'dev'
    });

    const prodPipeline = new ApiPipelineStack(scope, "prodPipeline", {
      env: { account: "417916115807", region: "us-east-1" },
      branchName: 'main',
      stage: 'prod'
    });
  }
  
}