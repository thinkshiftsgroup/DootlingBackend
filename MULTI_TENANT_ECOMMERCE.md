# Multi-Tenant E-Commerce Platform

## Overview
This is a comprehensive multi-tenant e-commerce platform where each user can create and manage their own online store. The system ensures complete data isolation between stores while providing a rich set of e-commerce features.

## Architecture

### Multi-Tenancy Model
- **Tenant Isolation**: Each store (tenant) has its own isolated data
- **User-Store Relationship**: One user can own one store
- **Data Scoping**: All resources (products, orders, customers) are scoped to a store
- **Access Control**: Middleware ensures users can only access their own store data

### Key Components

#### 1. Store Management
Each store has:
- Unique store URL (subdomain-style: `mystore.dootling.com`)
- Custom branding (logo, favicon, colors)
- Business information
- Currency and tax settings
- Launch status

#### 2. Product Catalog
- Products with multiple images
- Multi-currency pricing
- Inventory tracking
- Categories and brands
- Product variants and options
- Upsell/cross-sell relationships

#### 3. Customer Management
- Customer profiles with contact info
- Shipping and billing addresses
- Customer groups for segmentation
- Newsletter subscriptions
- Order history

#### 4. Order Management
- Complete order lifecycle (pending → processing → shipped → delivered)
- Payment status tracking
- Order items with pricing snapshot
- Shipping tracking
- Order statistics and analytics

#### 5. Shopping Cart
- Guest and authenticated user carts
- Session-based cart for guests
- Cart merging when guest logs in
- Real-time totals calculation
- Stock validation

## API Endpoints

### Store Endpoints
```
POST   /api/store/setup          - Create a new store
GET    /api/store                - Get user's store
PUT    /api/store                - Update store settings
POST   /api/store/launch         - Launch store
```

### Product Endpoints
```
POST   /api/products/:storeId              - Create product
GET    /api/products/:storeId              - List products
PUT    /api/products/:productId            - Update product
DELETE /api/products/:productId            - Delete product
```

### Customer Endpoints
```
POST   /api/stores/:storeId/customers           - Create customer
GET    /api/stores/:storeId/customers           - List customers
GET    /api/stores/:storeId/customers/stats     - Customer statistics
GET    /api/stores/:storeId/customers/export    - Export to CSV
GET    /api/customers/:id                       - Get customer
PUT    /api/customers/:id                       - Update customer
DELETE /api/customers/:id                       - Delete customer
```

### Customer Group Endpoints
```
POST   /api/stores/:storeId/customer-groups        - Create group
GET    /api/stores/:storeId/customer-groups        - List groups
GET    /api/stores/:storeId/customer-groups/export - Export to CSV
GET    /api/customer-groups/:id                    - Get group
PUT    /api/customer-groups/:id                    - Update group
DELETE /api/customer-groups/:id                    - Delete group
```

### Order Endpoints
```
POST   /api/stores/:storeId/orders           - Create order
GET    /api/stores/:storeId/orders           - List orders
GET    /api/stores/:storeId/orders/stats     - Order statistics
GET    /api/stores/:storeId/orders/export    - Export to CSV
GET    /api/orders/:id                       - Get order
GET    /api/orders/number/:orderNumber       - Track order (public)
PUT    /api/orders/:id                       - Update order
DELETE /api/orders/:id                       - Delete order
```

### Cart Endpoints
```
GET    /api/stores/:storeId/cart             - Get cart
POST   /api/stores/:storeId/cart/items       - Add to cart
PUT    /api/cart/items/:cartItemId           - Update cart item
DELETE /api/cart/items/:cartItemId           - Remove from cart
DELETE /api/cart/:cartId                     - Clear cart
```

## Security & Multi-Tenancy

### Middleware Stack

#### 1. Authentication Middleware (`protect`)
- Verifies JWT token
- Attaches user to request
- Required for all store owner operations

#### 2. Tenant Access Middleware (`verifyStoreAccess`)
- Verifies store ownership
- Ensures user can only access their own store
- Attaches store to request

#### 3. Resource Ownership Middleware (`verifyResourceOwnership`)
- Verifies resource belongs to user's store
- Used for products, customers, orders, etc.
- Prevents cross-tenant data access

#### 4. Public Store Access (`getStoreByUrl`)
- Allows public access to store by URL
- Used for customer-facing endpoints
- No authentication required

