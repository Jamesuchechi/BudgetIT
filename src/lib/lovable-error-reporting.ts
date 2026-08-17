export function reportLovableError(error: unknown, metadata?: Record<string, unknown>): void {
  console.error("Lovable error reported:", error, metadata);
}
