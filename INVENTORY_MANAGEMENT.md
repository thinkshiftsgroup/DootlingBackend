# Inventory Management System

This document describes the inventory management features implemented in the Dootling e-commerce platform.

## Overview

The inventory management system provides comprehensive tools for managing:
- **Warehouses/Branches**: Multiple storage locations for products
- **Suppliers**: Vendor management for product sourcing
- **Stock Lots**: Purchase orders and inventory receipts
- **Stock Adjustments**: Manual inventory corrections and adjustments
- **Stock Tracking**: Real-time inventory levels per warehouse

## Features

### 1. Warehouse Management

Manage multiple warehouses or branch locations where inventory is stored.

**Endpoints:**
- `POST /api/warehouses/{storeId}` - Create a new warehouse
- `GET /api/warehouses/{storeId}` - List warehouses with pagination
- `GET /api/warehouses/{storeId}/all` - Get all active warehouses
- `GET /api/warehouses/{storeId}/{id}` - Get warehouse details
- `PUT /api/warehouses/{id}` - Update warehouse
- `DELETE /api/warehouses/{id}` - Delete warehouse
- `GET /api/warehouses/{storeId}/export` - Export warehouses to CSV

**Fields:**
- Name (required)
- Address, City, State, Country, Zip Code
- Phone
- Active status

### 2. Supplier Management

Track and manage suppliers who provide products.

**Endpoints:**
- `POST /api/suppliers/{storeId}` - Create a new supplier
- `GET /api/suppliers/{storeId}` - List suppliers with pagination
- `GET /api/suppliers/{storeId}/all` - Get all active suppliers
- `GET /api/suppliers/{storeId}/{id}` - Get supplier details
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier
- `GET /api/suppliers/{storeId}/export` - Export suppliers to CSV

**Fields:**
- Name (required)
- Email, Phone
- Address, City, State, Country, Zip Code
- Contact Person
- Notes
- Active status

### 3. Stock Lot Management (Purchase Orders)

Record product purchases from suppliers. When a stock lot is marked as "DELIVERED", the inventory is automatically updated.

**Endpoints:**
- `POST /api/stock-lots/{storeId}` - Create a new stock lot
- `GET /api/stock-lots/{storeId}` - List stock lots with pagination
- `GET /api/stock-lots/{storeId}/all` - Get all stock lots
- `GET /api/stock-lots/{storeId}/{id}` - Get stock lot details
- `PUT /api/stock-lots/{id}` - Update stock lot
- `DELETE /api/stock-lots/{id}` - Delete stock lot
- `POST /api/stock-lots/{storeId}/import` - Import stock lots from CSV
- `GET /api/stock-lots/{storeId}/export` - Export stock lots to CSV

**Fields:**
- Warehouse (required)
- Supplier (required)
- Product (required)
- Lot Reference Number (required, unique)
- Purchase Date (required)
- Quantity (required)
- Purchase Price (required)
- Other Charges (optional)
- Discount (optional)
- Status: PENDING, DELIVERED, CANCELLED
- Notes
- Created By

**Automatic Stock Updates:**
When a stock lot status is changed to "DELIVERED", the system automatically:
1. Creates or updates the stock record for the product in the specified warehouse
2. Adds the quantity to existing stock
3. Calculates the weighted average purchase price

### 4. Stock Adjustment Management

Make manual adjustments to inventory for various reasons (damage, returns, transfers, etc.).

**Endpoints:**
- `POST /api/stock-adjustments/{storeId}` - Create a new adjustment
- `GET /api/stock-adjustments/{storeId}` - List adjustments with pagination
- `GET /api/stock-adjustments/{storeId}/all` - Get all adjustments
- `GET /api/stock-adjustments/{storeId}/{id}` - Get adjustment details
- `PUT /api/stock-adjustments/{id}` - Update adjustment
- `DELETE /api/stock-adjustments/{id}` - Delete adjustment
- `GET /api/stock-adjustments/{storeId}/export` - Export adjustments to CSV

**Fields:**
- Warehouse (required)
- Product (required)
- Reference Number (optional)
- Adjustment Date (required)
- Quantity (required)
- Type: INCREASE, DECREASE, DAMAGE, RETURN, TRANSFER, OTHER
- Notes
- Created By

**Automatic Stock Updates:**
Adjustments automatically update the stock quantity:
- INCREASE: Adds to stock
- DECREASE, DAMAGE, RETURN, TRANSFER, OTHER: Subtracts from stock

### 5. Stock Tracking

View current inventory levels across all warehouses.

