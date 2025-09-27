import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { user, logout } = useUser();
  const location = useLocation();
  const { t } = useTranslation();

  // Helper function to determine if a link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Helper function to get navigation link classes
  const getNavLinkClasses = (path) => {
    const baseClasses = "transition-colors font-semibold";
    if (isActive(path)) {
      return `${baseClasses} text-[#f3ba2f]`;
    }
    return `${baseClasses} text-gray-300 hover:text-[#f3ba2f]`;
  };

  return (
    <header className="p-4 border-b border-gray-800 bg-black shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-2xl text-[#f3ba2f] tracking-wide flex items-center gap-2">
          <span role="img" aria-label="BNB">🟡</span> {t('header.title')}
        </Link>
        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className={getNavLinkClasses('/')}
          >
            {t('common.home')}
          </Link>
          <Link 
            to="/verify" 
            className={getNavLinkClasses('/verify')}
          >
            {t('common.verify')}
          </Link>
          <Link 
            to="/dashboard-binance" 
            className={getNavLinkClasses('/dashboard-binance')}
          >
            {t('common.dashboard')}
          </Link>
          <Link 
            to="/profile" 
            className={getNavLinkClasses('/profile')}
          >
            {t('common.profile')}
          </Link>
          {user && user.role === 'institute' && (
            <Link 
              to="/bulk" 
              className={getNavLinkClasses('/bulk')}
            >
              {t('common.bulk')}
            </Link>
          )}
          {user && user.role === 'student' && ( // NEW: Conditional for student only
            <Link 
              to="/resume-builder" 
              className={getNavLinkClasses('/resume-builder')}
            >
              {t('common.resume')}
            </Link>
          )}
          <Link 
            to="/networking" 
            className={`${getNavLinkClasses('/networking')} flex items-center gap-2`}
          >
            {t('common.networking')}
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm bg-[#f3ba2f] text-black rounded-full px-3 py-1 shadow hover:shadow-yellow-400/50 transition-shadow">
                <span role="img" aria-label="User">👤</span>
                <span className="font-semibold">{user.role}</span>
                <span className="hidden md:inline ml-2">{user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}</span>
              </span>
              <button
                onClick={() => {
                  console.log('Logout button clicked');
                  logout();
                }}
                className="px-4 py-1 rounded-lg font-semibold border-2 border-[#f3ba2f] text-[#f3ba2f] hover:bg-[#f3ba2f] hover:text-black transition-transform transform hover:scale-105"
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <Link
              to="/auth-binance"
              className="px-4 py-2 rounded-lg font-semibold bg-[#f3ba2f] text-black hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg hover:shadow-yellow-400/50"
            >
              {t('common.signIn')}
            </Link>
          )}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
