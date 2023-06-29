import { Stack, StackProps } from "aws-cdk-lib";
import { IdentitySource, LambdaIntegration, RequestAuthorizer, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

const NODE16 = Runtime.NODEJS_16_X;

export class ApiStatelessStack extends Stack {
    constructor(scope: Construct, id: string, stageName: string, props?: StackProps) {
        super(scope, id, props);

        /**
         * * API GATEWAY + AUTHORIZATION
         */

        // Instantiate API Gateway construct
        const api = new RestApi(this, "CarbonlinkTestApi", {
            restApiName: "Carbonlink Test API",
            description: "Test API for Carbonlink",
            deployOptions: {
                stageName: stageName,
            },
        });
        
        // Generate a Request-based Lambda Authorizer
        const authorizerFn = new NodejsFunction(this, "AuthorizerFunction", {
            runtime: NODE16,
            handler: "handler",
            entry: path.join(__dirname, "lambda/AuthorizerFunction.ts"),
        });

        const authorizer = new RequestAuthorizer(this, "ApiAuthorizer", {
            handler: authorizerFn,
            identitySources: [IdentitySource.header("Authorization")],
        });

        /**
         * * LAMBDA
         */
        const testLambda = new NodejsFunction(this, "TestLambda", {
            memorySize: 1024,
            runtime: NODE16,
            handler: "handler",
            entry: path.join(__dirname, "lambda/TestLambda.ts"),
            bundling: {
                minify: true,
                externalModules: ["aws-sdk"],
            },
            environment: { "STAGE": stageName }
        });
        api.root.addMethod("GET", new LambdaIntegration(testLambda), {authorizer});

    }
}