**Endpoints:**
- `GET /api/stocks/{storeId}` - List stocks with pagination and filters
- `GET /api/stocks/{storeId}/all` - Get all stocks
- `GET /api/stocks/{storeId}/product/{productId}` - Get stocks for a specific product
- `GET /api/stocks/{storeId}/product/{productId}/warehouse/{warehouseId}` - Get stock for specific product and warehouse
- `GET /api/stocks/{storeId}/export` - Export stocks to CSV

**Query Filters:**
- Search by product name
- Filter by warehouse
- Filter by category
- Filter by brand
- Pagination support

**Stock Information:**
- Product details
- Warehouse location
- Current quantity
- Average purchase price
- Selling price
- Last updated timestamp

## Database Schema

### Warehouse
```prisma
model Warehouse {
  id          Int
  storeId     Int
  name        String
  address     String?
  city        String?
  state       String?
  country     String?
  zipCode     String?
  phone       String?
  isActive    Boolean
  stocks      Stock[]
  stockLots   StockLot[]
  adjustments StockAdjustment[]
}
```

### Supplier
```prisma
model Supplier {
  id            Int
  storeId       Int
  name          String
  email         String?
  phone         String?
  address       String?
  city          String?
  state         String?
  country       String?
  zipCode       String?
  contactPerson String?
  notes         String?
  isActive      Boolean
  stockLots     StockLot[]
}
```

### StockLot
```prisma
model StockLot {
  id             Int
  storeId        Int
  warehouseId    Int
  supplierId     Int
  productId      Int
  lotReferenceNo String (unique)
  purchaseDate   DateTime
  quantity       Int
  purchasePrice  Float
  otherCharges   Float?
  discount       Float?
  status         PurchaseStatus (PENDING, DELIVERED, CANCELLED)
  notes          String?
  createdBy      String?
}
```

### StockAdjustment
```prisma
model StockAdjustment {
  id             Int
  storeId        Int
  warehouseId    Int
  productId      Int
  referenceNo    String?
  adjustmentDate DateTime
  quantity       Int
  type           AdjustmentType (INCREASE, DECREASE, DAMAGE, RETURN, TRANSFER, OTHER)
  notes          String?
  createdBy      String?
}
```

### Stock
```prisma
model Stock {
  id               Int
  storeId          Int
  productId        Int
  warehouseId      Int
  quantity         Int
  avgPurchasePrice Float?
  sellingPrice     Float?
}
```

## Usage Examples

### Creating a Warehouse
```bash
POST /api/warehouses/1
{
  "name": "Main Warehouse",
  "address": "123 Storage St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zipCode": "10001",
  "phone": "+1234567890",
  "isActive": true
}
```

### Creating a Stock Lot
```bash
POST /api/stock-lots/1
{
  "warehouseId": 1,
  "supplierId": 1,
  "productId": 5,
  "lotReferenceNo": "LOT-2025-001",
  "purchaseDate": "2025-02-01",
  "quantity": 100,
  "purchasePrice": 50.00,
  "otherCharges": 5.00,
  "discount": 2.50,
  "status": "DELIVERED",
  "notes": "First batch of winter collection",
  "createdBy": "John Doe"
}
```

### Creating a Stock Adjustment
```bash
POST /api/stock-adjustments/1
{
  "warehouseId": 1,
  "productId": 5,
  "referenceNo": "ADJ-2025-001",
  "adjustmentDate": "2025-02-05",
  "quantity": 5,
  "type": "DECREASE",
  "notes": "Damaged items removed from inventory",
  "createdBy": "Jane Smith"
}
```

### Viewing Stock Levels
```bash
GET /api/stocks/1?warehouseId=1&search=sofa&page=1&limit=10
```

### Importing Stock Lots from CSV
```bash
POST /api/stock-lots/1/import
{
  "lots": [
    {
      "warehouseId": 1,
      "supplierId": 1,
      "productId": 1,
      "lotReferenceNo": "LOT-001",
      "purchaseDate": "2025-01-15",
      "quantity": 100,
      "purchasePrice": 50.00,
      "status": "DELIVERED"
    }
  ]
}
```

## CSV Import Format

See `examples/stock-lot-import-sample.csv` for the CSV import template.

Required columns:
- warehouseId
- supplierId
- productId
- lotReferenceNo
- purchaseDate
- quantity
- purchasePrice

Optional columns:
- otherCharges
- discount
- status
- notes

## Authentication

All inventory management endpoints require authentication using a Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

## Permissions

Users must be authenticated and have access to the specified store to perform inventory operations.

## Best Practices

