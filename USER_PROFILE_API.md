# User Profile API Documentation

## Overview
User profile management API for authenticated users to view and update their personal information, identification details, and contact information.

## Base URL
`http://localhost:8000/api/user`

---

## Authentication
All user profile endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

---

## Endpoints

### 1. Get User Profile
**GET** `/profile`

Retrieve the authenticated user's complete profile information including personal details and identification.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe1234",
    "fullName": "John Doe",
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
    "profilePhotoUrl": "https://res.cloudinary.com/...",
    "isVerified": true
  }
}
```

**Error Responses:**
- `401` - Unauthorized (missing or invalid token)
- `404` - User not found
- `500` - Internal server error

**Example cURL:**
```bash
curl -X GET http://localhost:8000/api/user/profile \
  -H "Authorization: Bearer <accessToken>"
```

---

### 2. Update User Profile
**PUT** `/profile`

Update the authenticated user's profile information including personal details and identification.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
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

**Parameters:**
- `firstname` (optional): First name (non-empty if provided)
- `lastname` (optional): Last name (non-empty if provided)
- `middleName` (optional): Middle name
- `gender` (optional): Gender (Male, Female, Other)
- `dateOfBirth` (optional): Date of birth (format: YYYY-MM-DD)
- `phone` (optional): Mobile number
- `meansOfIdentification` (optional): Type of identification
  - `NIN` - National Identification Number
  - `VOTERS_CARD` - Voter's Card
  - `DRIVERS_LICENSE` - Driver's License
  - `INTERNATIONAL_PASSPORT` - International Passport
- `identificationNumber` (optional): Valid ID number
- `identificationExpiry` (optional): ID expiry date (format: YYYY-MM-DD)
- `countryOfResidency` (optional): Country of residency
- `contactAddress` (optional): Contact address

**Validation Rules:**
- First name cannot be empty if provided
- Last name cannot be empty if provided
- Date fields must be valid dates
- All fields are optional (partial updates supported)

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe1234",
    "fullName": "John Doe",
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
}
```

**Error Responses:**
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - User not found
- `500` - Internal server error

**Example cURL:**
```bash
curl -X PUT http://localhost:8000/api/user/profile \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

---

## Profile Fields

### Basic Information
- **firstname** - User's first name
- **lastname** - User's last name
- **middleName** - User's middle name
- **fullName** - Auto-generated from firstname and lastname

### Personal Details
- **gender** - Gender (Male, Female, Other)
- **dateOfBirth** - Date of birth
- **phone** - Mobile number

### Identification
- **meansOfIdentification** - Type of ID document
- **identificationNumber** - ID number
- **identificationExpiry** - ID expiration date

### Residency & Contact
- **countryOfResidency** - Country of residence
- **contactAddress** - Physical contact address

### System Fields
- **email** - User's email (read-only)
- **username** - Unique username (read-only)
- **profilePhotoUrl** - Profile photo URL (set via separate endpoint)
- **isVerified** - Email verification status (read-only)

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

### Common Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found (user not found)
- `500` - Internal Server Error

### Validation Errors
- "First name cannot be empty"
- "Last name cannot be empty"
- "Invalid date format"

---

## Data Storage

User profile data is stored in two database tables:

### User Table
- Basic user information (email, username, phone, etc.)
- Authentication data (password, tokens)
- System fields (createdAt, updatedAt)

### UserKycProfile Table
- Extended profile information (middleName, gender, DOB)
- Identification details (meansOfIdentification, identificationNumber, etc.)
- Residency information (countryOfResidency, contactAddress)
- KYC status tracking

---

## Integration Notes

1. **Partial Updates** - All fields are optional. Send only the fields you want to update.
2. **Date Format** - Use ISO 8601 format (YYYY-MM-DD) for date fields.
3. **Full Name** - Automatically generated from firstname and lastname. Do not send directly.
4. **Profile Photo** - Upload via separate endpoint `/api/user/profile/photo`
5. **KYC Status** - Profile updates automatically set KYC status to "IN_PROGRESS" if not already started.

---

## Example Workflow

1. User registers and verifies email
2. User logs in and gets access token
3. User retrieves profile: `GET /api/user/profile`
4. User updates profile with personal details: `PUT /api/user/profile`
5. User uploads profile photo: `POST /api/user/profile/photo`
6. User continues with KYC submission

---

## Rate Limiting

No rate limiting currently implemented. Consider adding for production.

---

## Security Considerations

✅ **Implemented:**
- Authentication required (Bearer token)
- User can only access their own profile
- Input validation on all fields
- Secure password storage (not exposed in API)

✅ **Best Practices:**
- Never expose sensitive data in responses
- Validate all input on server side
- Use HTTPS in production
- Implement rate limiting for production
