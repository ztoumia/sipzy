'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Coffee as CoffeeIcon, MapPin, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Coffee } from '@/types';

interface CoffeeReviewQueueProps {
  coffees: Coffee[];
  onApprove: (coffeeId: number, notes?: string) => Promise<void>;
  onReject: (coffeeId: number, notes: string) => Promise<void>;
}

export function CoffeeReviewQueue({ coffees, onApprove, onReject }: CoffeeReviewQueueProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionNotes, setActionNotes] = useState<Record<number, string>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleApprove = async (coffeeId: number) => {
    setLoadingId(coffeeId);
    try {
      await onApprove(coffeeId, actionNotes[coffeeId]);
      setActionNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[coffeeId];
        return newNotes;
      });
      setExpandedId(null);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (coffeeId: number) => {
    const notes = actionNotes[coffeeId];
    if (!notes || notes.trim().length === 0) {
      alert('Veuillez indiquer une raison pour le rejet');
      return;
    }

    setLoadingId(coffeeId);
    try {
      await onReject(coffeeId, notes);
      setActionNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[coffeeId];
        return newNotes;
      });
      setExpandedId(null);
    } finally {
      setLoadingId(null);
    }
  };

  if (coffees.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-coffee-900 mb-2">
            Aucun café en attente
          </h3>
          <p className="text-coffee-600">
            Tous les cafés ont été modérés. Excellent travail ! ☕
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {coffees.map((coffee) => {
        const isExpanded = expandedId === coffee.id;
        const isLoading = loadingId === coffee.id;

        return (
          <Card key={coffee.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                    {coffee.imageUrl ? (
                      <Image
                        src={coffee.imageUrl}
                        alt={coffee.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CoffeeIcon className="h-8 w-8 text-coffee-400" />
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-xl mb-1">{coffee.name}</CardTitle>
                        {coffee.roaster && (
                          <p className="text-sm text-coffee-600">
                            par {coffee.roaster.name}
                          </p>
                        )}
                      </div>
                      <Badge variant="default" className="ml-2">
                        En attente
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {coffee.origin && (
                        <Badge variant="outline" size="sm">
                          <MapPin className="mr-1 h-3 w-3" />
                          {coffee.origin}
                        </Badge>
                      )}
                      {coffee.process && (
                        <Badge variant="secondary" size="sm">
                          {coffee.process}
                        </Badge>
                      )}
                      {coffee.priceRange && (
                        <Badge variant="outline" size="sm">
                          {coffee.priceRange}
                        </Badge>
                      )}
                    </div>

                    {coffee.description && (
                      <p className="text-sm text-coffee-700 mb-3 line-clamp-2">
                        {coffee.description}
                      </p>
                    )}

                    {coffee.submittedByUser && (
                      <p className="text-xs text-coffee-500">
                        Proposé par{' '}
                        <span className="font-medium">{coffee.submittedByUser.username}</span>
                        {' '}le{' '}
                        {new Date(coffee.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Actions */}
              <div className="space-y-3">
                {isExpanded && (
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-2">
                      Notes administrateur (optionnel pour approbation, obligatoire pour rejet)
                    </label>
                    <textarea
                      value={actionNotes[coffee.id] || ''}
                      onChange={(e) => setActionNotes(prev => ({
                        ...prev,
                        [coffee.id]: e.target.value,
                      }))}
                      className="w-full rounded-lg border border-coffee-300 px-3 py-2 text-sm focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      rows={3}
                      placeholder="Ex: Informations manquantes sur le processus..."
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  {!isExpanded ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedId(coffee.id)}
                        className="flex-1"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ajouter des notes
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(coffee.id)}
                        disabled={isLoading}
                        loading={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approuver
                      </Button>
                      <Link href={`/coffees/${coffee.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          Voir détails
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setExpandedId(null);
                          setActionNotes(prev => {
                            const newNotes = { ...prev };
                            delete newNotes[coffee.id];
                            return newNotes;
                          });
                        }}
                        disabled={isLoading}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(coffee.id)}
                        disabled={isLoading}
                        loading={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approuver
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReject(coffee.id)}
                        disabled={isLoading}
                        loading={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejeter
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
