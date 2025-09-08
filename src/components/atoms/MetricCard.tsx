import React from 'react';
import Icon from './Icon';

interface MetricCardProps {
  title: string;
  value: string | number;
  iconName: string;
  iconBgColor: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export default function MetricCard({
  title,
  value,
  iconName,
  iconBgColor,
  change,
  changeType = 'neutral'
}: MetricCardProps) {
  const changeColorClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${changeColorClasses[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor}`}>
          <Icon name={iconName} size="lg" className="text-white" />
        </div>
      </div>
    </div>
  );
}
