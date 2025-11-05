# API Client Documentation

This directory contains the real API client for connecting to the Spring Boot backend.

## Structure

```
lib/api/
├── apiClient.ts    # Axios instance with interceptors
├── realApi.ts      # Service wrappers for all endpoints
└── README.md       # This file

lib/types/
└── api.ts          # TypeScript interfaces for API types
```

## Usage

### Basic Import

```typescript
import api from '@/lib/api/realApi';

// Use specific service
const coffees = await api.coffees.list();
const roasters = await api.roasters.list();
```

### Authentication

```typescript
// Login
const { user, token } = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Token is automatically stored and sent with subsequent requests
```

### Coffees

```typescript
// List coffees with filters
const coffeesPage = await api.coffees.list({
  origin: ['Ethiopia', 'Colombia'],
  roasterId: [1, 2],
  noteIds: [5, 12],
  minRating: 4.0,
  page: 1,
  limit: 12,
  sortBy: 'rating',
  sortOrder: 'desc'
});

// Get single coffee
const coffee = await api.coffees.getById(123);

// Create coffee
const newCoffee = await api.coffees.create({
  name: 'Ethiopia Yirgacheffe',
  roasterId: 1,
  origin: 'Ethiopia',
  noteIds: [1, 2, 3],
  // ...
});

// Update coffee
const updated = await api.coffees.update(123, {
  name: 'Updated name',
  // ...
});

// Delete coffee
await api.coffees.delete(123);

// Get popular/recent/similar
const popular = await api.coffees.getPopular(8);
const recent = await api.coffees.getRecent(8);
const similar = await api.coffees.getSimilar(123, 4);
```

### Roasters

```typescript
// List all roasters
const roasters = await api.roasters.list();

// Get roaster by ID
const roaster = await api.roasters.getById(1);
```

### Notes

```typescript
// List all flavor notes
const notes = await api.notes.list();

// Get notes grouped by category
const notesByCategory = await api.notes.getByCategory();
// Returns: [{ category: 'Fruity', notes: [...] }, ...]
```

### Reviews

```typescript
// Get reviews for a coffee
const reviewsPage = await api.reviews.getForCoffee(123, {
  sortBy: 'helpful',
  page: 1,
  limit: 10
});

// Create review
const review = await api.reviews.create({
  coffeeId: 123,
  rating: 5,
  comment: 'Amazing coffee!',
  imageUrl: 'https://...'
});

// Update review
const updated = await api.reviews.update(456, {
  coffeeId: 123,
  rating: 4,
  comment: 'Updated review'
});

// Delete review
await api.reviews.delete(456);

// Vote on review
const voteResult = await api.reviews.vote(456, {
  isHelpful: true
});

// Get recent reviews (global)
const recentReviews = await api.reviews.getRecent(6);
```

### Users

```typescript
// Get user by ID
const user = await api.users.getById(1);

// Get user by username
const user = await api.users.getByUsername('john_doe');

// Get user profile with stats
const profile = await api.users.getProfile(1);
// Returns: { user, stats, recentReviews, approvedCoffees }

// Update own profile
const updated = await api.users.updateProfile({
  username: 'new_username',
  bio: 'My new bio',
  avatarUrl: 'https://...'
});

// Get user reviews
const reviewsPage = await api.users.getReviews(1, {
  page: 1,
  limit: 10
});

// Get user coffees
const coffeesPage = await api.users.getCoffees(1, {
  page: 1,
  limit: 10
});

// Get/update preferences
const prefs = await api.users.getPreferences();
await api.users.updatePreferences({
  emailNotifications: true,
  reviewNotifications: false,
  coffeeApprovalNotifications: true
});
```

### Upload

```typescript
// Get Cloudinary signature for avatar upload
const signature = await api.upload.getAvatarSignature();

// Get signature for coffee image
const signature = await api.upload.getCoffeeImageSignature();

// Get signature for review image
const signature = await api.upload.getReviewImageSignature();

// Use signature to upload directly to Cloudinary
const formData = new FormData();
formData.append('file', file);
formData.append('signature', signature.signature);
formData.append('timestamp', signature.timestamp.toString());
formData.append('api_key', signature.apiKey);
// ... upload to Cloudinary
```

### Admin

```typescript
// Get dashboard stats
const stats = await api.admin.getStats();

// Get pending coffees
const pendingCoffees = await api.admin.getPendingCoffees({
  page: 1,
  limit: 20
});

// Approve coffee
const approved = await api.admin.approveCoffee(123, {
  adminNotes: 'Looks good!'
});

// Reject coffee
const rejected = await api.admin.rejectCoffee(123, {
  adminNotes: 'Needs better description'
});

// Get all coffees (admin view)
const allCoffees = await api.admin.getAllCoffees({
  status: 'PENDING',
  search: 'Ethiopia',
  page: 1,
  limit: 20
});

// Get all users
const allUsers = await api.admin.getAllUsers({
  page: 1,
  limit: 20
});

// Ban/unban user
const banned = await api.admin.banUser(123, {
  reason: 'Spam',
  isPermanent: false,
  durationInDays: 7
});
const unbanned = await api.admin.unbanUser(123);

// Get reports
const pendingReports = await api.admin.getPendingReports();
const allReports = await api.admin.getAllReports({
  status: 'PENDING',
  page: 1,
  limit: 20
});

// Resolve/dismiss report
const resolved = await api.admin.resolveReport(123, {
  adminNotes: 'User warned'
});
const dismissed = await api.admin.dismissReport(123, {
  adminNotes: 'No violation found'
});

// Get recent activity
const activities = await api.admin.getRecentActivity(10);
```

