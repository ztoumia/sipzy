'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { shareContent, canUseWebShare } from '@/lib/utils/share';

interface ShareButtonProps {
  title: string;
  text?: string;
  url: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  showLabel?: boolean;
}

export function ShareButton({
  title,
  text,
  url,
  size = 'sm',
  variant = 'ghost',
  className = '',
  showLabel = false,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);

    try {
      const result = await shareContent({ title, text, url });

      if (result.success) {
        if (result.method === 'clipboard') {
          // Afficher l'indicateur de copie
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const Icon = copied ? Check : canUseWebShare() ? Share2 : Copy;
  const label = copied ? 'Copié !' : showLabel ? 'Partager' : '';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={isSharing || copied}
      className={`transition-all ${copied ? 'text-green-600' : ''} ${className}`}
      aria-label={copied ? 'Lien copié' : 'Partager'}
    >
      <Icon className={`h-4 w-4 ${showLabel && label ? 'mr-2' : ''}`} />
      {showLabel && label && <span>{label}</span>}
    </Button>
  );
}
