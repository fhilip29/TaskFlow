# TaskFlow Task Service API Documentation

## Overview

The Task Service provides comprehensive task management functionality for the TaskFlow project management system. This RESTful API handles task creation, assignment, status management, and activity tracking with role-based permissions.

**Base URL**: `http://localhost:3003/api`
**Authentication**: JWT Bearer Token required for all endpoints

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error context (optional)"
  }
}
```

### Error Codes

- `UNAUTHORIZED` - Authentication required or token invalid
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `INVALID_STATUS_TRANSITION` - Invalid task status change
- `ASSIGNEE_NOT_PROJECT_MEMBER` - Assignee not a project member
- `INTERNAL_ERROR` - Server error

## Endpoints

### 1. Create Task

Create a new task in a project.

**Endpoint**: `POST /projects/{projectId}/tasks`

**Permissions**: Project admin only

**Request Body**:

```json
{
  "title": "string (required, max 200 chars)",
  "description": "string (optional, max 2000 chars)",
  "priority": "low|medium|high|critical (optional, default: medium)",
  "assignee": "string (optional, user ID)",
  "dueDate": "string (optional, ISO date)",
  "labels": ["string"] (optional, max 10 labels, 50 chars each)
}
```

**Example Request**:

```bash
curl -X POST "http://localhost:3003/api/projects/64f9a1234567890abcdef123/tasks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication with role management",
    "priority": "high",
    "assignee": "64f9a1234567890abcdef456",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "labels": ["authentication", "security", "backend"]
  }'
```

**Response**:

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "64f9a1234567890abcdef789",
    "projectId": "64f9a1234567890abcdef123",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication with role management",
    "status": "backlog",
    "priority": "high",
    "creator": {
      "_id": "64f9a1234567890abcdef001",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "assignee": {
      "_id": "64f9a1234567890abcdef456",
      "fullName": "Jane Smith",
      "email": "jane@example.com"
    },
    "dueDate": "2024-12-31T23:59:59.000Z",
    "labels": ["authentication", "security", "backend"],
    "watchers": ["64f9a1234567890abcdef001", "64f9a1234567890abcdef456"],
    "isDeleted": false,
    "lastStatusChangeAt": "2023-12-01T10:00:00.000Z",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

---

### 2. List Tasks

Retrieve tasks with filtering and pagination.

**Endpoint**: `GET /projects/{projectId}/tasks`

**Permissions**: Any project member

**Query Parameters**:

- `status` - Filter by status (backlog, in_progress, blocked, done, archived)
- `assignee` - Filter by assignee user ID
- `priority` - Filter by priority (low, medium, high, critical)
- `label` - Filter by label name
- `search` - Text search in title and description
- `dueDateFrom` - Filter tasks due after this date (ISO format)
- `dueDateTo` - Filter tasks due before this date (ISO format)
- `isDeleted` - Include deleted tasks (default: false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field: createdAt, updatedAt, title, priority, dueDate (prefix with - for desc)

**Example Request**:

```bash
curl -X GET "http://localhost:3003/api/projects/64f9a1234567890abcdef123/tasks?status=in_progress,blocked&assignee=64f9a1234567890abcdef456&priority=high&page=1&limit=10&sort=-createdAt" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:

```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "_id": "64f9a1234567890abcdef789",
      "projectId": "64f9a1234567890abcdef123",
      "title": "Implement user authentication",
      "status": "in_progress",
      "priority": "high",
      "creator": {
        "_id": "64f9a1234567890abcdef001",
        "fullName": "John Doe"
      },
      "assignee": {
        "_id": "64f9a1234567890abcdef456",
        "fullName": "Jane Smith"
      },
      "dueDate": "2024-12-31T23:59:59.000Z",
      "labels": ["authentication", "security"],
      "lastStatusChangeAt": "2023-12-01T14:30:00.000Z",
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 3. Get Single Task

Retrieve a specific task by ID.

**Endpoint**: `GET /projects/{projectId}/tasks/{taskId}`

**Permissions**: Any project member

**Example Request**:

```bash
curl -X GET "http://localhost:3003/api/projects/64f9a1234567890abcdef123/tasks/64f9a1234567890abcdef789" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:

```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "_id": "64f9a1234567890abcdef789",
    "projectId": "64f9a1234567890abcdef123",
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication with role management",
    "status": "in_progress",
    "priority": "high",
    "creator": {
      "_id": "64f9a1234567890abcdef001",
      "fullName": "John Doe",
      "email": "john@example.com",
      "profileImage": "https://example.com/avatar.jpg"
    },
    "assignee": {
      "_id": "64f9a1234567890abcdef456",
      "fullName": "Jane Smith",
      "email": "jane@example.com",
      "profileImage": "https://example.com/avatar2.jpg"
    },
    "dueDate": "2024-12-31T23:59:59.000Z",
    "labels": ["authentication", "security", "backend"],
    "watchers": ["64f9a1234567890abcdef001", "64f9a1234567890abcdef456"],
    "isDeleted": false,
    "lastStatusChangeAt": "2023-12-01T14:30:00.000Z",
    "metadata": {},
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T14:30:00.000Z"
  }
}
```

