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

Create a new store for the authenticated user. Each user can have only one store.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessName": "My Awesome Shop",
  "storeUrl": "my-awesome-shop",
  "country": "United States",
  "currency": "USD"
}
```

**Parameters:**
- `businessName` (required): Name of the business (1-255 characters, non-empty)
- `storeUrl` (required): Unique store URL (3-63 characters, lowercase alphanumeric and hyphens only)
- `country` (required): Country name (any country supported, non-empty)
- `currency` (optional): Currency code (e.g., USD, EUR, GBP, INR, JPY, AUD, CAD, etc. Defaults to USD)

**Validation Rules:**
- Business name cannot be empty
- Store URL must be 3-63 characters
- Store URL can only contain lowercase letters, numbers, and hyphens
- Store URL must be unique across the platform
- Country cannot be empty
- User can only have one store

**Response (201):**
```json
{
  "message": "Store setup successful",
  "store": {
    "id": 1,
    "businessName": "My Awesome Shop",
    "storeUrl": "my-awesome-shop",
    "country": "United States",
    "currency": "USD",
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
  "message": "Store retrieved successfully",
  "store": {
    "id": 1,
    "businessName": "My Awesome Shop",
    "storeUrl": "my-awesome-shop",
    "country": "United States",
    "currency": "USD",
    "isLaunched": false,
    "createdAt": "2025-11-26T10:00:00Z",
    "updatedAt": "2025-11-26T10:00:00Z"
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

Update the authenticated user's store details. Only businessName, country, and currency can be updated. storeUrl is immutable.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessName": "Updated Shop Name",
  "country": "Canada",
  "currency": "CAD"
}
```

**Parameters:**
- `businessName` (optional): New business name (1-255 characters, non-empty if provided)
- `country` (optional): New country name (non-empty if provided)
- `currency` (optional): New currency code (e.g., USD, EUR, GBP, INR, JPY, AUD, CAD, etc.)

**Response (200):**
```json
{
  "message": "Store updated successfully",
  "store": {
    "id": 1,
    "businessName": "Updated Shop Name",
    "storeUrl": "my-awesome-shop",
    "country": "Canada",
    "currency": "CAD",
    "isLaunched": false,
    "createdAt": "2025-11-26T10:00:00Z",
    "updatedAt": "2025-11-26T10:15:00Z"
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
    "businessName": "My Awesome Shop",
    "storeUrl": "my-awesome-shop",
    "country": "United States",
    "currency": "USD",
    "isLaunched": true,
    "createdAt": "2025-11-26T10:00:00Z",
    "updatedAt": "2025-11-26T10:20:00Z"
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