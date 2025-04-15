
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import FeatureHeader from '@/components/FeatureHeader';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

// Define the features data structure with colors
const featuresData = {
  'pocket-money': {
    title: 'Pocket Money',
    color: '#7209B7', // famille-purple
  },
  'budget': {
    title: 'Family Budget',
    color: '#4361EE', // famille-blue
  },
  'recipes': {
    title: 'Family Recipes',
    color: '#FB8500', // famille-orange
  },
  'solar': {
    title: 'Solar Panels',
    color: '#FFBE0B', // famille-yellow
  },
  'calendar': {
    title: 'Family Calendar',
    color: '#06D6A0', // famille-teal
  },
  'tasks': {
    title: 'Tasks & Chores',
    color: '#F72585', // famille-pink
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

  return (
    <div className="flex flex-col min-h-screen">
      <FeatureHeader title={translatedTitle} color={feature.color} />
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

// Export the features data so it can be used elsewhere
export { featuresData };
