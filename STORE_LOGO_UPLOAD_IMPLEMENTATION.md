# Store Logo Upload Implementation

## Summary
Implemented Cloudinary upload functionality for store logos in the setup and update endpoints.

## Changes Made

### 1. Controller Updates (`src/controllers/store.controller.ts`)
- Added `uploadToCloudinary` import
- Modified `setupStore` to handle file uploads via `req.file`
- Modified `updateStore` to handle file uploads via `req.file`
- Logo is uploaded to Cloudinary before saving to database
- Returns Cloudinary URL in response

### 2. Route Updates (`src/routes/store.routes.ts`)
- Added `uploadSingle` middleware import
- Applied `uploadSingle` middleware to `/setup` endpoint
- Applied `uploadSingle` middleware to `/` (PUT) endpoint
- Enables multipart/form-data handling for file uploads

### 3. Swagger Documentation Updates (`swagger.yml`)
- Updated `/api/store/setup` endpoint:
  - Changed content type to `multipart/form-data`
  - Added `file` parameter for logo upload
  - Added all store fields (storeName, businessSector, tagLine, description, timezone, phone, address, state, city, zipCode)
  - Updated response schema to include all fields and logoUrl

- Updated `/api/store` (GET) endpoint:
  - Added all store fields to response schema
  - Included logoUrl with Cloudinary example

- Updated `/api/store` (PUT) endpoint:
  - Changed content type to `multipart/form-data`
  - Added `file` parameter for logo upload
  - Added all updatable store fields
  - Updated response schema to include all fields and logoUrl

- Updated `/api/store/launch` endpoint:
  - Updated response schema to include all fields and logoUrl

### 4. API Documentation Updates (`STORE_API.md`)
- Updated all endpoint examples to show multipart/form-data format
- Added logo upload instructions
- Documented all available store fields
- Updated response examples to include logoUrl and all fields

## How It Works

### Setup Store with Logo
```bash
curl -X POST http://localhost:8000/api/store/setup \
  -H "Authorization: Bearer <accessToken>" \
  -F "storeUrl=my-awesome-shop" \
  -F "storeName=My Store" \
  -F "businessName=My Awesome Shop" \
  -F "file=@/path/to/logo.png" \
  -F "currency=USD" \
  -F "country=United States"
```

### Update Store with New Logo
```bash
curl -X PUT http://localhost:8000/api/store/ \
  -H "Authorization: Bearer <accessToken>" \
  -F "businessName=Updated Shop Name" \
  -F "file=@/path/to/new-logo.png" \
  -F "tagLine=New tagline"
```

## Features
- ✅ Logo upload to Cloudinary
- ✅ Automatic URL generation
- ✅ Support for JPEG, PNG, PDF formats
- ✅ Max file size: 50MB
- ✅ Optional logo upload (can create/update store without logo)
- ✅ Consistent with other entity uploads (Brand, Supplier, etc.)
- ✅ Full field support (storeName, businessSector, tagLine, description, etc.)

## Environment Variables Required
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Compatibility
The implementation is now fully compatible with the Dootling store information page at `https://dootling.com/store/store-information`, supporting all displayed fields:
- Business Name
- Store Name/Logo
- Store Tagline
- Store Description
- Contact Phone
- Address
- Zip-code
- Store Currency
- And additional fields (state, city, timezone, businessSector)
