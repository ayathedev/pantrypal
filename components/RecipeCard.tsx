
import React, { useState, useEffect } from 'react';
import { Clock, ChefHat, ChevronDown, ChevronUp, CheckCircle2, Bookmark, BookmarkCheck, Share2, X, Maximize2, Flame, Brain, Wheat, Droplets, Users } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  isSaved?: boolean;
  onToggleSave?: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSaved = false, onToggleSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // Create a search-friendly string for the image placeholder
  const imageSearchTerms = encodeURIComponent(recipe.name.toLowerCase().replace(/\s+/g, ',') + ',food,cooking');
  const imageUrl = `https://loremflickr.com/800/400/${imageSearchTerms}`;
  const largeImageUrl = `https://loremflickr.com/1200/800/${imageSearchTerms}`;

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsImageModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: `Recipe: ${recipe.name}`,
      text: `Check out this delicious recipe for ${recipe.name} I found on PantryPal!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        alert('Recipe link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing recipe:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Recipe Image Placeholder */}
      <div 
        className="h-48 w-full overflow-hidden bg-slate-100 relative cursor-zoom-in group/image"
        onClick={() => setIsImageModalOpen(true)}
      >
        <img 
          src={imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
            <Maximize2 size={24} />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
          Click to enlarge
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 animate-in fade-in duration-300"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[110]"
            onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(false); }}
          >
            <X size={24} />
          </button>
          
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-300">
            <img 
              src={largeImageUrl} 
              alt={recipe.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute -bottom-10 left-0 right-0 text-center">
              <h3 className="text-white font-bold text-lg">{recipe.name}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">{recipe.name}</h3>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-1">
              {recipe.difficulty} • {recipe.prepTime}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-200 transition-all"
              title="Share recipe"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={() => onToggleSave?.(recipe)}
              className={`p-2 rounded-xl border transition-all ${
                isSaved 
                  ? 'bg-orange-50 border-orange-200 text-orange-600' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-200'
              }`}
              title={isSaved ? "Remove from saved" : "Save recipe"}
            >
              {isSaved ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
            </button>
          </div>
        </div>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-slate-400" />
              <span>{recipe.prepTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChefHat size={16} className="text-slate-400" />
              <span>{recipe.ingredients.length} ingredients</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic select-none">
            Source: AI Generated
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-2.5 flex items-center justify-center gap-2 text-slate-700 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          {isOpen ? (
            <>Hide Details <ChevronUp size={18} /></>
          ) : (
            <>View Detailed Recipe <ChevronDown size={18} /></>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="p-6 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top duration-300">
          
          {/* Nutrition Section */}
          {recipe.nutrition && (
            <div className="mb-8">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-base">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                Nutritional Estimates <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider ml-2">(Per Serving)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <Flame size={16} className="text-orange-500 mb-1" />
                  <span className="text-lg font-bold text-slate-800 leading-none">{recipe.nutrition.calories}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Calories</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <Brain size={16} className="text-blue-500 mb-1" />
                  <span className="text-lg font-bold text-slate-800 leading-none">{recipe.nutrition.protein}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Protein</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <Wheat size={16} className="text-amber-500 mb-1" />
                  <span className="text-lg font-bold text-slate-800 leading-none">{recipe.nutrition.carbs}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Carbs</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <Droplets size={16} className="text-rose-500 mb-1" />
                  <span className="text-lg font-bold text-slate-800 leading-none">{recipe.nutrition.fat}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Fat</span>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                Ingredients
              </h4>
              <div className="flex gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-300" /> Servings: {recipe.servings || 4}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-300" /> Total Time: {recipe.totalTime || '45 mins'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <CheckCircle2 size={16} className="text-orange-500 flex-shrink-0" />
                  <span className="font-medium">{ing}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-base">
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              Step-by-Step Instructions
            </h4>
            <div className="space-y-3">
              {recipe.instructions.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-2xl border flex gap-4 transition-all ${
                    idx % 2 === 0 
                      ? 'bg-white border-slate-200 shadow-sm' 
                      : 'bg-orange-50/40 border-orange-100'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <span className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-full text-xs font-bold shadow-md">
                      {idx + 1}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium pt-1">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center py-4 border-t border-slate-200 border-dashed">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Enjoy your {recipe.name}!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
