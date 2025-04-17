import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useFamilyDrawer } from '@/context/FamilyDrawerContext';
import { useProfileDrawer } from '@/context/ProfileDrawerContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, ArrowLeft, Menu, X, LucideIcon } from 'lucide-react';

interface FeatureNavbarProps {
  featureTitle: string;
  featureIcon: LucideIcon;
  backgroundColor: string;
}

const FeatureNavbar = ({ featureTitle, featureIcon: FeatureIcon, backgroundColor }: FeatureNavbarProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();
  const { openDrawer } = useFamilyDrawer();
  const { openDrawer: openProfileDrawer } = useProfileDrawer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="w-full shadow-sm sticky top-0 z-50" style={{ backgroundColor }}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center mr-3 text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <div className="flex items-center gap-2">
            <FeatureIcon className="h-6 w-6 text-white" />
            <span className="text-xl font-bold text-white">
              {featureTitle}
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-white hover:text-white/90 transition-colors">
                {t('nav.dashboard')}
              </Link>
              <button
                onClick={openDrawer}
                className="text-white hover:text-white/90 transition-colors"
              >
                {t('nav.family')}
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full border-2 border-white">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePicture || '/placeholder.svg'} alt={user?.firstName} />
                      <AvatarFallback className="bg-white text-[color:var(--color)]" style={{ '--color': backgroundColor } as React.CSSProperties}>
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 leading-none p-2">
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={openProfileDrawer}
                    className="cursor-pointer flex w-full items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('nav.profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('nav.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-white/90 transition-colors">
                {t('nav.login')}
              </Link>
              <Button asChild className="bg-white text-[color:var(--color)] hover:bg-white/90" style={{ '--color': backgroundColor } as React.CSSProperties}>
                <Link to="/signup">
                  {t('nav.signup')}
                </Link>
              </Button>
            </>
          )}
          <LanguageSwitcher />
        </nav>

        {/* Mobile Nav - Adapté pour prendre en compte les couleurs personnalisées */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-white">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-md">
          <nav className="flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profilePicture || '/placeholder.svg'} alt={user?.firstName} />
                    <AvatarFallback style={{ backgroundColor }} className="text-white">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-famille-blue transition-colors px-3 py-2"
                  onClick={closeMenu}
                >
                  {t('nav.dashboard')}
                </Link>
                <button 
                  className="text-gray-700 hover:text-famille-blue transition-colors px-3 py-2 text-left w-full"
                  onClick={() => {
                    closeMenu();
                    openDrawer();
                  }}
                >
                  {t('nav.family')}
                </button>
                <button 
                  className="text-gray-700 hover:text-famille-blue transition-colors px-3 py-2 text-left w-full"
                  onClick={() => {
                    closeMenu();
                    openProfileDrawer();
                  }}
                >
                  {t('nav.profile')}
                </button>
                <Button 
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  variant="ghost"
                  className="justify-start px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-famille-blue transition-colors px-3 py-2"
                  onClick={closeMenu}
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  to="/signup" 
                  style={{ backgroundColor }}
                  className="text-white px-3 py-2 rounded-md text-center"
                  onClick={closeMenu}
                >
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default FeatureNavbar;