# API Endpoints

Base URL: `http://localhost:8080/api`

## Authentication

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: {
  "user": {...},
  "token": "eyJhbGc..."
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Verify Token
```http
POST /api/auth/verify-token
Authorization: Bearer {token}

Response: {
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    ...
  }
}
```

### Forgot Password
```http
POST /api/auth/forgot-password?email=john@example.com

Response: {
  "message": "Si l'email existe, un lien de réinitialisation a été envoyé"
}
```

## Coffees

### List Coffees
```http
GET /api/coffees?page=1&limit=12&origin=Ethiopia&roasterId=1&noteIds=5,12&minRating=4.0&sortBy=rating&sortOrder=desc

Query Parameters:
- search: string (optional)
- origin: List<string> (optional)
- roasterId: List<Long> (optional)
- noteIds: List<Long> (optional)
- priceRange: List<string> (optional)
- minRating: double (optional)
- sortBy: string (default: "rating")
- sortOrder: string (default: "desc")
- page: int (default: 1)
- limit: int (default: 12)
```

### Get Coffee
```http
GET /api/coffees/{id}
```

### Create Coffee
```http
POST /api/coffees
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Ethiopia Yirgacheffe",
  "roasterId": 1,
  "origin": "Ethiopia",
  "process": "Washed",
  "variety": "Heirloom",
  "altitudeMin": 1800,
  "altitudeMax": 2200,
  "priceRange": "€€€",
  "noteIds": [5, 12, 18]
}
```

### Update Coffee
```http
PUT /api/coffees/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Ethiopia Yirgacheffe",
  "roasterId": 1,
  "origin": "Ethiopia",
  "process": "Washed",
  "variety": "Heirloom",
  "altitudeMin": 1800,
  "altitudeMax": 2200,
  "priceRange": "€€€",
  "noteIds": [5, 12, 18]
}
```

### Delete Coffee
```http
DELETE /api/coffees/{id}
Authorization: Bearer {token}
```

### Popular Coffees
```http
GET /api/coffees/popular?limit=8
```

### Recent Coffees
```http
GET /api/coffees/recent?limit=8
```

### Similar Coffees
```http
GET /api/coffees/{id}/similar?limit=4
```

## Reviews

### Get Reviews for Coffee
```http
GET /api/coffees/{coffeeId}/reviews?page=1&limit=10&sortBy=helpful

Query Parameters:
- sortBy: string (default: "helpful", options: "helpful", "recent", "rating")
- page: int (default: 1)
- limit: int (default: 10)
```

### Create Review
```http
POST /api/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "coffeeId": 789,
  "rating": 5,
  "comment": "Amazing coffee!",
  "imageUrl": "https://..."
}
```

### Update Review
```http
PUT /api/reviews/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "coffeeId": 789,
  "rating": 5,
  "comment": "Updated comment",
  "imageUrl": "https://..."
}
```

### Delete Review
```http
DELETE /api/reviews/{id}
Authorization: Bearer {token}
```

### Vote on Review
```http
POST /api/reviews/{id}/vote
Authorization: Bearer {token}
Content-Type: application/json

{
  "isHelpful": true
}
```

### Recent Reviews
```http
GET /api/reviews/recent?limit=6
```

## Roasters

### List All Roasters
```http
GET /api/roasters

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Blue Bottle Coffee",
      "description": "Specialty coffee roaster from California",
      "location": "Oakland, CA",
      "website": "https://bluebottlecoffee.com",
      "logoUrl": "https://...",
      "isVerified": true,
      "createdAt": "2025-10-25T10:00:00Z",
      "updatedAt": "2025-10-25T10:00:00Z"
    }
  ],
  "timestamp": "2025-10-25T12:00:00Z"
}
```

### Get Roaster by ID
```http
GET /api/roasters/{id}

Response: {
  "success": true,
  "data": {
    "id": 1,
    "name": "Blue Bottle Coffee",
    "description": "Specialty coffee roaster from California",
    "location": "Oakland, CA",
    "website": "https://bluebottlecoffee.com",
    "logoUrl": "https://...",
    "isVerified": true,
    "createdAt": "2025-10-25T10:00:00Z",
    "updatedAt": "2025-10-25T10:00:00Z"
  },
  "timestamp": "2025-10-25T12:00:00Z"
}
```

## Notes

### List All Flavor Notes
```http
GET /api/notes

Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Citrus",
      "category": "Fruity",
      "createdAt": "2025-10-25T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Berry",
      "category": "Fruity",
      "createdAt": "2025-10-25T10:00:00Z"
    }
  ],
  "timestamp": "2025-10-25T12:00:00Z"
}
```

### Get Notes Grouped by Category
```http
GET /api/notes/categories

Response: {
  "success": true,
  "data": [
    {
      "category": "Floral",
      "notes": [
        {
          "id": 5,
          "name": "Jasmine",
          "category": "Floral",
          "createdAt": "2025-10-25T10:00:00Z"
        },
        {
          "id": 6,
          "name": "Rose",
          "category": "Floral",
          "createdAt": "2025-10-25T10:00:00Z"
        }
      ]
    },
    {
      "category": "Fruity",
      "notes": [...]
    }
  ],
  "timestamp": "2025-10-25T12:00:00Z"
}

Note: Categories are sorted alphabetically
```

## Users

### Get User by ID
```http
GET /api/users/{id}
```

### Get User by Username
```http
GET /api/users/username/{username}
```

### Get User Profile (with stats)
```http
GET /api/users/{id}/profile
```

### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "new_username",
  "bio": "Coffee enthusiast",
  "avatarUrl": "https://..."
}
```

### Get User Reviews
```http
GET /api/users/{id}/reviews?page=1&limit=10
```

### Get User Coffees
```http
GET /api/users/{id}/coffees?page=1&limit=10
```

### Get User Preferences
```http
GET /api/users/preferences
Authorization: Bearer {token}
```

### Update User Preferences
```http
PUT /api/users/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "favoriteOrigins": ["Ethiopia", "Kenya"],
  "favoriteNoteIds": [5, 12, 18],
  "preferredPriceRange": ["€€", "€€€"]
}
```

## Favorites

### Add to Favorites
```http
POST /api/users/favorites/{coffeeId}
Authorization: Bearer {token}

