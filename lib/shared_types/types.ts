export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface SuccessMessageResponse {
  success: true;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}