---

### 4. Update Task

Update task fields (title, description, priority, due date, labels).

**Endpoint**: `PATCH /projects/{projectId}/tasks/{taskId}`

**Permissions**: Project admin only

**Request Body**:

```json
{
  "title": "string (optional, max 200 chars)",
  "description": "string (optional, max 2000 chars, null to clear)",
  "priority": "low|medium|high|critical (optional)",
  "dueDate": "string (optional, ISO date, null to clear)",
  "labels": ["string"] (optional, replaces all labels)
}
```

**Example Request**:

```bash
curl -X PATCH "http://localhost:3003/api/projects/64f9a1234567890abcdef123/tasks/64f9a1234567890abcdef789" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement OAuth authentication",
    "description": "Updated: Add OAuth2 authentication with Google and GitHub",
    "priority": "critical",
    "dueDate": "2024-11-30T23:59:59.000Z",
    "labels": ["authentication", "oauth", "security", "integration"]
  }'
```

**Response**:

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "64f9a1234567890abcdef789",
    "title": "Implement OAuth authentication",
    "description": "Updated: Add OAuth2 authentication with Google and GitHub",
    "priority": "critical",
    "dueDate": "2024-11-30T23:59:59.000Z",
    "labels": ["authentication", "oauth", "security", "integration"],
    "updatedAt": "2023-12-01T15:45:00.000Z"
    // ... other fields
  }
}
```

---

### 5. Update Task Status

Change task status with validation.

**Endpoint**: `PATCH /projects/{projectId}/tasks/{taskId}/status`

**Permissions**: Project admin OR task assignee

**Request Body**:

```json
{
  "status": "backlog|in_progress|blocked|done|archived"
}
```

**Valid Status Transitions**:

- `backlog` → `in_progress`, `archived`
- `in_progress` → `blocked`, `done`, `archived`
- `blocked` → `in_progress`, `archived`
- `done` → `archived`, `in_progress`
- `archived` → (no transitions allowed)

**Example Request**:

```bash
curl -X PATCH "http://localhost:3003/api/projects/64f9a1234567890abcdef123/tasks/64f9a1234567890abcdef789/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done"
  }'
```

**Response**:

```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "_id": "64f9a1234567890abcdef789",
    "status": "done",
    "lastStatusChangeAt": "2023-12-01T16:00:00.000Z",
    "updatedAt": "2023-12-01T16:00:00.000Z"
    // ... other fields
  }
}
```

---

### 6. Assign Task

Assign or unassign a task to/from a user.

**Endpoint**: `PATCH /projects/{projectId}/tasks/{taskId}/assignee`

**Permissions**: Project admin only

**Request Body**:

```json
{
  "assignee": "string (user ID, null to unassign)"
}
```

**Example Request - Assign**:

```bash
curl -X PATCH "http://localhost:3003/api/projects/64f9a1234567890abcdef123/tasks/64f9a1234567890abcdef789/assignee" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignee": "64f9a1234567890abcdef999"
  }'
```

**Example Request - Unassign**:

```bash
curl -X PATCH "http://localhost:3003/api/projects/64f9a1234567890abcdef123/tasks/64f9a1234567890abcdef789/assignee" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignee": null
  }'
```

**Response**:

```json
{
  "success": true,
  "message": "Task assigned successfully",
  "data": {
    "_id": "64f9a1234567890abcdef789",
    "assignee": {
      "_id": "64f9a1234567890abcdef999",
      "fullName": "Bob Wilson",
      "email": "bob@example.com"
    },
    "watchers": ["64f9a1234567890abcdef001", "64f9a1234567890abcdef999"],
    "updatedAt": "2023-12-01T16:15:00.000Z"
    // ... other fields
  }
}
```

---

### 7. Delete Task

Soft delete a task (sets isDeleted flag).

**Endpoint**: `DELETE /projects/{projectId}/tasks/{taskId}`

**Permissions**: Project admin only

**Example Request**:

```bash
curl -X DELETE "http://localhost:3003/api/projects/64f9a1234567890abcdef123/tasks/64f9a1234567890abcdef789" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### 8. Get Task Activity

Retrieve task activity log with pagination.

**Endpoint**: `GET /projects/{projectId}/tasks/{taskId}/activity`

**Permissions**: Any project member

**Query Parameters**:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 100)

**Example Request**:

