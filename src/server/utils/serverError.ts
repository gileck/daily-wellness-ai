export class ServerError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ServerError';

        // This line is important for ensuring `instanceof ServerError` works correctly
        Object.setPrototypeOf(this, ServerError.prototype);
    }
} 