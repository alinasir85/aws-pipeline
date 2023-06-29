import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from 'constructs';

export class ApiStatefulStack extends Stack {
    constructor(scope: Construct, id: string, stageName: string, props?: StackProps) {
        super(scope, id, props);
        
        // Create core DynamoDB table view to support 1:1 and 1:n mappings.
        const coreTable = new Table(this, 'CoreTable', {
            partitionKey: {
                name: 'PK',
                type: AttributeType.STRING
            },
            sortKey: {
                name: 'SK',
                type: AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY
        });

        // Add first GSI to support GSI overloading.
        coreTable.addGlobalSecondaryIndex({
            indexName: 'GSI-1',
            partitionKey: {
                name: 'SK',
                type: AttributeType.STRING
            },
            sortKey: {
                name: 'GSI-1-SK',
                type: AttributeType.STRING
            }
        })

        // Add second GSI to support write sharding.
        coreTable.addGlobalSecondaryIndex({
            indexName: 'GSI-2',
            partitionKey: {
                name: 'GSI-2-PK',
                type: AttributeType.STRING
            },
            sortKey: {
                name: 'SK',
                type: AttributeType.STRING
            }
        })
    }
}