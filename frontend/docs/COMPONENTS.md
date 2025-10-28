# Component Library

## Layout Components

### Navbar
```tsx
import Navbar from '@/components/layout/Navbar';

<Navbar />
```
Global navigation with authentication state.

### PageLayout
```tsx
import PageLayout from '@/components/layout/PageLayout';

<PageLayout>
  <YourContent />
</PageLayout>
```
Includes skip link for accessibility.

## Coffee Components

### CoffeeCard
```tsx
import CoffeeCard from '@/components/CoffeeCard';

<CoffeeCard
  coffee={coffee}
  onFavoriteToggle={(id) => handleFavorite(id)}
/>
```

**Props:**
- `coffee` - Coffee object
- `onFavoriteToggle?` - Optional favorite toggle handler

### FilterBar
```tsx
import FilterBar from '@/components/FilterBar';

<FilterBar
  filters={filters}
  onFilterChange={handleFilterChange}
/>
```

## Review Components

### ReviewCard
```tsx
import ReviewCard from '@/components/ReviewCard';

<ReviewCard
  review={review}
  onVote={(id, isHelpful) => handleVote(id, isHelpful)}
/>
```

### AddReviewModal
```tsx
import AddReviewModal from '@/components/AddReviewModal';

<AddReviewModal
  coffeeId={coffeeId}
  isOpen={isOpen}
  onClose={handleClose}
  onSubmit={handleSubmit}
/>
```

## Form Components

### StarRating
```tsx
import StarRating from '@/components/StarRating';

<StarRating
  rating={4.5}
  onRatingChange={handleRating}
  readonly={false}
/>
```

### ImageUpload
```tsx
import ImageUpload from '@/components/ImageUpload';

<ImageUpload
  onImageSelect={handleImage}
  maxSize={5 * 1024 * 1024} // 5MB
/>
```

## UI Components

### Toast
```tsx
import { useToast } from '@/hooks/useToast';

const { showToast } = useToast();

showToast({
  message: 'Success!',
  type: 'success' // 'success' | 'error' | 'info'
});
```

## Contexts

### AuthContext
```tsx
import { useAuth } from '@/hooks/useAuth';

const { user, login, logout, isAuthenticated } = useAuth();
```

**Methods:**
- `login(email, password)` - User login
- `logout()` - User logout
- `register(data)` - User registration

## Custom Hooks

### useAuth
Authentication state and methods.

### useToast
Toast notification system.

### useFavorites
Manage user favorites (localStorage).
