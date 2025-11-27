# User Profile API Update Summary

## Overview
Updated the User Profile API to include identification and residency fields as part of the user profile, not as separate KYC endpoints.

## Changes Made

### 1. User Service (`src/services/user.service.ts`)

**Updated `getUserProfile` function:**
- Now retrieves both User and UserKycProfile data
- Returns combined profile with all fields including:
  - middleName
  - gender
  - dateOfBirth
  - meansOfIdentification
  - identificationNumber
  - identificationExpiry
  - countryOfResidency
  - contactAddress

**Updated `updateUserProfile` function:**
- Now accepts all profile fields including identification and residency
- Automatically creates or updates UserKycProfile when these fields are provided
- Sets KYC status to "IN_PROGRESS" on first update
- Supports partial updates (only send fields you want to update)

### 2. Swagger Documentation (`swagger.yml`)

**Updated GET /api/user/profile:**
- Added detailed response schema with all profile fields
- Documented all user profile properties
- Included field descriptions and formats

**Updated PUT /api/user/profile:**
- Added comprehensive request body schema
- Documented all updateable fields
- Included field descriptions, formats, and enums
- Added validation rules in description

### 3. API Documentation (`USER_PROFILE_API.md`)

Created comprehensive documentation including:
- Complete endpoint descriptions
- Request/response examples
- Field definitions and validation rules
- Error handling guide
- Integration notes
- Example workflow
- Security considerations

## User Profile Fields

### Basic Information
- firstname (required for update)
- lastname (required for update)
- middleName (optional)
- fullName (auto-generated, read-only)

### Personal Details
- gender (Male, Female, Other)
- dateOfBirth (YYYY-MM-DD format)
- phone (mobile number)

### Identification
- meansOfIdentification (NIN, VOTERS_CARD, DRIVERS_LICENSE, INTERNATIONAL_PASSPORT)
- identificationNumber (ID number)
- identificationExpiry (YYYY-MM-DD format)

### Residency & Contact
- countryOfResidency (country name)
- contactAddress (physical address)

### System Fields (Read-only)
- id
- email
- username
- profilePhotoUrl
- isVerified
- createdAt
- updatedAt

## API Endpoints

### GET /api/user/profile
Retrieve complete user profile with all personal and identification details.

**Response includes:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "middleName": "Michael",
    "gender": "Male",
    "dateOfBirth": "1990-01-15",
    "phone": "+1234567890",
    "meansOfIdentification": "INTERNATIONAL_PASSPORT",
    "identificationNumber": "A12345678",
    "identificationExpiry": "2030-12-31",
    "countryOfResidency": "United States",
    "contactAddress": "123 Main Street, New York, NY 10001",
    "profilePhotoUrl": "https://...",
    "isVerified": true
  }
}
```

### PUT /api/user/profile
Update user profile with personal and identification information.

**Supports partial updates:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "middleName": "Michael",
  "gender": "Male",
  "dateOfBirth": "1990-01-15",
  "phone": "+1234567890",
  "meansOfIdentification": "INTERNATIONAL_PASSPORT",
  "identificationNumber": "A12345678",
  "identificationExpiry": "2030-12-31",
  "countryOfResidency": "United States",
  "contactAddress": "123 Main Street, New York, NY 10001"
}
```

## Database Integration

### User Table
Stores basic user information:
- firstname, lastname
- email, username
- phone
- profilePhotoUrl
- Authentication data

### UserKycProfile Table
Stores extended profile information:
- middleName, gender, dateOfBirth
- meansOfIdentification, identificationNumber, identificationExpiry
- countryOfResidency, contactAddress
- KYC status

## Test Results

✅ **All 15 tests passing**
- User profile tests: 4/4 passing
- KYC tests: 11/11 passing

**Test Coverage:**
- User Service: 66.12% statements
- User Controller: 53.57% statements

## Validation Rules

✅ First name cannot be empty (if provided)
✅ Last name cannot be empty (if provided)
✅ Date fields must be valid dates
✅ All fields are optional (partial updates supported)
✅ Identification types validated against enum
✅ Gender validated against enum

## Integration with UI

The User Profile API now fully supports the UI screenshot showing:
- First Name, Last Name, Middle Name
- Gender, DOB, Mobile Number
- Means of Identification, Valid ID Number, ID Expiry
- Country of Residency, Contact Address

All fields can be retrieved and updated through the single `/api/user/profile` endpoint.

## Backward Compatibility

✅ Existing endpoints remain unchanged
✅ KYC endpoints still available for business and document management
✅ No breaking changes to authentication or store endpoints

## Next Steps

1. Frontend can now use `/api/user/profile` for complete profile management
2. File upload for profile photo via `/api/user/profile/photo`
3. KYC document uploads via `/api/kyc/documents`
4. Business KYC via `/api/kyc/business`
5. KYC submission via `/api/kyc/submit`
