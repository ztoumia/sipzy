'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface VoteButtonsProps {
  reviewId: number;
  initialHelpfulCount: number;
  initialNotHelpfulCount: number;
  onVote?: (reviewId: number, isHelpful: boolean) => void;
  className?: string;
}

export function VoteButtons({
  reviewId,
  initialHelpfulCount,
  initialNotHelpfulCount,
  onVote,
  className = '',
}: VoteButtonsProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [notHelpfulCount, setNotHelpfulCount] = useState(initialNotHelpfulCount);
  const [userVote, setUserVote] = useState<'helpful' | 'not_helpful' | null>(null);

  // Charger le vote de l'utilisateur depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      const votes = JSON.parse(localStorage.getItem('reviewVotes') || '{}');
      const vote = votes[reviewId];
      if (vote) {
        setUserVote(vote);
      }
    }
  }, [reviewId, isAuthenticated]);

  const handleVote = async (isHelpful: boolean) => {
    // Rediriger vers login si non authentifié
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/coffees');
      return;
    }

    const voteType = isHelpful ? 'helpful' : 'not_helpful';

    // Si l'utilisateur clique sur le même vote, annuler le vote
    if (userVote === voteType) {
      // Retirer le vote
      setUserVote(null);
      if (isHelpful) {
        setHelpfulCount(prev => prev - 1);
      } else {
        setNotHelpfulCount(prev => prev - 1);
      }

      // Sauvegarder dans localStorage
      const votes = JSON.parse(localStorage.getItem('reviewVotes') || '{}');
      delete votes[reviewId];
      localStorage.setItem('reviewVotes', JSON.stringify(votes));
    } else {
      // Changer le vote ou voter pour la première fois
      const previousVote = userVote;
      setUserVote(voteType);

      // Ajuster les compteurs
      if (previousVote === 'helpful') {
        setHelpfulCount(prev => prev - 1);
      } else if (previousVote === 'not_helpful') {
        setNotHelpfulCount(prev => prev - 1);
      }

      if (isHelpful) {
        setHelpfulCount(prev => prev + 1);
      } else {
        setNotHelpfulCount(prev => prev + 1);
      }

      // Sauvegarder dans localStorage
      const votes = JSON.parse(localStorage.getItem('reviewVotes') || '{}');
      votes[reviewId] = voteType;
      localStorage.setItem('reviewVotes', JSON.stringify(votes));
    }

    // Callback optionnel
    if (onVote) {
      onVote(reviewId, isHelpful);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={userVote === 'helpful' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => handleVote(true)}
        className="flex items-center gap-1.5"
        aria-label={userVote === 'helpful' ? 'Retirer le vote utile' : 'Marquer comme utile'}
      >
        <ThumbsUp className={`h-4 w-4 ${userVote === 'helpful' ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{helpfulCount}</span>
      </Button>

      <Button
        variant={userVote === 'not_helpful' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => handleVote(false)}
        className="flex items-center gap-1.5"
        aria-label={userVote === 'not_helpful' ? 'Retirer le vote pas utile' : 'Marquer comme pas utile'}
      >
        <ThumbsDown className={`h-4 w-4 ${userVote === 'not_helpful' ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{notHelpfulCount}</span>
      </Button>
    </div>
  );
}
