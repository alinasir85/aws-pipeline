interface TestLambdaResponse {
    body: string,
    statusCode: number
}

export async function handler(): Promise<TestLambdaResponse> {
  return {
    body: `Hello from ${process.env.ENVIRONMENT}`,
    statusCode: 200
  };
}