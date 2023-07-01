import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiStatelessStack } from "./stateless-stack";
import { ApiStatefulStack } from "./stateful-stack";

interface ApiPipelineStageProps extends StageProps {
  chatbotArn: string;
}

export class ApiPipelineStage extends Stage {
  constructor(scope: Construct, stageName: string, props: StageProps) {
    super(scope, stageName, props);

    const stateful = new ApiStatefulStack(this, "StatefulStack", stageName);
    const stateless = new ApiStatelessStack(this, "StatelessStack", {stageName, table: stateful.coreTable});
  }
}