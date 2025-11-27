# User Profile & KYC Flow Documentation

## Overview
Complete guide for user profile management and KYC (Know Your Customer) verification flow in the Dootling platform.

---

## Table of Contents
1. [User Profile Management](#user-profile-management)
2. [KYC Personal Information](#kyc-personal-information)
3. [KYC Business Information](#kyc-business-information)
4. [KYC Documents](#kyc-documents)
5. [KYC PEPS](#kyc-peps)
6. [Complete KYC Flow](#complete-kyc-flow)
7. [API Endpoints Summary](#api-endpoints-summary)

---

## User Profile Management

### Overview
User profile contains basic personal information and identification details. This is the first step after registration.

### Get User Profile
**Endpoint:** `GET /api/user/profile`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
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

### Update User Profile
**Endpoint:** `PUT /api/user/profile`

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

**Response:**
```json
{
  "message": "Profile updated successfully",
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
    "contactAddress": "123 Main Street, New York, NY 10001"
  }
}
```

### Upload Profile Photo
**Endpoint:** `POST /api/user/profile/photo`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <binary image file>
```

**Response:**
```json
{
  "message": "Profile photo uploaded successfully",
  "profilePhotoUrl": "https://res.cloudinary.com/..."
}
```

**Supported Formats:** JPEG, PNG, JPG  
**Max Size:** 50MB

---

## KYC Personal Information

### Overview
Personal KYC contains detailed personal information for verification purposes. This is separate from the user profile but can be updated through the profile endpoint.

### Get Personal KYC
**Endpoint:** `GET /api/kyc/personal`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "profile": {
    "id": 1,
    "userId": 1,
    "middleName": "Michael",
    "gender": "Male",
    "dateOfBirth": "1990-01-15",
    "meansOfIdentification": "INTERNATIONAL_PASSPORT",
    "identificationNumber": "A12345678",
    "identificationExpiry": "2030-12-31",
    "countryOfResidency": "United States",
    "contactAddress": "123 Main Street, New York, NY 10001",
    "status": "IN_PROGRESS",
    "createdAt": "2025-11-27T10:00:00Z",
    "updatedAt": "2025-11-27T10:00:00Z"
  }
}
```

### Update Personal KYC
**Endpoint:** `PUT /api/kyc/personal`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "middleName": "Michael",
  "gender": "Male",
  "dateOfBirth": "1990-01-15",
  "meansOfIdentification": "INTERNATIONAL_PASSPORT",
  "identificationNumber": "A12345678",
  "identificationExpiry": "2030-12-31",
  "countryOfResidency": "United States",
  "contactAddress": "123 Main Street, New York, NY 10001"
}
```

**Response:**
```json
{
  "message": "Personal KYC profile created",
  "profile": {
    "id": 1,
    "userId": 1,
    "middleName": "Michael",
    "gender": "Male",
    "dateOfBirth": "1990-01-15",
    "meansOfIdentification": "INTERNATIONAL_PASSPORT",
    "identificationNumber": "A12345678",
    "identificationExpiry": "2030-12-31",
    "countryOfResidency": "United States",
    "contactAddress": "123 Main Street, New York, NY 10001",
    "status": "IN_PROGRESS"
  }
}
```

**Means of Identification Options:**
- `NIN` - National Identification Number
- `VOTERS_CARD` - Voter's Card
- `DRIVERS_LICENSE` - Driver's License
- `INTERNATIONAL_PASSPORT` - International Passport

---

## KYC Business Information

### Overview
Business KYC contains company information for business verification.

### Get Business KYC
**Endpoint:** `GET /api/kyc/business`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "profile": {
    "id": 1,
    "userId": 1,
    "businessName": "Test Business Ltd",
    "companyType": "Limited Liability Company",
    "incorporationNumber": "RC123456",
    "dateOfIncorporation": "2020-01-01",
    "countryOfIncorporation": "Nigeria",
    "taxNumber": "TAX123456",
    "companyAddress": "456 Business Ave",
    "zipOrPostcode": "100001",
    "stateOrProvince": "Lagos",
    "city": "Lagos",
    "businessDescription": "E-commerce platform",
    "companyWebsite": "https://testbusiness.com",
    "createdAt": "2025-11-27T10:00:00Z",
    "updatedAt": "2025-11-27T10:00:00Z"
  }
}
```

### Update Business KYC
**Endpoint:** `PUT /api/kyc/business`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessName": "Test Business Ltd",
  "companyType": "Limited Liability Company",
  "incorporationNumber": "RC123456",
  "dateOfIncorporation": "2020-01-01",
  "countryOfIncorporation": "Nigeria",
  "taxNumber": "TAX123456",
  "companyAddress": "456 Business Ave",
  "zipOrPostcode": "100001",
  "stateOrProvince": "Lagos",
  "city": "Lagos",
  "businessDescription": "E-commerce platform",
  "companyWebsite": "https://testbusiness.com"
}
```

**Response:**
```json
{
  "message": "Business KYC created",
  "profile": {
    "id": 1,
    "userId": 1,
    "businessName": "Test Business Ltd",
    "companyType": "Limited Liability Company",
    "incorporationNumber": "RC123456",
    "dateOfIncorporation": "2020-01-01",
    "countryOfIncorporation": "Nigeria",
    "taxNumber": "TAX123456",
    "companyAddress": "456 Business Ave",
    "zipOrPostcode": "100001",
    "stateOrProvince": "Lagos",
    "city": "Lagos",
    "businessDescription": "E-commerce platform",
    "companyWebsite": "https://testbusiness.com"
  }
}
```

**Required Fields:**
- `businessName` - Company name

**Optional Fields:**
- `companyType` - Type of company
- `incorporationNumber` - Registration number
- `dateOfIncorporation` - Date of incorporation
- `countryOfIncorporation` - Country of incorporation
- `taxNumber` - Tax identification number
- `companyAddress` - Company address
- `zipOrPostcode` - Postal code
- `stateOrProvince` - State or province
- `city` - City
- `businessDescription` - What the business does
- `companyWebsite` - Company website URL

---

## KYC Documents

### Overview
KYC documents include government ID, business certificates, proof of address, and other required documents.

### Get KYC Documents
**Endpoint:** `GET /api/kyc/documents`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "documents": [
    {
      "id": 1,
      "userId": 1,
      "type": "GOVERNMENT_ID",
      "url": "https://res.cloudinary.com/...",
      "uploadedAt": "2025-11-27T10:00:00Z"
    },
    {
      "id": 2,
      "userId": 1,
      "type": "PROOF_OF_ADDRESS",
      "url": "https://res.cloudinary.com/...",
      "uploadedAt": "2025-11-27T10:05:00Z"
    }
  ]
}
```

### Save Document URLs
**Endpoint:** `PUT /api/kyc/documents`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "documents": [
    {
      "type": "GOVERNMENT_ID",
      "url": "https://res.cloudinary.com/..."
    },
    {
      "type": "PROOF_OF_ADDRESS",
      "url": "https://res.cloudinary.com/..."
    },
    {
      "type": "INCORPORATION_CERTIFICATE",
      "url": "https://res.cloudinary.com/..."
    }
  ]
}
```

**Response:**
```json
{
  "message": "KYC documents saved",
  "count": 3
}
```

### Upload Documents to Cloudinary
**Endpoint:** `POST /api/kyc/documents/upload`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request Body:**
```
governmentId: <file>
incorporationCertificate: <file>
articleOfAssociation: <file>
proofOfAddress: <file>
selfieWithId: <file>
bankStatement: <file>
additionalDocuments: <files>
```

**Response:**
```json
{
  "message": "Documents uploaded successfully",
  "documents": [
    {
      "type": "GOVERNMENT_ID",
      "url": "https://res.cloudinary.com/..."
    },
    {
      "type": "PROOF_OF_ADDRESS",
      "url": "https://res.cloudinary.com/..."
    }
  ]
}
```

**Document Types:**
- `GOVERNMENT_ID` - Valid government issued ID
- `INCORPORATION_CERTIFICATE` - Business registration certificate
- `ARTICLE_OF_ASSOCIATION` - Company articles
- `PROOF_OF_ADDRESS` - Recent proof of address
- `SELFIE_WITH_ID` - Selfie with ID
- `BANK_STATEMENT` - Recent bank statement
- `ADDITIONAL` - Other documents

**Supported Formats:** JPEG, PNG, JPG, PDF  
**Max Size:** 50MB per file  
**Max Files:** 5 per upload

---

## KYC PEPS

### Overview
PEPS (Politically Exposed Persons) tracking for compliance purposes.

### Get PEPs
**Endpoint:** `GET /api/kyc/peps`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "peps": [
    {
      "id": 1,
      "userId": 1,
      "name": "John Doe",
      "position": "Senator",
      "description": "Member of Senate",
      "createdAt": "2025-11-27T10:00:00Z",
      "updatedAt": "2025-11-27T10:00:00Z"
    }
  ]
}
```

### Save PEPs
**Endpoint:** `PUT /api/kyc/peps`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "peps": [
    {
      "name": "John Doe",
      "position": "Senator",
      "description": "Member of Senate"
    },
    {
      "name": "Jane Smith",
      "position": "Minister",
      "description": "Minister of Finance"
    }
  ]
}
```

**Response:**
```json
{
  "message": "PEPs saved",
  "count": 2
}
```

**Required Fields:**
- `name` - PEP name
- `position` - Position/title

**Optional Fields:**
- `description` - PEP status description

---

## Complete KYC Flow

### Step-by-Step Process

#### Step 1: User Registration
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "subscribeToMarketing": true
}
```

#### Step 2: Verify Email
```bash
POST /api/auth/verify-email
{
  "email": "user@example.com",
  "code": "123456"
}
```
Response includes `accessToken` and `refreshToken`

#### Step 3: Update User Profile
```bash
PUT /api/user/profile
Authorization: Bearer <accessToken>
{
  "middleName": "Michael",
  "gender": "Male",
  "dateOfBirth": "1990-01-15",
  "meansOfIdentification": "INTERNATIONAL_PASSPORT",
  "identificationNumber": "A12345678",
  "identificationExpiry": "2030-12-31",
  "countryOfResidency": "United States",
  "contactAddress": "123 Main Street, New York, NY 10001"
}
```

#### Step 4: Upload Profile Photo
```bash
POST /api/user/profile/photo
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
file: <image file>
```

#### Step 5: Fill Business Information
```bash
PUT /api/kyc/business
Authorization: Bearer <accessToken>
{
  "businessName": "Test Business Ltd",
  "companyType": "Limited Liability Company",
  "incorporationNumber": "RC123456",
  "dateOfIncorporation": "2020-01-01",
  "countryOfIncorporation": "Nigeria",
  "taxNumber": "TAX123456",
  "companyAddress": "456 Business Ave",
  "zipOrPostcode": "100001",
  "stateOrProvince": "Lagos",
  "city": "Lagos",
  "businessDescription": "E-commerce platform",
  "companyWebsite": "https://testbusiness.com"
}
```

#### Step 6: Upload Documents
```bash
POST /api/kyc/documents/upload
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
governmentId: <file>
incorporationCertificate: <file>
proofOfAddress: <file>
selfieWithId: <file>
bankStatement: <file>
```

#### Step 7: Add PEPS Information
```bash
PUT /api/kyc/peps
Authorization: Bearer <accessToken>
{
  "peps": [
    {
      "name": "John Doe",
      "position": "Senator",
      "description": "Member of Senate"
    }
  ]
}
```

#### Step 8: Submit KYC for Approval
```bash
POST /api/kyc/submit
Authorization: Bearer <accessToken>
```

Response:
```json
{
  "message": "KYC submitted for approval",
  "profile": {
    "status": "SUBMITTED"
  }
}
```

---

## API Endpoints Summary

### Authentication (10 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-email` | Verify email with OTP |
| POST | `/api/auth/resend-verification` | Resend verification code |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/verify-reset-code` | Verify reset code |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/set-password` | Set password (authenticated) |
| POST | `/api/auth/logout` | Logout user |

### User Profile (3 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |
| POST | `/api/user/profile/photo` | Upload profile photo |

### KYC Personal (2 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/kyc/personal` | Get personal KYC |
| PUT | `/api/kyc/personal` | Update personal KYC |

### KYC Business (2 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/kyc/business` | Get business KYC |
| PUT | `/api/kyc/business` | Update business KYC |

### KYC Documents (3 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/kyc/documents` | Get documents |
| PUT | `/api/kyc/documents` | Save document URLs |
| POST | `/api/kyc/documents/upload` | Upload documents |

### KYC PEPS (2 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/kyc/peps` | Get PEPs |
| PUT | `/api/kyc/peps` | Save PEPs |

### KYC Submission (1 endpoint)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/kyc/submit` | Submit KYC for approval |

### Store (4 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/store/setup` | Create store |
| GET | `/api/store` | Get store |
| PUT | `/api/store` | Update store |
| POST | `/api/store/launch` | Launch store |

### Health (1 endpoint)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

**Total: 28 Endpoints**

---

## KYC Status Workflow

```
NOT_STARTED
    ↓
IN_PROGRESS (when user starts filling forms)
    ↓
SUBMITTED (when user submits KYC)
    ↓
APPROVED (admin approves)
    ↓
REJECTED (admin rejects, user can resubmit)
```

---

## Error Handling

All endpoints return errors in this format:

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
- `404` - Not Found
- `500` - Internal Server Error

---

## Security & Best Practices

✅ **Implemented:**
- JWT authentication required for all protected endpoints
- Input validation on all fields
- File type and size validation
- Secure password storage
- Email verification required
- OTP-based password reset

✅ **Recommendations:**
- Use HTTPS in production
- Implement rate limiting
- Add request logging
- Regular security audits
- Encrypt sensitive data at rest

---

## Integration Notes

1. **Partial Updates** - All fields are optional. Send only fields you want to update.
2. **Date Format** - Use ISO 8601 format (YYYY-MM-DD)
3. **File Uploads** - Use Cloudinary for document storage
4. **Token Refresh** - Refresh token when access token expires
5. **Error Handling** - Always check response status and error messages

---

## Example Frontend Integration

### React Example
```javascript
// Get user profile
const getProfile = async (accessToken) => {
  const response = await fetch('http://localhost:8000/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  });
  return response.json();
};

// Update profile
const updateProfile = async (accessToken, profileData) => {
  const response = await fetch('http://localhost:8000/api/user/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData)
  });
  return response.json();
};

// Upload documents
const uploadDocuments = async (accessToken, files) => {
  const formData = new FormData();
  Object.entries(files).forEach(([key, file]) => {
    if (file) formData.append(key, file);
  });

  const response = await fetch('http://localhost:8000/api/kyc/documents/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData
  });
  return response.json();
};
```

---

## Support

For issues or questions, contact: support@dootling.com
