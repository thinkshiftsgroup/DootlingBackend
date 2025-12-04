# Store API Documentation

## Overview
Store management API for authenticated users to create and manage their Dootling store. Supports any country and currency worldwide.

## Base URL
`http://localhost:8000/api/store`

---

## Authentication
All store endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

---

## Endpoints

### 1. Setup Store
**POST** `/setup`

Create a new store for the authenticated user. Each user can have only one store. Supports logo upload.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
storeName: "My Store"
businessName: "My Awesome Shop"
storeUrl: "my-awesome-shop"
file: [logo image file]
businessSector: "Retail"
tagLine: "Your one-stop shop"
description: "We sell amazing products"
timezone: "America/New_York"
currency: "USD"
phone: "+1234567890"
address: "123 Main St"
country: "United States"
state: "New York"
city: "New York"
zipCode: "10001"
```

**Parameters:**
- `storeUrl` (required): Unique store URL (3-63 characters, lowercase alphanumeric and hyphens only)
- `storeName` (optional): Display name for the store
- `businessName` (optional): Legal business name
- `file` (optional): Store logo image (JPEG, PNG, or PDF) - uploaded to Cloudinary
- `businessSector` (optional): Business sector/industry
- `tagLine` (optional): Store tagline
- `description` (optional): Store description
- `timezone` (optional): Store timezone
- `currency` (optional): Currency code (e.g., USD, EUR, GBP, INR, JPY, AUD, CAD, etc. Defaults to USD)
- `phone` (optional): Contact phone number
- `address` (optional): Store address
- `country` (optional): Country name
- `state` (optional): State/province
- `city` (optional): City
- `zipCode` (optional): ZIP/postal code

**Validation Rules:**
- Store URL must be 3-63 characters
- Store URL can only contain lowercase letters, numbers, and hyphens
- Store URL must be unique across the platform
- User can only have one store
- Logo file must be JPEG, PNG, or PDF (max 50MB)

**Response (201):**
```json
{
  "message": "Store setup successful",
  "store": {
    "id": 1,
    "storeName": "My Store",
    "businessName": "My Awesome Shop",
    "storeUrl": "my-awesome-shop",
    "logoUrl": "https://res.cloudinary.com/...",
    "businessSector": "Retail",
    "tagLine": "Your one-stop shop",
    "description": "We sell amazing products",
    "timezone": "America/New_York",
    "currency": "USD",
    "phone": "+1234567890",
    "address": "123 Main St",
    "country": "United States",
    "state": "New York",
    "city": "New York",
    "zipCode": "10001",
    "isLaunched": false
  }
}
```

**Error Responses:**
- `400` - Invalid input / Store URL already taken / User already has a store / Invalid store URL format
- `401` - Unauthorized (missing or invalid token)
- `404` - User not found
- `500` - Internal server error

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/store/setup \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "My Awesome Shop",
    "storeUrl": "my-awesome-shop",
    "country": "United States",
    "currency": "USD"
  }'
```

---

### 2. Get Store
**GET** `/`

Retrieve the authenticated user's store details.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "store": {
    "id": 1,
    "storeName": "My Store",
    "businessName": "My Awesome Shop",
    "storeUrl": "my-awesome-shop",
    "logoUrl": "https://res.cloudinary.com/...",
    "businessSector": "Retail",
    "tagLine": "Your one-stop shop",
    "description": "We sell amazing products",
    "timezone": "America/New_York",
    "currency": "USD",
    "phone": "+1234567890",
    "address": "123 Main St",
    "country": "United States",
    "state": "New York",
    "city": "New York",
    "zipCode": "10001",
    "isLaunched": false,
    "createdAt": "2025-11-26T10:00:00Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized (missing or invalid token)
- `404` - Store not found
- `500` - Internal server error

**Example cURL:**
```bash
curl -X GET http://localhost:8000/api/store/ \
  -H "Authorization: Bearer <accessToken>"
```

---

### 3. Update Store
**PUT** `/`

Update the authenticated user's store details. All fields except storeUrl can be updated. Supports logo upload.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
storeName: "Updated Store Name"
businessName: "Updated Shop Name"
file: [new logo image file]
businessSector: "E-commerce"
tagLine: "New tagline"
description: "Updated description"
timezone: "America/Los_Angeles"
currency: "CAD"
phone: "+1987654321"
address: "456 Oak Ave"
country: "Canada"
state: "Ontario"
city: "Toronto"
zipCode: "M5H 2N2"
```

**Parameters (all optional):**
- `storeName`: Display name for the store
- `businessName`: Legal business name
- `file`: New store logo image (JPEG, PNG, or PDF) - uploaded to Cloudinary
- `businessSector`: Business sector/industry
- `tagLine`: Store tagline
- `description`: Store description
- `timezone`: Store timezone
- `currency`: Currency code (e.g., USD, EUR, GBP, INR, JPY, AUD, CAD, etc.)
- `phone`: Contact phone number
- `address`: Store address
- `country`: Country name
- `state`: State/province
- `city`: City
- `zipCode`: ZIP/postal code

**Note:** storeUrl is immutable and cannot be changed after creation.

**Response (200):**
```json
{
  "message": "Store updated successfully",
  "store": {
    "id": 1,
    "storeName": "Updated Store Name",
    "businessName": "Updated Shop Name",
    "storeUrl": "my-awesome-shop",
    "logoUrl": "https://res.cloudinary.com/...",
    "businessSector": "E-commerce",
    "tagLine": "New tagline",
    "description": "Updated description",
    "timezone": "America/Los_Angeles",
    "currency": "CAD",
    "phone": "+1987654321",
    "address": "456 Oak Ave",
    "country": "Canada",
    "state": "Ontario",
    "city": "Toronto",
    "zipCode": "M5H 2N2",
    "isLaunched": false
  }
}
```

**Error Responses:**
- `400` - Invalid input
- `401` - Unauthorized (missing or invalid token)
- `404` - Store not found
- `500` - Internal server error

**Example cURL:**
```bash
curl -X PUT http://localhost:8000/api/store/ \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Updated Shop Name",
    "country": "Canada",
    "currency": "CAD"
  }'
```

---

### 4. Launch Store
**POST** `/launch`

Launch the authenticated user's store. Once launched, the store becomes publicly accessible.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "message": "Store launched successfully",
  "store": {
    "id": 1,
    "storeName": "My Store",
    "businessName": "My Awesome Shop",
    "storeUrl": "my-awesome-shop",
    "logoUrl": "https://res.cloudinary.com/...",
    "businessSector": "Retail",
    "tagLine": "Your one-stop shop",
    "description": "We sell amazing products",
    "timezone": "America/New_York",
    "currency": "USD",
    "phone": "+1234567890",
    "address": "123 Main St",
    "country": "United States",
    "state": "New York",
    "city": "New York",
    "zipCode": "10001",
    "isLaunched": true
  }
}
```

**Error Responses:**
- `400` - Store already launched
- `401` - Unauthorized (missing or invalid token)
- `404` - Store not found
- `500` - Internal server error

**Example cURL:**
```bash
curl -X POST http://localhost:8000/api/store/launch \
  -H "Authorization: Bearer <accessToken>"
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "stack": {}
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error