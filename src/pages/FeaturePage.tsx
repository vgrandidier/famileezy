import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import FeatureNavbar from '@/components/FeatureNavbar';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { PiggyBank, DollarSign, ChefHat, Sun, Calendar, ClipboardList, LucideIcon } from 'lucide-react';

// Define the features data structure with colors and icons
export const featuresData = {
  'pocket-money': {
    title: 'Pocket Money',
    color: '#41AFAA', // famille-money
    icon: PiggyBank,
  },
  'budget': {
    title: 'Family Budget',
    color: '#466EB4', // famille-budget
    icon: DollarSign,
  },
  'recipes': {
    title: 'Family Recipes',
    color: '#00A0E1', // famille-recipe
    icon: ChefHat,
  },
  'solar': {
    title: 'Solar Panels',
    color: '#E6A532', // famille-solar
    icon: Sun,
  },
  'calendar': {
    title: 'Family Calendar',
    color: '#D7642C', // famille-calendar
    icon: Calendar,
  },
  'tasks': {
    title: 'Tasks & Chores',
    color: '#AF4B91', // famille-task
    icon: ClipboardList,
  },
};

export type FeatureId = keyof typeof featuresData;

const FeaturePage = () => {
  const { isAuthenticated } = useAuth();
  const { featureId } = useParams<{ featureId: string }>();
  const { t } = useLanguage();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if the feature exists
  if (!featureId || !Object.keys(featuresData).includes(featureId)) {
    return <Navigate to="/dashboard" />;
  }

  const feature = featuresData[featureId as FeatureId];
  const translatedTitle = t(`features.${featureId}.title`);
  const Icon = feature.icon;

  return (
    <div className="flex flex-col min-h-screen">
      <FeatureNavbar 
        featureTitle={translatedTitle} 
        featureIcon={Icon} 
        backgroundColor={feature.color}
      />
      <main className="flex-grow p-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-4">{translatedTitle}</h2>
          <p className="text-muted-foreground">
            {t('features.comingSoon', 'This feature is coming soon. Check back later for updates!')}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturePage;