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

## Coffees

### List Coffees
```http
GET /api/coffees?page=1&limit=12&origin=Ethiopia&minRating=4.0
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

## Reviews

### Get Reviews for Coffee
```http
GET /api/coffees/{coffeeId}/reviews?page=1&limit=10&sortBy=helpful
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

### Vote on Review
```http
POST /api/reviews/{id}/vote
Authorization: Bearer {token}
Content-Type: application/json

{
  "isHelpful": true
}
```

## Admin

### Get Stats
```http
GET /api/admin/stats
Authorization: Bearer {admin-token}
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

## Response Format

### Success
```json
{
  "data": {...},
  "message": "Success",
  "timestamp": "2025-10-25T10:30:00Z"
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": {...}
  },
  "timestamp": "2025-10-25T10:30:00Z"
}
```

## Swagger UI

Interactive API documentation: `http://localhost:8080/swagger-ui.html`
