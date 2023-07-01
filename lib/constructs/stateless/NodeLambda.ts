import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

interface NodeLambdaProps {
    entry: string;
    environment?: { [key: string]: string };
    externalModules?: string[];
}

export class NodeLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: NodeLambdaProps) {
    super(scope, id, {
      memorySize: 1024,
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: props.entry,
      bundling: { minify: true, externalModules: props.externalModules ?? [] },
      environment: props.environment
    });
  }
}