1. **Always use unique lot reference numbers** to avoid conflicts
2. **Mark stock lots as DELIVERED** only when inventory is physically received
3. **Use stock adjustments** for corrections, not for regular purchases
4. **Regularly export data** for backup and reporting purposes
5. **Keep supplier information updated** for better tracking
6. **Use meaningful reference numbers** for easy identification

## Future Enhancements

Potential features for future releases:
- Stock transfer between warehouses
- Low stock alerts and notifications
- Barcode scanning integration
- Batch and expiry date tracking
- Stock valuation reports
- Purchase order approval workflow
- Supplier performance analytics


## Additional Features

### 6. Internal Transfer Management

Transfer inventory between warehouses/branches.

**Endpoints:**
- `POST /api/internal-transfers/{storeId}` - Create a new internal transfer
- `GET /api/internal-transfers/{storeId}` - List transfers with pagination
- `GET /api/internal-transfers/{storeId}/all` - Get all transfers
- `GET /api/internal-transfers/{storeId}/{id}` - Get transfer details
- `PUT /api/internal-transfers/{id}` - Update transfer
- `DELETE /api/internal-transfers/{id}` - Delete transfer
- `GET /api/internal-transfers/{storeId}/export` - Export transfers to CSV

**Fields:**
- From Warehouse (required)
- To Warehouse (required)
- Product (required)
- Reference Number (optional)
- Transfer Date (required)
- Quantity (required)
- Cost for Transfer (optional)
- Status: PENDING, IN_TRANSIT, COMPLETED, CANCELLED
- Notes
- Created By

**Automatic Stock Updates:**
When a transfer status is changed to "COMPLETED", the system automatically:
1. Deducts quantity from the source warehouse
2. Adds quantity to the destination warehouse
3. Validates sufficient stock in source warehouse

### 7. Invoice Management

Create and manage invoices for sales and purchases.

**Endpoints:**
- `POST /api/invoices/{storeId}` - Create a new invoice
- `GET /api/invoices/{storeId}` - List invoices with pagination
- `GET /api/invoices/{storeId}/all` - Get all invoices
- `GET /api/invoices/{storeId}/{id}` - Get invoice details
- `PUT /api/invoices/{id}` - Update invoice
- `DELETE /api/invoices/{id}` - Delete invoice
- `GET /api/invoices/{storeId}/export` - Export invoices to CSV

**Fields:**
- Invoice Number (required, unique)
- Warehouse (required)
- Customer (optional)
- Supplier (optional)
- Biller Name (required)
- Invoice Date (required)
- Due Date (optional)
- Total Amount (auto-calculated)
- Paid Amount
- Due Amount (auto-calculated)
- Tax Amount (auto-calculated)
- Discount Amount
- Payment Method: CASH, BANK_TRANSFER, CREDIT_CARD, DEBIT_CARD, CHEQUE, OTHER
- Payment Note
- Status: PENDING, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED
- Notes
- Created By
- Invoice Items (array of products with quantities and prices)

**Query Filters:**
- Search by invoice number, biller, or customer name
- Filter by warehouse
- Filter by customer
- Filter by status
- Filter by price range (min/max amount)
- Pagination support

### 8. Enhanced Supplier Management

Suppliers now support multiple contact methods and addresses.

**New Features:**
- Multiple email addresses with types (WORK, PERSONAL, OTHER)
- Multiple phone numbers with types (WORK, PERSONAL, OTHER)
- Multiple addresses with titles
- Supplier ID field
- Image upload support

**Example Request:**
```json
{
  "name": "ABC Suppliers Ltd",
  "supplierId": "SUP-001",
  "emails": [
    { "email": "sales@abc.com", "type": "WORK" },
    { "email": "support@abc.com", "type": "WORK" }
  ],
  "phones": [
    { "phone": "+1234567890", "type": "WORK" },
    { "phone": "+0987654321", "type": "PERSONAL" }
  ],
  "addresses": [
    {
      "title": "Main Office",
      "address": "123 Business St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    }
  ],
  "notes": "Preferred supplier for electronics",
  "isActive": true
}
```

### 9. Barcode Generation

Generate barcodes for products and stock lots.

**Endpoints:**
- `GET /api/barcodes/product/{productId}` - Generate barcode for a product
- `GET /api/barcodes/lot/{lotId}` - Generate barcode for a stock lot
- `POST /api/barcodes/bulk` - Generate barcodes in bulk

**Query Parameters:**
- `format`: png (default) or base64
- `type`: barcode type (default: code128)
- `pageStyle`: A4 (for printing)

