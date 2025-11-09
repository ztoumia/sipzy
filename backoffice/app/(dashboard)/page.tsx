'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Coffee, FileText, Users, Activity, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState, LoadingSpinner } from '@/components/shared/LoadingState';
import { StatsCards } from '@/components/StatsCards';
import { CoffeeReviewQueue } from '@/components/CoffeeReviewQueue';
import { adminApi, AdminStats } from '@/lib/api/adminApi';
import { Coffee as CoffeeType } from '@sipzy/shared/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingCoffees, setPendingCoffees] = useState<CoffeeType[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load data independently to prevent one failure from blocking others
      const results = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.getPendingCoffees(1, 5),
        adminApi.getRecentActivity(10),
      ]);

      // Handle stats
      if (results[0].status === 'fulfilled') {
        setStats(results[0].value);
      } else {
        console.error('Error loading stats:', results[0].reason);
      }

      // Handle pending coffees
      if (results[1].status === 'fulfilled') {
        setPendingCoffees(results[1].value.data);
      } else {
        console.error('Error loading pending coffees:', results[1].reason);
      }

      // Handle recent activity
      if (results[2].status === 'fulfilled') {
        setRecentActivity(results[2].value);
      } else {
        console.error('Error loading recent activity:', results[2].reason);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
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
        adminId: 1, // TODO: Get from auth
      });
      await loadDashboardData();
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
        adminId: 1, // TODO: Get from auth
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Error rejecting coffee:', error);
      alert('Failed to reject coffee');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Shield}
        title="Admin Dashboard"
        description="Welcome to Sipzy Admin - Manage your platform"
      />

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href="/admin/coffees" className="group">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Coffee className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Coffees</p>
                <p className="text-sm text-gray-600">Moderation</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/users" className="group">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Users</p>
                <p className="text-sm text-gray-600">Management</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/reports" className="group">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Reports</p>
                <p className="text-sm text-gray-600">Moderation</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/import" className="group">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Import</p>
                <p className="text-sm text-gray-600">Batch Data</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/activity" className="group">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Activity</p>
                <p className="text-sm text-gray-600">Logs</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <StatsCards stats={stats} />
      ) : null}

      {/* Pending Coffees */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Pending Coffee Moderation
          </h2>
          {pendingCoffees.length > 0 && (
            <Link
              href="/admin/coffees?status=PENDING"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all ({stats?.pendingCoffees})
            </Link>
          )}
        </div>

        {isLoading ? (
          <LoadingState count={3} />
        ) : (
          <CoffeeReviewQueue
            coffees={pendingCoffees}
            onApprove={handleApproveCoffee}
            onReject={handleRejectCoffee}
          />
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                >
                  <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                    <Coffee className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">
              No recent activity
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
