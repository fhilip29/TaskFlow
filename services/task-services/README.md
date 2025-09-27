# TaskFlow Task Service

A comprehensive microservice for task management in the TaskFlow project management system. This service handles all task-related operations including creation, assignment, status management, and activity tracking.

## Features

### Core Task Management

- ✅ Create, read, update, and delete tasks
- ✅ Task assignment and reassignment
- ✅ Status transitions with state machine validation
- ✅ Priority management (low, medium, high, critical)
- ✅ Due date tracking
- ✅ Label/tag system
- ✅ Watcher system for notifications

### Status Management

- ✅ State machine enforced transitions:
  - `backlog` → `in_progress`, `archived`
  - `in_progress` → `blocked`, `done`, `archived`
  - `blocked` → `in_progress`, `archived`
  - `done` → `archived`, `in_progress`
  - `archived` → (no transitions allowed)

### Activity Logging

- ✅ Comprehensive activity tracking for all task changes
- ✅ Append-only activity log with actor tracking
- ✅ Detailed change history with before/after snapshots

### Permission System

- ✅ Role-based access control:
  - **Admin**: Full task management (create, edit, assign, delete)
  - **Member**: View tasks, change status if assigned
  - **Viewer**: Read-only access
- ✅ Project membership validation
- ✅ Assignee must be project member validation

### Advanced Features

- ✅ Text search across task titles and descriptions
- ✅ Advanced filtering (status, assignee, priority, labels, due date)
- ✅ Pagination with metadata
- ✅ Soft delete for data integrity
- ✅ Optimized database queries with proper indexing

## API Endpoints

### Task CRUD Operations

#### Create Task

```http
POST /api/projects/{projectId}/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication system",
  "priority": "high",
  "assignee": "userId123",
  "dueDate": "2024-12-31T23:59:59Z",
  "labels": ["authentication", "backend"]
}
```

#### List Tasks

```http
GET /api/projects/{projectId}/tasks?status=in_progress&assignee=userId123&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**

- `status`: Filter by task status (single value or comma-separated)
- `assignee`: Filter by assignee ID (single value or comma-separated)
- `priority`: Filter by priority level
- `label`: Filter by labels
- `search`: Text search in title and description
- `dueDateFrom`: Filter tasks due after this date
- `dueDateTo`: Filter tasks due before this date
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (-createdAt, title, priority, dueDate)

#### Get Single Task

```http
GET /api/projects/{projectId}/tasks/{taskId}
Authorization: Bearer {token}
```

#### Update Task

```http
PATCH /api/projects/{projectId}/tasks/{taskId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "critical",
  "dueDate": "2024-12-25T23:59:59Z",
  "labels": ["urgent", "bug-fix"]
}
```

### Task Status Management

#### Update Task Status

```http
PATCH /api/projects/{projectId}/tasks/{taskId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress"
}
```

### Task Assignment

#### Assign/Unassign Task

```http
PATCH /api/projects/{projectId}/tasks/{taskId}/assignee
Authorization: Bearer {token}
Content-Type: application/json

{
  "assignee": "userId123"  // or null to unassign
}
```

### Task Management

#### Delete Task (Soft Delete)

```http
DELETE /api/projects/{projectId}/tasks/{taskId}
Authorization: Bearer {token}
```

### Activity Tracking

#### Get Task Activity Log

```http
GET /api/projects/{projectId}/tasks/{taskId}/activity?page=1&limit=50
Authorization: Bearer {token}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "taskId123",
    "projectId": "projectId123",
    "title": "Task title",
    "description": "Task description",
    "status": "backlog",
    "priority": "medium",
    "creator": {
      "_id": "userId123",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "assignee": {
      "_id": "userId456",
      "fullName": "Jane Smith",
      "email": "jane@example.com"
    },
    "dueDate": "2024-12-31T23:59:59.000Z",
    "labels": ["backend", "api"],
    "watchers": ["userId123", "userId456"],
    "isDeleted": false,
    "lastStatusChangeAt": "2023-12-01T10:00:00.000Z",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {
      "field": "title",
      "received": ""
    }
  }
}
```

## Error Codes

- `UNAUTHORIZED`: Authentication required or invalid token
- `FORBIDDEN`: Insufficient permissions for the operation
- `NOT_FOUND`: Task, project, or user not found
- `VALIDATION_ERROR`: Invalid input data
- `INVALID_STATUS_TRANSITION`: Attempted invalid status change
- `ASSIGNEE_NOT_PROJECT_MEMBER`: Assignee is not a project member
- `INTERNAL_ERROR`: Server error

## Installation & Setup

1. **Install Dependencies**

   ```bash
   cd services/task-services
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