**Bulk Generation:**
Generate barcodes for multiple products by:
- Lot ID: Generate barcode for all products in a lot
- Supplier ID: Generate barcodes for all products from a supplier

**Example Response (base64 format):**
```json
{
  "success": true,
  "data": [
    {
      "productId": 1,
      "productName": "Modern Sofa Set",
      "barcode": "data:image/png;base64,iVBORw0KG...",
      "quantity": 10
    }
  ]
}
```

## Database Schema Updates

### Enhanced Supplier Schema
```prisma
model Supplier {
  id            Int
  storeId       Int
  name          String
  supplierId    String?
  imageUrl      String?
  notes         String?
  isActive      Boolean
  emails        SupplierEmail[]
  phones        SupplierPhone[]
  addresses     SupplierAddress[]
  stockLots     StockLot[]
  invoices      Invoice[]
}

model SupplierEmail {
  id         Int
  supplierId Int
  email      String
  type       ContactType (WORK, PERSONAL, OTHER)
}

model SupplierPhone {
  id         Int
  supplierId Int
  phone      String
  type       ContactType (WORK, PERSONAL, OTHER)
}

model SupplierAddress {
  id         Int
  supplierId Int
  title      String?
  address    String
  city       String?
  state      String?
  country    String?
  zipCode    String?
}
```

### InternalTransfer Schema
```prisma
model InternalTransfer {
  id              Int
  storeId         Int
  fromWarehouseId Int
  toWarehouseId   Int
  productId       Int
  referenceNo     String?
  transferDate    DateTime
  quantity        Int
  costForTransfer Float?
  status          TransferStatus (PENDING, IN_TRANSIT, COMPLETED, CANCELLED)
  notes           String?
  createdBy       String?
}
```

### Invoice Schema
```prisma
model Invoice {
  id             Int
  storeId        Int
  invoiceNumber  String (unique)
  warehouseId    Int
  customerId     Int?
  supplierId     Int?
  billerName     String
  invoiceDate    DateTime
  dueDate        DateTime?
  totalAmount    Float
  paidAmount     Float
  dueAmount      Float
  taxAmount      Float?
  discountAmount Float?
  paymentMethod  PaymentMethod?
  paymentNote    String?
  status         InvoiceStatus (PENDING, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED)
  notes          String?
  createdBy      String?
  items          InvoiceItem[]
}

model InvoiceItem {
  id         Int
  invoiceId  Int
  productId  Int
  quantity   Int
  unitPrice  Float
  totalPrice Float
  taxRate    Float?
  taxAmount  Float?
}
```

## Usage Examples

### Creating an Internal Transfer
```bash
POST /api/internal-transfers/1
{
  "fromWarehouseId": 1,
  "toWarehouseId": 2,
  "productId": 5,
  "referenceNo": "TRF-2025-001",
  "transferDate": "2025-02-10",
  "quantity": 20,
  "costForTransfer": 50.00,
  "status": "COMPLETED",
  "notes": "Transfer to branch office",
  "createdBy": "John Doe"
}
```

### Creating an Invoice
```bash
POST /api/invoices/1
{
  "invoiceNumber": "INV-1001",
  "warehouseId": 1,
  "customerId": 5,
  "billerName": "Alice Johnson",
  "invoiceDate": "2025-02-15",
  "dueDate": "2025-03-15",
  "paymentMethod": "BANK_TRANSFER",
  "discountAmount": 100,
  "status": "PENDING",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 500,
      "taxRate": 10
    },
    {
      "productId": 3,
      "quantity": 1,
      "unitPrice": 300,
      "taxRate": 5
    }
  ]
}
```

### Generating Barcodes
```bash
# Single product barcode (PNG)
GET /api/barcodes/product/1?format=png

# Stock lot barcode (Base64)
GET /api/barcodes/lot/5?format=base64

# Bulk barcodes for a supplier
POST /api/barcodes/bulk?format=base64
{
  "supplierId": 2
}
```

## Summary

The complete inventory management system now includes:

1. **Warehouse Management** - Multiple storage locations
2. **Supplier Management** - Enhanced with multiple contacts
3. **Stock Lot Management** - Purchase orders with auto-stock updates
4. **Stock Adjustment** - Manual inventory corrections
5. **Stock Tracking** - Real-time inventory levels
6. **Internal Transfers** - Move stock between warehouses
7. **Invoice Management** - Sales and purchase invoicing
8. **Barcode Generation** - Print labels for products and lots

All features include:
- Full CRUD operations
- Pagination and filtering
- CSV export functionality
- Automatic stock calculations
- Transaction safety
- Authentication and authorization
