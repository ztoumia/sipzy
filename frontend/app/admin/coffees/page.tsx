'use client';

import { useEffect, useState } from 'react';
import { Coffee } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { SearchBar } from '@/components/admin/shared/SearchBar';
import { FilterTabs, FilterTab } from '@/components/admin/shared/FilterTabs';
import { Pagination } from '@/components/admin/shared/Pagination';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { EmptyState } from '@/components/admin/shared/EmptyState';
import { CoffeeReviewQueue } from '@/components/admin/CoffeeReviewQueue';
import { adminApi } from '@/lib/api/adminApi';
import { Coffee as CoffeeType } from '@/types';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AdminCoffeesPage() {
  const [coffees, setCoffees] = useState<CoffeeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCoffees();
  }, [statusFilter, searchQuery, page]);

  const loadCoffees = async () => {
    setIsLoading(true);
    try {
      const filters = {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery || undefined,
      };

      const result = await adminApi.getAllCoffees(filters, page, 20);
      setCoffees(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Error loading coffees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCoffee = async (coffeeId: number, notes?: string) => {
    try {
      await adminApi.approveCoffee({
        coffeeId,
        action: 'APPROVE',
        adminNotes: notes,
        adminId: 1, // TODO: Get from auth context
      });
      await loadCoffees();
    } catch (error) {
      console.error('Error approving coffee:', error);
      alert('Failed to approve coffee');
    }
  };

  const handleRejectCoffee = async (coffeeId: number, notes: string) => {
    try {
      await adminApi.rejectCoffee({
        coffeeId,
        action: 'REJECT',
        adminNotes: notes,
        adminId: 1, // TODO: Get from auth context
      });
      await loadCoffees();
    } catch (error) {
      console.error('Error rejecting coffee:', error);
      alert('Failed to reject coffee');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleFilterChange = (newFilter: StatusFilter) => {
    setStatusFilter(newFilter);
    setPage(1);
  };

  const filterTabs: FilterTab<StatusFilter>[] = [
    { id: 'ALL', label: 'All', color: 'gray' },
    { id: 'PENDING', label: 'Pending', color: 'yellow' },
    { id: 'APPROVED', label: 'Approved', color: 'green' },
    { id: 'REJECTED', label: 'Rejected', color: 'red' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Coffee}
        title="Coffee Moderation"
        description="Manage coffee submissions from the community"
      />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search coffee, origin, roaster..."
            />
          </div>
          <FilterTabs
            tabs={filterTabs}
            activeTab={statusFilter}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState count={5} />
      ) : coffees.length === 0 ? (
        <EmptyState
          icon={Coffee}
          title="No coffees found"
          description="No coffees match your search criteria"
        />
      ) : statusFilter === 'PENDING' || statusFilter === 'ALL' ? (
        <CoffeeReviewQueue
          coffees={coffees.filter(c => statusFilter === 'ALL' || c.status === 'PENDING')}
          onApprove={handleApproveCoffee}
          onReject={handleRejectCoffee}
        />
      ) : (
        <div className="space-y-4">
          {coffees.map((coffee) => (
            <div key={coffee.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {coffee.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {coffee.roaster?.name} - {coffee.origin}
                  </p>
                  <div className="flex gap-2 items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        coffee.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {coffee.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </span>
                    {coffee.approvedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(coffee.approvedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={`/coffees/${coffee.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
