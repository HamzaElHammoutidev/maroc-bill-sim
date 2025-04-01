/**
 * Utility functions for formatting dates, currency, and other values
 */

/**
 * Format a date string to a localized date format
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    return dateString;
  }
}

/**
 * Format a number as currency
 * @param amount Amount to format
 * @param currencySymbol Currency symbol or code to use
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencySymbol: string = 'DH'): string {
  try {
    const formatter = new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return `${formatter.format(amount)} ${currencySymbol}`;
  } catch (error) {
    return `${amount} ${currencySymbol}`;
  }
}

/**
 * Format a number as a percentage
 * @param value Value to format as percentage
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  try {
    const formatter = new Intl.NumberFormat('fr-MA', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(value / 100);
  } catch (error) {
    return `${value}%`;
  }
}

/**
 * Format file size to human-readable format
 * @param bytes Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format a phone number to a readable format
 * @param phoneNumber Phone number string to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // For Moroccan phone numbers
  if (phoneNumber.startsWith('+212')) {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length === 12) { // +212 format (12 digits)
      return `+212 ${digits.substring(3, 5)} ${digits.substring(5, 8)} ${digits.substring(8, 10)} ${digits.substring(10, 12)}`;
    }
  }
  
  // No specific formatting, return as is
  return phoneNumber;
} 