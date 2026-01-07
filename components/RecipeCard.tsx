
import React, { useState } from 'react';
import { Clock, ChefHat, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-900">{recipe.name}</h3>
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
            recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
            recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'
          }`}>
            {recipe.difficulty}
          </span>
        </div>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat size={16} />
            <span>{recipe.ingredients.length} ingredients</span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-2 flex items-center justify-center gap-1 text-orange-600 font-semibold border border-orange-100 rounded-xl hover:bg-orange-50 transition-colors"
        >
          {isOpen ? (
            <>Hide Details <ChevronUp size={18} /></>
          ) : (
            <>View Recipe <ChevronDown size={18} /></>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="p-6 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top duration-300">
          <div className="mb-6">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              Ingredients needed
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                  <CheckCircle2 size={14} className="text-orange-400" />
                  {ing}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              Instructions
            </h4>
            <ol className="space-y-4">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-orange-500 text-white rounded-full text-xs font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
