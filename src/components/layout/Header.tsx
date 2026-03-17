import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Search, Building2, DollarSign, BarChart3, Settings, Moon, Sun, LogOut, User, LayoutDashboard, Heart, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { MembersOnlyModal } from '../ui/MembersOnlyModal';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [membersOnlyModalOpen, setMembersOnlyModalOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(currentTheme);
  }, [profile]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');

    if (user && profile) {
      try {
        await supabase
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating theme preference:', error);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home, public: true },
    { name: 'Search Properties', href: '/search', icon: Search, public: true },
    { name: 'Agencies', href: '/agencies', icon: Building2, public: true },
    { name: 'Agents', href: '/agents', icon: Building2, public: true },
    { name: 'Contractors', href: '/contractors', icon: Building2, public: true },
  ];

  const dashboardRoles = ['agent', 'agency', 'mortgage_institution'];

  const userNavigation = [
    { name: 'My Listings', href: '/my-listings', icon: Building2, roles: ['agent', 'agency'] },
    { name: 'Mortgage', href: '/mortgage', icon: DollarSign, roles: ['buyer', 'bank_partner'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'bank_partner'] },
    { name: 'Admin', href: '/admin', icon: Settings, roles: ['admin'] },
  ];

  const filteredUserNav = userNavigation.filter(
    (item) => profile && item.roles.includes(profile.role)
  );

  const handleAIChatClick = () => {
    if (user) {
      navigate('/chat');
    } else {
      setMembersOnlyModalOpen(true);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/placesi-logo-dark copy.png"
                alt="Placesi"
                className="h-8 dark:hidden"
                style={{ width: 'auto', imageRendering: 'crisp-edges' }}
              />
              <img
                src="/placesi-logo-white copy.png"
                alt="Placesi"
                className="h-8 hidden dark:block"
                style={{ width: 'auto', imageRendering: 'crisp-edges' }}
              />
            </Link>

            <div className="hidden md:ml-10 md:flex md:space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-green-500 hover:text-gray-900 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {item.name}
                </Link>
              ))}

              <button
                onClick={handleAIChatClick}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-green-500 hover:text-gray-900 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                AI Chat
              </button>

              {user && filteredUserNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-green-500 hover:text-gray-900 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {profile?.full_name || 'User'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-200 dark:border-gray-700">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2 dark:text-green-500" />
                      Profile
                    </Link>
                    {profile && profile.role === 'agency' && (
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2 dark:text-green-500" />
                        Agency Dashboard
                      </Link>
                    )}
                    {profile && profile.role === 'mortgage_institution' && (
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <DollarSign className="w-4 h-4 mr-2 dark:text-green-500" />
                        Mortgage Panel
                      </Link>
                    )}
                    {profile && profile.role === 'agent' && (
                      <Link
                        to="/agent-panel"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Building2 className="w-4 h-4 mr-2 dark:text-green-500" />
                        Agent Panel
                      </Link>
                    )}
                    {profile && profile.role === 'contractor' && (
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2 dark:text-green-500" />
                        Dashboard
                      </Link>
                    )}
                    <Link
                      to="/favorites"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Heart className="w-4 h-4 mr-2 dark:text-green-500" />
                      Favorites
                    </Link>
                    {profile && profile.role !== 'agency' && profile.role !== 'mortgage_institution' && profile.role !== 'contractor' && (
                      <Link
                        to="/my-mortgage-applications"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FileText className="w-4 h-4 mr-2 dark:text-green-500" />
                        Mortgage Applications
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4 mr-2 dark:text-green-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <button
              onClick={handleAIChatClick}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              AI Chat
            </button>

            {user && filteredUserNav.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {!user && (
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link to="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <MembersOnlyModal
        isOpen={membersOnlyModalOpen}
        onClose={() => setMembersOnlyModalOpen(false)}
      />
    </header>
  );
}
