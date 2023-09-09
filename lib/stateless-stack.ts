import {Stack, StackProps, Stage} from "aws-cdk-lib";
import {LambdaIntegration, MethodLoggingLevel, RestApi,} from "aws-cdk-lib/aws-apigateway";
import {Construct} from "constructs";
import {NodeLambda} from "./constructs/stateless/NodeLambda";
import * as path from "path";
import * as fs from "fs";

interface StatelessStackProps extends StackProps {
  stageName: string;
}

export class ApiStatelessStack extends Stack {
  constructor(scope: Construct, id: string, props: StatelessStackProps) {
    super(scope, id, props);
    const { stageName } = props;

    const envFilePath = `./.env.${stageName}`;
    console.log("envFilePath: ",envFilePath)
    if (fs.existsSync(envFilePath)) {
      require('dotenv').config({ path: envFilePath });
    } else {
      throw new Error(`Environment file ${envFilePath} not found.`);
    }

    const api = new RestApi(this, "Pipeline", {
      restApiName: `${stageName}-pipeline`,
      description: `${stageName}-pipeline`,
      deployOptions: { stageName, loggingLevel: MethodLoggingLevel.INFO },
    });
    const testLambda = new NodeLambda(this, "TestLambda", {
      entry: path.join(__dirname, "lambda/TestLambda.ts"),
      environment: {
        ENVIRONMENT: process.env.ENVIRONMENT || '',
      },
    });
    api.root.addMethod("GET", new LambdaIntegration(testLambda));

    const devStage = new Stage(this, 'DevStage', {
      stageName
    });
    const prodStage = new Stage(this, 'ProdStage', {
      stageName
    });

  }
}
