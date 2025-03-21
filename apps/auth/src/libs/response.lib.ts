export interface ErrorResponse {
  code: string;
  message: string;
  details: Record<string, string>;
}

export function createGRPCErrorResponse(
  code: string,
  message: string,
  details?: Record<string, string>,
): ErrorResponse {
  return {
    code,
    message,
    details: details || {},
  };
}
