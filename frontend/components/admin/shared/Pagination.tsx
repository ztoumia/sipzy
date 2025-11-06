'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, isLoading = false }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const canGoPrevious = currentPage > 1 && !isLoading;
  const canGoNext = currentPage < totalPages && !isLoading;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <span className="text-sm text-gray-600 px-4">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
