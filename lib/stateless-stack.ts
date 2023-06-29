import { Stack, StackProps } from "aws-cdk-lib";
import { Runtime, Function, Code } from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';
import * as path from 'path';

export class ApiStatelessStack extends Stack {
    constructor(scope: Construct, id: string, stageName: string, props?: StackProps) {
        super(scope, id, props);
        
        new Function(this, 'TestLambda', {
            runtime: Runtime.NODEJS_16_X,
            handler: "handler",
            code: Code.fromAsset(path.join(__dirname, 'lambdas/test-lambda')),
            environment: { 'stageName': stageName }
        })
    }
}