# TaskFlow Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Git

## Getting Started

### 1. Clone and Setup

```bash
cd TaskFlow
```

### 2. Setup Environment Variables

#### Frontend (.env.local)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_USERS_API_URL=http://localhost:4001
```

#### Auth Service (.env)

Create `services/auth-services/.env`:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/taskflow-auth
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=http://localhost:3000
```

#### Users Service (.env)

Create `services/users-services/.env`:

```env
PORT=4001
MONGODB_URI=mongodb://localhost:27017/taskflow-users
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=http://localhost:3000
```

#### Project Service (.env)

Create `services/project-services/.env`:

```env
PORT=4002
MONGODB_URI=mongodb://localhost:27017/taskflow-projects
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=http://localhost:3000
```

### 3. Install Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Auth Service

```bash
cd services/auth-services
npm install
```

#### Users Service

```bash
cd services/users-services
npm install
```

#### Project Service

```bash
cd services/project-services
npm install
```

### 4. Build Services

#### Auth Service

```bash
cd services/auth-services
npm run build
```

#### Users Service

```bash
cd services/users-services
npm run build
```

#### Project Service

```bash
cd services/project-services
npm run build
```

### 5. Create Uploads Directory for Users Service

```bash
mkdir services/users-services/uploads
```

### 6. Start Services

#### Start in Development Mode (Recommended)

**Terminal 1 - Auth Service:**

```bash
cd services/auth-services
npm run dev
```

**Terminal 2 - Users Service:**

```bash
cd services/users-services
npm run dev
```

**Terminal 3 - Project Service:**

```bash
cd services/project-services
npm run dev
```

**Terminal 4 - Frontend:**

```bash
cd frontend
npm run dev
```

### 7. Verify Services are Running

Visit these URLs to check if services are up:

- Auth Service: http://localhost:4000/health
- Users Service: http://localhost:4001/health
- Project Service: http://localhost:4002/health
- Frontend: http://localhost:3000

### 8. Test the Settings Page

1. Register a new user account
2. Login to the application
3. Navigate to Dashboard > Settings
4. Try updating profile information
5. Try uploading a profile picture
6. Verify changes are saved in the database

## Troubleshooting

### Common Issues

1. **Backend Connection Issues**

   - Ensure all services are running on their correct ports
   - Check MongoDB connection
   - Verify environment variables

2. **File Upload Issues**

   - Ensure `uploads` directory exists in `services/users-services/`
   - Check file permissions
   - Verify file size limits (5MB max)

3. **CORS Issues**
   - Verify CORS origins in backend services
   - Check if frontend URL matches CORS configuration

### Health Check Commands

```bash
# Check Auth Service
curl http://localhost:4000/health

# Check Users Service
curl http://localhost:4001/health

# Check Project Service
curl http://localhost:4002/health
```

### Database Verification

Connect to MongoDB and check if data is being saved:

```bash
# Connect to MongoDB
mongosh

# Switch to users database
use taskflow-users

# Check users collection
db.users.find().pretty()
```

## Important Notes

1. **Settings Page Changes:**

   - Only shows success notification when data actually changes
   - Primary button uses proper Tailwind/CSS styling
   - Profile image updates are saved to database
   - Form tracks changes to prevent unnecessary saves

2. **Security:**

   - Change JWT_SECRET in production
   - Use environment variables for sensitive data
   - Enable HTTPS in production

3. **File Uploads:**
   - Images are stored in `services/users-services/uploads/`
   - Maximum file size is 5MB
   - Supported formats: JPG, PNG, GIF

## Production Deployment

For production, update the environment variables to use:

- Production database URLs
- Production frontend URLs
- Secure JWT secrets
- HTTPS endpoints
