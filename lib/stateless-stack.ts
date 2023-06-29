import { Stack, StackProps } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from 'constructs';
import * as path from 'path';

export class ApiStatelessStack extends Stack {
    constructor(scope: Construct, id: string, stageName: string, props?: StackProps) {
        super(scope, id, props);
        
        new NodejsFunction(this, 'TestLambda', {
            memorySize: 1024,
            runtime: Runtime.NODEJS_16_X,
            handler: "index.handler",
            entry: path.join(__dirname, 'lambda/TestLambda'),
            bundling: {
                minify: true,
                externalModules: ['aws-sdk'],
            },
            environment: { 'STAGE': stageName }
        })
    }
}