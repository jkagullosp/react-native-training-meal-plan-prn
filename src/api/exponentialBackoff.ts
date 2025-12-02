export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  initialDelay = 1000,
): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxRetries) {
    try {
      return await fn(); // Attempt the function
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        // Stop after max retries and rethrow the error
        throw error;
      }

      const jitter = Math.random() * 100; // Add random jitter to avoid synchronized retries
      console.warn(`Retrying in ${delay + jitter}ms (Attempt ${attempt})...`);
      // Fix: Ensure resolve is called without arguments
      await new Promise<void>(resolve => setTimeout(resolve, delay + jitter)); // Wait before retrying
      delay *= 2; // Double the delay for exponential backoff
    }
  }

  // This return is unreachable but satisfies TypeScript's strict checks
  throw new Error('Exponential backoff failed unexpectedly');
}
