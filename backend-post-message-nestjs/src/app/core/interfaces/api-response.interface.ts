export interface ApiSuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
  path?: string;
  error?: string | object;
  errors?: unknown;
}

export type ApiResponseShape<T = unknown> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;
