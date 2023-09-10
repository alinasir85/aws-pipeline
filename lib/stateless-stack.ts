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
    console.log("stageName: ",stageName);
    const envFilePath = `./.env.${stageName}`;
    if (fs.existsSync(envFilePath)) {
      require('dotenv').config({ path: envFilePath });
      console.log("envFilePath: ",envFilePath)
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
        ENVIRONMENTS: process.env.ENVIRONMENTS || '',
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
