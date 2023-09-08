import {Stack, StackProps} from "aws-cdk-lib";
import {LambdaIntegration, MethodLoggingLevel, RestApi,} from "aws-cdk-lib/aws-apigateway";
import {Construct} from "constructs";
import {NodeLambda} from "./constructs/stateless/NodeLambda";
import * as path from "path";

interface StatelessStackProps extends StackProps {
  stageName: string;
}

export class ApiStatelessStack extends Stack {
  constructor(scope: Construct, id: string, props: StatelessStackProps) {
    super(scope, id, props);
    const { stageName } = props;
    const api = new RestApi(this, "Pipeline", {
      restApiName: "Pipeline",
      description: "Pipeline",
      deployOptions: { stageName, loggingLevel: MethodLoggingLevel.INFO },
    });
    const testLambda = new NodeLambda(this, "TestLambda", {
      entry: path.join(__dirname, "lambda/TestLambda.ts"),
    });
    api.root.addMethod("GET", new LambdaIntegration(testLambda));
  }
}
