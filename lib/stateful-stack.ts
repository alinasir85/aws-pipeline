import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { OneTable } from "./constructs/stateful/OneTable";

export class ApiStatefulStack extends Stack {
    public readonly coreTable: OneTable;
    constructor(scope: Construct, id: string, stageName: string, props?: StackProps) {
        super(scope, id, props);
        
        // Implementing single-table design with a Core Table
        this.coreTable = new OneTable(this, "CoreTable");
    }
}