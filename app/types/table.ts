// types/table.ts
export type StatusConfig = {
  label: string
  color: 'success' | 'warning' | 'error' | 'neutral' | string
}


export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};


