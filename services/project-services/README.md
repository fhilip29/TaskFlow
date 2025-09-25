# TaskFlow Project Service

A NodeJS microservice for managing projects and team collaboration in the TaskFlow platform.

## 🚀 Features

### Project Management

- ✅ Create, read, update, and delete projects
- ✅ Project status management (active, archived, deleted)
- ✅ Project settings (public/private, member permissions, max members)
- ✅ Advanced search and filtering
- ✅ Pagination support

### Team Management

- ✅ Invite members by email or user ID
- ✅ Role-based access control (admin, member, viewer)
- ✅ Unique invitation codes for each project
- ✅ QR code generation for easy project joining
- ✅ Member role management
- ✅ Member removal and self-removal

### Security & Permissions

- ✅ JWT authentication
- ✅ Role-based permissions enforcement
- ✅ Request validation with Joi
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers

### Integration

- ✅ User Service integration stubs
- ✅ Task Service integration stubs
- ✅ Notification Service integration stubs
- ✅ MongoDB with Mongoose ODM
- ✅ Swagger API documentation

## 📋 Prerequisites

- Node.js v18+
- MongoDB v5+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd services/project-services
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment setup:**
   Copy `.env.example` to `.env` and configure:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/taskflowdb
   JWT_SECRET=your-super-secret-jwt-key
   PORT=4002
   NODE_ENV=development
   USER_SERVICE_URL=http://localhost:4001
   TASK_SERVICE_URL=http://localhost:4003
   FRONTEND_URL=http://localhost:3000
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

## 🚦 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 API Documentation

Once the service is running, visit:

- **API Docs:** `http://localhost:4002/api-docs`
- **Health Check:** `http://localhost:4002`
- **Service Info:** `http://localhost:4002/api/info`

## 🔧 API Endpoints

### Projects

- `POST /api/projects` - Create new project
- `GET /api/projects` - Get user's projects (with pagination/filtering)
- `GET /api/projects/:projectId` - Get project details
- `PUT /api/projects/:projectId` - Update project (admin only)
- `DELETE /api/projects/:projectId` - Delete project (creator only)

### Members

- `POST /api/projects/:projectId/invite` - Invite member to project
- `POST /api/projects/join/:invitationCode` - Join project via invitation code
- `GET /api/projects/:projectId/members` - Get project members
- `PUT /api/projects/:projectId/members/:memberId/role` - Update member role (admin only)
- `DELETE /api/projects/:projectId/members/:memberId` - Remove member (admin or self)
- `POST /api/projects/:projectId/leave` - Leave project

## 🏗️ Architecture

### Project Structure

```
src/
├── config/           # Database configuration
├── controllers/      # Request handlers
├── middleware/       # Authentication & validation
├── models/           # MongoDB schemas
├── routes/           # API route definitions
├── services/         # External service integrations
├── types/            # TypeScript type definitions
├── utils/            # Helper functions and validation
└── server.ts         # Application entry point
```

### Key Components

#### Project Model

- **Schema:** Comprehensive project schema with members, settings, metadata
- **Methods:** Role checking, permission validation, progress calculation
- **Indexes:** Optimized for queries on members, status, and search
- **Validation:** Joi-based request validation

#### Authentication

- **JWT Protection:** All routes require valid JWT tokens
- **Role-Based Access:** Fine-grained permissions (admin, member, viewer)
- **Project Membership:** Automatic membership validation

#### Integration Services

- **User Service:** Fetch user details, validate users
- **Task Service:** Get project tasks, update task status
- **Notification Service:** Send invitations, updates, alerts

## 🎯 Role-Based Permissions

### Admin

- All project management operations
- Member management (invite, remove, role changes)
- Project settings management
- Project deletion (creator only)

### Member

- View project details and members
- Invite new members (if allowed by settings)
- Leave project
- Update own profile

### Viewer

- View project details and members only
- Cannot invite members or modify project

## 🔄 Service Integration

### User Service (`localhost:4001`)

```typescript
// Get user by ID
UserService.getUserById(userId);

// Get user by email
UserService.getUserByEmail(email);

// Get multiple users
UserService.getUsersByIds(userIds);
```

### Task Service (`localhost:4003`)

```typescript
// Get project tasks
TaskService.getProjectTasks(projectId);

// Get task statistics
TaskService.getProjectTaskStats(projectId);

// Update task status when project changes
TaskService.updateProjectTasks(projectId, status);
```

### Notification Service (Stub)

```typescript
// Send project invitation
NotificationService.sendProjectInvitation(data);

// Send project updates
NotificationService.sendProjectUpdate(data);

// Send deletion notification
NotificationService.sendProjectDeletion(data);
```

## 🧪 Testing

The service includes comprehensive unit tests for:

- **Models:** Project schema validation and methods
- **Controllers:** API endpoint functionality
- **Services:** Integration service stubs
- **Utilities:** Helper functions and validation

### Test Structure

```
tests/
├── setup.ts              # Test environment setup
├── models/               # Model tests
├── controllers/          # Controller tests
├── services/             # Service tests
└── utils/                # Utility tests
```

### Coverage Goals

- **Statements:** 90%+
- **Branches:** 85%+
- **Functions:** 90%+
- **Lines:** 90%+

## 🔐 Security Features

- **Helmet:** Security headers protection
- **Rate Limiting:** API request throttling
- **CORS:** Cross-origin request control
- **Input Validation:** Joi schema validation
- **Error Handling:** Secure error responses
- **JWT Verification:** Token-based authentication

## 📊 Performance Optimization

- **Database Indexes:** Optimized queries for large datasets
- **Pagination:** Efficient data loading
- **Connection Pooling:** MongoDB connection management
- **Caching Ready:** Structured for Redis integration
- **Query Optimization:** Lean queries and projections

## 🚀 Deployment

### Docker Support (Future)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4002
CMD ["npm", "start"]
```

### Environment Variables

```env
# Required
MONGODB_URI=mongodb://localhost:27017/taskflowdb
JWT_SECRET=your-secret-key
PORT=4002

# Optional
NODE_ENV=production
USER_SERVICE_URL=http://user-service:4001
TASK_SERVICE_URL=http://task-service:4003
FRONTEND_URL=https://taskflow.app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain test coverage above 90%
- Update documentation for new features
- Follow conventional commit messages
- Validate with ESLint and Prettier

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**

```bash
# Check MongoDB service
brew services start mongodb-community
# or
sudo systemctl start mongod
```

**Port Already in Use:**

```bash
# Kill process using port 4002
lsof -ti:4002 | xargs kill
```

**JWT Secret Error:**

```bash
# Ensure JWT_SECRET is set in .env
echo "JWT_SECRET=your-super-secret-key" >> .env
```

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👥 Authors

- **TaskFlow Development Team**

## 🙏 Acknowledgments

- Express.js for the web framework
- Mongoose for MongoDB integration
- Joi for validation
- Swagger for API documentation
- Jest for testing framework