### Data Isolation

All database queries are scoped by `storeId`:
```typescript
// Example: Get products for a specific store
const products = await prisma.product.findMany({
  where: { storeId: userStore.id }
});
```

## Database Schema

### Core Models
- **User**: Platform users who own stores
- **Store**: Tenant/store with settings and branding
- **Product**: Store products with pricing and inventory
- **Category**: Product categories
- **Brand**: Product brands
- **Customer**: Store customers
- **CustomerGroup**: Customer segmentation
- **Order**: Customer orders
- **OrderItem**: Order line items
- **Cart**: Shopping carts
- **CartItem**: Cart line items
- **Inventory**: Stock tracking

### Relationships
```
User (1) ──→ (1) Store
Store (1) ──→ (N) Product
Store (1) ──→ (N) Customer
Store (1) ──→ (N) Order
Store (1) ──→ (N) Cart
Customer (1) ──→ (N) Order
Customer (1) ──→ (1) Cart
Order (1) ──→ (N) OrderItem
Cart (1) ──→ (N) CartItem
Product (1) ──→ (N) OrderItem
Product (1) ──→ (N) CartItem
Product (1) ──→ (1) Inventory
```

## Features

### Store Owner Features
✅ Create and customize store
✅ Manage products with variants
✅ Track inventory
✅ Manage customers and groups
✅ Process orders
✅ View analytics and statistics
✅ Export data to CSV
✅ Multi-currency support
✅ Tax configuration

### Customer Features
✅ Browse products by store URL
✅ Add products to cart
✅ Guest checkout
✅ Order tracking
✅ Customer accounts
✅ Order history

### System Features
✅ Complete data isolation
✅ Role-based access control
✅ Secure authentication
✅ RESTful API
✅ Comprehensive error handling
✅ Audit trails (timestamps)

## Usage Examples

### 1. Create a Store
```bash
POST /api/store/setup
Authorization: Bearer <token>

{
  "businessName": "My Awesome Store",
  "storeUrl": "mystore",
  "country": "USA",
  "currency": "USD"
}
```

### 2. Add a Product
```bash
POST /api/products/1
Authorization: Bearer <token>

{
  "name": "Premium T-Shirt",
  "shortDescription": "Comfortable cotton t-shirt",
  "productImages": ["https://..."],
  "pricings": [
    {
      "currencyCode": "USD",
      "sellingPrice": 29.99
    }
  ],
  "stockQuantity": 100,
  "categories": [1, 2]
}
```

### 3. Create an Order
```bash
POST /api/stores/1/orders
Authorization: Bearer <token>

{
  "customerEmail": "customer@example.com",
  "customerFirstName": "John",
  "customerLastName": "Doe",
  "shippingAddress": "123 Main St",
  "shippingCity": "New York",
  "shippingCountry": "USA",
  "shippingZipCode": "10001",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

### 4. Add to Cart (Guest)
```bash
POST /api/stores/1/cart/items

{
  "productId": 1,
  "quantity": 1,
  "sessionId": "guest-session-123"
}
```

## Deployment Considerations

### Environment Variables
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=3000
```

### Database Migration
```bash
npx prisma generate --schema=./src/prisma/schema.prisma
npx prisma db push
```

### Running the Application
```bash
npm run dev      # Development
npm run build    # Build for production
npm start        # Production
```

## Future Enhancements

### Planned Features
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Discount codes and promotions
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Multi-language support
- [ ] Advanced shipping calculations
- [ ] Webhook system
- [ ] API rate limiting
- [ ] Store themes and templates
- [ ] Mobile app API
- [ ] Subscription products
- [ ] Digital product downloads

### Scalability
- Implement caching (Redis)
- Add search engine (Elasticsearch)
- CDN for static assets
- Database read replicas
- Horizontal scaling with load balancer

## Best Practices

### For Store Owners
1. Always verify store ownership before operations
2. Use pagination for large datasets
3. Implement proper error handling
4. Keep inventory updated
5. Monitor order status regularly

### For Developers
1. Always scope queries by storeId
2. Use middleware for access control
3. Validate input data
4. Handle edge cases (out of stock, etc.)
5. Log important operations
6. Write tests for critical paths

## Support

For issues or questions:
- Check API documentation
- Review error messages
- Contact support team
