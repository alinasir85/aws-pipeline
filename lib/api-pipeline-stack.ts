import * as cdk from 'aws-cdk-lib';
import { ShellStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ApiPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'ApiPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection('evangabe/carbonlink-api', 'master', {
          connectionArn: 'arn:aws:codestar-connections:us-east-1:417916115807:connection/31f8df03-57d5-48c8-8f6c-16179288a19a'
        }),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    })

    // Designate Development Stage

    // Create Manager Approval step

    // Designate Production Stage

  }
}
