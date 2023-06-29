import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiStatelessStack } from "./stateless-stack";
import { ApiStatefulStack } from "./stateful-stack";

export class ApiPipelineStage extends Stage {
    constructor(scope: Construct, stageName: string, props?: StageProps) {
        super(scope, stageName, props);

        new ApiStatelessStack(this, "StatelessStack", stageName);
        new ApiStatefulStack(this, "StatefulStack", stageName);
    }
}