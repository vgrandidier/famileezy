
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FamilyMemberList from '@/components/FamilyMemberList';

const Family = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">Gestion de la famille</h1>
          <p className="text-muted-foreground mb-8">
            Gérez les membres de votre famille et envoyez des invitations pour les rejoindre.
          </p>
          <FamilyMemberList currentUser={user} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Family;
