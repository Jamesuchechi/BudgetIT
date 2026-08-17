export function reportError(error: unknown, metadata?: Record<string, unknown>): void {
  console.error("Error reported:", error, metadata);
}
