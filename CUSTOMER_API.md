# Customer Management API

## Overview
This API provides endpoints for managing customers and customer groups in your store.

## Customer Endpoints

### Create Customer
**POST** `/api/stores/:storeId/customers`

Creates a new customer with shipping and billing address information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "instagramHandle": "@johndoe",
  "additionalInfo": "VIP customer",
  "customerGroupId": 1,
  "shippingAddress": "123 Main St",
  "shippingCountry": "USA",
  "shippingState": "CA",
  "shippingCity": "Los Angeles",
  "shippingZipCode": "90001",
  "billingAddress": "456 Oak Ave",
  "billingCountry": "USA",
  "billingState": "CA",
  "billingCity": "Los Angeles",
  "billingZipCode": "90002",
  "sameAsShippingAddress": false,
  "sendWelcomeEmail": true,
  "subscribedToNewsletter": true
}
```

### List Customers
**GET** `/api/stores/:storeId/customers`

Retrieves a paginated list of customers.

**Query Parameters:**
- `search` (optional): Search by name, email, or phone
- `customerGroupId` (optional): Filter by customer group
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Example:**
```
GET /api/stores/1/customers?search=john&page=1&limit=10
```

### Get Customer Stats
**GET** `/api/stores/:storeId/customers/stats`

Returns statistics about customers.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 150,
    "customerGroups": 5,
    "newsletterSubscribers": 80
  }
}
```

### Get Customer by ID
**GET** `/api/customers/:id`

Retrieves a specific customer by ID.

### Update Customer
**PUT** `/api/customers/:id`

Updates customer information.

**Request Body:** (all fields optional)
```json
{
  "firstName": "Jane",
  "email": "jane.doe@example.com",
  "customerGroupId": 2
}
```

### Delete Customer
**DELETE** `/api/customers/:id`

Deletes a customer.

### Export Customers to CSV
**GET** `/api/stores/:storeId/customers/export`

Exports all customers to a CSV file.

---

## Customer Group Endpoints

### Create Customer Group
**POST** `/api/stores/:storeId/customer-groups`

Creates a new customer group.

**Request Body:**
```json
{
  "name": "VIP Customers",
  "description": "High-value customers with special privileges"
}
```

### List Customer Groups
**GET** `/api/stores/:storeId/customer-groups`

Retrieves a paginated list of customer groups.

**Query Parameters:**
- `search` (optional): Search by name or description
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

### Get Customer Group by ID
**GET** `/api/customer-groups/:id`

Retrieves a specific customer group by ID.

### Update Customer Group
**PUT** `/api/customer-groups/:id`

Updates customer group information.

**Request Body:**
```json
{
  "name": "Premium VIP",
  "description": "Updated description"
}
```

### Delete Customer Group
**DELETE** `/api/customer-groups/:id`

Deletes a customer group.

### Export Customer Groups to CSV
**GET** `/api/stores/:storeId/customer-groups/export`

Exports all customer groups to a CSV file.

---

## Response Format

All endpoints return responses in the following format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Newsletter Endpoints

### Subscribe to Newsletter
**POST** `/api/stores/:storeId/newsletter/subscribe`

Subscribe an email address to the newsletter. Creates a new customer if email doesn't exist.

**Request Body:**
```json
{
  "email": "subscriber@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter",
  "data": {
    "id": 1,
    "email": "subscriber@example.com",
    "subscribedToNewsletter": true
  }
}
```

### Unsubscribe from Newsletter
**POST** `/api/stores/:storeId/newsletter/unsubscribe`

Unsubscribe an email address from the newsletter.

**Request Body:**
```json
{
  "email": "subscriber@example.com"
}
```

### Get Newsletter Subscribers
**GET** `/api/stores/:storeId/newsletter/subscribers`

Retrieves a paginated list of newsletter subscribers.

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "subscribers": [
      {
        "id": 1,
        "email": "subscriber@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 50,
      "totalPages": 2
    }
  }
}
```

### Get Newsletter Statistics
**GET** `/api/stores/:storeId/newsletter/stats`

Returns statistics about newsletter subscribers.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSubscribers": 150,
    "recentSubscribers": 25,
    "subscriptionRate": "75.00%"
  }
}
```

### Send Newsletter
**POST** `/api/stores/:storeId/newsletter/send`

Send a newsletter email to all subscribers.

**Request Body:**
```json
{
  "subject": "Monthly Newsletter - January 2024",
  "htmlContent": "<h1>Hello {firstName}!</h1><p>Check out our latest products...</p>",
  "textContent": "Hello {firstName}! Check out our latest products..."
}
```

**Personalization Variables:**
- `{firstName}` - Subscriber's first name
- `{lastName}` - Subscriber's last name
- `{fullName}` - Subscriber's full name

**Response:**
```json
{
  "success": true,
  "message": "Newsletter sent successfully",
  "data": {
    "totalSubscribers": 150,
    "successful": 148,
    "failed": 2
  }
}
```

### Export Newsletter Subscribers to CSV
**GET** `/api/stores/:storeId/newsletter/export`

Exports all newsletter subscribers to a CSV file.

---

## Features

- **Customer Management**: Full CRUD operations for customers
- **Customer Groups**: Organize customers into groups
- **Address Management**: Separate shipping and billing addresses
- **Newsletter Management**: Complete newsletter subscription system
- **Email Campaigns**: Send personalized newsletters to subscribers
- **Welcome Emails**: Automatic welcome emails for new customers
- **Search & Filter**: Search customers by name, email, or phone
- **Pagination**: Efficient data retrieval with pagination
- **CSV Export**: Export customer and subscriber data for reporting
- **Statistics**: Get customer and newsletter metrics at a glance
- **Personalization**: Use variables in newsletters for personalized content
