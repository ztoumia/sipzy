# Upload d'Images avec Cloudinary

## Architecture

L'upload d'images utilise une approche **signature-based** pour plus de sécurité et de performance:

1. **Frontend** choisit le fichier (avatar, image de café, etc.)
2. **Frontend** demande une signature temporaire au backend via l'API
3. **Backend** génère la signature sécurisée avec `api_secret` et définit le `public_id`
4. **Frontend** envoie le fichier **directement à Cloudinary** avec la signature
5. **Backend** peut optionnellement supprimer/remplacer l'ancienne image

## Avantages

- ✅ **Performance**: Le fichier ne passe pas par le serveur backend
- ✅ **Sécurité**: La signature expire et est unique par upload
- ✅ **Scalabilité**: Pas de charge sur le serveur backend
- ✅ **Transformation**: Cloudinary applique automatiquement les transformations (resize, crop, etc.)

## Endpoints Backend

### 1. Obtenir une signature pour avatar

```http
GET /api/upload/signature/avatar
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signature": "a1b2c3d4e5f6...",
    "timestamp": 1234567890,
    "cloudName": "sipzy",
    "apiKey": "123456789",
    "folder": "avatars",
    "publicId": "user_42_uuid-here"
  }
}
```

### 2. Obtenir une signature pour image de café

```http
GET /api/upload/signature/coffee-image
Authorization: Bearer <JWT_TOKEN>
```

**Response:** (même structure que avatar)

### 3. Obtenir une signature pour image d'avis

```http
GET /api/upload/signature/review-image
Authorization: Bearer <JWT_TOKEN>
```

**Response:** (même structure que avatar)

## Flow Frontend (Exemple avec Avatar)

### Étape 1: Demander la signature au backend

```javascript
// 1. Utilisateur sélectionne un fichier
const file = event.target.files[0];

// 2. Demander une signature au backend
const response = await fetch('/api/upload/signature/avatar', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { signature, timestamp, cloudName, apiKey, folder, publicId } = await response.json().data;
```

### Étape 2: Upload direct à Cloudinary

```javascript
// 3. Créer FormData pour Cloudinary
const formData = new FormData();
formData.append('file', file);
formData.append('signature', signature);
formData.append('timestamp', timestamp);
formData.append('api_key', apiKey);
formData.append('folder', folder);
formData.append('public_id', publicId);

// 4. Uploader directement à Cloudinary
const cloudinaryResponse = await fetch(
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  {
    method: 'POST',
    body: formData
  }
);

const result = await cloudinaryResponse.json();
const imageUrl = result.secure_url;

// 5. Utiliser l'URL de l'image uploadée
console.log('Image uploadée:', imageUrl);
```

### Étape 3: Mettre à jour le profil avec la nouvelle URL

```javascript
// 6. Envoyer l'URL au backend pour mettre à jour le profil
await fetch('/api/users/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    avatarUrl: imageUrl
  })
});
```

## Transformations Automatiques

Le backend configure automatiquement les transformations Cloudinary:

### Avatar
- Taille: 200x200px
- Crop: `fill` avec détection de visage (`gravity: face`)
- Format: Auto (WebP si supporté)
- Qualité: Auto

### Images de Café/Avis
- Taille max: 800x600px
- Crop: `limit` (garde le ratio)
- Format: Auto (WebP si supporté)
- Qualité: Auto

## Sécurité

- ✅ **JWT requis**: L'utilisateur doit être authentifié pour obtenir une signature
- ✅ **Signature expirante**: Chaque signature est liée à un timestamp
- ✅ **Public ID unique**: Chaque upload a un ID unique généré par le backend
- ✅ **Validation Cloudinary**: Cloudinary valide la signature avant d'accepter l'upload
- ✅ **Folder isolation**: Les images sont organisées par dossiers (avatars, coffees, reviews)

## Gestion des Anciennes Images

Pour supprimer une ancienne image lors du remplacement d'un avatar:

```java
// Dans UserCommandService.updateProfile()
if (oldAvatarUrl != null) {
    // Extraire le public_id de l'ancienne URL
    // Appeler cloudinary.uploader().destroy(publicId)
}
```

## Exemple Complet React

```typescript
import { useState } from 'react';

const AvatarUpload = () => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // 1. Get signature from backend
      const signatureRes = await fetch('/api/upload/signature/avatar', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { signature, timestamp, cloudName, apiKey, folder, publicId } =
        await signatureRes.json().data;

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('folder', folder);
      formData.append('public_id', publicId);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const { secure_url } = await uploadRes.json();

      // 3. Update profile with new avatar URL
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatarUrl: secure_url })
      });

      console.log('Avatar mis à jour:', secure_url);
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      disabled={uploading}
    />
  );
};
```

## Notes Importantes

1. **Validation Côté Client**: Le frontend devrait valider la taille et le type de fichier avant l'upload
2. **Gestion d'Erreur**: Gérer les erreurs Cloudinary (quota dépassé, fichier invalide, etc.)
3. **Progress Bar**: Utiliser `XMLHttpRequest` ou `axios` pour afficher la progression
4. **Retry Logic**: Implémenter un retry en cas d'échec réseau
5. **Optimistic UI**: Afficher un preview local pendant l'upload

## Variables d'Environnement

Backend (`application.yml`):
```yaml
cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME}
  api-key: ${CLOUDINARY_API_KEY}
  api-secret: ${CLOUDINARY_API_SECRET}
```

Frontend (`.env`):
```
# Pas besoin de stocker api_secret côté frontend!
# Le cloud_name et api_key sont fournis par l'API de signature
```
