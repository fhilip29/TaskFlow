# TaskFlow Project Service API Documentation

## 🌐 Base URL

```
http://localhost:4002
```

## 🔐 Authentication

All API endpoints require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## 📊 Response Format

All API responses follow this standard format:

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    /* response data */
  },
  "timestamp": "2025-01-08T10:30:00.000Z",
  "pagination": {
    /* pagination info (when applicable) */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2025-01-08T10:30:00.000Z"
}
```

---

## 📋 Project Management Endpoints

### Create Project

**POST** `/api/projects`

Create a new project with the authenticated user as the admin.

#### Request Body

```json
{
  "name": "My Project", // Required: 3-100 characters
  "description": "Project description", // Optional: max 500 characters
  "isPublic": false, // Optional: default false
  "allowMemberInvite": true, // Optional: default true
  "maxMembers": 50 // Optional: 1-1000
}
```

#### Response

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "_id": "project-id",
    "name": "My Project",
    "description": "Project description",
    "createdBy": {
      "_id": "user-id",
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "members": [
      {
        "userId": "user-id",
        "email": "user@example.com",
        "role": "admin",
        "joinedAt": "2025-01-08T10:00:00.000Z",
        "status": "active"
      }
    ],
    "invitationCode": "ABC12345",
    "qrCodeUrl": "data:image/png;base64,...",
    "status": "active",
    "settings": {
      "isPublic": false,
      "allowMemberInvite": true,
      "maxMembers": 50
    },
    "metadata": {
      "totalTasks": 0,
      "completedTasks": 0,
      "progress": 0
    },
    "createdAt": "2025-01-08T10:00:00.000Z",
    "updatedAt": "2025-01-08T10:00:00.000Z"
  }
}
```

---

### Get User Projects

**GET** `/api/projects`

Retrieve all projects where the user is a member with pagination and filtering.

#### Query Parameters

- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10, max: 100)
- `sort` (string): Sort field (name, -name, createdAt, -createdAt, updatedAt, -updatedAt)
- `search` (string): Search in project names and descriptions
- `status` (string): Filter by status (active, archived, deleted)
- `role` (string): Filter by user's role (admin, member, viewer)

#### Example Request

```
GET /api/projects?page=1&limit=10&sort=-updatedAt&search=mobile&status=active
```

#### Response

