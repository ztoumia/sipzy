'use client';

import React from 'react';
import { Star, Coffee, MessageSquare, ThumbsUp } from 'lucide-react';
import { UserProfileStats } from '@/lib/api/profileApi';

interface ProfileStatsProps {
  stats: UserProfileStats;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    {
      icon: MessageSquare,
      label: 'Avis publiés',
      value: stats.totalReviews,
      color: 'text-coffee-600',
      bgColor: 'bg-coffee-50',
    },
    {
      icon: Coffee,
      label: 'Cafés soumis',
      value: stats.totalCoffeesSubmitted,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      icon: Star,
      label: 'Note moyenne',
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: ThumbsUp,
      label: 'Votes utiles',
      value: stats.helpfulVotes,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-coffee-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`${item.bgColor} ${item.color} p-2 rounded-lg`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
