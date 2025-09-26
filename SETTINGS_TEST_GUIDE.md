# TaskFlow Settings Test Guide

## Manual Testing Steps

### 1. Start All Services

Run one of the startup scripts:

```bash
# Windows Batch
./start-all-services.bat

# PowerShell
./start-all-services.ps1

# Manual (4 separate terminals)
cd services/auth-services && npm run dev
cd services/users-services && npm run dev
cd services/project-services && npm run dev
cd frontend && npm run dev
```

### 2. Test Backend Health

```bash
node test-backend.js
```

Should show all services as ✅ running.

### 3. Frontend Testing

#### Register/Login

1. Go to http://localhost:3000
2. Register a new account
3. Login with your credentials

#### Settings Page Testing

1. Navigate to Dashboard → Settings
2. Go to Profile tab

#### Profile Information Testing

1. **Change Detection Test:**

   - Notice "Save Changes" button is disabled initially (no changes)
   - Modify any field (name, phone, bio, etc.)
   - Button should become enabled
   - Click "Save Changes"
   - Should show "Settings saved successfully!" toast
   - Button should disable again (no changes)

2. **Profile Image Testing:**

   - Click "Change Picture" or drag an image
   - Should upload immediately and show success toast
   - Image should appear in the profile preview
   - Refresh page - image should persist
   - Check database: `db.users.findOne({email: "your-email"})` should show `profileImage` field

3. **Address Information Testing:**
   - Fill in address fields
   - Click "Save Changes"
   - Should save successfully
   - Check database: user document should have `address` object

#### Error Handling Testing

1. **No Changes:**

   - Don't modify anything
   - Try to click "Save Changes" (should be disabled)
   - If somehow clicked, should show "No changes to save"

2. **Large File Upload:**

   - Try uploading image > 5MB
   - Should show error toast

3. **Invalid File Type:**

   - Try uploading non-image file
   - Should show error toast

4. **Backend Offline:**
   - Stop users service
   - Try to save changes
   - Should show connection error

### 4. Database Verification

Connect to MongoDB:

```bash
mongosh
use taskflow-users
db.users.find().pretty()
```

Verify that:

- Profile updates are saved
- Image uploads create `profileImage` field
- Address information is saved in `address` object
- `updatedAt` timestamp changes

### 5. Success Criteria ✅

**Issue 1: Database Updates**

- ✅ Profile changes update the MongoDB database
- ✅ Image uploads save file path to database
- ✅ Address changes are persisted

**Issue 2: Notification Control**

- ✅ Success notification only appears when data actually changes
- ✅ No notification when clicking save with no changes
- ✅ Button is disabled when no changes are detected

**Issue 3: Button Styling**

- ✅ Primary button uses proper Tailwind classes
- ✅ Button shows correct state (enabled/disabled)
- ✅ Loading state works correctly

**Issue 4: Image Database Updates**

- ✅ Profile image changes are saved to database
- ✅ Image files are properly stored in uploads directory
- ✅ Image URL is served correctly by backend

## Troubleshooting

### Common Issues:

1. **Connection refused**: Service not running
2. **CORS errors**: Check service CORS configuration
3. **File upload fails**: Check uploads directory exists
4. **Changes not saving**: Check MongoDB connection
5. **Images not loading**: Check static file serving

### Debug Commands:

```bash
# Check service status
curl http://localhost:4000/health
curl http://localhost:4001/health
curl http://localhost:4002/health

# Check MongoDB
mongosh
show dbs
use taskflow-users
db.users.find()

# Check uploads directory
ls services/users-services/uploads/
```
