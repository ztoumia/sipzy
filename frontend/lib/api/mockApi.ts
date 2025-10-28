import { Coffee, User, Review, Roaster, Note, CoffeeFilters, PaginatedResponse } from '@/types';

// Simuler un délai réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Charger les données mockées (cached pour permettre des mutations en runtime)
let cachedData: null | {
  coffees: Coffee[];
  users: User[];
  reviews: Review[];
  roasters: Roaster[];
  notes: Note[];
} = null;

const loadMockData = async () => {
  if (cachedData) return cachedData;

  const [coffeesData, usersData, reviewsData, roastersData, notesData] = await Promise.all([
    import('@/mocks/coffees.json'),
    import('@/mocks/users.json'),
    import('@/mocks/reviews.json'),
    import('@/mocks/roasters.json'),
    import('@/mocks/notes.json'),
  ]);

  cachedData = {
    coffees: coffeesData.default as Coffee[],
    users: usersData.default as User[],
    reviews: reviewsData.default as Review[],
    roasters: roastersData.default as Roaster[],
    notes: notesData.default as Note[],
  };

  return cachedData;
};

// API pour les cafés
export const coffeeApi = {
  // Récupérer tous les cafés avec filtres et pagination
  async getCoffees(filters: CoffeeFilters = {}, page = 1, limit = 12): Promise<PaginatedResponse<Coffee>> {
    await delay(300); // Simuler délai réseau
    
    const data = await loadMockData();
    let filteredCoffees = [...data.coffees];

    // Appliquer les filtres
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCoffees = filteredCoffees.filter(coffee =>
        coffee.name.toLowerCase().includes(searchLower) ||
        coffee.origin?.toLowerCase().includes(searchLower) ||
        coffee.roaster?.name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.origin && filters.origin.length > 0) {
      filteredCoffees = filteredCoffees.filter(coffee =>
        coffee.origin && filters.origin!.includes(coffee.origin)
      );
    }

    if (filters.roasterId && filters.roasterId.length > 0) {
      filteredCoffees = filteredCoffees.filter(coffee =>
        coffee.roasterId && filters.roasterId!.includes(coffee.roasterId)
      );
    }

    if (filters.noteIds && filters.noteIds.length > 0) {
      filteredCoffees = filteredCoffees.filter(coffee =>
        coffee.notes?.some(note => filters.noteIds!.includes(note.id))
      );
    }

    if (filters.priceRange && filters.priceRange.length > 0) {
      filteredCoffees = filteredCoffees.filter(coffee =>
        coffee.priceRange && filters.priceRange!.includes(coffee.priceRange)
      );
    }

    if (filters.minRating) {
      filteredCoffees = filteredCoffees.filter(coffee =>
        coffee.avgRating >= filters.minRating!
      );
    }

    // Appliquer le tri
    if (filters.sortBy) {
      filteredCoffees.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'rating':
            aValue = a.avgRating;
            bValue = b.avgRating;
            break;
          case 'reviews':
            aValue = a.reviewCount;
            bValue = b.reviewCount;
            break;
          case 'created':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    // Pagination
    const total = filteredCoffees.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCoffees = filteredCoffees.slice(startIndex, endIndex);

    return {
      data: paginatedCoffees,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  // Récupérer un café par ID
  async getCoffeeById(id: number): Promise<Coffee | null> {
    await delay(200);
    
    const data = await loadMockData();
    const coffee = data.coffees.find(c => c.id === id);
    
    if (!coffee) return null;

    // Ajouter les avis associés
    const reviews = data.reviews.filter(r => r.coffeeId === id);
    return { ...coffee, reviews };
  },

  // Récupérer les cafés populaires
  async getPopularCoffees(limit = 8): Promise<Coffee[]> {
    await delay(250);
    
    const data = await loadMockData();
    return data.coffees
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit);
  },

  // Récupérer les cafés récents
  async getRecentCoffees(limit = 8): Promise<Coffee[]> {
    await delay(250);
    
    const data = await loadMockData();
    return data.coffees
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  // Récupérer les cafés similaires
  async getSimilarCoffees(coffeeId: number, limit = 4): Promise<Coffee[]> {
    await delay(200);
    
    const data = await loadMockData();
    const targetCoffee = data.coffees.find(c => c.id === coffeeId);
    
    if (!targetCoffee) return [];

    // Trouver des cafés avec la même origine ou des notes similaires
    const similarCoffees = data.coffees
      .filter(c => c.id !== coffeeId)
      .filter(c => 
        c.origin === targetCoffee.origin ||
        c.notes?.some(note => 
          targetCoffee.notes?.some(targetNote => targetNote.id === note.id)
        )
      )
      .slice(0, limit);

    return similarCoffees;
  },
};

// API pour les avis
export const reviewApi = {
  // Récupérer les avis d'un café
  async getReviewsByCoffeeId(coffeeId: number, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
    await delay(200);
    
    const data = await loadMockData();
    const reviews = data.reviews.filter(r => r.coffeeId === coffeeId);
    
    // Trier par plus utiles puis par date
    reviews.sort((a, b) => {
      if (a.helpfulCount !== b.helpfulCount) {
        return b.helpfulCount - a.helpfulCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = reviews.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    return {
      data: paginatedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  // Récupérer les avis récents
  async getRecentReviews(limit = 6): Promise<Review[]> {
    await delay(200);
    
    const data = await loadMockData();
    return data.reviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  // Créer un nouvel avis (mock in-memory)
  async createReview(payload: {
    coffeeId: number;
    userId: number;
    rating: number;
    comment: string;
    imageUrl?: string | null;
  }): Promise<Review> {
    await delay(300);

    const data = await loadMockData();

    const newId = data.reviews.length > 0 ? Math.max(...data.reviews.map(r => r.id)) + 1 : 1;
    const user = data.users.find(u => u.id === payload.userId) || null;
    const coffee = data.coffees.find(c => c.id === payload.coffeeId) || null;

    const newReview: Review = {
      id: newId,
      coffeeId: payload.coffeeId,
      coffee: coffee ? { id: coffee.id, name: coffee.name, roasterId: coffee.roasterId, origin: coffee.origin, process: coffee.process, variety: coffee.variety, altitudeMin: coffee.altitudeMin, altitudeMax: coffee.altitudeMax, harvestYear: coffee.harvestYear, priceRange: coffee.priceRange, description: coffee.description, imageUrl: coffee.imageUrl, avgRating: coffee.avgRating, reviewCount: coffee.reviewCount, status: coffee.status, submittedBy: coffee.submittedBy } as any : undefined,
      userId: payload.userId,
      user: user || undefined,
      rating: payload.rating,
      comment: payload.comment,
      imageUrl: payload.imageUrl || null,
      helpfulCount: 0,
      notHelpfulCount: 0,
      isFlagged: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Review;

    // mettre à jour le cache
    data.reviews.unshift(newReview);

    // mettre à jour les compteurs du café si présent
    const targetCoffee = data.coffees.find(c => c.id === payload.coffeeId);
    if (targetCoffee) {
      targetCoffee.reviewCount = (targetCoffee.reviewCount || 0) + 1;
      // recalcul simple de la moyenne
      const coffeeReviews = data.reviews.filter(r => r.coffeeId === payload.coffeeId);
      targetCoffee.avgRating = +(coffeeReviews.reduce((s, r) => s + r.rating, 0) / coffeeReviews.length).toFixed(2);
    }

    return newReview;
  },
};

// API pour les utilisateurs
export const userApi = {
  // Récupérer un utilisateur par ID
  async getUserById(id: number): Promise<User | null> {
    await delay(150);
    
    const data = await loadMockData();
    return data.users.find(u => u.id === id) || null;
  },

  // Récupérer un utilisateur par username
  async getUserByUsername(username: string): Promise<User | null> {
    await delay(150);
    
    const data = await loadMockData();
    return data.users.find(u => u.username === username) || null;
  },

  // Récupérer les avis d'un utilisateur
  async getUserReviews(userId: number, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
    await delay(200);
    
    const data = await loadMockData();
    const reviews = data.reviews.filter(r => r.userId === userId);
    
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = reviews.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    return {
      data: paginatedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },
};

// API pour les torréfacteurs
export const roasterApi = {
  // Récupérer tous les torréfacteurs
  async getRoasters(): Promise<Roaster[]> {
    await delay(150);
    
    const data = await loadMockData();
    return data.roasters;
  },

  // Récupérer un torréfacteur par ID
  async getRoasterById(id: number): Promise<Roaster | null> {
    await delay(150);
    
    const data = await loadMockData();
    return data.roasters.find(r => r.id === id) || null;
  },
};

// API pour les notes aromatiques
export const noteApi = {
  // Récupérer toutes les notes
  async getNotes(): Promise<Note[]> {
    await delay(100);
    
    const data = await loadMockData();
    return data.notes;
  },

  // Récupérer les notes par catégorie
  async getNotesByCategory(category: string): Promise<Note[]> {
    await delay(100);
    
    const data = await loadMockData();
    return data.notes.filter(note => note.category === category);
  },
};

// API pour l'authentification (mock)
export const authApi = {
  // Connexion
  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    await delay(500); // Simuler délai de connexion
    
    const data = await loadMockData();
    const user = data.users.find(u => u.email === email);
    
    // Mock simple : si l'email existe, on accepte n'importe quel mot de passe
    if (user && password.length >= 6) {
      return {
        user,
        token: `mock_token_${user.id}_${Date.now()}`,
      };
    }
    
    return null;
  },

  // Inscription
  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<{ user: User; token: string } | null> {
    await delay(800); // Simuler délai d'inscription
    
    const data = await loadMockData();
    
    // Vérifier si l'email ou username existe déjà
    const existingUser = data.users.find(u => 
      u.email === userData.email || u.username === userData.username
    );
    
    if (existingUser) {
      return null;
    }
    
    // Créer un nouvel utilisateur
    const newUser: User = {
      id: Math.max(...data.users.map(u => u.id)) + 1,
      username: userData.username,
      email: userData.email,
      role: 'USER',
      isActive: true,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return {
      user: newUser,
      token: `mock_token_${newUser.id}_${Date.now()}`,
    };
  },

  // Vérifier le token
  async verifyToken(token: string): Promise<User | null> {
    await delay(100);
    
    // Mock simple : extraire l'ID utilisateur du token
    const match = token.match(/mock_token_(\d+)_/);
    if (!match) return null;
    
    const userId = parseInt(match[1]);
    const data = await loadMockData();
    return data.users.find(u => u.id === userId) || null;
  },
};
