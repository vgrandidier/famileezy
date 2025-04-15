
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank, DollarSign, ChefHat, Sun, Calendar, ClipboardList } from 'lucide-react';
import { featuresData, FeatureId } from './FeaturePage';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null; // Don't render anything while redirecting
  }

  const modules = [
    {
      title: t('features.pocketMoney.title'),
      description: t('features.pocketMoney.description'),
      icon: PiggyBank,
      color: 'bg-famille-purple',
      link: '/feature/pocket-money',
      id: 'pocket-money' as FeatureId,
    },
    {
      title: t('features.budget.title'),
      description: t('features.budget.description'),
      icon: DollarSign,
      color: 'bg-famille-blue',
      link: '/feature/budget',
      id: 'budget' as FeatureId,
    },
    {
      title: t('features.recipes.title'),
      description: t('features.recipes.description'),
      icon: ChefHat,
      color: 'bg-famille-orange',
      link: '/feature/recipes',
      id: 'recipes' as FeatureId,
    },
    {
      title: t('features.solar.title'),
      description: t('features.solar.description'),
      icon: Sun,
      color: 'bg-famille-yellow',
      link: '/feature/solar',
      id: 'solar' as FeatureId,
    },
    {
      title: t('features.calendar.title'),
      description: t('features.calendar.description'),
      icon: Calendar,
      color: 'bg-famille-teal',
      link: '/feature/calendar',
      id: 'calendar' as FeatureId,
    },
    {
      title: t('features.tasks.title'),
      description: t('features.tasks.description'),
      icon: ClipboardList,
      color: 'bg-famille-pink',
      link: '/feature/tasks',
      id: 'tasks' as FeatureId,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {user.firstName}!
          </h1>
          <p className="text-muted-foreground mb-8">
            Bienvenue sur votre tableau de bord familial. Que souhaitez-vous gérer aujourd'hui?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className={`text-white ${module.color}`}>
                  <div className="flex items-center gap-2">
                    <module.icon className="h-6 w-6" />
                    <CardTitle>{module.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <CardDescription className="text-gray-600 mb-4">
                    {module.description}
                  </CardDescription>
                  <Link 
                    to={module.link} 
                    className="text-famille-blue hover:underline inline-flex items-center"
                  >
                    Gérer
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
                      <path d="M6.5 12.5L11 8L6.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
