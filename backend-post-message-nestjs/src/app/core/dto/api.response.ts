export interface ApiResponseData<T> {
  statusCode: number;
  data: T;
  message?: string;
  timestamp: string;
  path?: string;
  success: boolean;
  error?: string | object;
}

export class ApiResponse {
  static success<T>(
    data: T,
    message?: string,
    statusCode: number = 200,
  ): ApiResponseData<T> {
    return {
      statusCode,
      data,
      message: message ?? 'Success',
      timestamp: new Date().toISOString(),
      success: true,
    };
  }

  static error(
    message: string,
    error?: string | object,
    statusCode: number = 400,
  ): ApiResponseData<null> {
    return {
      statusCode,
      data: null,
      message,
      ...(error !== undefined && { error }),
      timestamp: new Date().toISOString(),
      success: false,
    };
  }
}
