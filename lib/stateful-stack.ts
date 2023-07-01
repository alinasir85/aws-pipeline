import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { OneTable } from "./constructs/stateful/OneTable";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { SeedResource } from "./constructs/stateful/SeedResource";

export class ApiStatefulStack extends Stack {
  public readonly coreTable: Table;
  constructor(scope: Construct, id: string, stageName: string, props?: StackProps) {
    super(scope, id, props);
        
    // Implementing single-table design with a Core Table
    this.coreTable = new OneTable(this, "CoreTable").table;

    // Seeding Core Table
    // new SeedResource(this, "SeedResource", {
    //   tableName: this.coreTable.tableName,
    //   tableArn: this.coreTable.tableArn,
    // });
  }
  
}