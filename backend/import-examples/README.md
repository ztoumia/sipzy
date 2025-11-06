# Coffee Import API - Documentation

## Overview

The Coffee Import API allows administrators to bulk import coffee and roaster data into the Sipzy application. The import functionality supports:

- ✅ Creating new roasters and coffees
- ✅ Updating existing roasters and coffees by ID
- ✅ Downloading images from external URLs and uploading to Cloudinary
- ✅ Batch import with error handling (continue on error or stop at first error)
- ✅ Auto-approval of imported coffees (optional)
- ✅ Flexible roaster and note resolution (by ID or name)
- ✅ Comprehensive error reporting and warnings

## Authentication

All import endpoints require **ADMIN role** authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Import Single Roaster

**Endpoint:** `POST /api/import/roaster`

**Description:** Import or update a single roaster.

**Request Body:**
```json
{
  "id": null,  // Optional: for updates, provide existing roaster ID
  "name": "Café de Spécialité Paris",
  "description": "Artisan roaster specializing in single-origin coffees",
  "location": "Paris, France",
  "website": "https://example.com/cafe",
  "logoUrl": "https://example.com/images/logo.jpg",  // Will be downloaded and uploaded to Cloudinary
  "isVerified": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Roaster imported successfully",
  "data": {
    "entityType": "ROASTER",
    "operation": "CREATE",  // or "UPDATE", "SKIP"
    "entityId": 1,
    "entityName": "Café de Spécialité Paris",
    "success": true,
    "errorMessage": null,
    "warning": null  // e.g., "Failed to download logo image from URL: ..."
  }
}
```

---

### 2. Import Single Coffee

**Endpoint:** `POST /api/import/coffee`

**Description:** Import or update a single coffee.

**Request Body:**
```json
{
  "id": null,  // Optional: for updates, provide existing coffee ID
  "name": "Ethiopian Yirgacheffe Natural",
  "roasterId": 1,  // Preferred: use roaster ID
  "roasterName": "Café de Spécialité Paris",  // Alternative: lookup by name
  "origin": "Ethiopia",
  "process": "Natural",
  "variety": "Heirloom",
  "altitudeMin": 1800,
  "altitudeMax": 2200,
  "harvestYear": 2024,
  "priceRange": "€€€",
  "description": "A vibrant Ethiopian coffee with intense blueberry and floral notes.",
  "imageUrl": "https://example.com/images/coffee.jpg",  // Will be downloaded
  "noteIds": [1, 2, 3],  // Preferred: use note IDs
  "noteNames": ["Blueberry", "Floral", "Citrus"],  // Alternative: lookup by name
  "submittedById": null,  // Optional: user ID, defaults to admin
  "autoApprove": false  // If true, coffee will be APPROVED immediately
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coffee imported successfully",
  "data": {
    "entityType": "COFFEE",
    "operation": "CREATE",
    "entityId": 10,
    "entityName": "Ethiopian Yirgacheffe Natural",
    "success": true,
    "errorMessage": null,
    "warning": null
  }
}
```

---

### 3. Batch Import

**Endpoint:** `POST /api/import/batch`

**Description:** Import multiple roasters and coffees in a single request.

**Request Body:**
```json
{
  "continueOnError": true,  // Continue importing even if one item fails
  "autoApprove": false,  // Apply to all coffees unless overridden
  "roasters": [
    {
      "name": "Roaster 1",
      "location": "Paris, France",
      ...
    },
    {
      "name": "Roaster 2",
      "location": "Copenhagen, Denmark",
      ...
    }
  ],
  "coffees": [
    {
      "name": "Coffee 1",
      "roasterName": "Roaster 1",
      ...
    },
    {
      "name": "Coffee 2",
      "roasterName": "Roaster 2",
      "autoApprove": true,  // Override global setting
      ...
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Import completed: 4 total, 3 created, 0 updated, 1 errors, 0 skipped",
  "data": {
    "timestamp": "2025-11-05T10:30:00Z",
    "totalProcessed": 4,
    "successCount": 3,
    "errorCount": 1,
    "skipCount": 0,
    "createCount": 3,
    "updateCount": 0,
    "results": [
      {
        "entityType": "ROASTER",
        "operation": "CREATE",
        "entityId": 1,
        "entityName": "Roaster 1",
        "success": true,
        "errorMessage": null,
        "warning": null
      },
      {
        "entityType": "COFFEE",
        "operation": "CREATE",
        "entityId": 10,
        "entityName": "Coffee 1",
        "success": true,
        "errorMessage": null,
        "warning": "Failed to download image from URL: ..."
      },
      ...
    ],
    "message": "Import completed: 4 total, 3 created, 0 updated, 1 errors, 0 skipped"
  }
}
```

