# Customer Authentication & Profile Flow

This document describes the storefront customer authentication (OTP-based) and profile completion flow scoped per store.

## Overview
- OTP-based signup and email verification (same as user flow).
- Store-scoped login: a customer's email is unique per store (`@@unique([storeId, email])`).
- Refresh token support and password reset with OTP.
- Customer profile completion endpoint to fill remaining model fields.

## Endpoints (Storefront)
Prefix: `/api/storefront/:storeUrl`

- POST `/auth/register`
  - Body: `{ email, firstName, lastName, password }`
  - Sends 6-digit code to email; customer must verify.

- POST `/auth/verify-email`
  - Body: `{ email, code }`
  - Verifies email; returns `{ accessToken, refreshToken, customer }`.

- POST `/auth/resend-verification`
  - Body: `{ email }`

- POST `/auth/login`
  - Body: `{ email, password }`
  - Requires verified email; returns tokens.

- POST `/auth/refresh-token`
  - Body: `{ refreshToken }`
  - Returns new `{ accessToken }`.

- POST `/auth/forgot-password`
  - Body: `{ email }`
  - Sends 6-digit reset code.

- POST `/auth/verify-reset-code`
  - Body: `{ email, code }`

- POST `/auth/reset-password`
  - Body: `{ email, code, newPassword }`

- POST `/auth/logout`
  - Auth: Bearer token (customer)

- PUT `/customer/profile`
  - Auth: Bearer token (customer)
  - Body (all optional):
    - `firstName`, `lastName`, `phone`, `instagramHandle`, `additionalInfo`
    - Shipping: `shippingAddress`, `shippingCountry`, `shippingState`, `shippingCity`, `shippingZipCode`
    - Billing: `billingAddress`, `billingCountry`, `billingState`, `billingCity`, `billingZipCode`
    - `sameAsShippingAddress` (boolean)
    - `subscribedToNewsletter` (boolean)
    - `customerGroupId` (number or null)

## Data Model (Prisma Customer)
Added auth fields to `Customer`:
- `password?`, `isVerified`, `verificationCode?`, `verificationCodeExpires?`
- `resetPasswordToken?`, `resetPasswordExpires?`, `refreshToken?`, `lastActive?`

Other fields are unchanged (contact, shipping, billing, group, newsletter).

## Tokens
- Access: `JWT_SECRET`, expiry `ACCESS_TOKEN_EXPIRY` (default: 15m).
- Refresh: `JWT_REFRESH_SECRET`, expiry `REFRESH_TOKEN_EXPIRY` (default: 7d).

## Flow
1. Register → send OTP
2. Verify email → returns tokens
3. Login (if verified)
4. Complete profile (PUT `/customer/profile`)
5. Refresh token as needed
6. Forgot/Reset password via OTP

## Commands
Run after pulling schema changes:
```
npx prisma migrate dev --name customer-auth
npx prisma generate
npm run test -- --coverage
```

## Notes
- All storefront endpoints resolve `:storeUrl` using `getStoreByUrl` middleware.
- Customer JWTs are validated using `customerProtect` middleware.
- Email utilities `sendVerificationCodeEmail` and `sendPasswordResetCodeEmail` are reused.
