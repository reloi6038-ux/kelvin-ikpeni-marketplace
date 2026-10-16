/**
 * ApiResponse
 * -----------
 * Standard success-response shape used by every endpoint.
 * Format: { success, statusCode, message, data }
 */
export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}