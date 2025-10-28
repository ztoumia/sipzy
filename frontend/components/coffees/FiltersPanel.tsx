'use client';

import React from 'react';
import { X, SlidersHorizontal, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CoffeeFilters } from '@/hooks/useCoffeeFilters';

interface FiltersPanelProps {
  filters: CoffeeFilters;
  onToggleValue: (key: keyof CoffeeFilters, value: string) => void;
  onUpdateFilter: <K extends keyof CoffeeFilters>(key: K, value: CoffeeFilters[K]) => void;
  onApply: () => void;
  onReset: () => void;
  onClose?: () => void;
  availableOrigins?: string[];
  availableRoasters?: string[];
  availableNotes?: string[];
  availableProcesses?: string[];
  isMobile?: boolean;
}

export function FiltersPanel({
  filters,
  onToggleValue,
  onUpdateFilter,
  onApply,
  onReset,
  onClose,
  availableOrigins = [],
  availableRoasters = [],
  availableNotes = [],
  availableProcesses = [],
  isMobile = false,
}: FiltersPanelProps) {
  const sortOptions = [
    { value: 'rating', label: 'Meilleure note' },
    { value: 'reviews', label: 'Plus d\'avis' },
    { value: 'recent', label: 'Plus récents' },
    { value: 'name', label: 'Nom (A-Z)' },
  ];

  const ratingOptions = [
    { value: 0, label: 'Toutes' },
    { value: 4, label: '4+ étoiles' },
    { value: 4.5, label: '4.5+ étoiles' },
  ];

  return (
    <div className={`bg-white ${isMobile ? 'h-full' : 'rounded-lg border border-coffee-200'} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-coffee-600" />
          <h2 className="text-lg font-semibold text-coffee-900">Filtres</h2>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-coffee-100 rounded-lg transition-colors"
            aria-label="Fermer les filtres"
          >
            <X className="h-5 w-5 text-coffee-600" />
          </button>
        )}
      </div>

      {/* Filters Content */}
      <div className="space-y-6 overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(100vh - 200px)' : '600px' }}>
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-coffee-900 mb-3">
            Trier par
          </label>
          <div className="space-y-2">
            {sortOptions.map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sortBy"
                  value={option.value}
                  checked={filters.sortBy === option.value}
                  onChange={() => onUpdateFilter('sortBy', option.value as CoffeeFilters['sortBy'])}
                  className="w-4 h-4 text-coffee-600 focus:ring-coffee-500"
                />
                <span className="text-sm text-coffee-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-coffee-200"></div>

        {/* Min Rating */}
        <div>
          <label className="block text-sm font-medium text-coffee-900 mb-3">
            Note minimum
          </label>
          <div className="space-y-2">
            {ratingOptions.map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="minRating"
                  value={option.value}
                  checked={filters.minRating === option.value}
                  onChange={() => onUpdateFilter('minRating', option.value)}
                  className="w-4 h-4 text-coffee-600 focus:ring-coffee-500"
                />
                <span className="text-sm text-coffee-700 flex items-center gap-1">
                  {option.label}
                  {option.value > 0 && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Origins */}
        {availableOrigins.length > 0 && (
          <>
            <div className="border-t border-coffee-200"></div>
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-3">
                Origine ({filters.origins.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {availableOrigins.map(origin => {
                  const isSelected = filters.origins.includes(origin);
                  return (
                    <Badge
                      key={origin}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-coffee-600 hover:text-white transition-colors"
                      onClick={() => onToggleValue('origins', origin)}
                    >
                      {origin}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Roasters */}
        {availableRoasters.length > 0 && (
          <>
            <div className="border-t border-coffee-200"></div>
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-3">
                Torréfacteur ({filters.roasters.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {availableRoasters.map(roaster => {
                  const isSelected = filters.roasters.includes(roaster);
                  return (
                    <Badge
                      key={roaster}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-coffee-600 hover:text-white transition-colors"
                      onClick={() => onToggleValue('roasters', roaster)}
                    >
                      {roaster}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Processes */}
        {availableProcesses.length > 0 && (
          <>
            <div className="border-t border-coffee-200"></div>
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-3">
                Processus ({filters.processes.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {availableProcesses.map(process => {
                  const isSelected = filters.processes.includes(process);
                  return (
                    <Badge
                      key={process}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-coffee-600 hover:text-white transition-colors"
                      onClick={() => onToggleValue('processes', process)}
                    >
                      {process}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        {availableNotes.length > 0 && (
          <>
            <div className="border-t border-coffee-200"></div>
            <div>
              <label className="block text-sm font-medium text-coffee-900 mb-3">
                Notes aromatiques ({filters.notes.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {availableNotes.map(note => {
                  const isSelected = filters.notes.includes(note);
                  return (
                    <Badge
                      key={note}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-coffee-600 hover:text-white transition-colors"
                      onClick={() => onToggleValue('notes', note)}
                    >
                      {note}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-coffee-200">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onReset}
        >
          Réinitialiser
        </Button>
        <Button
          className="flex-1"
          onClick={onApply}
        >
          Appliquer
        </Button>
      </div>
    </div>
  );
}
