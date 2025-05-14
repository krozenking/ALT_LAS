/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  /**
   * Column ID
   */
  id: string;
  /**
   * Column header
   */
  header: string;
  /**
   * Column accessor
   */
  accessor?: keyof T | ((row: T) => any);
  /**
   * Column cell renderer
   */
  cell?: (value: any, row: T, index: number) => React.ReactNode;
  /**
   * Column width
   */
  width?: number | string;
  /**
   * Whether the column is sortable
   */
  sortable?: boolean;
  /**
   * Whether the column is filterable
   */
  filterable?: boolean;
  /**
   * Whether the column is resizable
   */
  resizable?: boolean;
  /**
   * Whether the column is hidden
   */
  hidden?: boolean;
  /**
   * Column alignment
   */
  align?: 'left' | 'center' | 'right';
  /**
   * Column data type
   */
  type?: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'time' | 'currency' | 'percent' | 'custom';
}

/**
 * Table sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Table sort
 */
export interface TableSort {
  /**
   * Column ID
   */
  id: string;
  /**
   * Sort direction
   */
  direction: SortDirection;
}

/**
 * Table filter
 */
export interface TableFilter {
  /**
   * Column ID
   */
  id: string;
  /**
   * Filter value
   */
  value: any;
}

/**
 * Table pagination
 */
export interface TablePagination {
  /**
   * Current page
   */
  page: number;
  /**
   * Page size
   */
  pageSize: number;
  /**
   * Total rows
   */
  totalRows: number;
}

/**
 * Table selection
 */
export interface TableSelection<T = any> {
  /**
   * Selected rows
   */
  selectedRows: T[];
  /**
   * Selected row indices
   */
  selectedRowIndices: number[];
  /**
   * Whether all rows are selected
   */
  allRowsSelected: boolean;
}

/**
 * Table state
 */
export interface TableState<T = any> {
  /**
   * Table columns
   */
  columns: TableColumn<T>[];
  /**
   * Table data
   */
  data: T[];
  /**
   * Table sort
   */
  sort: TableSort[];
  /**
   * Table filters
   */
  filters: TableFilter[];
  /**
   * Table pagination
   */
  pagination: TablePagination;
  /**
   * Table selection
   */
  selection: TableSelection<T>;
  /**
   * Table loading state
   */
  loading: boolean;
  /**
   * Table error
   */
  error: Error | null;
}

/**
 * Table action types
 */
export enum TableActionTypes {
  SET_COLUMNS = 'SET_COLUMNS',
  SET_DATA = 'SET_DATA',
  SET_SORT = 'SET_SORT',
  SET_FILTERS = 'SET_FILTERS',
  SET_PAGINATION = 'SET_PAGINATION',
  SET_SELECTION = 'SET_SELECTION',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
}

/**
 * Table action
 */
export interface TableAction {
  type: TableActionTypes;
  payload: any;
}
