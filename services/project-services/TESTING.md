# TaskFlow Project Service - Testing Guide

## 🧪 Manual Testing

Since the Project Service is now running successfully on `http://localhost:4002`, you can test the API endpoints manually.

### Prerequisites

1. **MongoDB** should be running on port 27017
2. **Project Service** is running on port 4002
3. You need a **JWT token** from the Auth Service (port 4000)

### Get JWT Token First

1. Start the Auth Service: `http://localhost:4000`
2. Register/login to get a JWT token
3. Use this token in the `Authorization: Bearer <token>` header

### Test Endpoints

#### 1. Health Check

```bash
curl http://localhost:4002
```

Expected response:

```json
{
  "success": true,
  "message": "TaskFlow Project Service API is running 🚀",
  "version": "1.0.0",
  "timestamp": "2025-09-25T07:10:00.000Z",
  "endpoints": {
    "health": "/",
    "docs": "/api-docs",
    "projects": "/api/projects"
  }
}
```

#### 2. API Documentation

Visit: `http://localhost:4002/api-docs`

#### 3. Create Project

```bash
curl -X POST http://localhost:4002/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Test Project",
    "description": "Testing the project API",
    "isPublic": false,
    "allowMemberInvite": true,
    "maxMembers": 10
  }'
```

#### 4. Get User Projects

```bash
curl -X GET "http://localhost:4002/api/projects?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. Get Project Details

```bash
curl -X GET http://localhost:4002/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 6. Invite Member by Email

```bash
curl -X POST http://localhost:4002/api/projects/PROJECT_ID/invite \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@example.com",
    "role": "member"
  }'
```

#### 7. Join Project by Code

```bash
curl -X POST http://localhost:4002/api/projects/join/ABC12345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 8. Get Project Members

```bash
curl -X GET http://localhost:4002/api/projects/PROJECT_ID/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Integration Testing

### Test with Other Services

1. **User Service Integration**

   - The Project Service calls User Service stubs
   - Check console logs for `[STUB]` messages
   - Real implementation should replace these stubs

2. **Task Service Integration**

   - Task statistics are mocked
   - Check console for task-related stub calls

3. **Notification Service**
   - Email notifications are stubbed
   - Check console for notification logs

## 📊 Database Testing

### MongoDB Collections

1. **projects** - stores all project data
2. Check indexes are created properly
3. Verify member arrays are populated correctly

### Sample Queries

```javascript
// Connect to MongoDB
use taskflowdb

// Find all projects
db.projects.find().pretty()

// Find projects by member
db.projects.find({ "members.userId": ObjectId("USER_ID") })

// Find by invitation code
db.projects.find({ "invitationCode": "ABC12345" })
```

## 🚨 Error Testing

### Test Error Scenarios

1. **Invalid JWT Token**

```bash
curl -X GET http://localhost:4002/api/projects \
  -H "Authorization: Bearer invalid_token"
```

2. **Missing Required Fields**

```bash
curl -X POST http://localhost:4002/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Missing name field"}'
```

3. **Invalid Project ID**

```bash
curl -X GET http://localhost:4002/api/projects/invalid_id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

4. **Permission Denied**

- Try to update/delete projects you don't own
- Try admin operations as a member/viewer

## 📈 Performance Testing

### Load Testing

Use tools like Apache Bench or Artillery:

```bash
# Test project creation
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
   -H "Content-Type: application/json" \
   -p project_data.json \
   http://localhost:4002/api/projects
```

### Memory & CPU Monitoring

```bash
# Monitor Node.js process
top -p $(pgrep -f "ts-node")

# Monitor MongoDB
mongotop
mongostat
```

## 🐛 Common Issues

1. **MongoDB Connection Failed**

   - Ensure MongoDB is running
   - Check connection string in .env

2. **JWT Token Issues**

   - Verify Auth Service is running
   - Check token format and expiration

3. **Port Already in Use**

   - Kill process: `lsof -ti:4002 | xargs kill`
   - Or change PORT in .env file

4. **CORS Errors**
   - Check frontend URL in allowedOrigins
   - Verify credentials: true setting

## 🔄 Next Steps

1. **Replace Service Stubs**

   - Implement real HTTP calls to User/Task services
   - Add proper error handling and retries

2. **Add Redis Caching**

   - Cache user details and project data
   - Implement cache invalidation strategies

3. **Add WebSocket Support**

   - Real-time project updates
   - Live member presence

4. **Implement File Uploads**

   - Project avatars/images
   - Document attachments

5. **Add Search Engine**
   - Elasticsearch integration
   - Full-text search across projects

## 📝 Test Checklist

- [ ] Service starts without errors
- [ ] MongoDB connection established
- [ ] Health endpoint responds
- [ ] API documentation loads
- [ ] JWT authentication works
- [ ] Project CRUD operations
- [ ] Member management works
- [ ] Role-based permissions enforced
- [ ] Error handling functions
- [ ] Validation catches invalid data
- [ ] Service integration stubs work
- [ ] QR code generation works
- [ ] Pagination works correctly

## 🎯 Success Criteria

✅ **Service is production-ready when:**

- All endpoints respond correctly
- Authentication/authorization works
- Database operations are efficient
- Error handling is comprehensive
- Service integrations are functional
- Documentation is complete
- Tests pass with good coverage
