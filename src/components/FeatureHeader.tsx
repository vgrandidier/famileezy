
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/LanguageContext';

interface FeatureHeaderProps {
  title: string;
  color: string;
}

const FeatureHeader = ({ title, color }: FeatureHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  return (
    <div 
      className="w-full py-4 px-4 flex items-center justify-between sticky top-0 z-40"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-white text-xl font-bold">{title}</h1>
      </div>
      
      {/* Mobile menu can be added here if needed for specific features */}
      {isMobile && (
        <div className="flex items-center">
          {/* This space is reserved for feature-specific actions on mobile */}
        </div>
      )}
    </div>
  );
};

export default FeatureHeader;