---

### 4. Import Multiple Roasters

**Endpoint:** `POST /api/import/roasters`

**Description:** Convenience endpoint for importing multiple roasters.

**Request Body:** Array of roaster objects
```json
[
  {
    "name": "Roaster 1",
    ...
  },
  {
    "name": "Roaster 2",
    ...
  }
]
```

---

### 5. Import Multiple Coffees

**Endpoint:** `POST /api/import/coffees?autoApprove=false`

**Description:** Convenience endpoint for importing multiple coffees.

**Query Parameters:**
- `autoApprove` (optional, default: false): Auto-approve all imported coffees

**Request Body:** Array of coffee objects
```json
[
  {
    "name": "Coffee 1",
    ...
  },
  {
    "name": "Coffee 2",
    ...
  }
]
```

---

### 6. Health Check

**Endpoint:** `GET /api/import/health`

**Description:** Check if the import service is operational.

**Response:**
```json
{
  "success": true,
  "message": "Import service is operational",
  "data": "OK"
}
```

---

## Update Operations

To update an existing roaster or coffee, provide the `id` field in the request:

**Update Roaster:**
```json
{
  "id": 1,
  "description": "Updated description",
  "logoUrl": "https://example.com/new-logo.jpg"
}
```

**Update Coffee:**
```json
{
  "id": 10,
  "name": "Updated Coffee Name",
  "priceRange": "€€€€",
  "autoApprove": true
}
```

Only provided fields will be updated. Other fields remain unchanged.

---

## Image Handling

### Automatic Download & Upload

When you provide an `imageUrl` or `logoUrl`, the import service will:

1. ✅ Download the image from the provided URL
2. ✅ Validate image format and size (max 10 MB)
3. ✅ Upload to Cloudinary with appropriate transformations
4. ✅ Store the Cloudinary URL in the database

### Image Transformations

- **Roaster logos:** 200x200px, face crop
- **Coffee images:** 800x600px, size limit

### Image Validation

The service performs the following validations:
- Content-Type must be `image/*`
- File size must be ≤ 10 MB
- URL must be accessible (HTTP 200)

### Error Handling

If image download fails:
- The entity will still be created/updated
- A **warning** will be included in the response
- The `imageUrl`/`logoUrl` field will be `null`

---

## Error Handling

### Continue on Error (Batch Import)

When `continueOnError: true`, the import will process all items even if some fail:

```json
{
  "continueOnError": true,
  "roasters": [ ... ],
  "coffees": [ ... ]
}
```

Response will include both successes and failures:
```json
{
  "totalProcessed": 10,
  "successCount": 8,
  "errorCount": 2,
  "results": [
    { "success": true, ... },
    { "success": false, "errorMessage": "Roaster not found" },
    ...
  ]
}
```

### Stop on First Error

When `continueOnError: false`, the import stops at the first error:

```json
{
  "continueOnError": false,
  "coffees": [ ... ]
}
```

---

## Validation Rules

### Roaster Validation

- `name`: Required, max 100 characters, must be unique
- `description`: Max 1000 characters
- `location`: Max 100 characters
- `website`: Max 500 characters
- `logoUrl`: Max 500 characters, must be valid image URL

### Coffee Validation

- `name`: Required, 3-255 characters
- `roasterId` or `roasterName`: Required
- `origin`: Max 100 characters
- `process`: Max 50 characters
- `variety`: Max 100 characters
- `altitudeMin`, `altitudeMax`: 0-5000 meters
- `harvestYear`: ≥ 2000
- `priceRange`: Must match pattern `€{1,4}` (€, €€, €€€, €€€€)
- `description`: Max 2000 characters
- `imageUrl`: Max 500 characters
- `noteIds` or `noteNames`: 1-10 notes required

---

## Examples

### Example 1: Import Single Roaster

```bash
curl -X POST http://localhost:8080/api/import/roaster \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d @single-roaster-import.json
```

### Example 2: Import Single Coffee

