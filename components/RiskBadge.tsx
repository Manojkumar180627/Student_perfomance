
import React from 'react';
import { RiskLevel } from '../types';
import { COLORS } from '../constants';

interface RiskBadgeProps {
  level: RiskLevel;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const style = COLORS[level] || COLORS.MEDIUM;
  
  const getIcon = () => {
    switch(level) {
      case RiskLevel.LOW: return <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;
      case RiskLevel.MEDIUM: return <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />;
      case RiskLevel.HIGH: return <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
    }
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ring-1 ring-inset ${style}`}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        {getIcon()}
      </svg>
      {level}
    </span>
  );
};

export default RiskBadge;
