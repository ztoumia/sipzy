import React from 'react';
import { Coffee, Users, MessageCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { AdminStats } from '@/lib/api/adminApi';

interface StatsCardsProps {
  stats: AdminStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Cafés',
      value: stats.totalCoffees,
      icon: Coffee,
      color: 'bg-coffee-100 text-coffee-600',
      description: 'Cafés au total',
    },
    {
      title: 'En Attente',
      value: stats.pendingCoffees,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      description: 'Cafés à modérer',
    },
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      description: 'Membres actifs',
    },
    {
      title: 'Avis',
      value: stats.totalReviews,
      icon: MessageCircle,
      color: 'bg-purple-100 text-purple-600',
      description: 'Avis publiés',
    },
    {
      title: 'Avis en attente',
      value: stats.pendingReviews,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      description: 'Avis à modérer',
    },
    {
      title: 'Signalements',
      value: stats.reportedContent,
      icon: XCircle,
      color: 'bg-red-100 text-red-600',
      description: 'Contenus signalés',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-coffee-600">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-coffee-900">
                  {card.value}
                </p>
                <p className="text-xs text-coffee-500">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
