interface AuthorizerFnResponse {
    principalId: string;
    policyDocument: {
        Version: string;
        Statement: {
            Action: string;
            Effect: string;
            Resource: string;
        }[];
    };
    context?: {
        id: string;
    }
}

const effects = ["Deny", "Allow"];

export async function handler(event: {[key: string]: string | number}, context: {[key: string]: string | number}): Promise<AuthorizerFnResponse> {
    const token = event.authorizationToken;

    console.log("----- AUTHORIZER EVENT -----");
    console.log(event, null, 2);
    console.log("----- AUTHORIZER CONTEXT -----");
    console.log(context, null, 2);


    return generatePolicy("test", effects[+(token == "allow")], event.methodArn as string);
}

const generatePolicy = (principalId: string, effect: string, resource: string): AuthorizerFnResponse => {
    const isValid = effect && resource;
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
        context: isValid ? {
            id: "PeterPan123"
        } : undefined
    };
};