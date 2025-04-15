
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-muted py-16 md:py-24 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="bg-gradient-to-r from-famille-blue via-famille-purple to-famille-pink text-transparent bg-clip-text mb-6 animate-fade-in">
            {t('landing.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 animate-slide-up">
            {t('landing.hero.subtitle')}
          </p>
          <Button asChild size="lg" className="bg-famille-blue hover:bg-famille-blue/90 text-lg py-6 px-8">
            <Link to="/signup">
              {t('landing.hero.cta')}
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-famille-yellow/20 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-famille-purple/20 blur-3xl"></div>
      <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-famille-teal/20 blur-2xl"></div>
    </div>
  );
};

export default Hero;
