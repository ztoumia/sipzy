'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Shield, Edit } from 'lucide-react';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Bannière supérieure */}
      <div className="h-32 bg-gradient-to-r from-coffee-600 to-coffee-800"></div>

      {/* Contenu du profil */}
      <div className="px-6 pb-6">
        {/* Avatar et nom */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-coffee-100 text-coffee-600 text-4xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {user.username}
                  {user.role === 'ADMIN' && (
                    <Shield className="w-5 h-5 text-coffee-600" title="Administrateur" />
                  )}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>Membre depuis {formatDate(user.createdAt)}</span>
                </div>
              </div>

              {isOwnProfile && (
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Éditer le profil
                  </Button>
                </Link>
              )}
            </div>

            {user.bio && (
              <p className="mt-4 text-gray-700 leading-relaxed max-w-2xl">{user.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
