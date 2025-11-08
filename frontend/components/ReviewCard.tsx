'use client';

import React from 'react';
import Image from 'next/image';
import { Flag, MoreHorizontal } from 'lucide-react';
import { Review } from '@sipzy/shared/types';
import { Card, CardContent } from '@sipzy/shared/components/ui/Card';
import { Avatar } from '@sipzy/shared/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@sipzy/shared/components/ui/Button';
import { ShareButton } from '@/components/ShareButton';
import { VoteButtons } from '@/components/VoteButtons';
import { getReviewShareUrl } from '@sipzy/shared/lib/utils/share';
import { cn } from '@sipzy/shared/lib/utils/cn';

interface ReviewCardProps {
  review: Review;
  showCoffeeInfo?: boolean;
  showActions?: boolean;
  onVote?: (reviewId: number, isHelpful: boolean) => void;
  onReport?: (reviewId: number) => void;
  userVote?: boolean | null; // true = helpful, false = not helpful, null = no vote
  className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showCoffeeInfo = false,
  showActions = true,
  onVote,
  onReport,
  userVote = null,
  className,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Aujourd'hui";
    } else if (diffInDays === 1) {
      return "Hier";
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  };

  const handleVote = (isHelpful: boolean) => {
    if (onVote) {
      onVote(review.id, isHelpful);
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport(review.id);
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar
                src={review.user?.avatarUrl}
                fallback={review.user?.username || 'User'}
                size="md"
              />
              <div>
                <p className="font-medium text-coffee-900">
                  {review.user?.username || 'Utilisateur anonyme'}
                </p>
                <p className="text-sm text-coffee-500">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            </div>
            
            {showActions && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReport}
                  className="text-coffee-400 hover:text-coffee-600"
                  aria-label="Signaler cet avis"
                >
                  <Flag className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-coffee-400 hover:text-coffee-600"
                  aria-label="Plus d'options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Coffee Info (if needed) */}
          {showCoffeeInfo && review.coffee && (
            <div className="border-l-4 border-coffee-200 pl-4">
              <p className="text-sm text-coffee-600">
                Avis pour <span className="font-medium">{review.coffee.name}</span>
                {review.coffee.roaster && (
                  <span> par {review.coffee.roaster.name}</span>
                )}
              </p>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <StarRating
              rating={review.rating}
              size="sm"
              interactive={false}
            />
            <span className="text-sm text-coffee-600">
              {review.rating}/5
            </span>
          </div>

          {/* Comment */}
          <p className="text-coffee-800 leading-relaxed">
            {review.comment}
          </p>

          {/* Review Image */}
          {review.imageUrl && (
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={review.imageUrl}
                alt="Photo de l'avis"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between pt-2 border-t border-cream-200">
              <div className="flex items-center space-x-2">
                {/* Vote Buttons */}
                <VoteButtons
                  reviewId={review.id}
                  initialHelpfulCount={review.helpfulCount}
                  initialNotHelpfulCount={review.notHelpfulCount}
                  onVote={onVote}
                />

                {/* Share Button */}
                {review.coffee && (
                  <ShareButton
                    title={`Avis sur ${review.coffee.name}`}
                    text={`Découvrez cet avis sur ${review.coffee.name}`}
                    url={getReviewShareUrl(review.coffee.id, review.id)}
                    variant="ghost"
                    size="sm"
                  />
                )}
              </div>

              <div className="text-sm text-coffee-500">
                {review.helpfulCount > 0 && (
                  <span>
                    {review.helpfulCount} personne{review.helpfulCount > 1 ? 's' : ''} trouvent cet avis utile
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { ReviewCard };
