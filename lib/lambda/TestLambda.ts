interface TestLambdaResponse {
    body: string,
    statusCode: number
}

export async function handler(): Promise<TestLambdaResponse> {
    
  return {
    body: "Hello from a Lambda Function",
    statusCode: 200
  };
}