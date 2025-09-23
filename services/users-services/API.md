# Users Service API Documentation

## Base URL

```
http://localhost:4001/api/users
```

## Authentication

All endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Endpoints

### 1. Get User Profile

**GET** `/profile`

**Response:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "profileImage": "/uploads/profile-123456789.jpg",
    "bio": "Software developer passionate about technology",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "preferences": {
      "notifications": true,
      "theme": "dark",
      "language": "en"
    },
    "isActive": true,
    "lastLogin": "2025-09-23T10:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-09-23T10:00:00.000Z"
  }
}
```

### 2. Update User Profile

**PUT** `/profile`

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio description",
  "dateOfBirth": "1990-01-15",
  "phone": "+1234567890",
  "address": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210",
    "country": "USA"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated user profile object
  }
}
```

### 3. Upload Profile Image

**POST** `/profile/image`

**Content-Type:** `multipart/form-data`

**Form Data:**

- `profileImage`: Image file (JPEG, PNG, GIF, WebP, max 5MB)

**Response:**

```json
{
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "profileImage": "/uploads/profile-123456789.jpg"
  }
}
```

### 4. Delete Profile Image

**DELETE** `/profile/image`

**Response:**

```json
{
  "success": true,
  "message": "Profile image deleted successfully"
}
```

### 5. Update User Preferences

**PUT** `/preferences`

**Request Body:**

```json
{
  "preferences": {
    "notifications": false,
    "theme": "dark",
    "language": "es"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    "preferences": {
      "notifications": false,
      "theme": "dark",
      "language": "es"
    }
  }
}
```

### 6. Deactivate Account

**POST** `/deactivate`

**Response:**

```json
{
  "success": true,
  "message": "Account deactivated successfully"
}
```

### 7. Health Check

**GET** `/health`

**Response:**

```json
{
  "success": true,
  "message": "Users service is running",
  "timestamp": "2025-09-23T10:00:00.000Z"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation error",
  "error": "Invalid date format for dateOfBirth"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Access token is required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

## Example Usage with cURL

### Get Profile

```bash
curl -X GET http://localhost:4001/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Profile

```bash
curl -X PUT http://localhost:4001/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Updated bio"
  }'
```

### Upload Profile Image

```bash
curl -X POST http://localhost:4001/api/users/profile/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profileImage=@/path/to/image.jpg"
```

### Update Preferences

```bash
curl -X PUT http://localhost:4001/api/users/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "language": "en"
    }
  }'
```

## Notes

1. All dates should be in ISO 8601 format
2. Profile images are stored locally in the `uploads/` directory
3. Maximum file size for images is 5MB
4. Supported image formats: JPEG, PNG, GIF, WebP
5. The service uses the same MongoDB database as the auth service
6. User preferences have default values if not specified
