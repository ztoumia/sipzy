'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Coffee as CoffeeIcon } from 'lucide-react';
import { Coffee } from '@sipzy/shared/types';
import { Card, CardContent } from '@sipzy/shared/components/ui/Card';
import { Badge } from '@sipzy/shared/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { FavoriteButton } from '@/components/FavoriteButton';
import { cn } from '@sipzy/shared/lib/utils/cn';

interface CoffeeCardProps {
  coffee: Coffee;
  className?: string;
  onFavoriteToggle?: () => void;
}

const CoffeeCard: React.FC<CoffeeCardProps> = ({ coffee, className, onFavoriteToggle }) => {
  const formatPriceRange = (priceRange?: string) => {
    if (!priceRange) return null;
    
    const priceMap: Record<string, string> = {
      '€': '€',
      '€€': '€€',
      '€€€': '€€€',
      '€€€€': '€€€€',
    };
    
    return priceMap[priceRange] || priceRange;
  };

  const getPriceColor = (priceRange?: string) => {
    const colorMap: Record<string, string> = {
      '€': 'success',
      '€€': 'default',
      '€€€': 'warning',
      '€€€€': 'danger',
    };
    
    return colorMap[priceRange || ''] || 'default';
  };

  return (
    <Link href={`/coffees/${coffee.id}`} className="group">
      <Card className={cn('h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1', className)}>
        <div className="relative aspect-square overflow-hidden rounded-t-xl">
          {coffee.imageUrl ? (
            <Image
              src={coffee.imageUrl}
              alt={coffee.name}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-cream-100">
              <CoffeeIcon className="h-12 w-12 text-coffee-400" />
            </div>
          )}
          
          {/* Favorite Button */}
          <div className="absolute top-3 left-3 z-10">
            <FavoriteButton
              coffeeId={coffee.id}
              size="sm"
              onToggle={onFavoriteToggle}
            />
          </div>

          {/* Price Badge */}
          {coffee.priceRange && (
            <div className="absolute top-3 right-3">
              <Badge
                variant={getPriceColor(coffee.priceRange) as any}
                size="sm"
              >
                {formatPriceRange(coffee.priceRange)}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Coffee Name */}
            <h3 className="font-semibold text-coffee-900 line-clamp-2 group-hover:text-coffee-700 transition-colors">
              {coffee.name}
            </h3>

            {/* Roaster */}
            {coffee.roaster && (
              <p className="text-sm text-coffee-600">
                par {coffee.roaster.name}
              </p>
            )}

            {/* Origin & Process */}
            <div className="flex flex-wrap gap-2">
              {coffee.origin && (
                <Badge variant="outline" size="sm">
                  {coffee.origin}
                </Badge>
              )}
              {coffee.process && (
                <Badge variant="secondary" size="sm">
                  {coffee.process}
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StarRating
                  rating={coffee.avgRating}
                  size="sm"
                  interactive={false}
                />
                <span className="text-sm text-coffee-600">
                  {coffee.avgRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-coffee-500">
                {coffee.reviewCount} avis
              </span>
            </div>

            {/* Notes aromatiques */}
            {coffee.notes && coffee.notes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {coffee.notes.slice(0, 3).map((note) => (
                  <Badge
                    key={note.id}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {note.name}
                  </Badge>
                ))}
                {coffee.notes.length > 3 && (
                  <Badge variant="outline" size="sm" className="text-xs">
                    +{coffee.notes.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export { CoffeeCard };
