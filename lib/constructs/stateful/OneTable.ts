import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class OneTable extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const table = new Table(this, id, {
            partitionKey: {
                name: "PK",
                type: AttributeType.STRING
            },
            sortKey: {
                name: "SK",
                type: AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY
        });

        // Add first GSI to support GSI overloading.
        table.addGlobalSecondaryIndex({
            indexName: "GSI-1",
            partitionKey: {
                name: "SK",
                type: AttributeType.STRING
            },
            sortKey: {
                name: "GSI-1-SK",
                type: AttributeType.STRING
            }
        });

        // Add second GSI to support write sharding.
        table.addGlobalSecondaryIndex({
            indexName: "GSI-2",
            partitionKey: {
                name: "GSI-2-PK",
                type: AttributeType.STRING
            },
            sortKey: {
                name: "SK",
                type: AttributeType.STRING
            }
        });
    }
}