```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": [
    {
      "_id": "project-id",
      "name": "Mobile App Project",
      "description": "Mobile application development",
      "role": "admin",
      "memberCount": 5,
      "taskCount": 15,
      "progress": 67,
      "status": "active",
      "updatedAt": "2025-01-08T09:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 3,
    "total": 25,
    "limit": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### Get Project Details

**GET** `/api/projects/:projectId`

Retrieve detailed information about a specific project.

#### Response

```json
{
  "success": true,
  "message": "Project retrieved successfully",
  "data": {
    "_id": "project-id",
    "name": "My Project",
    "description": "Project description",
    "createdBy": {
      "_id": "creator-id",
      "email": "creator@example.com",
      "fullName": "Jane Smith"
    },
    "members": [
      {
        "userId": "user-id",
        "email": "user@example.com",
        "fullName": "John Doe",
        "role": "admin",
        "joinedAt": "2025-01-08T10:00:00.000Z",
        "status": "active"
      }
    ],
    "invitationCode": "ABC12345",
    "qrCodeUrl": "data:image/png;base64,...",
    "status": "active",
    "settings": {
      "isPublic": false,
      "allowMemberInvite": true,
      "maxMembers": 50
    },
    "metadata": {
      "totalTasks": 10,
      "completedTasks": 6,
      "progress": 60
    },
    "createdAt": "2025-01-08T10:00:00.000Z",
    "updatedAt": "2025-01-08T11:30:00.000Z"
  }
}
```

---

### Update Project

**PUT** `/api/projects/:projectId`

Update project details. Only admin members can perform this operation.

#### Request Body

```json
{
  "name": "Updated Project Name", // Optional: 3-100 characters
  "description": "New description", // Optional: max 500 characters
  "status": "archived", // Optional: active, archived
  "settings": {
    "isPublic": true, // Optional
    "allowMemberInvite": false, // Optional
    "maxMembers": 100 // Optional: 1-1000
  }
}
```

#### Response

```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    /* updated project object */
  }
}
```

---

### Delete Project

**DELETE** `/api/projects/:projectId`

Soft delete a project. Only the project creator can perform this operation.

#### Response

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## 👥 Member Management Endpoints

### Invite Member

**POST** `/api/projects/:projectId/invite`

Invite a user to join the project. Admin members or regular members (if allowed by settings) can invite.

#### Request Body

```json
{
  "email": "newuser@example.com", // Required if userId not provided
  "userId": "user-object-id", // Required if email not provided
  "role": "member" // Optional: member, viewer (default: member)
}
```

#### Response

```json
{
  "success": true,
  "message": "Member invited successfully",
  "data": {
    "inviteId": "project-id"
  }
}
```

---

### Join Project

**POST** `/api/projects/join/:invitationCode`

Join a project using an invitation code.

#### Response

```json
{
  "success": true,
  "message": "Successfully joined the project",
  "data": {
    "projectId": "project-id"
  }
}
```

---

### Get Project Members

**GET** `/api/projects/:projectId/members`

Get all members of a project. Any project member can view the member list.

#### Response

```json
{
  "success": true,
  "message": "Project members retrieved successfully",
  "data": [
    {
      "userId": "user-id",
      "email": "user@example.com",
      "fullName": "John Doe",
      "profileImage": "https://example.com/avatar.jpg",
      "role": "admin",
      "joinedAt": "2025-01-08T10:00:00.000Z",
      "status": "active"
    },
    {
      "userId": "user-id-2",
      "email": "member@example.com",
      "fullName": "Jane Smith",
      "role": "member",
      "joinedAt": "2025-01-08T11:00:00.000Z",
      "status": "active"
    }
  ]
}
```

---

### Update Member Role

**PUT** `/api/projects/:projectId/members/:memberId/role`

Update a member's role. Only admin members can perform this operation.

#### Request Body

```json
{
  "role": "viewer" // Required: admin, member, viewer
}
```

#### Response

```json
{
  "success": true,
  "message": "Member role updated successfully"
}
```

---

### Remove Member

**DELETE** `/api/projects/:projectId/members/:memberId`

Remove a member from the project. Admin members can remove any member, or members can remove themselves.

#### Response

```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

---

### Leave Project

**POST** `/api/projects/:projectId/leave`

Leave a project. Project creators cannot leave their own projects.

#### Response

```json
{
  "success": true,
  "message": "Successfully left the project"
}
```

---

## 🎯 Role-Based Permissions

### Admin

- Create, read, update projects
- Delete projects (creator only)
- Invite, remove, and manage member roles
- View all project details and members

### Member

- Read project details and members
- Invite new members (if allowed by settings)
- Leave project
- Cannot modify project settings or member roles

### Viewer

- Read project details and members only
- Cannot invite members, modify project, or change roles

---

## ❌ Error Codes

### Common HTTP Status Codes

- `400 Bad Request`: Invalid request data or validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions for the operation
- `404 Not Found`: Project, member, or resource not found
- `409 Conflict`: Resource conflict (duplicate invitation, etc.)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Examples

#### Validation Error

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Project name must be at least 3 characters long"
    }
  ]
}
```

#### Permission Error

```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

#### Not Found Error

```json
{
  "success": false,
  "message": "Project not found"
}
```

---

## 🔄 Integration Points

### External Service Calls

The Project Service integrates with other TaskFlow services:

- **User Service** (port 4001): User details and validation
- **Task Service** (port 4003): Project task management
- **Notification Service**: Email/push notifications (stub)

### Webhook Support (Future)

Future versions will support webhooks for:

- Project creation/updates
- Member changes
- Status changes

---

## 📝 Rate Limiting

Default rate limits:

- **1000 requests per 15 minutes** per IP address
- Applies to all endpoints
- Returns `429 Too Many Requests` when exceeded

---

## 🧪 Testing the API

### Using cURL

#### Create Project

```bash
curl -X POST http://localhost:4002/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "A test project",
    "isPublic": false
  }'
```

#### Get Projects

```bash
curl -X GET "http://localhost:4002/api/projects?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Join Project

```bash
curl -X POST http://localhost:4002/api/projects/join/ABC12345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

Import the Postman collection: `TaskFlow-Projects.postman_collection.json` (to be created)

---

## 📖 Interactive Documentation

Visit `http://localhost:4002/api-docs` for interactive Swagger documentation where you can test all endpoints directly in your browser.
