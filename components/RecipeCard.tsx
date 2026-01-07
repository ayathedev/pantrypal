
import React, { useState, useEffect } from 'react';
import { Clock, ChefHat, ChevronDown, ChevronUp, CheckCircle2, Bookmark, BookmarkCheck, Share2, X, Maximize2, Flame, Brain, Wheat, Droplets, Users, Search, ExternalLink, Lightbulb, Sparkles } from 'lucide-react';
import { Recipe } from '../types';
import { generateImageFromTitle } from '../services/geminiService';

interface RecipeCardProps {
  recipe: Recipe;
  isSaved?: boolean;
  onToggleSave?: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSaved = false, onToggleSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAiImage = async () => {
      setIsGenerating(true);
      const url = await generateImageFromTitle(recipe.name);
      if (isMounted && url) {
        setGeneratedImageUrl(url);
      }
      if (isMounted) setIsGenerating(false);
    };

    fetchAiImage();
    return () => { isMounted = false; };
  }, [recipe.name]);

  // Fallback if AI generation fails
  const fallbackUrl = `https://loremflickr.com/800/450/food,${recipe.name.replace(/\s+/g, ',')}`;
  const displayUrl = generatedImageUrl || fallbackUrl;

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

  const openGoogleImages = () => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(recipe.name)}+recipe&tbm=isch`;
    window.open(searchUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-500 ease-out group animate-card-entry">
      {/* Recipe Image Display */}
      <div 
        className="h-64 w-full overflow-hidden bg-slate-100 relative cursor-zoom-in group/image"
        onClick={() => setIsImageModalOpen(true)}
      >
        {(!imageLoaded || isGenerating) && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex flex-col items-center justify-center gap-3">
             <div className="w-12 h-12 bg-slate-300/50 rounded-full flex items-center justify-center">
                <Sparkles className="text-orange-400 animate-pulse" size={24} />
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               AI is painting your {recipe.name.split(' ').pop()}...
             </p>
          </div>
        )}
        
        <img 
          src={displayUrl}
          alt={recipe.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
            imageLoaded && !isGenerating ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'
          }`}
          loading="lazy"
        />
        
        {imageLoaded && !isGenerating && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
              <Maximize2 size={24} />
            </div>
          </div>
        )}

        {generatedImageUrl && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="bg-black/50 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-lg flex items-center gap-1">
              <Sparkles size={10} /> AI Generated
            </div>
          </div>
        )}

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
              src={displayUrl} 
              alt={recipe.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute -bottom-10 left-0 right-0 text-center">
              <h3 className="text-white font-bold text-lg">{recipe.name}</h3>
              <p className="text-white/60 text-xs">Generated by Gemini 2.5 Flash Image</p>
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
            {generatedImageUrl ? "AI Painting" : "Photo Source"}
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-2.5 flex items-center justify-center gap-2 text-slate-700 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
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
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                  Nutritional Estimates <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider ml-2">(Per Serving)</span>
                </h4>
                <button
                  onClick={() => setShowNutrition(!showNutrition)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest transition-all active:scale-95"
                >
                  {showNutrition ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showNutrition ? 'Hide' : 'Show'}
                </button>
              </div>

              {showNutrition && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
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
              )}
            </div>
          )}

          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                Ingredients
              </h4>
              <div className="flex gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-300" /> {recipe.servings || 2} Servings
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-300" /> {recipe.totalTime}
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
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                Step-by-Step Instructions
              </h4>
              <button 
                onClick={openGoogleImages}
                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-orange-600 uppercase tracking-widest transition-colors"
              >
                <Search size={12} /> Google Images <ExternalLink size={10} />
              </button>
            </div>
            <div className="space-y-4 mb-10">
              {recipe.instructions.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`pt-6 pb-8 px-4 -mx-4 rounded-2xl flex gap-6 relative group/step transition-all duration-300 hover:bg-orange-50/50 ${
                    idx !== recipe.instructions.length - 1 ? 'border-b border-slate-100/80 border-dashed' : ''
                  }`}
                >
                  <div className="flex-shrink-0 flex items-start">
                    <div className="relative flex items-center justify-center transition-transform duration-300 group-hover/step:scale-110">
                      <div className="absolute inset-0 bg-orange-100 rounded-lg rotate-6 translate-x-0.5 translate-y-0.5 group-hover/step:rotate-0 group-hover/step:translate-x-0 group-hover/step:translate-y-0 transition-all duration-300"></div>
                      <span className="relative w-9 h-9 flex items-center justify-center bg-orange-500 text-white rounded-lg text-sm font-black shadow-sm group-hover/step:shadow-md transition-shadow">
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 leading-[1.8] font-medium pt-1 flex items-start">
                      <span className="mr-2 text-orange-400 font-bold select-none opacity-70" aria-hidden="true">—</span>
                      <span>{step}</span>
                    </p>
                  </div>
                  <span className="absolute -right-2 -bottom-4 text-7xl font-black text-slate-900/[0.02] select-none pointer-events-none group-hover/step:text-orange-500/[0.06] transition-colors duration-300">
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chef's Tips & Techniques */}
          {recipe.tips && recipe.tips.length > 0 && (
            <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-100 relative overflow-hidden group/tips">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/tips:opacity-[0.05] transition-opacity">
                <Lightbulb size={120} className="text-amber-900" />
              </div>
              <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2 text-base relative z-10">
                <Lightbulb size={18} className="text-amber-600" />
                Chef's Tips & Techniques
              </h4>
              <ul className="space-y-3 relative z-10">
                {recipe.tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-amber-900/80 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-10 flex flex-col items-center justify-center py-6 border-t border-slate-200 border-dashed text-center">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">
              Bon Appétit!
            </p>
            <div className="flex gap-4">
               <button 
                 onClick={handleShare}
                 className="px-6 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
               >
                 <Share2 size={14} /> Share Recipe
               </button>
               <button 
                 onClick={() => onToggleSave?.(recipe)}
                 className={`px-6 py-2 rounded-full text-xs font-bold shadow-sm flex items-center gap-2 transition-colors ${
                   isSaved 
                    ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                 }`}
               >
                 {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />} 
                 {isSaved ? 'Saved to Book' : 'Save for Later'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
