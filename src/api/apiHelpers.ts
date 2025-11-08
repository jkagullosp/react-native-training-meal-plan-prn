export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown, context: string): ApiError {
  if (error instanceof ApiError) return error;

  const message = error instanceof Error ? error.message : String(error);
  console.error(`[API Error - ${context}]:`, error);

  return new ApiError(`[${context}] ${message}`, undefined, error);
}
