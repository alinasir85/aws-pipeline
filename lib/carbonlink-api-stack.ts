import * as cdk from 'aws-cdk-lib';
import { ShellStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CarbonlinkApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new CodePipeline(this, 'Pipeline', {
      pipelineName: 'TestPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection('evangabe/carbonlink-api', 'master', {
          connectionArn: 'arn:aws:codestar:us-east-1:417916115807:project/api-testproject'
        }),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    })
  }
}
