# Password Reset Functionality

This document describes the password reset functionality implemented in AAA Services.

## Features

- **Forgot Password**: Users can request a password reset by entering their email
- **Secure Reset Tokens**: Cryptographically secure tokens with 1-hour expiration
- **Email Integration**: Uses Google SMTP to send password reset emails
- **Token Verification**: Backend validates reset tokens before allowing password changes
- **Security**: Tokens are hashed and stored securely in the database

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Email Configuration (Google SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-secret-key

# MongoDB Connection
MONGO_URI=your-mongodb-connection-string
```

### Google SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password in `EMAIL_PASSWORD`

## API Endpoints

### 1. Forgot Password
```
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset link has been sent to your email.",
  "note": "Please check your email and follow the instructions to reset your password."
}
```

### 2. Reset Password
```
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "new-password"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully",
  "note": "You can now login with your new password"
}
```

### 3. Verify Reset Token
```
GET /api/auth/verify-reset-token/:token
```

**Response:**
```json
{
  "message": "Reset token is valid",
  "note": "You can proceed to reset your password"
}
```

## Frontend Routes

- `/forgot-password` - Forgot password form
- `/reset-password?token=xxx` - Reset password form

## Security Features

1. **Token Hashing**: Reset tokens are hashed using SHA-256 before storage
2. **Token Expiration**: Tokens expire after 1 hour
3. **One-time Use**: Tokens are cleared after successful password reset
4. **Email Validation**: Only sends reset emails to registered users
5. **Rate Limiting**: Protected by Express rate limiting middleware

## Database Schema Updates

The User model now includes:

```javascript
resetToken: {
  type: String,
  default: null
},
resetTokenExpiry: {
  type: Date,
  default: null
}
```

## User Methods

### `generatePasswordResetToken()`
Generates a secure reset token and sets expiry time.

### `clearPasswordResetToken()`
Clears the reset token and expiry time.

### `isResetTokenValid(token)`
Validates if a reset token is valid and not expired.

## Email Templates

The system sends professionally formatted HTML emails with:
- Company branding
- Clear instructions
- Security warnings
- Responsive design

## Testing

### Development Mode
In development, the reset URL is also returned in the API response for testing purposes.

### Production Mode
In production, only the email is sent, and no reset URL is exposed in the API response.

## Error Handling

- Invalid email format
- User not found (generic response for security)
- Email sending failures
- Invalid/expired tokens
- Password validation errors

## Troubleshooting

### Common Issues

1. **Email not sending**: Check SMTP credentials and app password
2. **Token validation failing**: Ensure token hasn't expired
3. **Database connection**: Verify MongoDB connection
4. **Environment variables**: Check all required env vars are set

### Logs

Check server console for:
- Email sending success/failure
- Token generation
- Password reset attempts
- Validation errors

## Future Enhancements

- SMS-based password reset
- Multiple email templates
- Password strength requirements
- Account lockout after failed attempts
- Audit logging for security events
