'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Container } from '@/components/layout/Container';
import { Button } from '@sipzy/shared/components/ui/Button';
import { Input } from '@sipzy/shared/components/ui/Input';
import { Badge } from '@sipzy/shared/components/ui/Badge';
import { CoffeeCard } from '@/components/CoffeeCard';
import { FiltersPanel } from '@/components/coffees/FiltersPanel';
import { useCoffeeFilters } from '@/hooks/useCoffeeFilters';
import api from '@/lib/api/realApi';
import { Coffee, Note, Roaster } from '@sipzy/shared/types';

function CoffeesPageContent() {
  const {
    filters,
    updateFilter,
    toggleFilterValue,
    applyFilters,
    resetFilters,
    activeFiltersCount,
    hasActiveFilters,
    isFiltersPanelOpen,
    setIsFiltersPanelOpen,
  } = useCoffeeFilters();

  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [roasters, setRoasters] = useState<Roaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(filters.search);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Charger les options de filtres
  useEffect(() => {
    const loadFilterOptions = async () => {
      const [notesData, roastersData] = await Promise.all([
        api.notes.getAll(),
        api.roasters.getAll(),
      ]);
      setNotes(notesData);
      setRoasters(roastersData);
    };
    loadFilterOptions();
  }, []);

  // Charger les cafés quand les filtres changent
  useEffect(() => {
    const loadCoffees = async () => {
      setLoading(true);
      try {
        const result = await api.coffees.search({
          search: filters.search,
          origin: filters.origins.length > 0 ? filters.origins : undefined,
          roasterId: filters.roasters.length > 0 ? filters.roasters.map(name => {
            const roaster = roasters.find(r => r.name === name);
            return roaster?.id || 0;
          }) : undefined,
          noteIds: filters.notes.length > 0 ? filters.notes.map(name => {
            const note = notes.find(n => n.name === name);
            return note?.id || 0;
          }) : undefined,
          minRating: filters.minRating > 0 ? filters.minRating : undefined,
          sortBy: filters.sortBy,
          sortOrder: 'desc',
          page,
          limit: 12,
        });
        setCoffees(result.data);
        setTotalPages(result.pagination.totalPages);
      } finally {
        setLoading(false);
      }
    };

    loadCoffees();
  }, [filters, page, notes, roasters]);

  // Synchroniser searchInput avec filters.search
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput);
    applyFilters();
  };

  const availableOrigins = ['Ethiopia', 'Colombia', 'Kenya', 'Panama', 'Brazil', 'Guatemala', 'Costa Rica'];
  const availableProcesses = ['Natural', 'Washed', 'Honey', 'Anaerobic'];

  return (
    <PageLayout>
      <div className="bg-cream-50 py-8">
        <Container>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-coffee-900 mb-4">
              Découvrez nos cafés
            </h1>
            <p className="text-lg text-coffee-700 max-w-2xl mx-auto">
              Explorez notre collection de cafés spécialisés,
              sélectionnés et notés par notre communauté.
            </p>
          </div>

          {/* Search and Sort Bar */}
          <div className="bg-white rounded-lg border border-cream-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-400" />
                  <Input
                    type="search"
                    placeholder="Rechercher un café, torréfacteur, origine..."
                    className="pl-10"
                    value={searchInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                  />
                </div>
              </form>

              {/* Sort and Filters Button */}
              <div className="flex gap-2">
                <select
                  className="rounded-lg border border-coffee-300 px-3 py-2 text-sm focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  value={filters.sortBy}
                  onChange={(e) => {
                    updateFilter('sortBy', e.target.value as typeof filters.sortBy);
                    applyFilters();
                  }}
                >
                  <option value="rating">Mieux notés</option>
                  <option value="reviews">Plus d'avis</option>
                  <option value="name">Nom A-Z</option>
                  <option value="recent">Plus récents</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden relative"
                  onClick={() => setIsFiltersPanelOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filtres
                  {activeFiltersCount() > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters() && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-coffee-200">
                <span className="text-sm text-coffee-600 mr-2">Filtres actifs:</span>
                {filters.origins.map(origin => (
                  <Badge key={origin} variant="default" className="flex items-center gap-1">
                    {origin}
                    <button
                      onClick={() => {
                        toggleFilterValue('origins', origin);
                        applyFilters();
                      }}
                      className="ml-1 hover:text-coffee-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.roasters.map(roaster => (
                  <Badge key={roaster} variant="default" className="flex items-center gap-1">
                    {roaster}
                    <button
                      onClick={() => {
                        toggleFilterValue('roasters', roaster);
                        applyFilters();
                      }}
                      className="ml-1 hover:text-coffee-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.notes.map(note => (
                  <Badge key={note} variant="default" className="flex items-center gap-1">
                    {note}
                    <button
                      onClick={() => {
                        toggleFilterValue('notes', note);
                        applyFilters();
                      }}
                      className="ml-1 hover:text-coffee-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.processes.map(process => (
                  <Badge key={process} variant="default" className="flex items-center gap-1">
                    {process}
                    <button
                      onClick={() => {
                        toggleFilterValue('processes', process);
                        applyFilters();
                      }}
                      className="ml-1 hover:text-coffee-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.minRating > 0 && (
                  <Badge variant="default" className="flex items-center gap-1">
                    {filters.minRating}+ étoiles
                    <button
                      onClick={() => {
                        updateFilter('minRating', 0);
                        applyFilters();
                      }}
                      className="ml-1 hover:text-coffee-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-coffee-600 hover:text-coffee-900"
                >
                  Tout effacer
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Panel - Desktop */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <FiltersPanel
                filters={filters}
                onToggleValue={toggleFilterValue}
                onUpdateFilter={updateFilter}
                onApply={applyFilters}
                onReset={resetFilters}
                availableOrigins={availableOrigins}
                availableRoasters={roasters.map(r => r.name)}
                availableNotes={notes.map(n => n.name)}
                availableProcesses={availableProcesses}
              />
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton h-80 rounded-xl bg-coffee-100 animate-pulse" />
                  ))}
                </div>
              ) : coffees.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-coffee-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-coffee-900 mb-2">
                    Aucun café trouvé
                  </h3>
                  <p className="text-coffee-600 mb-4">
                    Essayez de modifier vos critères de recherche ou vos filtres.
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {coffees.map((coffee) => (
                      <CoffeeCard key={coffee.id} coffee={coffee} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                      <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                      >
                        Précédent
                      </Button>

                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          const isActive = pageNum === page;

                          return (
                            <Button
                              key={pageNum}
                              variant={isActive ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                      >
                        Suivant
                      </Button>
                    </div>
                  )}

                  {/* Results Info */}
                  <div className="text-center text-sm text-coffee-600 mt-4">
                    Affichage de {coffees.length} cafés
                  </div>
                </>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Filters Modal */}
      {isFiltersPanelOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFiltersPanelOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <FiltersPanel
              filters={filters}
              onToggleValue={toggleFilterValue}
              onUpdateFilter={updateFilter}
              onApply={applyFilters}
              onReset={resetFilters}
              onClose={() => setIsFiltersPanelOpen(false)}
              availableOrigins={availableOrigins}
              availableRoasters={roasters.map(r => r.name)}
              availableNotes={notes.map(n => n.name)}
              availableProcesses={availableProcesses}
              isMobile
            />
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default function CoffeesPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="bg-cream-50 py-8">
          <Container>
            <div className="text-center py-12">
              <div className="text-coffee-400 mb-4">
                <Search className="h-12 w-12 mx-auto animate-pulse" />
              </div>
              <p className="text-coffee-600">Chargement...</p>
            </div>
          </Container>
        </div>
      </PageLayout>
    }>
      <CoffeesPageContent />
    </Suspense>
  );
}
