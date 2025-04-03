# Profile Registration and Introduction Status Documentation

## Overview

This document outlines the profile registration process and introduction status feature in the Entrify application. The system allows users to register profiles, administrators to approve registrations, and track whether users have been introduced at events.

## Features

### Profile Registration

Users can register their profiles with the following information:
- Personal details (name, email, mobile number, etc.)
- Birth details (date of birth, birth time, birthplace)
- Education and other background information
- Photo upload
- First and Second Gotra
- Annual Income and Expected Income
- Attendee Count (max 10)
- Gender

### Approval System

Administrators can:
- View registered profiles
- Approve profiles by scanning QR codes
- Set the number of guests (attendee count) for each profile
- Mark whether a user has been introduced at an event

## Implementation

### Database Schema

The `ProfileCsv` model in the Prisma schema includes:

```prisma
model ProfileCsv {
  // Other fields...
  attendeeCount         Int?
  approvalStatus        Boolean  @default(false)
  introductionStatus    Boolean  @default(false)
}
```

### Server Actions

We've implemented the following server actions to interact with user profiles:

1. **registerProfile.ts**
   - Handles the registration of new profiles
   - Validates form data
   - Uploads photos to Cloudinary
   - Sends confirmation emails with QR codes

2. **getProfile.ts**
   - Retrieves a profile by Anubandh ID
   - Returns all profile details including introduction status

3. **getApprovalStatus.ts**
   - Checks if a profile has been approved
   - Returns approval status, attendee count, and introduction status

4. **updateApprovalStatus.ts**
   - Updates a profile's approval status
   - Sets attendee count
   - Records whether the user has been introduced at an event

### Components

1. **RegistrationForm.tsx**
   - Form for users to register their profiles
   - Includes all necessary fields
   - Validates data before submission

2. **ScannedDataDisplay.tsx**
   - Displays profile data after scanning a QR code
   - Allows administrators to:
     - Set guest count (1-10)
     - Mark whether the user has been introduced
     - Approve the profile

## API Routes (Legacy)

For backward compatibility, we maintain API routes that duplicate server action functionality:

- **/api/userEntry**
  - GET: Retrieves a user's approval status
  - POST: Updates a user's approval status, attendee count, and introduction status

## Best Practices

1. **Server Actions vs API Routes**
   - Prefer server actions for new functionality
   - API routes are maintained for backward compatibility

2. **Form Validation**
   - Use Zod for form validation
   - Validate on both client and server side

3. **User Experience**
   - Provide clear feedback for user actions
   - Use toast notifications for success/error messages

## Troubleshooting

Common issues and solutions:

1. **Type Errors**
   - Ensure that types match between form data and database fields
   - Convert number inputs to strings when needed for API calls

2. **Database Errors**
   - Check database schema for required fields
   - Ensure Prisma schema is in sync with database
   - Run migrations when schema changes

3. **Server/Client Mismatch**
   - Server components cannot use client-side hooks
   - Use "use client" directive appropriately
   - Move Node.js-specific code to server actions or API routes 