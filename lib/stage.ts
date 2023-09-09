import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiStatelessStack } from "./stateless-stack";

export class ApiPipelineStage extends Stage {
  constructor(scope: Construct, stageName: string, props: StageProps) {
    super(scope, stageName, props);
    const stateless = new ApiStatelessStack(this, "PipelineStatelessStack", {stageName});
  }
}