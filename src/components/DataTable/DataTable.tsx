
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

export type Column<T> = {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  enableSorting?: boolean;
  className?: string;
  cellClassName?: string;
};

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T | string;
  noResultsMessage?: string;
  noDataMessage?: string;
  title?: string;
  onRowClick?: (item: T) => void;
  rowClassName?: string | ((item: T) => string);
  initialSortField?: keyof T | string;
  initialSortDirection?: SortDirection;
  pageSize?: number;
  cardClassName?: string;
  tableClassName?: string;
  hideSearch?: boolean;
  enablePagination?: boolean;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search...",
  searchKey,
  noResultsMessage = "No results found",
  noDataMessage = "No data available",
  title,
  onRowClick,
  rowClassName,
  initialSortField,
  initialSortDirection = null,
  pageSize = 10,
  cardClassName,
  tableClassName,
  hideSearch = false,
  enablePagination = false,
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<keyof T | string | undefined>(initialSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery || !searchKey) return data;

    return data.filter(item => {
      // Handle nested properties with dot notation
      const getValue = (obj: any, path: string) => {
        const keys = path.split('.');
        return keys.reduce((o, key) => (o && o[key] !== undefined) ? o[key] : null, obj);
      };

      const value = typeof searchKey === 'string' 
        ? getValue(item, searchKey)
        : item[searchKey];

      if (value == null) return false;

      return String(value).toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery, searchKey]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortField || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      // Handle nested properties with dot notation
      const getValue = (obj: any, path: string) => {
        const keys = path.split('.');
        return keys.reduce((o, key) => (o && o[key] !== undefined) ? o[key] : null, obj);
      };

      const valueA = typeof sortField === 'string' 
        ? getValue(a, sortField)
        : a[sortField];
      
      const valueB = typeof sortField === 'string' 
        ? getValue(b, sortField)
        : b[sortField];

      // Handle different data types
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (valueA === valueB) return 0;
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [filteredData, sortField, sortDirection]);

  // Pagination
  const paginatedData = React.useMemo(() => {
    if (!enablePagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, enablePagination]);

  // Total pages calculation for pagination
  const totalPages = React.useMemo(() => {
    return Math.max(1, Math.ceil(sortedData.length / pageSize));
  }, [sortedData, pageSize]);

  // Handle sorting
  const handleSort = (field: keyof T | string) => {
    // If clicking on a different column, sort ascending by that column
    if (sortField !== field) {
      setSortField(field);
      setSortDirection('asc');
      return;
    }

    // If clicking on the current sort column, cycle through sort directions
    if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else if (sortDirection === 'desc') {
      setSortField(undefined);
      setSortDirection(null);
    } else {
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: keyof T | string) => {
    if (sortField !== field) return null;
    
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-1 h-3 w-3" />;
    }
    
    if (sortDirection === 'desc') {
      return <ArrowDown className="ml-1 h-3 w-3" />;
    }
    
    return null;
  };

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get row class name
  const getRowClassName = (item: T) => {
    if (!rowClassName) return '';
    
    if (typeof rowClassName === 'function') {
      return rowClassName(item);
    }
    
    return rowClassName;
  };

  return (
    <Card className={cn("shadow-sm", cardClassName)}>
      {(title || !hideSearch) && (
        <CardHeader className={cn(hideSearch ? "pb-2" : "pb-0")}>
          {title && <CardTitle>{title}</CardTitle>}
          
          {!hideSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-10"
              />
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent className={cn(!title && hideSearch ? "pt-6" : "")}>
        <div className="overflow-x-auto">
          <Table className={tableClassName}>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead 
                    key={index}
                    className={cn(
                      column.enableSorting && "cursor-pointer hover:bg-muted/50",
                      column.className
                    )}
                    onClick={() => column.enableSorting && handleSort(column.accessorKey)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.enableSorting && getSortIcon(column.accessorKey)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, rowIndex) => (
                  <TableRow 
                    key={rowIndex}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                      getRowClassName(item)
                    )}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {columns.map((column, colIndex) => {
                      // Handle nested properties with dot notation
                      const getValue = (obj: any, path: string) => {
                        const keys = path.split('.');
                        return keys.reduce((o, key) => (o && o[key] !== undefined) ? o[key] : null, obj);
                      };

                      // Get the cell value
                      const value = typeof column.accessorKey === 'string' 
                        ? getValue(item, column.accessorKey)
                        : item[column.accessorKey];

                      return (
                        <TableCell 
                          key={colIndex}
                          className={column.cellClassName}
                        >
                          {column.cell ? column.cell(item) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {data.length === 0 ? noDataMessage : noResultsMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {enablePagination && totalPages > 1 && (
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default DataTable;
