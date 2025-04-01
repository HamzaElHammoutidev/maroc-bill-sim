# Stock Management Module

## Overview

The Stock Management Module provides comprehensive inventory control capabilities for MarocBill. This module allows businesses to track product stock levels, manage stock movements (entries, exits, and adjustments), and conduct periodic inventory checks.

## Features

### Stock Tracking
- Track current stock levels for products
- Set minimum stock levels and alert thresholds
- View products that need restocking

### Stock Movements
- Record stock entries (purchases, returns from customers)
- Record stock exits (sales, returns to suppliers)
- Make manual stock adjustments
- View comprehensive movement history

### Multiple Locations
- Manage stock across multiple storage locations
- Track which products are stored in which locations
- Transfer stock between locations

### Inventory Management
- Conduct periodic inventory checks
- Record actual stock counts and compare with system values
- Automatically adjust stock levels based on inventory results

## Technical Implementation

The stock management system is integrated with the following components:

1. **Product Data Model**: Extended with stock-related fields:
   - `manageStock`: Flag to enable stock management
   - `currentStock`: Current stock level
   - `minStock`: Minimum stock level
   - `alertStock`: Alert threshold
   - `locationId`: Default storage location

2. **Stock Locations**: Storage locations for inventory:
   - Name and address
   - Default location flag
   - Company association

3. **Stock Movements**: Transactions that affect stock levels:
   - Various movement types (purchase, sale, return, adjustment, etc.)
   - Quantity (positive for entries, negative for exits)
   - Reference information
   - Before/after stock values for audit purposes

4. **Inventory**: Periodic stock counting:
   - Expected vs. actual stock levels
   - Discrepancy tracking
   - Adjustment generation

## User Interface

### Main Stock Dashboard
The stock dashboard provides an overview of:
- Products with low stock levels
- Recent stock movements
- Quick access to stock management functions

### Stock Movement Dialog
This dialog allows users to:
- Select a product and location
- Specify quantity
- Enter reason and reference information
- Record the stock movement

### Inventory Management
The inventory section allows users to:
- Create new inventory counts
- Record actual stock quantities
- Apply adjustments based on findings

## Usage

1. **Enable Stock Management**:
   - In the product details, enable stock management
   - Set initial stock level, minimum stock, and alert threshold

2. **Record Stock Movements**:
   - Use the appropriate button (Entry, Exit, Adjustment) from the stock page
   - Fill in the required information
   - Submit to update stock levels

3. **Monitor Stock Levels**:
   - View low stock items on the dashboard
   - Generate stock reports

4. **Conduct Inventory**:
   - Create a new inventory
   - Count physical stock
   - Validate and apply adjustments

## Integration with Other Modules

- **Products**: Stock management extends product functionality
- **Invoices**: Stock can be automatically updated when invoices are created
- **Reports**: Stock data is available in reporting

## Future Enhancements

- Barcode scanning for stock movements and inventory
- Supplier management and purchase orders
- Batch and serial number tracking
- Expiry date management for perishable items
- Advanced analytical reports for stock optimization 