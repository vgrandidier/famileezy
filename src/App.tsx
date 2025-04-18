import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { FamilyProvider } from "@/context/FamilyContext";
import { FamilyDrawerProvider, useFamilyDrawer } from "@/context/FamilyDrawerContext";
import { ProfileDrawerProvider, useProfileDrawer } from "@/context/ProfileDrawerContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Family from "./pages/Family";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import FeaturePage from "./pages/FeaturePage";
import FamilyDrawer from "./components/FamilyDrawer";
import ProfileDrawer from "./components/ProfileDrawer";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FamilyProvider>
          <LanguageProvider>
            <FamilyDrawerProvider>
              <ProfileDrawerProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <AppContent />
                  </BrowserRouter>
                </TooltipProvider>
              </ProfileDrawerProvider>
            </FamilyDrawerProvider>
          </LanguageProvider>
        </FamilyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Composant séparé pour accéder au contexte à l'intérieur du BrowserRouter
const AppContent = () => {
  const { isOpen, closeDrawer } = useFamilyDrawer();
  const { isOpen: isProfileOpen, closeDrawer: closeProfileDrawer } = useProfileDrawer();
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/family" element={<Family />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/feature/:featureId" element={<FeaturePage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Les tiroirs sont accessibles globalement */}
      <FamilyDrawer open={isOpen} onOpenChange={closeDrawer} />
      <ProfileDrawer open={isProfileOpen} onOpenChange={closeProfileDrawer} />
    </>
  );
};

export default App;