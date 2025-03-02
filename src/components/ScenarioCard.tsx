import React from 'react';
import { Shield, Users, Clock, Edit, CheckCircle2, Lock, Trash2 } from 'lucide-react';
import { Scenario } from '../types';

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (scenario: Scenario) => void;
  onDelete?: (scenario: Scenario) => void;
  isCustom?: boolean;
  isCompleted?: boolean;
}

export function ScenarioCard({ scenario, onSelect, onDelete, isCustom, isCompleted }: ScenarioCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(scenario);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${
        isCompleted ? 'border-l-4 border-green-500' : ''
      }`}
      onClick={() => onSelect(scenario)}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{scenario.title}</h3>
          <div className="flex items-center gap-2">
            {isCustom && (
              <span className="text-xs text-gray-500">Custom Scenario</span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 size={12} />
                Completed
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {scenario.type.replace(/_/g, ' ')}
          </span>
          {isCustom && !isCompleted && (
            <span className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
              <Edit size={16} />
            </span>
          )}
          {isCompleted && (
            <span className="p-1 text-gray-500 rounded-full">
              <Lock size={16} />
            </span>
          )}
          {isCustom && onDelete && (
            <button 
              onClick={handleDelete}
              className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
              title="Delete scenario"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{scenario.description}</p>
      
      <div className="flex items-center gap-4 text-gray-500">
        <div className="flex items-center gap-1">
          <Shield size={18} />
          <span>{scenario.mitreTactics.length} tactics</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={18} />
          <span>{scenario.roles.length} roles</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={18} />
          <span>{scenario.injects?.length || 0} injects</span>
        </div>
      </div>
      
      {scenario.startedAt && !scenario.completedAt && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-yellow-600 flex items-center gap-1">
            <Clock size={12} />
            In Progress
          </span>
        </div>
      )}
    </div>
  );
}