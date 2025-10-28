import { Coffee, Report, User } from '@/types';

// Simuler un délai réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Types pour l'admin
export interface AdminStats {
  totalCoffees: number;
  totalUsers: number;
  totalReviews: number;
  pendingCoffees: number;
  pendingReports: number;
  approvedCoffees: number;
  rejectedCoffees: number;
}

export interface CoffeeModerationAction {
  coffeeId: number;
  action: 'APPROVE' | 'REJECT';
  adminNotes?: string;
  adminId: number;
}

export interface ReportAction {
  reportId: number;
  action: 'RESOLVED' | 'DISMISSED';
  adminNotes?: string;
  adminId: number;
}

// Charger les données depuis le cache global
let cachedData: {
  coffees: Coffee[];
  users: User[];
  reviews: any[];
  reports: Report[];
} | null = null;

const loadData = async () => {
  if (cachedData) return cachedData;

  const [coffeesData, usersData, reviewsData] = await Promise.all([
    import('@/mocks/coffees.json'),
    import('@/mocks/users.json'),
    import('@/mocks/reviews.json'),
  ]);

  cachedData = {
    coffees: coffeesData.default as Coffee[],
    users: usersData.default as User[],
    reviews: reviewsData.default,
    reports: [], // Pour l'instant, pas de mock de reports
  };

  return cachedData;
};

// API Admin
export const adminApi = {
  /**
   * Récupérer les statistiques du dashboard admin
   */
  async getStats(): Promise<AdminStats> {
    await delay(300);

    const data = await loadData();

    return {
      totalCoffees: data.coffees.length,
      totalUsers: data.users.length,
      totalReviews: data.reviews.length,
      pendingCoffees: data.coffees.filter(c => c.status === 'PENDING').length,
      pendingReports: data.reports.filter(r => r.status === 'PENDING').length,
      approvedCoffees: data.coffees.filter(c => c.status === 'APPROVED').length,
      rejectedCoffees: data.coffees.filter(c => c.status === 'REJECTED').length,
    };
  },

  /**
   * Récupérer les cafés en attente de modération
   */
  async getPendingCoffees(page = 1, limit = 10): Promise<{
    data: Coffee[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    await delay(400);

    const data = await loadData();
    const pendingCoffees = data.coffees.filter(c => c.status === 'PENDING');

    // Tri par date de création (plus récent en premier)
    pendingCoffees.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = pendingCoffees.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: pendingCoffees.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  /**
   * Approuver un café
   */
  async approveCoffee(action: CoffeeModerationAction): Promise<Coffee> {
    await delay(500);

    const data = await loadData();
    const coffee = data.coffees.find(c => c.id === action.coffeeId);

    if (!coffee) {
      throw new Error('Café non trouvé');
    }

    // Mettre à jour le statut
    coffee.status = 'APPROVED';
    coffee.approvedBy = action.adminId;
    coffee.approvedAt = new Date().toISOString();

    return coffee;
  },

  /**
   * Rejeter un café
   */
  async rejectCoffee(action: CoffeeModerationAction): Promise<Coffee> {
    await delay(500);

    const data = await loadData();
    const coffee = data.coffees.find(c => c.id === action.coffeeId);

    if (!coffee) {
      throw new Error('Café non trouvé');
    }

    // Mettre à jour le statut
    coffee.status = 'REJECTED';
    coffee.approvedBy = action.adminId;
    coffee.approvedAt = new Date().toISOString();

    // Stocker les notes admin (en prod, ce serait dans une table séparée)
    (coffee as any).rejectionReason = action.adminNotes;

    return coffee;
  },

  /**
   * Récupérer tous les cafés avec filtres
   */
  async getAllCoffees(filters?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    search?: string;
  }, page = 1, limit = 20): Promise<{
    data: Coffee[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    await delay(300);

    const data = await loadData();
    let coffees = [...data.coffees];

    // Appliquer les filtres
    if (filters?.status) {
      coffees = coffees.filter(c => c.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      coffees = coffees.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.origin?.toLowerCase().includes(searchLower) ||
        c.roaster?.name.toLowerCase().includes(searchLower)
      );
    }

    // Tri par date de création (plus récent en premier)
    coffees.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = coffees.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: coffees.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  /**
   * Récupérer les signalements
   */
  async getReports(filters?: {
    status?: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  }, page = 1, limit = 20): Promise<{
    data: Report[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    await delay(300);

    const data = await loadData();
    let reports = [...data.reports];

    // Appliquer les filtres
    if (filters?.status) {
      reports = reports.filter(r => r.status === filters.status);
    }

    // Tri par date de création (plus récent en premier)
    reports.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = reports.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: reports.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  /**
   * Traiter un signalement
   */
  async handleReport(action: ReportAction): Promise<Report> {
    await delay(500);

    const data = await loadData();
    const report = data.reports.find(r => r.id === action.reportId);

    if (!report) {
      throw new Error('Signalement non trouvé');
    }

    // Mettre à jour le statut
    report.status = action.action;
    report.resolvedBy = action.adminId;
    report.resolvedAt = new Date().toISOString();
    report.adminNotes = action.adminNotes;

    return report;
  },

  /**
   * Récupérer les activités récentes pour le dashboard
   */
  async getRecentActivity(limit = 10): Promise<Array<{
    id: number;
    type: 'coffee_submitted' | 'coffee_approved' | 'coffee_rejected' | 'report_created';
    message: string;
    timestamp: string;
    user?: User;
    coffee?: Coffee;
  }>> {
    await delay(200);

    const data = await loadData();

    // Créer des activités basées sur les données
    const activities: Array<any> = [];

    // Cafés récents
    data.coffees
      .filter(c => c.status === 'PENDING')
      .slice(0, 5)
      .forEach(coffee => {
        activities.push({
          id: coffee.id,
          type: 'coffee_submitted',
          message: `Nouveau café proposé : ${coffee.name}`,
          timestamp: coffee.createdAt,
          coffee,
          user: coffee.submittedByUser,
        });
      });

    // Trier par date (plus récent en premier)
    activities.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return activities.slice(0, limit);
  },
};
