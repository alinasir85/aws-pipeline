interface TestLambdaResponse {
    body: string,
    statusCode: number
}

export async function handler(): Promise<TestLambdaResponse> {
  return {
    body: `Hello froms ${process.env.ENVIRONMENTS}...`,
    statusCode: 200
  };
}