## Error Handling

### Using try-catch

```typescript
import { getErrorMessage, getValidationErrors } from '@/lib/api/apiClient';

try {
  const coffee = await api.coffees.create(data);
} catch (error) {
  // Get user-friendly error message
  const message = getErrorMessage(error);
  console.error(message);

  // Get validation errors (if any)
  const validationErrors = getValidationErrors(error);
  if (validationErrors) {
    console.error('Validation errors:', validationErrors);
    // { "name": "Name is required", "roasterId": "Roaster is required" }
  }
}
```

### In React Components

```typescript
import { useState } from 'react';
import api from '@/lib/api/realApi';
import { getErrorMessage } from '@/lib/api/apiClient';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data) => {
    try {
      setError(null);
      await api.coffees.create(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      {error && <div className="error">{error}</div>}
      {/* form */}
    </>
  );
}
```

## Response Structure

### Success Response

All successful API calls return data wrapped in `ApiResponse`:

```typescript
{
  "success": true,
  "data": { /* your data */ },
  "message": "Optional message",
  "timestamp": "2025-11-05T10:00:00Z"
}
```

The `unwrapResponse()` helper automatically extracts the `data` field.

### Error Response

Errors follow this structure:

```typescript
{
  "success": false,
  "status": 404,
  "error": "Not Found",
  "message": "Roaster with id 999 not found",
  "path": "/api/roasters/999",
  "timestamp": "2025-11-05T10:00:00Z",
  "validationErrors": { /* optional */ }
}
```

### Paginated Response

Paginated endpoints return:

```typescript
{
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Authentication

### Token Storage

The JWT token is automatically:
- Stored in `localStorage` after login/register
- Sent with every request via `Authorization: Bearer {token}` header
- Removed on 401 Unauthorized errors
- Checked for expiration

### Manual Token Management

```typescript
import {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  isAuthenticated
} from '@/lib/api/apiClient';

// Set token manually
setAuthToken('your-jwt-token');

// Get current token
const token = getAuthToken();

// Remove token
removeAuthToken();

// Check if authenticated
if (isAuthenticated()) {
  // User is logged in
}
```

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

For production:

```bash
NEXT_PUBLIC_API_URL=https://api.sipzy.coffee
```

## Breaking Changes from Mock API

### 1. Response Structure

**Before (Mock):**
```typescript
const coffees = response.data; // Direct array
```

**After (Real API):**
```typescript
const coffees = response.data.data; // Wrapped in ApiResponse
// OR use the service which unwraps automatically:
const coffees = await api.coffees.list(); // Already unwrapped
```

### 2. RoasterSummary Field

**Before:**
```typescript
coffee.roaster.country
```

**After:**
```typescript
coffee.roaster.location
```

### 3. New Field: isVerified

Roasters now have an `isVerified` boolean field:

```typescript
{roaster.isVerified && <Badge>Verified</Badge>}
```

## Migration Checklist

- [ ] Replace mock API imports with `import api from '@/lib/api/realApi'`
- [ ] Update AuthContext to use `api.auth.*` methods
- [ ] Update components to handle new response structure
- [ ] Update TypeScript interfaces (`country` → `location`)
- [ ] Add `isVerified` badge to roaster displays
- [ ] Test all CRUD operations
- [ ] Test error handling
- [ ] Test authentication flow

## Testing

```typescript
// Example: Test API connection
async function testConnection() {
  try {
    const roasters = await api.roasters.list();
    console.log('✅ API connected:', roasters.length, 'roasters found');
  } catch (error) {
    console.error('❌ API connection failed:', getErrorMessage(error));
  }
}
```

## Troubleshooting

### CORS Errors

Make sure backend SecurityConfig includes your frontend URL:

```java
configuration.setAllowedOrigins(Arrays.asList(
  "http://localhost:3000",
  "http://localhost:3001"
));
```

### 401 Unauthorized

- Check if token is expired
- Verify token is being sent in headers
- Check backend JWT configuration

### Network Errors

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check if backend is running
- Check for firewall/proxy issues

## Support

For backend API documentation, see:
- `backend/docs/API.md` - Full API reference
- `docs/MIGRATION_PLAN.md` - Migration guide
- `docs/CHANGELOG_API_CONSISTENCY.md` - Recent changes

For issues, check:
- Browser DevTools Network tab
- Backend console logs
- `apiClient.ts` interceptor logs (development mode)
