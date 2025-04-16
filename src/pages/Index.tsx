
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PiggyBank, DollarSign, ChefHat, Sun, Calendar, ClipboardList } from 'lucide-react';
import { useEffect } from 'react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // If user is authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      title: t('features.pocket-money.title'),
      description: t('features.pocket-money.description'),
      icon: PiggyBank,
      color: 'bg-famille-purple',
    },
    {
      title: t('features.budget.title'),
      description: t('features.budget.description'),
      icon: DollarSign,
      color: 'bg-famille-blue',
    },
    {
      title: t('features.recipes.title'),
      description: t('features.recipes.description'),
      icon: ChefHat,
      color: 'bg-famille-orange',
    },
    {
      title: t('features.solar.title'),
      description: t('features.solar.description'),
      icon: Sun,
      color: 'bg-famille-yellow',
    },
    {
      title: t('features.calendar.title'),
      description: t('features.calendar.description'),
      icon: Calendar,
      color: 'bg-famille-teal',
    },
    {
      title: t('features.tasks.title'),
      description: t('features.tasks.description'),
      icon: ClipboardList,
      color: 'bg-famille-pink',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <Hero />
        
        {/* Features Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto">
            <h2 className="text-center mb-12">Tout ce dont votre famille a besoin</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  color={feature.color}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials or additional sections can be added here */}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
