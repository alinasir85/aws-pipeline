#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CarbonlinkApiStack } from '../lib/carbonlink-api-stack';

const app = new cdk.App();
new CarbonlinkApiStack(app, 'EvansTestApiStack', {
  env: { account: '417916115807', region: 'us-east-1' },
});

app.synth();