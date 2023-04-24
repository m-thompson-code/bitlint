export function getErrorMessage(error: unknown): string {
  if (error == null) {
    return '';
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && 'message' in error) {
    return getErrorMessage(error.message);
  }

  return `${error}`;
}
