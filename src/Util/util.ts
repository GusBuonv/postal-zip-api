export function logOpInvocation(opName: string): void {
  if (process.env.DEBUG) {
    console.log(`Operation "${opName}" invoked`);
  }
}

export function logInvalidRequestRouting(opName: string, details?: string): void {
  console.error(`Invalid request routed to operation "${opName}"`);
  if (details) {
    console.error(details);
  }
}

export function formatZipCode(zip: number): string {
  const result = String(100000 + zip);
  return result.slice(1);
}

export function isZipCodeValid(zip: string): boolean {
  return zip.length === 5 && !/[^0-9]/.test(zip);
}