```bash
curl -X GET "http://localhost:3003/api/projects/64f9a1234567890abcdef123/tasks/64f9a1234567890abcdef789/activity?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:

```json
{
  "success": true,
  "message": "Task activity retrieved successfully",
  "data": [
    {
      "_id": "64f9a1234567890abcdef111",
      "taskId": "64f9a1234567890abcdef789",
      "projectId": "64f9a1234567890abcdef123",
      "actor": {
        "_id": "64f9a1234567890abcdef456",
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "profileImage": "https://example.com/avatar.jpg"
      },
      "action": "update_status",
      "from": {
        "status": "in_progress"
      },
      "to": {
        "status": "done"
      },
      "metadata": {
        "timestamp": "2023-12-01T16:00:00.000Z",
        "description": "Status changed from in_progress to done"
      },
      "createdAt": "2023-12-01T16:00:00.000Z"
    },
    {
      "_id": "64f9a1234567890abcdef110",
      "taskId": "64f9a1234567890abcdef789",
      "projectId": "64f9a1234567890abcdef123",
      "actor": {
        "_id": "64f9a1234567890abcdef001",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "action": "assign",
      "from": {
        "assignee": null
      },
      "to": {
        "assignee": "64f9a1234567890abcdef456"
      },
      "metadata": {
        "timestamp": "2023-12-01T14:30:00.000Z",
        "description": "Task assigned"
      },
      "createdAt": "2023-12-01T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Activity Types

The following activity types are logged:

- `create` - Task creation
- `update_status` - Status change
- `update_priority` - Priority change
- `assign` - Task assignment
- `unassign` - Task unassignment
- `edit` - Field updates (title, description, etc.)
- `archive` - Task archived
- `restore` - Task restored
- `delete` - Task deleted
- `add_label` - Label added
- `remove_label` - Label removed
- `set_due_date` - Due date set
- `remove_due_date` - Due date removed

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per minute per user
- **List endpoints**: 30 requests per minute per user
- **Create/Update endpoints**: 60 requests per minute per user

Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit resets

## SDK Examples

### JavaScript/Node.js

```javascript
// Task Service Client Example
class TaskServiceClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async createTask(projectId, taskData) {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/tasks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      }
    );
    return response.json();
  }

  async listTasks(projectId, filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/tasks?${params}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    );
    return response.json();
  }

  async updateTaskStatus(projectId, taskId, status) {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/tasks/${taskId}/status`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );
    return response.json();
  }
}

// Usage
const client = new TaskServiceClient(
  "http://localhost:3003/api",
  "your-jwt-token"
);

// Create a task
const newTask = await client.createTask("project123", {
  title: "New Feature Implementation",
  priority: "high",
  assignee: "user456",
});

// List tasks
const tasks = await client.listTasks("project123", {
  status: "in_progress",
  assignee: "user456",
});

// Update task status
const updated = await client.updateTaskStatus("project123", "task789", "done");
```

### Python

```python
import requests
from typing import Dict, Any, Optional

class TaskServiceClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def create_task(self, project_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(
            f'{self.base_url}/projects/{project_id}/tasks',
            json=task_data,
            headers=self.headers
        )
        return response.json()

    def list_tasks(self, project_id: str, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        params = filters or {}
        response = requests.get(
            f'{self.base_url}/projects/{project_id}/tasks',
            params=params,
            headers=self.headers
        )
        return response.json()

    def update_task_status(self, project_id: str, task_id: str, status: str) -> Dict[str, Any]:
        response = requests.patch(
            f'{self.base_url}/projects/{project_id}/tasks/{task_id}/status',
            json={'status': status},
            headers=self.headers
        )
        return response.json()

# Usage
client = TaskServiceClient('http://localhost:3003/api', 'your-jwt-token')

# Create a task
new_task = client.create_task('project123', {
    'title': 'Bug Fix',
    'priority': 'high',
    'labels': ['bug', 'urgent']
})

# List tasks with filters
tasks = client.list_tasks('project123', {
    'status': 'in_progress',
    'priority': 'high'
})
```

## Health Check

**Endpoint**: `GET /health`

**Authentication**: Not required

```bash
curl -X GET "http://localhost:3003/health"
```

**Response**:

```json
{
  "success": true,
  "message": "Task Service is healthy",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "service": "TaskFlow Task Service",
  "version": "1.0.0"
}
```

## Support

For API support and questions:

- **Documentation**: This document
- **Issues**: Create GitHub issues for bugs or feature requests
- **Development**: See README.md for development setup

## Changelog

### v1.0.0 (Current)

- Initial release with core task management functionality
- Complete CRUD operations for tasks
- Status management with state machine validation
- Assignment system with project member validation
- Comprehensive activity logging
- Role-based permissions
- Advanced filtering and search
- Full test coverage