```bash
curl -X POST http://localhost:8080/api/import/coffee \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d @single-coffee-import.json
```

### Example 3: Batch Import

```bash
curl -X POST http://localhost:8080/api/import/batch \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d @batch-import-example.json
```

### Example 4: Update Coffee

```bash
curl -X POST http://localhost:8080/api/import/coffee \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d @update-coffee-example.json
```

---

## Special Cases

### Case 1: Roaster Lookup by Name

If you don't know the roaster ID, provide the roaster name:

```json
{
  "name": "My Coffee",
  "roasterName": "Café de Spécialité Paris",
  ...
}
```

The import service will:
1. Look up the roaster by name
2. If found, use that roaster
3. If not found, return error

### Case 2: Note Lookup by Name

If you don't know note IDs, provide note names:

```json
{
  "name": "My Coffee",
  "noteNames": ["Blueberry", "Floral", "Citrus"],
  ...
}
```

The import service will:
1. Look up notes by name (case-sensitive)
2. Use all matching notes
3. If no notes found, return error

### Case 3: Duplicate Roaster Names

When creating a roaster with an existing name:
- Operation: `SKIP`
- Returns existing roaster ID
- No new roaster is created

### Case 4: Missing Images

When image download fails:
- Entity is still created/updated
- `imageUrl`/`logoUrl` is set to `null`
- Warning message is included in response

### Case 5: Auto-Approval

By default, imported coffees have status `PENDING`. To auto-approve:

**Option 1: Global setting (batch import)**
```json
{
  "autoApprove": true,
  "coffees": [ ... ]
}
```

**Option 2: Per-coffee setting**
```json
{
  "name": "My Coffee",
  "autoApprove": true,
  ...
}
```

---

## Troubleshooting

### Problem: "Roaster not found"

**Solution:** Either:
- Provide valid `roasterId`
- Provide exact `roasterName` (case-sensitive)
- Import roasters before coffees in batch import

### Problem: "At least one valid note is required"

**Solution:** Either:
- Provide valid `noteIds` (check `/api/notes` for available notes)
- Provide exact `noteNames` (case-sensitive)

### Problem: Image not downloading

**Possible causes:**
- URL is not accessible
- Content-Type is not `image/*`
- File size exceeds 10 MB
- Network timeout (30 seconds)

**Solution:**
- Verify image URL in browser
- Check image format and size
- Use direct image links (not HTML pages)

### Problem: "Another roaster already exists with name: X"

**Solution:**
- When updating, ensure no other roaster has the same name
- Use unique roaster names

---

## Integration with Frontend

The frontend can trigger imports through the admin panel:

1. **File Upload:** Upload JSON file with import data
2. **Form Input:** Fill form with roaster/coffee data
3. **Bulk Operations:** Import multiple items at once

**Frontend Implementation Example:**

```javascript
async function importCoffees(coffees, autoApprove = false) {
  const response = await fetch('/api/import/coffees?autoApprove=' + autoApprove, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(coffees)
  });

  const result = await response.json();

  if (result.success) {
    console.log('Import completed:', result.data.message);
    console.log('Details:', result.data.results);
  } else {
    console.error('Import failed:', result.message);
  }
}
```

---

## Rate Limiting

Import endpoints are subject to rate limiting:
- Admin endpoints: Higher rate limit than public endpoints
- If rate limit is exceeded, HTTP 429 (Too Many Requests) is returned

---

## Best Practices

1. ✅ **Import roasters before coffees** in batch operations
2. ✅ **Use IDs instead of names** for better performance (roasterId, noteIds)
3. ✅ **Enable continueOnError** for large batch imports
4. ✅ **Review warnings** even on successful imports
5. ✅ **Test with small batches** before large imports
6. ✅ **Use direct image URLs** (not redirect URLs)
7. ✅ **Keep image files under 5 MB** for faster uploads
8. ✅ **Validate JSON** before sending (use JSON validator)
9. ✅ **Set autoApprove carefully** - only for trusted data sources

---

## Support

For issues or questions:
- Check backend logs: `backend/logs/application.log`
- Review validation errors in API response
- Contact system administrator

---

## Changelog

### Version 1.0 (2025-11-05)
- Initial release
- Support for roaster and coffee import
- Image download and Cloudinary upload
- Batch import with error handling
- Update operations
- Comprehensive validation and error reporting
