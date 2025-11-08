'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, LogOut, Coffee, Heart, User, FileText, Shield, LayoutDashboard, CheckCircle, Flag, Users, ChevronDown } from 'lucide-react';
import { Button } from '@sipzy/shared/components/ui/Button';
import { Input } from '@sipzy/shared/components/ui/Input';
import { Avatar } from '@sipzy/shared/components/ui/Avatar';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@sipzy/shared/components/ui/DropdownMenu';

interface HeaderProps {
  user?: {
    id: number;
    username: string;
    avatarUrl?: string;
    role: string;
  } | null;
  onLogout?: () => void;
  isLoading?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, isLoading = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Empêcher le flash en attendant l'hydratation côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/coffees?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cream-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-coffee-600" />
            <span className="text-xl font-bold text-coffee-900">Sipzy</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-400" />
              <Input
                type="search"
                placeholder="Rechercher un café..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-4">
            {/* Navigation Links */}
            <div className="flex items-center gap-4">
              <Link
                href="/coffees"
                className="text-coffee-700 hover:text-coffee-900 transition-colors font-medium"
              >
                Cafés
              </Link>

              {user && (
                <Link
                  href="/coffees/new"
                  className="text-coffee-700 hover:text-coffee-900 transition-colors font-medium"
                >
                  Proposer un café
                </Link>
              )}
            </div>

            {!isClient || isLoading ? (
              <>
                {/* Séparateur */}
                <div className="h-6 w-px bg-coffee-300" />

                {/* Skeleton pendant le chargement */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-coffee-200 rounded-full animate-pulse"></div>
                  <div className="w-20 h-4 bg-coffee-200 rounded animate-pulse"></div>
                </div>
              </>
            ) : user ? (
              <>
                {/* Séparateur */}
                <div className="h-6 w-px bg-coffee-300" />

                {/* User Profile Dropdown */}
                <DropdownMenu
                  trigger={
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                      <Avatar
                        src={user.avatarUrl}
                        fallback={user.username}
                        size="sm"
                      />
                      <span className="text-coffee-700 font-medium">{user.username}</span>
                      <ChevronDown className="h-4 w-4 text-coffee-500" />
                    </div>
                  }
                  align="right"
                >
                  <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                  <DropdownMenuItem href={`/profile/${user.username}`} icon={<User className="h-4 w-4" />}>
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem href="/profile/favorites" icon={<Heart className="h-4 w-4" />}>
                    Mes favoris
                  </DropdownMenuItem>
                  <DropdownMenuItem href="/profile/submissions" icon={<FileText className="h-4 w-4" />}>
                    Mes propositions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} icon={<LogOut className="h-4 w-4" />} variant="danger">
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Séparateur */}
                <div className="h-6 w-px bg-coffee-300" />

                {/* Auth Buttons */}
                <div className="flex items-center gap-3">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="primary" size="sm">
                      S'inscrire
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-cream-200">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-400" />
                  <Input
                    type="search"
                    placeholder="Rechercher un café..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4"
                  />
                </div>
              </form>

              {/* Section: Navigation */}
              <div className="px-3 pt-4 pb-2">
                <h3 className="text-xs font-semibold text-coffee-500 uppercase tracking-wider">Navigation</h3>
              </div>

              <Link
                href="/coffees"
                className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-coffee-700 hover:text-coffee-900 hover:bg-coffee-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Coffee className="h-4 w-4" />
                Cafés
              </Link>

              {user && (
                <Link
                  href="/coffees/new"
                  className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-coffee-700 hover:text-coffee-900 hover:bg-coffee-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText className="h-4 w-4" />
                  Proposer un café
                </Link>
              )}

              {!isClient || isLoading ? (
                <>
                  {/* Loading skeleton */}
                  <div className="px-3 pt-4 pb-2">
                    <div className="h-3 w-24 bg-coffee-200 rounded animate-pulse"></div>
                  </div>
                  <div className="px-3 py-2.5">
                    <div className="h-4 w-32 bg-coffee-200 rounded animate-pulse"></div>
                  </div>
                </>
              ) : user ? (
                <>
                  {/* Section: Mon Compte */}
                  <div className="px-3 pt-4 pb-2">
                    <h3 className="text-xs font-semibold text-coffee-500 uppercase tracking-wider">Mon Compte</h3>
                  </div>

                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-coffee-700 hover:text-coffee-900 hover:bg-coffee-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Avatar
                      src={user.avatarUrl}
                      fallback={user.username}
                      size="sm"
                    />
                    Mon profil
                  </Link>

                  <Link
                    href="/profile/favorites"
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-coffee-700 hover:text-coffee-900 hover:bg-coffee-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    Mes favoris
                  </Link>

                  <Link
                    href="/profile/submissions"
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-coffee-700 hover:text-coffee-900 hover:bg-coffee-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    Mes propositions
                  </Link>

                  {/* Divider */}
                  <div className="h-px bg-coffee-200 my-2" />

                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  {/* Section: Authentification */}
                  <div className="px-3 pt-4 pb-2">
                    <h3 className="text-xs font-semibold text-coffee-500 uppercase tracking-wider">Compte</h3>
                  </div>

                  <Link
                    href="/auth/login"
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-coffee-700 hover:text-coffee-900 hover:bg-coffee-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Connexion
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-coffee-700 hover:text-coffee-900 hover:bg-coffee-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export { Header };