3. **Database Setup**

   ```bash
   # Ensure MongoDB is running
   # The service will create collections and indexes automatically
   ```

4. **Run Development Server**

   ```bash
   npm run dev
   ```

5. **Run Tests**

   ```bash
   npm test
   npm run test:coverage
   ```

6. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

```env
# Server Configuration
PORT=3003
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/taskflow_tasks

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Service URLs (for microservice communication)
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
PROJECT_SERVICE_URL=http://localhost:3004

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Database Schema

### Tasks Collection

```javascript
{
  _id: ObjectId,
  projectId: ObjectId, // Reference to Project
  title: String, // Required, max 200 chars
  description: String, // Optional, max 2000 chars
  status: String, // enum: backlog, in_progress, blocked, done, archived
  priority: String, // enum: low, medium, high, critical
  creator: ObjectId, // Reference to User, required
  assignee: ObjectId, // Reference to User, optional
  dueDate: Date, // Optional
  labels: [String], // Array of labels, max 50 chars each
  watchers: [ObjectId], // Array of User references
  isDeleted: Boolean, // Soft delete flag
  lastStatusChangeAt: Date,
  metadata: Mixed, // Additional data
  createdAt: Date,
  updatedAt: Date
}
```

### Task Activities Collection

```javascript
{
  _id: ObjectId,
  taskId: ObjectId, // Reference to Task
  projectId: ObjectId, // Reference to Project
  actor: ObjectId, // Reference to User who made the change
  action: String, // enum: create, update_status, assign, edit, etc.
  from: Mixed, // Previous state snapshot
  to: Mixed, // New state snapshot
  metadata: Mixed, // Additional context
  createdAt: Date
}
```

## Database Indexes

### Tasks Collection

- `{ projectId: 1, status: 1, priority: 1 }` - Optimized filtering
- `{ assignee: 1, status: 1 }` - Assignee queries
- `{ projectId: 1, status: 1, dueDate: 1 }` - Due date filtering
- `{ projectId: 1, isDeleted: 1, updatedAt: -1 }` - List queries
- `{ title: "text", description: "text" }` - Text search
- `{ labels: 1 }` - Label filtering

### Task Activities Collection

- `{ taskId: 1, createdAt: -1 }` - Task activity queries
- `{ projectId: 1, createdAt: -1 }` - Project activity queries
- `{ actor: 1, createdAt: -1 }` - User activity queries

## Performance Considerations

1. **Query Optimization**

   - Uses `.lean()` for list queries to improve performance
   - Selective population of referenced documents
   - Proper compound indexes for common query patterns

2. **Pagination**

   - All list endpoints support pagination
   - Configurable limits with reasonable defaults
   - Cursor-based pagination for large datasets

3. **Caching Strategy**
   - Ready for Redis integration for frequently accessed data
   - Activity logs are append-only for optimal write performance

## Testing

The service includes comprehensive test coverage:

- **Unit Tests**: Service layer business logic
- **Integration Tests**: Database operations and API endpoints
- **Performance Tests**: Query optimization and load testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- taskService.test.ts

# Watch mode for development
npm run test:watch
```

## Security Features

1. **Authentication**: JWT-based authentication required for all endpoints
2. **Authorization**: Role-based permissions with project context
3. **Input Validation**: Comprehensive validation using Zod schemas
4. **SQL Injection Protection**: MongoDB with proper ObjectId validation
5. **Rate Limiting**: Ready for rate limiting middleware integration
6. **CORS**: Configurable cross-origin resource sharing

## Future Enhancements

### Phase 2 Features (Planned)

- [ ] Real-time updates via WebSocket
- [ ] Task comments system
- [ ] File attachments
- [ ] Task dependencies
- [ ] Recurring tasks
- [ ] Time tracking
- [ ] Custom fields
- [ ] Bulk operations
- [ ] Advanced notifications
- [ ] Task templates

### Performance & Scaling

- [ ] Redis caching layer
- [ ] Database read replicas
- [ ] Horizontal scaling support
- [ ] Advanced analytics and reporting
- [ ] Task import/export functionality

## Contributing

1. Follow the established code style and patterns
2. Add tests for new features
3. Update documentation for API changes
4. Use proper TypeScript types
5. Follow the existing error handling patterns

## License

Private - TaskFlow Project
