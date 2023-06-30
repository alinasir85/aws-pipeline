import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { IdentitySource, LambdaIntegration, MethodLoggingLevel, RequestAuthorizer, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { NodeLambda } from "./constructs/stateless/NodeLambda";
import * as path from "path";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";


interface StatelessStackProps extends StackProps{
    table: Table;
    stageName: string;
}

export class ApiStatelessStack extends Stack {
    constructor(scope: Construct, id: string, props: StatelessStackProps) {
        super(scope, id, props);

        const { table, stageName } = props;

        /**
         * * API GATEWAY + AUTHORIZATION
         */

        // ? Instantiate API Gateway construct
        const api = new RestApi(this, "CarbonlinkTestApi", {
            restApiName: "Carbonlink Test API",
            description: "Test API for Carbonlink",
            deployOptions: { stageName, loggingLevel: MethodLoggingLevel.INFO },
            cloudWatchRole: true
        });
        
        // ? Generate a Request-based Lambda Authorizer
        const authorizerFn = new NodeLambda(this, "AuthorizerLambda", {
            entry: path.join(__dirname, "lambda/Authorizer.ts"),
            environment: { TABLE_NAME: table.tableName }
        });
        const authorizer = new RequestAuthorizer(this, "ApiRequestAuthorizer", {
            handler: authorizerFn,
            identitySources: [IdentitySource.header("Authorization")],
        });

        /**
         * * LAMBDA INTEGRATIONS
         */

        // ? Test Lambda
        const testLambda = new NodeLambda(this, "TestLambda", { entry: path.join(__dirname, "lambda/TestLambda.ts") });
        api.root.addMethod("GET", new LambdaIntegration(testLambda), {authorizer, apiKeyRequired: true});

        // ? Poll Asset Prices Lambda
        const pollAssetPricesLambda = new NodeLambda(this, "PollAssetPrices", { 
            entry: path.join(__dirname, "lambda/PollAssetPrices.ts"),
            environment: { TABLE_NAME: table.tableName }
        });
        
        /**
         * * GRANTS
        */

        // Read Grants
        table.grantReadData(authorizerFn);

        // Write Grants
        table.grantWriteData(pollAssetPricesLambda);

        // ReadWrite Grants

        /**
         * * CRONS
        */
        const pollSchedule = new Rule(this, "PollSchedule", {
            schedule: Schedule.rate(Duration.minutes(10))
        });
        pollSchedule.addTarget(new LambdaFunction(pollAssetPricesLambda));
    }
}