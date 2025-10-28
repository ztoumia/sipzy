'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface CoffeeFilters {
  search: string;
  origins: string[];
  roasters: string[];
  notes: string[];
  processes: string[];
  minRating: number;
  sortBy: 'rating' | 'reviews' | 'recent' | 'name';
}

const DEFAULT_FILTERS: CoffeeFilters = {
  search: '',
  origins: [],
  roasters: [],
  notes: [],
  processes: [],
  minRating: 0,
  sortBy: 'rating',
};

export function useCoffeeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CoffeeFilters>(DEFAULT_FILTERS);
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);

  // Charger les filtres depuis l'URL au montage
  useEffect(() => {
    const urlFilters: CoffeeFilters = {
      search: searchParams.get('search') || '',
      origins: searchParams.getAll('origin'),
      roasters: searchParams.getAll('roaster'),
      notes: searchParams.getAll('note'),
      processes: searchParams.getAll('process'),
      minRating: Number(searchParams.get('minRating')) || 0,
      sortBy: (searchParams.get('sortBy') as CoffeeFilters['sortBy']) || 'rating',
    };
    setFilters(urlFilters);
  }, [searchParams]);

  // Synchroniser les filtres avec l'URL
  const syncFiltersToUrl = useCallback((newFilters: CoffeeFilters) => {
    const params = new URLSearchParams();

    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.sortBy !== 'rating') params.set('sortBy', newFilters.sortBy);
    if (newFilters.minRating > 0) params.set('minRating', newFilters.minRating.toString());

    newFilters.origins.forEach(origin => params.append('origin', origin));
    newFilters.roasters.forEach(roaster => params.append('roaster', roaster));
    newFilters.notes.forEach(note => params.append('note', note));
    newFilters.processes.forEach(process => params.append('process', process));

    const queryString = params.toString();
    router.push(queryString ? `/coffees?${queryString}` : '/coffees', { scroll: false });
  }, [router]);

  // Mettre à jour un filtre spécifique
  const updateFilter = useCallback(<K extends keyof CoffeeFilters>(
    key: K,
    value: CoffeeFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Ajouter une valeur à un filtre tableau
  const addFilterValue = useCallback(<K extends keyof CoffeeFilters>(
    key: K,
    value: string
  ) => {
    setFilters(prev => {
      const current = prev[key];
      if (Array.isArray(current) && !current.includes(value)) {
        return { ...prev, [key]: [...current, value] };
      }
      return prev;
    });
  }, []);

  // Retirer une valeur d'un filtre tableau
  const removeFilterValue = useCallback(<K extends keyof CoffeeFilters>(
    key: K,
    value: string
  ) => {
    setFilters(prev => {
      const current = prev[key];
      if (Array.isArray(current)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      }
      return prev;
    });
  }, []);

  // Toggle une valeur dans un filtre tableau
  const toggleFilterValue = useCallback(<K extends keyof CoffeeFilters>(
    key: K,
    value: string
  ) => {
    setFilters(prev => {
      const current = prev[key];
      if (Array.isArray(current)) {
        const exists = current.includes(value);
        return {
          ...prev,
          [key]: exists ? current.filter(v => v !== value) : [...current, value]
        };
      }
      return prev;
    });
  }, []);

  // Appliquer les filtres (synchroniser avec l'URL)
  const applyFilters = useCallback(() => {
    syncFiltersToUrl(filters);
    setIsFiltersPanelOpen(false);
  }, [filters, syncFiltersToUrl]);

  // Réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    router.push('/coffees', { scroll: false });
    setIsFiltersPanelOpen(false);
  }, [router]);

  // Compter le nombre de filtres actifs
  const activeFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.origins.length > 0) count += filters.origins.length;
    if (filters.roasters.length > 0) count += filters.roasters.length;
    if (filters.notes.length > 0) count += filters.notes.length;
    if (filters.processes.length > 0) count += filters.processes.length;
    if (filters.minRating > 0) count += 1;
    if (filters.sortBy !== 'rating') count += 1;
    return count;
  }, [filters]);

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = useCallback(() => {
    return activeFiltersCount() > 0;
  }, [activeFiltersCount]);

  return {
    filters,
    setFilters,
    updateFilter,
    addFilterValue,
    removeFilterValue,
    toggleFilterValue,
    applyFilters,
    resetFilters,
    activeFiltersCount,
    hasActiveFilters,
    isFiltersPanelOpen,
    setIsFiltersPanelOpen,
  };
}
