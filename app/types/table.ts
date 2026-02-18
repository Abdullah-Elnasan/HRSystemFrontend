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


export type TableActionItem = {
  enabled?: boolean;
  label?: string;
  icon?: string;
};

export type TableActionsDisplayMode = 'auto' | 'dropdown' | 'inline';

export type TableActionsConfig = {
  copy?: boolean | TableActionItem;
  view?: boolean | TableActionItem;
  edit?: boolean | TableActionItem;
  delete?: boolean | TableActionItem;
  displayMode?: TableActionsDisplayMode; // ← جديد
};


export type apiResponse<T> = {
  success: boolean
  messageAr: string
  messageEn: string
  data: T
  pagination: PaginationMeta
}
