export async function handler(event: string, context: string) {
    
    return {
        body: 'Hello from a Lambda Function',
        statusCode: 200
    }
}