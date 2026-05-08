export type PaginatedParams = {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
};

export type PaginatedResponse<T = Record<string, unknown>> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
