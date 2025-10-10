export interface TableColumn<T = any> {
  header: string;
  field: keyof T | string;
  sortable?: boolean;
  cellRenderer?: (value: any, row?: T) => string | number | null | undefined;
  width?: string;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
}
