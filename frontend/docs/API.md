# Frontend API Contract

Documentation du contrat d'échange attendu côté frontend pour l'application Sipzy.

Base URL: `http://localhost:8080/api` (configurable via `NEXT_PUBLIC_API_URL`)

## Table des matières

- [Authentication](#authentication)
- [Coffees](#coffees)
- [Reviews](#reviews)
- [Users](#users)
- [Upload](#upload)
- [Admin](#admin)
- [Favorites](#favorites-client-side)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

---

## Authentication

### Login
```typescript
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "USER" | "ADMIN",
      "avatarUrl": "https://...",
      "bio": "Coffee enthusiast",
      "isActive": true,
      "emailVerified": true,
      "createdAt": "2025-10-25T10:30:00Z",
      "updatedAt": "2025-10-25T10:30:00Z"
    },
    "token": "eyJhbGc..."
  }
}
```

### Register
```typescript
POST /api/auth/register
Content-Type: application/json

Request:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: (same as login)
```

### Verify Token
```typescript
POST /api/auth/verify-token
Authorization: Bearer {token}

Response:
{
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "USER",
    ...
  }
}
```

### Logout
```typescript
POST /api/auth/logout
Authorization: Bearer {token}

Response: 204 No Content
```

### Forgot Password
```typescript
POST /api/auth/forgot-password?email=john@example.com

Response:
{
  "message": "Si l'email existe, un lien de réinitialisation a été envoyé"
}
```

---

## Coffees

### Get All Coffees (with filters)
```typescript
GET /api/coffees?page=1&limit=12&search=Ethiopia&origin=Ethiopia,Kenya&roasterId=1,2&noteIds=5,12&priceRange=€€,€€€&minRating=4.0&sortBy=rating&sortOrder=desc

Query Parameters:
- search?: string
- origin?: string[] (comma-separated)
- roasterId?: number[] (comma-separated)
- noteIds?: number[] (comma-separated)
- priceRange?: string[] (comma-separated)
- minRating?: number
- sortBy?: "name" | "rating" | "reviews" | "created" (default: "rating")
- sortOrder?: "asc" | "desc" (default: "desc")
- page?: number (default: 1)
- limit?: number (default: 12)

Response:
{
  "data": [
    {
      "id": 1,
      "name": "Ethiopia Yirgacheffe",
      "roasterId": 1,
      "roaster": {
        "id": 1,
        "name": "La Brûlerie",
        "country": "France",
        "website": "https://...",
        "logoUrl": "https://...",
        "description": "...",
        "isVerified": true,
        "createdAt": "2025-10-25T10:30:00Z",
        "updatedAt": "2025-10-25T10:30:00Z"
      },
      "origin": "Ethiopia",
      "process": "Washed",
      "variety": "Heirloom",
      "altitudeMin": 1800,
      "altitudeMax": 2200,
      "harvestYear": 2024,
      "priceRange": "€€€",
      "description": "...",
      "imageUrl": "https://...",
      "avgRating": 4.7,
      "reviewCount": 23,
      "status": "APPROVED",
      "submittedBy": 5,
      "approvedBy": 1,
      "approvedAt": "2025-10-25T10:30:00Z",
      "createdAt": "2025-10-25T10:30:00Z",
      "updatedAt": "2025-10-25T10:30:00Z",
      "notes": [
        {
          "id": 5,
          "name": "Floral",
          "category": "Aroma",
          "description": "...",
          "createdAt": "2025-10-25T10:30:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Coffee by ID
```typescript
GET /api/coffees/{id}

Response:
{
  "data": {
    "id": 1,
    "name": "Ethiopia Yirgacheffe",
    ...
    "reviews": [...] // Included reviews
  }
}
```

### Get Popular Coffees
```typescript
GET /api/coffees/popular?limit=8

Response:
{
  "data": [
    { /* Coffee object */ }
  ]
}
```

### Get Recent Coffees
```typescript
GET /api/coffees/recent?limit=8

Response:
{
  "data": [
    { /* Coffee object */ }
  ]
}
```

### Get Similar Coffees
```typescript
GET /api/coffees/{id}/similar?limit=4

Response:
{
  "data": [
    { /* Coffee object */ }
  ]
}
```

### Create Coffee
```typescript
POST /api/coffees
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "name": "Ethiopia Yirgacheffe",
  "roasterId": 1,
  "origin": "Ethiopia",
  "process": "Washed",
  "variety": "Heirloom",
  "altitudeMin": 1800,
  "altitudeMax": 2200,
  "harvestYear": 2024,
  "priceRange": "€€€",
  "description": "...",
  "imageUrl": "https://...",
  "noteIds": [5, 12, 18]
}

Response:
{
  "data": {
    "id": 123,
    "status": "PENDING",
    ...
  }
}
```

### Update Coffee
```typescript
PUT /api/coffees/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request: (same as create)

Response:
{
  "data": { /* Updated coffee */ }
}
```

### Delete Coffee
```typescript
DELETE /api/coffees/{id}
Authorization: Bearer {token}

Response: 204 No Content
```

---

## Reviews

### Get Reviews for Coffee
```typescript
GET /api/coffees/{coffeeId}/reviews?page=1&limit=10&sortBy=helpful

Query Parameters:
- sortBy?: "helpful" | "recent" | "rating" (default: "helpful")
- page?: number (default: 1)
- limit?: number (default: 10)

Response:
{
  "data": [
    {
      "id": 1,
      "coffeeId": 789,
      "coffee": { /* Coffee object */ },
      "userId": 5,
      "user": {
        "id": 5,
        "username": "coffee_lover",
        "avatarUrl": "https://...",
        ...
      },
      "rating": 5,
      "comment": "Amazing coffee!",
      "imageUrl": "https://...",
      "helpfulCount": 12,
      "notHelpfulCount": 1,
      "isFlagged": false,
      "createdAt": "2025-10-25T10:30:00Z",
      "updatedAt": "2025-10-25T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Recent Reviews (Global)
```typescript
GET /api/reviews/recent?limit=6

Response:
{
  "data": [
    { /* Review object */ }
  ]
}
```

### Create Review
```typescript
POST /api/reviews
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "coffeeId": 789,
  "rating": 5,
  "comment": "Amazing coffee!",
  "imageUrl": "https://..." // optional
}

Response:
{
  "data": {
    "id": 456,
    ...
  }
}
```

### Update Review
```typescript
PUT /api/reviews/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "coffeeId": 789,
  "rating": 4,
  "comment": "Updated review",
  "imageUrl": "https://..."
}

Response:
{
  "data": { /* Updated review */ }
}
```

### Delete Review
```typescript
DELETE /api/reviews/{id}
Authorization: Bearer {token}

Response: 204 No Content
```

### Vote on Review
```typescript
POST /api/reviews/{id}/vote
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "isHelpful": true
}

Response:
{
  "data": {
    "reviewId": 456,
    "userId": 5,
    "isHelpful": true,
    "createdAt": "2025-10-25T10:30:00Z"
  }
}
```

---

## Users

### Get User by ID
```typescript
GET /api/users/{id}

Response:
{
  "data": {
    "id": 5,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "USER",
    "avatarUrl": "https://...",
    "bio": "Coffee enthusiast",
    "isActive": true,
    "emailVerified": true,
    "createdAt": "2025-10-25T10:30:00Z",
    "updatedAt": "2025-10-25T10:30:00Z"
  }
}
```

### Get User by Username
```typescript
GET /api/users/username/{username}

Response: (same as get by ID)
```

### Get User Profile (with stats)
```typescript
GET /api/users/{id}/profile

Response:
{
  "data": {
    "user": { /* User object */ },
    "stats": {
      "totalReviews": 45,
      "totalCoffeesSubmitted": 8,
      "averageRating": 4.2,
      "helpfulVotes": 234
    },
    "recentReviews": [ /* Review objects */ ],
    "approvedCoffees": [ /* Coffee objects */ ]
  }
}
```

### Update Profile
```typescript
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "username": "new_username",
  "bio": "Updated bio",
  "avatarUrl": "https://..."
}

Response:
{
  "data": { /* Updated user */ }
}
```

### Get User Reviews
```typescript
GET /api/users/{id}/reviews?page=1&limit=10

Response:
{
  "data": [ /* Review objects */ ],
  "pagination": { ... }
}
```

### Get User Coffees
```typescript
GET /api/users/{id}/coffees?page=1&limit=10

Response:
{
  "data": [ /* Coffee objects */ ],
  "pagination": { ... }
}
```

### Get User Preferences
```typescript
GET /api/users/preferences
Authorization: Bearer {token}

Response:
{
  "data": {
    "emailNotifications": true,
    "reviewNotifications": true,
    "coffeeApprovalNotifications": true
  }
}
```

### Update User Preferences
```typescript
PUT /api/users/preferences
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "emailNotifications": true,
  "reviewNotifications": false,
  "coffeeApprovalNotifications": true
}

Response:
{
  "message": "Preferences updated successfully"
}
```

---

## Upload

### Get Avatar Upload Signature
```typescript
GET /api/upload/signature/avatar
Authorization: Bearer {token}

Response:
{
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
```typescript
GET /api/upload/signature/coffee-image
Authorization: Bearer {token}

Response:
{
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
```typescript
GET /api/upload/signature/review-image
Authorization: Bearer {token}

Response:
{
  "data": {
    "signature": "abc123...",
    "timestamp": 1635789456,
    "cloudName": "sipzy",
    "apiKey": "123456789",
    "folder": "reviews"
  }
}
```

---

## Admin

### Get Admin Stats
```typescript
GET /api/admin/stats
Authorization: Bearer {admin-token}

Response:
{
  "data": {
    "totalCoffees": 234,
    "totalUsers": 567,
    "totalReviews": 890,
    "pendingCoffees": 12,
    "pendingReports": 3,
    "approvedCoffees": 210,
    "rejectedCoffees": 12
  }
}
```

### Get Pending Coffees
```typescript
GET /api/admin/coffees/pending?page=1&limit=10
Authorization: Bearer {admin-token}

Response:
{
  "data": [ /* Coffee objects */ ],
  "pagination": { ... }
}
```

### Get All Coffees (Admin)
```typescript
GET /api/admin/coffees?status=APPROVED&search=Ethiopia&page=1&limit=20
Authorization: Bearer {admin-token}

Query Parameters:
- status?: "PENDING" | "APPROVED" | "REJECTED"
- search?: string
- page?: number (default: 1)
- limit?: number (default: 20)

Response:
{
  "data": [ /* Coffee objects */ ],
  "pagination": { ... }
}
```

### Approve Coffee
```typescript
PUT /api/admin/coffees/{id}/approve
Authorization: Bearer {admin-token}
Content-Type: application/json

Request:
{
  "adminNotes": "Approved - verified info"
}

Response:
{
  "data": { /* Approved coffee */ }
}
```

### Reject Coffee
```typescript
PUT /api/admin/coffees/{id}/reject
Authorization: Bearer {admin-token}
Content-Type: application/json

Request:
{
  "adminNotes": "Rejected - incorrect information"
}

Response:
{
  "data": { /* Rejected coffee */ }
}
```

### Get All Users
```typescript
GET /api/admin/users?page=1&limit=20
Authorization: Bearer {admin-token}

Response:
{
  "data": [ /* User objects */ ],
  "pagination": { ... }
}
```

### Ban User
```typescript
PUT /api/admin/users/{id}/ban
Authorization: Bearer {admin-token}
Content-Type: application/json

Request:
{
  "reason": "Spam or inappropriate behavior"
}

Response:
{
  "data": { /* Updated user */ }
}
```

### Unban User
```typescript
PUT /api/admin/users/{id}/unban
Authorization: Bearer {admin-token}

Response:
{
  "data": { /* Updated user */ }
}
```

### Get Pending Reports
```typescript
GET /api/admin/reports/pending?page=1&limit=10
Authorization: Bearer {admin-token}

Response:
{
  "data": [
    {
      "id": 1,
      "reportedBy": 5,
      "reportedByUser": { /* User object */ },
      "entityType": "REVIEW" | "COFFEE" | "USER",
      "entityId": 123,
      "reason": "SPAM" | "OFFENSIVE" | "INAPPROPRIATE" | "COPYRIGHT" | "OTHER",
      "description": "...",
      "status": "PENDING",
      "resolvedBy": null,
      "resolvedByUser": null,
      "resolvedAt": null,
      "adminNotes": null,
      "createdAt": "2025-10-25T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Get All Reports
```typescript
GET /api/admin/reports?status=RESOLVED&page=1&limit=20
Authorization: Bearer {admin-token}

Query Parameters:
- status?: "PENDING" | "RESOLVED" | "DISMISSED"
- page?: number (default: 1)
- limit?: number (default: 20)

Response:
{
  "data": [ /* Report objects */ ],
  "pagination": { ... }
}
```

### Resolve Report
```typescript
PUT /api/admin/reports/{id}/resolve
Authorization: Bearer {admin-token}
Content-Type: application/json

Request:
{
  "adminNotes": "Content removed, user warned"
}

Response:
{
  "data": { /* Updated report */ }
}
```

### Dismiss Report
```typescript
PUT /api/admin/reports/{id}/dismiss
Authorization: Bearer {admin-token}
Content-Type: application/json

Request:
{
  "adminNotes": "No violation found"
}

Response:
{
  "data": { /* Updated report */ }
}
```

### Get Recent Activity
```typescript
GET /api/admin/activity?limit=10
Authorization: Bearer {admin-token}

Response:
{
  "data": [
    {
      "id": 1,
      "type": "coffee_submitted" | "coffee_approved" | "coffee_rejected" | "report_created",
      "message": "Nouveau café proposé : Ethiopia Yirgacheffe",
      "timestamp": "2025-10-25T10:30:00Z",
      "user": { /* User object */ },
      "coffee": { /* Coffee object */ }
    }
  ]
}
```

---

## Favorites (Client-side)

**Note:** Les favoris sont actuellement gérés côté client via `localStorage`. Une API backend pourrait être ajoutée pour synchroniser entre appareils.

```typescript
// Client-side operations via favoritesApi
import { favoritesApi } from '@/lib/api/favoritesApi';

// Get favorite IDs
const favoriteIds = favoritesApi.getFavoriteIds(userId);

// Get full favorite coffees
const favorites = await favoritesApi.getFavorites(userId);

// Check if coffee is favorite
const isFav = favoritesApi.isFavorite(userId, coffeeId);

// Toggle favorite
const added = favoritesApi.toggleFavorite(userId, coffeeId);

// Get count
const count = favoritesApi.getFavoritesCount(userId);
```

---

## Data Models

### User
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Coffee
```typescript
interface Coffee {
  id: number;
  name: string;
  roasterId?: number;
  roaster?: Roaster;
  origin?: string;
  process?: string;
  variety?: string;
  altitudeMin?: number;
  altitudeMax?: number;
  harvestYear?: number;
  priceRange?: string;
  description?: string;
  imageUrl?: string;
  avgRating: number;
  reviewCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedBy?: number;
  submittedByUser?: User;
  approvedBy?: number;
  approvedByUser?: User;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: Note[];
  reviews?: Review[];
}
```

### Review
```typescript
interface Review {
  id: number;
  coffeeId: number;
  coffee?: Coffee;
  userId: number;
  user?: User;
  rating: number;
  comment: string;
  imageUrl?: string;
  helpfulCount: number;
  notHelpfulCount: number;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Roaster
```typescript
interface Roaster {
  id: number;
  name: string;
  country?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Note
```typescript
interface Note {
  id: number;
  name: string;
  category: string;
  description?: string;
  createdAt: string;
}
```

### Report
```typescript
interface Report {
  id: number;
  reportedBy: number;
  reportedByUser?: User;
  entityType: 'REVIEW' | 'COFFEE' | 'USER';
  entityId: number;
  reason: 'SPAM' | 'OFFENSIVE' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'OTHER';
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  resolvedBy?: number;
  resolvedByUser?: User;
  resolvedAt?: string;
  adminNotes?: string;
  createdAt: string;
}
```

### PaginatedResponse
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

---

## Error Handling

### Standard Error Response
```typescript
{
  "error": {
    "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "NOT_FOUND" | "SERVER_ERROR",
    "message": "Error message",
    "details": {
      "field": "Field-specific error"
    }
  },
  "timestamp": "2025-10-25T10:30:00Z"
}
```

### HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Conflict with existing resource
- `500 Internal Server Error` - Server error

---

## API Client Usage

### TypeScript Example
```typescript
import { coffeeApi, reviewApi, authApi } from '@/lib/api/mockApi';
import { profileApi } from '@/lib/api/profileApi';
import { adminApi } from '@/lib/api/adminApi';

// Authentication
const authResult = await authApi.login('user@example.com', 'password');

// Get coffees with filters
const coffees = await coffeeApi.getCoffees({
  search: 'Ethiopia',
  origin: ['Ethiopia', 'Kenya'],
  minRating: 4.0,
  sortBy: 'rating',
  sortOrder: 'desc'
}, 1, 12);

// Get coffee details
const coffee = await coffeeApi.getCoffeeById(123);

// Create review
const review = await reviewApi.createReview({
  coffeeId: 123,
  userId: 1,
  rating: 5,
  comment: 'Amazing!',
  imageUrl: 'https://...'
});

// Get user profile
const profile = await profileApi.getUserProfile('john_doe');

// Admin operations
const stats = await adminApi.getStats();
const pendingCoffees = await adminApi.getPendingCoffees(1, 10);
```

---

## Notes

- Toutes les dates sont au format ISO 8601
- Les tokens JWT doivent être inclus dans le header `Authorization: Bearer {token}`
- Les images sont uploadées via Cloudinary avec signatures générées côté backend
- La pagination commence à la page 1
- Les filtres multiples utilisent des tableaux (comma-separated en query params)
- Les favoris sont actuellement gérés côté client uniquement
