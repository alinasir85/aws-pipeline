import {Stack, StackProps} from "aws-cdk-lib";
import {Deployment, LambdaIntegration, MethodLoggingLevel, RestApi, Stage,} from "aws-cdk-lib/aws-apigateway";
import {Construct} from "constructs";
import {NodeLambda} from "./constructs/stateless/NodeLambda";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from 'dotenv';

interface StatelessStackProps extends StackProps {
  stageName: string;
}

export class ApiStatelessStack extends Stack {
  constructor(scope: Construct, id: string, props: StatelessStackProps) {
    super(scope, id, props);
    let { stageName } = props;
    console.log("stageName:  ",stageName);
    const envFilePath = `./.env.${stageName}`;
    if (fs.existsSync(envFilePath)) {
      dotenv.config({ path: envFilePath, override: true });
      console.log("envFilePath: ",envFilePath)
    } else {
      throw new Error(`Environment file ${envFilePath} not found.`);
    }
    console.log("process.env.ENVIRONMENTS: ",process.env.ENVIRONMENTS)
    const api = new RestApi(this, `${stageName}-Pipeline`, {
      restApiName: `${stageName}-pipeline`,
      description: `${stageName}-pipeline`,
      deployOptions: { stageName, loggingLevel: MethodLoggingLevel.INFO },
    });
    const testLambda = new NodeLambda(this, `${stageName}-TestLambda`, {
      entry: path.join(__dirname, "lambda/TestLambda.ts"),
      environment: {
        ENVIRONMENTS: process.env.ENVIRONMENTS || '',
      },
    });
    api.root.addMethod("GET", new LambdaIntegration(testLambda));
  }
}
