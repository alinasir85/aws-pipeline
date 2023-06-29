import { APIGatewayAuthorizerResult, APIGatewayAuthorizerResultContext, APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB Document client
const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const dbDoc = DynamoDBDocument.from(client);

export async function handler(event: APIGatewayRequestAuthorizerEvent) {
    // Get Authorization header
    const authHeader = event.headers?.["Authorization"];
    if (!authHeader) return generatePolicy("test", "Deny", event.methodArn);

    // Query database for user
    const user = await dbDoc.query({
        TableName: process.env.TABLE_NAME,
        IndexName: "GSI-1",
        KeyConditionExpression: "SK = :sk",
        ExpressionAttributeValues: {
            ":sk": authHeader.split("Basic ")[1]
        }
    });
    if (!user.Items || !user.Count) {
        console.log("Unauthorized, user does not exist in database.");
        return generatePolicy("test", "Deny", event.methodArn);
    } else if (user.Count > 1) {
        console.log("Unauthorized, user exists in database but is not unique.");
        return generatePolicy("test", "Deny", event.methodArn);
    }
    console.log("----- AUTHORIZER QUERY -----");
    console.log("User: ", user.Items, null, 2);
    
    const context = user.Items[0];
    const principalId = "user|" + context.PK;
    console.log("----- AUTHORIZER RESPONSE -----");
    console.log("Context: ", context, null, 2);
    console.log("Principal ID: ", principalId, null, 2);

    return generatePolicy(principalId, "Allow", event.methodArn, context);
}

const generatePolicy = (principalId: string, effect: string, resource: string, context?: APIGatewayAuthorizerResultContext): APIGatewayAuthorizerResult => {
    return {
        principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [{
                Action: "execute-api:Invoke",
                Effect: effect,
                Resource: resource,
            }]
        },
        context,
    };
};