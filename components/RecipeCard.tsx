
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ChefHat, ChevronDown, ChevronUp, CheckCircle2, Bookmark, BookmarkCheck, Share2, X, Maximize2, Flame, Brain, Wheat, Droplets, Users, Search, ExternalLink, Lightbulb, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [imageError, setImageError] = useState(false);

  const fetchAiImage = useCallback(async (isMounted: boolean = true) => {
    setIsGenerating(true);
    setImageError(false);
    try {
      const url = await generateImageFromTitle(recipe.name);
      if (isMounted) {
        if (url) {
          setGeneratedImageUrl(url);
          setImageError(false);
        } else {
          setImageError(true);
        }
      }
    } catch (err) {
      if (isMounted) setImageError(true);
    } finally {
      if (isMounted) setIsGenerating(false);
    }
  }, [recipe.name]);

  useEffect(() => {
    let isMounted = true;
    fetchAiImage(isMounted);
    return () => { isMounted = false; };
  }, [fetchAiImage]);

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
    const shareUrl = window.location.href;
    const shareData = {
      title: `Recipe: ${recipe.name}`,
      text: `Check out this delicious recipe for ${recipe.name} I found on PantryPal!`,
      url: shareUrl,
    };

    try {
      // Some environments use about:blank or other invalid URLs which cause navigator.share to throw
      const isValidUrl = shareUrl && shareUrl.startsWith('http');
      
      if (navigator.share && isValidUrl) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share not supported or invalid URL');
      }
    } catch (err) {
      // Fallback to clipboard if share fails or is unsupported
      try {
        const shareText = `${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        alert('Recipe link copied to clipboard!');
      } catch (clipboardErr) {
        console.error('Fallback sharing failed:', clipboardErr);
      }
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
        className={`h-64 w-full overflow-hidden bg-slate-100 relative ${!imageError ? 'cursor-zoom-in' : ''} group/image`}
        onClick={() => !imageError && !isGenerating && setIsImageModalOpen(true)}
      >
        {/* Loading State Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-20 bg-slate-200 animate-pulse flex flex-col items-center justify-center gap-3">
             <div className="w-12 h-12 bg-slate-300/50 rounded-full flex items-center justify-center">
                <Sparkles className="text-orange-400 animate-pulse" size={24} />
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 text-center">
               AI is painting your {recipe.name.split(' ').pop()}...
             </p>
          </div>
        )}

        {/* Error State Overlay */}
        {imageError && !isGenerating && (
          <div className="absolute inset-0 z-20 bg-slate-50 flex flex-col items-center justify-center p-6 text-center border-b border-slate-100">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">AI couldn't generate image</h4>
            <p className="text-[10px] text-slate-400 mb-4 max-w-[200px]">The model encountered an issue or the content was restricted.</p>
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); fetchAiImage(); }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95 shadow-md shadow-orange-100"
              >
                <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} /> Retry
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); openGoogleImages(); }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
              >
                <Search size={12} /> Search
              </button>
            </div>
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
        
        {imageLoaded && !isGenerating && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
              <Maximize2 size={24} />
            </div>
          </div>
        )}

        {generatedImageUrl && !imageError && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="bg-black/50 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-lg flex items-center gap-1">
              <Sparkles size={10} /> AI Generated
            </div>
          </div>
        )}

        {!imageError && (
          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
            Click to enlarge
          </div>
        )}
      </div>

      {/* Image Modal */}
      {isImageModalOpen && !imageError && (
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
            {generatedImageUrl ? (imageError ? "Photo Fallback" : "AI Painting") : "Photo Source"}
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full py-2.5 flex items-center justify-center gap-2 font-bold border rounded-xl transition-all shadow-sm ${
            isOpen 
              ? 'bg-slate-800 text-white border-slate-800' 
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {isOpen ? (
            <>Close Recipe Details <ChevronUp size={18} /></>
          ) : (
            <>View Detailed Recipe <ChevronDown size={18} /></>
          )}
        </button>
      </div>

      {/* Fancy Animated Detailed Section */}
      <div className={`expand-grid ${isOpen ? 'is-open' : ''}`}>
        <div className="expand-inner">
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100">
            
            {/* Header with Top Collapse Button */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  <ChefHat size={18} />
                </div>
                <h4 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Cooking Guide</h4>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200/50 hover:bg-slate-200 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                <ChevronUp size={14} /> Collapse Details
              </button>
            </div>
            
            {/* Nutrition Section */}
            {recipe.nutrition && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                    Nutrition Facts <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider ml-2">(Est. per serving)</span>
                  </h4>
                  <button
                    onClick={() => setShowNutrition(!showNutrition)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest transition-all"
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

            {/* Ingredients Section */}
            <div className="mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                  <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                  Ingredients List
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
                  <div key={idx} className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-all hover:bg-orange-50/20">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={12} className="text-orange-500" />
                    </div>
                    <span className="font-medium">{ing}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps Section */}
            <div className="mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                  <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                  Preparation Steps
                </h4>
                <button 
                  onClick={openGoogleImages}
                  className="w-fit flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-orange-600 uppercase tracking-widest transition-colors"
                >
                  <Search size={12} /> Search Images <ExternalLink size={10} />
                </button>
              </div>
              <div className="space-y-4">
                {recipe.instructions.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 sm:p-6 rounded-2xl flex gap-4 sm:gap-6 relative group/step bg-white border border-slate-100 shadow-sm hover:shadow-md hover:bg-orange-50/10 active:bg-orange-50/20 animate-reveal-step"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex-shrink-0 pt-1">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-orange-100 rounded-lg rotate-3 transition-transform group-hover/step:rotate-0"></div>
                        <span className="relative w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-lg text-xs font-black shadow-sm">
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-medium pt-1">
                        {step}
                      </p>
                    </div>
                    <span className="absolute right-4 bottom-2 text-6xl font-black text-slate-900/[0.02] select-none pointer-events-none group-hover/step:text-orange-500/[0.04] transition-colors hidden sm:block">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chef's Tips Section */}
            {recipe.tips && recipe.tips.length > 0 && (
              <div className="bg-amber-50/50 rounded-2xl p-5 sm:p-6 border border-amber-100 relative overflow-hidden group/tips mb-10">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Lightbulb size={120} className="text-amber-900" />
                </div>
                <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2 text-base relative z-10">
                  <Lightbulb size={18} className="text-amber-600" />
                  Pro Chef Tips
                </h4>
                <ul className="space-y-3 relative z-10">
                  {recipe.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-amber-900/80 leading-relaxed">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex flex-col items-center justify-center py-6 border-t border-slate-200 border-dashed text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">
                Ready to serve?
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                 <button 
                   onClick={handleShare}
                   className="px-5 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                 >
                   <Share2 size={14} /> Share
                 </button>
                 <button 
                   onClick={() => onToggleSave?.(recipe)}
                   className={`px-5 py-2 rounded-full text-xs font-bold shadow-sm flex items-center gap-2 transition-colors ${
                     isSaved 
                      ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                   }`}
                 >
                   {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />} 
                   {isSaved ? 'Saved' : 'Save Recipe'}
                 </button>
                 <button 
                   onClick={() => setIsOpen(false)}
                   className="px-5 py-2 bg-slate-800 text-white rounded-full text-xs font-bold hover:bg-slate-900 transition-colors shadow-md"
                 >
                   Finish Viewing
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
