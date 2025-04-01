/**
 * Utility for exporting entity data to CSV format
 */

/**
 * Generates and downloads a CSV file with the provided entity data
 * @param entities Array of entities to export
 * @param headers Object mapping column keys to header names
 * @param filename Name for the downloaded file (without extension)
 * @param transformFn Optional function to transform entity data before export
 */
export function exportEntitiesAsCsv<T extends Record<string, any>>(
  entities: T[],
  headers: Record<string, string>,
  filename: string,
  transformFn?: (entity: T) => Record<string, any>
) {
  // Define column keys (the object properties to include)
  const columnKeys = Object.keys(headers);
  
  // Build CSV header row
  const headerRow = columnKeys.map(key => headers[key]).join(',');
  
  // Build CSV data rows
  const dataRows = entities.map(entity => {
    // Apply transformation if provided
    const data = transformFn ? transformFn(entity) : entity;
    
    // Map each column and handle escaping
    return columnKeys.map(key => {
      const value = data[key];
      
      // Handle null or undefined values
      if (value === null || value === undefined) {
        return '';
      }
      
      // Convert to string and escape commas by wrapping in quotes
      const stringValue = String(value).replace(/"/g, '""');
      return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
    }).join(',');
  });
  
  // Combine header and data into CSV content
  const csvContent = [headerRow, ...dataRows].join('\n');
  
  // Create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper function to sanitize CSV fields
 * @param value Value to sanitize
 * @returns Sanitized value safe for CSV
 */
export function sanitizeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value).replace(/"/g, '""');
  return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
} 