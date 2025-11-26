# Authentication API Documentation

## Overview
Complete JWT authentication system with access/refresh tokens and OTP verification via email.

## Base URL
`http://localhost:8000/api/auth`

---

## Endpoints

### 1. Register
**POST** `/register`

Register a new user with password and send OTP verification code to email. Full name is automatically generated from firstname and lastname.

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "howDidYouFindUs": "Google Ads"
}
```

**Validation Rules:**
- `email` (required): Valid email format
- `firstname` (required): Non-empty string
- `lastname` (required): Non-empty string
- `password` (required): Minimum 8 characters
- `phone` (optional): Any format
- `howDidYouFindUs` (optional): Any string

**Response (201):**
```json
{
  "message": "Registration successful. Please check your email for verification code.",
  "userId": 1
}
```

**Error Responses:**
- `400` - Missing required fields / Invalid email format / Password too short / Email already registered
- `500` - Internal server error

---

### 2. Verify Email
**POST** `/verify-email`

Verify email with OTP code and receive access/refresh tokens. User can then login with their credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Validation Rules:**
- `email` (required): Must match registered email
- `code` (required): 6-digit OTP code sent to email

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "isVerified": true
  }
}
```

**Error Responses:**
- `400` - Missing required fields / Invalid verification code / Code expired / Email already verified
- `404` - User not found
- `500` - Internal server error

---

### 3. Change Password
**POST** `/set-password`

Change password for authenticated user. Requires access token.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "password": "NewSecurePass123!"
}
```

**Validation Rules:**
- `password` (required): Minimum 8 characters

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` - Missing password / Password too short
- `401` - Unauthorized / Invalid token
- `404` - User not found
- `500` - Internal server error

---

### 4. Resend Verification Code
**POST** `/resend-verification`

Resend OTP verification code to email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Verification code resent successfully"
}
```

---

### 5. Login
**POST** `/login`

Login with email and password. Email must be verified before login.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `email` (required): Valid registered email
- `password` (required): Correct password for the account

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "username": "johndoe1234"
  }
}
```

**Error Responses:**
- `400` - Missing required fields / Invalid credentials / Email not verified
- `500` - Internal server error

---

### 6. Refresh Access Token
**POST** `/refresh-token`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 7. Forgot Password
**POST** `/forgot-password`

Request password reset OTP code via email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset code sent to your email"
}
```

---

### 8. Verify Reset Code
**POST** `/verify-reset-code`

Verify the password reset OTP code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Reset code verified",
  "email": "user@example.com"
}
```

---

### 9. Reset Password
**POST** `/reset-password`

Reset password with verified OTP code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Validation Rules:**
- `email` (required): Valid registered email
- `code` (required): Valid reset code from email
- `newPassword` (required): Minimum 8 characters

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

**Error Responses:**
- `400` - Missing required fields / Invalid reset code / Code expired / Password too short
- `404` - User not found
- `500` - Internal server error

---

### 10. Logout
**POST** `/logout`

Logout and invalidate refresh token (requires authentication).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Token Configuration

- **Access Token Expiry:** 15 minutes (configurable via `ACCESS_TOKEN_EXPIRY`)
- **Refresh Token Expiry:** 7 days (configurable via `REFRESH_TOKEN_EXPIRY`)
- **OTP Code Expiry:** 15 minutes

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Error description"
}
```

**Common Error Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `404` - Not Found (user not found)
- `500` - Internal Server Error

---

## Authentication Flow

### Registration Flow:
1. User submits registration form with password → `POST /register`
2. System sends OTP to email
3. User enters OTP → `POST /verify-email`
4. System returns access + refresh tokens
5. User is fully authenticated and ready to use the app

### Login Flow:
1. User submits credentials → `POST /login`
2. System validates and returns tokens
3. User is authenticated

### Password Reset Flow:
1. User requests reset → `POST /forgot-password`
2. System sends OTP to email
3. User verifies OTP → `POST /verify-reset-code`
4. User submits new password → `POST /reset-password`
5. Password is updated

### Token Refresh Flow:
1. Access token expires
2. Client sends refresh token → `POST /refresh-token`
3. System returns new access token
4. Client continues with new token

---

## Protected Routes

To access protected routes, include the access token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

Example using fetch:
```javascript
fetch('http://localhost:8000/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
```
