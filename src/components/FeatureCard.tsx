
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  className?: string;
  style?: React.CSSProperties;
}

const FeatureCard = ({
  title,
  description,
  icon: Icon,
  color,
  className,
  style,
}: FeatureCardProps) => {
  return (
    <div 
      className={cn(
        "famille-card p-6 flex flex-col items-center text-center",
        "transform hover:scale-105 transition-all duration-300",
        className
      )}
      style={style}
    >
      <div className={`feature-icon mb-4 ${color}`}>
        <Icon className="h-full w-full" />
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
