
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-famille-blue to-famille-purple text-transparent bg-clip-text">
                FamilleHub
              </span>
            </Link>
            <p className="text-gray-600 max-w-sm">
              Une application complète pour gérer la vie de famille moderne avec
              simplicité et efficacité.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-famille-blue transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-famille-blue transition-colors">
                  {t('nav.login')}
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-600 hover:text-famille-blue transition-colors">
                  {t('nav.signup')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Légal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-famille-blue transition-colors">
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-famille-blue transition-colors">
                  {t('footer.terms')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-famille-blue transition-colors">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-center text-sm">
            &copy; {currentYear} FamilleHub. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
