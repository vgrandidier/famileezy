
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
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
import { Menu, X, User, LogOut, Home } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <Home className="h-6 w-6 text-famille-blue" />
            <span className="text-2xl font-bold bg-gradient-to-r from-famille-blue to-famille-purple text-transparent bg-clip-text">
              Famileezy
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-famille-blue transition-colors">
                {t('nav.dashboard')}
              </Link>
              <Link to="/family" className="text-gray-700 hover:text-famille-blue transition-colors">
                {t('nav.family')}
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePicture || '/placeholder.svg'} alt={user?.firstName} />
                      <AvatarFallback className="bg-famille-purple text-white">
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
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('nav.profile')}</span>
                    </Link>
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
              <Link to="/login" className="text-gray-700 hover:text-famille-blue transition-colors">
                {t('nav.login')}
              </Link>
              <Button asChild className="bg-famille-blue hover:bg-famille-blue/90">
                <Link to="/signup">
                  {t('nav.signup')}
                </Link>
              </Button>
            </>
          )}
          <LanguageSwitcher />
        </nav>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-gray-700">
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
                    <AvatarFallback className="bg-famille-purple text-white">
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
                <Link 
                  to="/family" 
                  className="text-gray-700 hover:text-famille-blue transition-colors px-3 py-2"
                  onClick={closeMenu}
                >
                  {t('nav.family')}
                </Link>
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-famille-blue transition-colors px-3 py-2"
                  onClick={closeMenu}
                >
                  {t('nav.profile')}
                </Link>
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
                  className="bg-famille-blue text-white hover:bg-famille-blue/90 px-3 py-2 rounded-md text-center"
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

export default Navbar;
