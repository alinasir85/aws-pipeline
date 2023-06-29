export async function handler(event: string, context: string) {
    console.log('Stage Name is: ' + process.env.STAGE);
    return {
        body: 'Hello from a Lambda Function',
        statusCode: 200
    }
}