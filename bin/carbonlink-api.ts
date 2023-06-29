#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { ApiPipelineStack } from '../lib/pipeline-stack';

const app = new App();
new ApiPipelineStack(app, 'EvansTestApiStack', {
  env: { account: '417916115807', region: 'us-east-1' },
});

app.synth();