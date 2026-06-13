export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  status: number;
}

export type ApiResponseShape<T = unknown> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;
