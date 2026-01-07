
import React from 'react';
import { ChefHat, Flame, Waves, Heater, Zap, Timer, Wind } from 'lucide-react';
import { Appliance } from '../types';

interface ApplianceSelectorProps {
  appliances: Appliance[];
  onToggle: (id: string) => void;
}

const ApplianceSelector: React.FC<ApplianceSelectorProps> = ({ appliances, onToggle }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <Zap size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">My Appliances</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {appliances.map((app) => (
          <button
            key={app.id}
            onClick={() => onToggle(app.id)}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
              app.enabled
                ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-100'
                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${app.enabled ? 'bg-blue-200' : 'bg-slate-200'}`}>
              <ApplianceIcon name={app.icon} size={18} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">{app.name}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-[10px] text-slate-400 uppercase font-bold tracking-widest text-center">
        Selected tools will guide recipe ideas
      </p>
    </div>
  );
};

const ApplianceIcon = ({ name, size }: { name: string; size: number }) => {
  switch (name) {
    case 'flame': return <Flame size={size} />;
    case 'oven': return <Heater size={size} />;
    case 'waves': return <Waves size={size} />;
    case 'toaster': return <Timer size={size} />;
    case 'zap': return <Zap size={size} />;
    case 'wind': return <Wind size={size} />;
    default: return <ChefHat size={size} />;
  }
};

export default ApplianceSelector;
