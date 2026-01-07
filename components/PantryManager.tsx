
import React, { useState } from 'react';
import { Plus, X, Carrot, ShoppingBasket } from 'lucide-react';
import { PantryItem } from '../types';

interface PantryManagerProps {
  items: PantryItem[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

const PantryManager: React.FC<PantryManagerProps> = ({ items, onAdd, onRemove }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
          <ShoppingBasket size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">My Pantry</h2>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add an ingredient (e.g. eggs, flour, tomatoes...)"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
        </button>
      </form>

      {items.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <div className="inline-block p-4 bg-slate-50 rounded-full mb-3">
            <Carrot size={32} />
          </div>
          <p>Your pantry is empty. Start adding items!</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium animate-in fade-in zoom-in duration-200"
            >
              <span>{item.name}</span>
              <button
                onClick={() => onRemove(item.id)}
                className="hover:text-orange-900 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PantryManager;
