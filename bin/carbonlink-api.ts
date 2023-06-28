#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiPipelineStack } from '../lib/api-pipeline-stack';

const app = new cdk.App();
new ApiPipelineStack(app, 'EvansTestApiStack', {
  env: { account: '417916115807', region: 'us-east-1' },
});

app.synth();