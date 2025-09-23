# Users Services

A TypeScript-based user profile management service for TaskFlow application.

## Features

- **Profile Management**: Complete user profile CRUD operations
- **Image Upload**: Profile image upload and management
- **User Preferences**: Theme, notifications, and language settings
- **Account Management**: Account deactivation and reactivation
- **Address Management**: Complete address information storage
- **Authentication**: JWT-based authentication middleware

## API Endpoints

### Profile Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Image Management

- `POST /api/users/profile/image` - Upload/update profile image
- `DELETE /api/users/profile/image` - Delete profile image

### Preferences

- `PUT /api/users/preferences` - Update user preferences

### Account Management

- `POST /api/users/deactivate` - Deactivate user account

### Health Check

- `GET /health` - Service health check

## Profile Data Structure

```json
{
  "email": "user@example.com",
  "username": "username",
  "firstName": "John",
  "lastName": "Doe",
  "profileImage": "/uploads/image.jpg",
  "bio": "User bio description",
  "dateOfBirth": "1990-01-01",
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
    "theme": "light",
    "language": "en"
  },
  "isActive": true,
  "lastLogin": "2025-09-23T10:00:00.000Z"
}
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file with the following variables:

```
MONGODB_URI=mongodb://127.0.0.1:27017/taskflowdb
JWT_SECRET=supersecret
PORT=4001
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. Create uploads directory:

```bash
mkdir uploads
```

## Development

1. Start development server:

```bash
npm run dev
```

2. Build for production:

```bash
npm run build
```

3. Start production server:

```bash
npm start
```

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Upload

Profile images are uploaded to the `uploads/` directory. Supported formats:

- JPEG
- PNG
- GIF
- WebP

Maximum file size: 5MB

## Environment Variables

| Variable              | Description               | Default               |
| --------------------- | ------------------------- | --------------------- |
| MONGODB_URI           | MongoDB connection string | Required              |
| JWT_SECRET            | JWT signing secret        | Required              |
| PORT                  | Server port               | 4001                  |
| CLIENT_URL            | Frontend URL for CORS     | http://localhost:3000 |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name     | Optional              |
| CLOUDINARY_API_KEY    | Cloudinary API key        | Optional              |
| CLOUDINARY_API_SECRET | Cloudinary API secret     | Optional              |

## Database Schema

The service uses the same MongoDB database as the auth service (`taskflowdb`) with a shared User collection for consistency.
