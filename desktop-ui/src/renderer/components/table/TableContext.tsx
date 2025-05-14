import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TableState, TableAction, TableActionTypes } from './types';

// Initial table state
const initialTableState: TableState = {
  columns: [],
  data: [],
  sort: [],
  filters: [],
  pagination: {
    page: 1,
    pageSize: 10,
    totalRows: 0,
  },
  selection: {
    selectedRows: [],
    selectedRowIndices: [],
    allRowsSelected: false,
  },
  loading: false,
  error: null,
};

// Table reducer
const tableReducer = (state: TableState, action: TableAction): TableState => {
  switch (action.type) {
    case TableActionTypes.SET_COLUMNS:
      return {
        ...state,
        columns: action.payload,
      };
    case TableActionTypes.SET_DATA:
      return {
        ...state,
        data: action.payload,
        pagination: {
          ...state.pagination,
          totalRows: action.payload.length,
        },
      };
    case TableActionTypes.SET_SORT:
      return {
        ...state,
        sort: action.payload,
      };
    case TableActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: action.payload,
      };
    case TableActionTypes.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload,
        },
      };
    case TableActionTypes.SET_SELECTION:
      return {
        ...state,
        selection: {
          ...state.selection,
          ...action.payload,
        },
      };
    case TableActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case TableActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Table context
export interface TableContextType {
  state: TableState;
  dispatch: React.Dispatch<TableAction>;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

// Table provider props
export interface TableProviderProps {
  children: ReactNode;
  initialState?: Partial<TableState>;
}

// Table provider
export const TableProvider: React.FC<TableProviderProps> = ({
  children,
  initialState = {},
}) => {
  const [state, dispatch] = useReducer(tableReducer, {
    ...initialTableState,
    ...initialState,
  });

  return (
    <TableContext.Provider value={{ state, dispatch }}>
      {children}
    </TableContext.Provider>
  );
};

// Hook to use table context
export const useTable = (): TableContextType => {
  const context = useContext(TableContext);
  
  if (!context) {
    throw new Error('useTable must be used within a TableProvider');
  }
  
  return context;
};

export default TableContext;