Response: {
  "success": true,
  "message": "Coffee added to favorites"
}
```

### Remove from Favorites
```http
DELETE /api/users/favorites/{coffeeId}
Authorization: Bearer {token}

Response: {
  "success": true,
  "message": "Coffee removed from favorites"
}
```

### Toggle Favorite
```http
POST /api/users/favorites/{coffeeId}/toggle
Authorization: Bearer {token}

Response: {
  "success": true,
  "message": "Coffee added to favorites",
  "data": {
    "isFavorite": true
  }
}
```

### Check if Favorite
```http
GET /api/users/favorites/{coffeeId}/check
Authorization: Bearer {token}

Response: {
  "success": true,
  "data": {
    "isFavorite": true
  }
}
```

### Get User Favorites
```http
GET /api/users/favorites?page=1&limit=12
Authorization: Bearer {token}

Response: {
  "data": [
    {
      "id": 1,
      "name": "Ethiopia Yirgacheffe",
      "roaster": {...},
      "origin": "Ethiopia",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 24,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Favorite IDs
```http
GET /api/users/favorites/ids
Authorization: Bearer {token}

Response: {
  "success": true,
  "data": [1, 5, 12, 23, 45]
}
```

### Get Favorite Count
```http
GET /api/users/favorites/count
Authorization: Bearer {token}

Response: {
  "success": true,
  "data": {
    "count": 24
  }
}
```

## Upload

### Get Avatar Upload Signature
```http
GET /api/upload/signature/avatar
Authorization: Bearer {token}

Response: {
  "data": {
    "signature": "abc123...",
    "timestamp": 1635789456,
    "cloudName": "sipzy",
    "apiKey": "123456789",
    "folder": "avatars"
  }
}
```

### Get Coffee Image Upload Signature
```http
GET /api/upload/signature/coffee-image
Authorization: Bearer {token}

Response: {
  "data": {
    "signature": "abc123...",
    "timestamp": 1635789456,
    "cloudName": "sipzy",
    "apiKey": "123456789",
    "folder": "coffees"
  }
}
```

### Get Review Image Upload Signature
```http
GET /api/upload/signature/review-image
Authorization: Bearer {token}

Response: {
  "data": {
    "signature": "abc123...",
    "timestamp": 1635789456,
    "cloudName": "sipzy",
    "apiKey": "123456789",
    "folder": "reviews"
  }
}
```

## Admin

### Get Stats
```http
GET /api/admin/stats
Authorization: Bearer {admin-token}
```

### Get Pending Coffees
```http
GET /api/admin/coffees/pending?page=1&limit=10
Authorization: Bearer {admin-token}
```

### Get All Coffees (Admin)
```http
GET /api/admin/coffees?status=APPROVED&search=Ethiopia&page=1&limit=20
Authorization: Bearer {admin-token}

Query Parameters:
- status: string (optional, values: PENDING, APPROVED, REJECTED)
- search: string (optional)
- page: int (default: 1)
- limit: int (default: 20)
```

### Approve Coffee
```http
PUT /api/admin/coffees/{id}/approve
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "adminNotes": "Approved - verified info"
}
```

### Reject Coffee
```http
PUT /api/admin/coffees/{id}/reject
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "adminNotes": "Rejected - incorrect information"
}
```

### Get All Users
```http
GET /api/admin/users?page=1&limit=20
Authorization: Bearer {admin-token}
```

### Ban User
```http
PUT /api/admin/users/{id}/ban
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "reason": "Spam or inappropriate behavior"
}
```

### Unban User
```http
PUT /api/admin/users/{id}/unban
Authorization: Bearer {admin-token}
```

### Get Pending Reports
```http
GET /api/admin/reports/pending?page=1&limit=10
Authorization: Bearer {admin-token}
```

### Get All Reports
```http
GET /api/admin/reports?status=RESOLVED&page=1&limit=20
Authorization: Bearer {admin-token}

Query Parameters:
- status: string (optional, values: PENDING, RESOLVED, DISMISSED)
- page: int (default: 1)
- limit: int (default: 20)
```

### Resolve Report
```http
PUT /api/admin/reports/{id}/resolve
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "adminNotes": "Content removed, user warned"
}
```

### Dismiss Report
```http
PUT /api/admin/reports/{id}/dismiss
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "adminNotes": "No violation found"
}
```

## Response Format

All API responses follow a standardized format with a `success` boolean field.

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message",
  "timestamp": "2025-10-25T10:30:00Z"
}
```

**Fields:**
- `success`: Always `true` for successful responses
- `data`: The actual response payload (can be object, array, or null)
- `message`: Optional message (usually null for GET requests)
- `timestamp`: ISO 8601 timestamp of the response

### Error Response
```json
{
  "success": false,
  "status": 404,
  "error": "Not Found",
  "message": "Roaster with id 999 not found",
  "path": "/api/roasters/999",
  "timestamp": "2025-10-25T10:30:00Z"
}
```

**Fields:**
- `success`: Always `false` for error responses
- `status`: HTTP status code (400, 401, 403, 404, 409, 500, etc.)
- `error`: Error type/category
- `message`: Human-readable error message
- `path`: Request path that caused the error
- `timestamp`: ISO 8601 timestamp of the error
- `validationErrors`: (Optional) Map of field-level validation errors for 400 Bad Request

### Paginated Response
```json
{
  "data": [...],
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

**Note:** Paginated responses don't include the `success` field at the root level.

## Swagger UI

Interactive API documentation: `http://localhost:8080/swagger-ui.html`
