import { z } from 'zod';

// ===================================
// AUTH SCHEMAS
// ===================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Le pseudo doit contenir au moins 3 caractères')
    .max(50, 'Le pseudo ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores'),
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z
    .string()
    .min(1, 'La confirmation du mot de passe est requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ===================================
// COFFEE SCHEMAS
// ===================================

export const addCoffeeSchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  roasterId: z
    .number()
    .min(1, 'Le torréfacteur est requis')
    .or(z.string().transform(Number)),
  origin: z
    .string()
    .min(2, 'L\'origine est requise')
    .max(100, 'L\'origine ne peut pas dépasser 100 caractères')
    .optional(),
  process: z
    .string()
    .max(50, 'Le processus ne peut pas dépasser 50 caractères')
    .optional(),
  variety: z
    .string()
    .max(100, 'La variété ne peut pas dépasser 100 caractères')
    .optional(),
  altitudeMin: z
    .number()
    .min(0, 'L\'altitude minimum doit être positive')
    .max(5000, 'L\'altitude maximum est 5000m')
    .optional()
    .or(z.string().transform(Number).optional()),
  altitudeMax: z
    .number()
    .min(0, 'L\'altitude maximum doit être positive')
    .max(5000, 'L\'altitude maximum est 5000m')
    .optional()
    .or(z.string().transform(Number).optional()),
  harvestYear: z
    .number()
    .min(2000, 'L\'année de récolte doit être après 2000')
    .max(new Date().getFullYear() + 1, 'L\'année de récolte ne peut pas être dans le futur')
    .optional()
    .or(z.string().transform(Number).optional()),
  priceRange: z
    .enum(['€', '€€', '€€€', '€€€€'])
    .optional(),
  description: z
    .string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  imageUrl: z
    .string()
    .url('URL d\'image invalide')
    .optional(),
  noteIds: z
    .array(z.number())
    .min(1, 'Sélectionnez au moins une note aromatique')
    .max(10, 'Vous ne pouvez sélectionner que 10 notes maximum'),
});

export type AddCoffeeInput = z.infer<typeof addCoffeeSchema>;

// ===================================
// REVIEW SCHEMAS
// ===================================

export const addReviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'La note doit être au moins 1')
    .max(5, 'La note ne peut pas dépasser 5'),
  comment: z
    .string()
    .min(10, 'Le commentaire doit contenir au moins 10 caractères')
    .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères'),
  imageUrl: z
    .string()
    .url('URL d\'image invalide')
    .optional(),
});

export type AddReviewInput = z.infer<typeof addReviewSchema>;

// ===================================
// PROFILE SCHEMAS
// ===================================

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Le pseudo doit contenir au moins 3 caractères')
    .max(50, 'Le pseudo ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores')
    .optional(),
  bio: z
    .string()
    .max(500, 'La bio ne peut pas dépasser 500 caractères')
    .optional(),
  avatarUrl: z
    .string()
    .url('URL d\'avatar invalide')
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateProfilePreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  reviewNotifications: z.boolean(),
  coffeeApprovalNotifications: z.boolean(),
});

export type UpdateProfilePreferencesInput = z.infer<typeof updateProfilePreferencesSchema>;

// ===================================
// REPORT SCHEMAS
// ===================================

export const reportSchema = z.object({
  reason: z
    .enum(['SPAM', 'OFFENSIVE', 'INAPPROPRIATE', 'COPYRIGHT', 'OTHER'], {
      errorMap: () => ({ message: 'Veuillez sélectionner un motif' }),
    }),
  description: z
    .string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;

// ===================================
// SEARCH & FILTER SCHEMAS
// ===================================

export const coffeeFiltersSchema = z.object({
  search: z.string().optional(),
  origins: z.array(z.string()).optional(),
  roasters: z.array(z.string()).optional(),
  notes: z.array(z.string()).optional(),
  processes: z.array(z.string()).optional(),
  minRating: z.number().min(0).max(5).optional(),
  sortBy: z.enum(['rating', 'reviews', 'recent', 'name']).optional(),
});

export type CoffeeFiltersInput = z.infer<typeof coffeeFiltersSchema>;
