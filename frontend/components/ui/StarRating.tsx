'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@sipzy/shared/lib/utils/cn';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className,
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  const [isHovering, setIsHovering] = React.useState(false);

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleMouseEnter = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
      setIsHovering(false);
    }
  };

  const handleClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const displayRating = isHovering ? hoverRating : rating;

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= displayRating;
        const isHalfFilled = starRating === Math.ceil(displayRating) && displayRating % 1 !== 0;

        return (
          <button
            key={index}
            type="button"
            className={cn(
              'transition-colors duration-150',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default'
            )}
            onMouseEnter={() => handleMouseEnter(starRating)}
            onClick={() => handleClick(starRating)}
            disabled={!interactive}
            aria-label={`Rate ${starRating} star${starRating > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizes[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : isHalfFilled
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'text-gray-300',
                interactive && 'hover:fill-yellow-300 hover:text-yellow-300'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export { StarRating };
