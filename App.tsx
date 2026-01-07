
import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Sparkles, Loader2, AlertCircle, ShoppingBasket, Bookmark, Users, Minus, Plus } from 'lucide-react';
import PantryManager from './components/PantryManager';
import RecipeCard from './components/RecipeCard';
import ApplianceSelector from './components/ApplianceSelector';
import { PantryItem, Recipe, Appliance } from './types';
import { getRecipesFromPantry } from './services/geminiService';

const DEFAULT_APPLIANCES: Appliance[] = [
  { id: 'stove', name: 'Stove', icon: 'flame', enabled: true },
  { id: 'oven', name: 'Oven', icon: 'oven', enabled: true },
  { id: 'microwave', name: 'Microwave', icon: 'waves', enabled: false },
  { id: 'toaster', name: 'Toaster Oven', icon: 'toaster', enabled: false },
  { id: 'hotplate', name: 'Hot Plate', icon: 'zap', enabled: false },
  { id: 'airfryer', name: 'Air Fryer', icon: 'wind', enabled: false },
];

const App: React.FC = () => {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>(DEFAULT_APPLIANCES);
  const [servings, setServings] = useState(2);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'saved'>('suggestions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref for scrolling to results
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedItems = localStorage.getItem('pantry-pal-items');
    const savedApps = localStorage.getItem('pantry-pal-apps');
    const persistedSavedRecipes = localStorage.getItem('pantry-pal-saved-recipes');
    const savedServings = localStorage.getItem('pantry-pal-servings');
    
    if (savedItems) {
      try { setPantryItems(JSON.parse(savedItems)); } catch (e) {}
    }
    if (savedApps) {
      try { setAppliances(JSON.parse(savedApps)); } catch (e) {}
    }
    if (persistedSavedRecipes) {
      try { setSavedRecipes(JSON.parse(persistedSavedRecipes)); } catch (e) {}
    }
    if (savedServings) {
      setServings(parseInt(savedServings) || 2);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pantry-pal-items', JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem('pantry-pal-apps', JSON.stringify(appliances));
  }, [appliances]);

  useEffect(() => {
    localStorage.setItem('pantry-pal-saved-recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    localStorage.setItem('pantry-pal-servings', servings.toString());
  }, [servings]);

  const addPantryItem = (name: string) => {
    const newItem: PantryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.toLowerCase(),
    };
    setPantryItems((prev) => [...prev, newItem]);
  };

  const removePantryItem = (id: string) => {
    setPantryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleAppliance = (id: string) => {
    setAppliances(prev => prev.map(app => 
      app.id === id ? { ...app, enabled: !app.enabled } : app
    ));
  };

  const toggleSaveRecipe = (recipe: Recipe) => {
    setSavedRecipes(prev => {
      const isAlreadySaved = prev.some(r => r.id === recipe.id);
      if (isAlreadySaved) {
        return prev.filter(r => r.id !== recipe.id);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const handleSearch = async () => {
    if (pantryItems.length === 0) {
      setError("Please add at least one ingredient to your pantry.");
      return;
    }

    // CLEAR FIRST: Explicitly reset the recipes state
    setRecipes([]);
    setLoading(true);
    setError(null);
    setActiveTab('suggestions');

    try {
      const ingredientList = pantryItems.map(i => i.name);
      const applianceList = appliances.filter(a => a.enabled).map(a => a.name);
      const results = await getRecipesFromPantry(ingredientList, applianceList, servings);
      setRecipes(results);
      
      // Focus on results immediately after they are set
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      
    } catch (err) {
      setError("Failed to fetch recipes. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayedRecipes = activeTab === 'suggestions' ? recipes : savedRecipes;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-xl text-white">
              <ChefHat size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              PantryPal
            </h1>
          </div>
          <div className="hidden sm:block text-sm font-medium text-slate-500">
            Smart Meal Finder
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <ApplianceSelector 
              appliances={appliances}
              onToggle={toggleAppliance}
            />

            <PantryManager 
              items={pantryItems} 
              onAdd={addPantryItem} 
              onRemove={removePantryItem} 
            />

            {/* Servings Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <Users size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Serving Size</h2>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  disabled={servings <= 1}
                >
                  <Minus size={18} />
                </button>
                <div className="text-center">
                  <span className="text-xl font-bold text-slate-800">{servings}</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                    {servings === 1 ? 'Person' : 'People'}
                  </p>
                </div>
                <button 
                  onClick={() => setServings(Math.min(10, servings + 1))}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  disabled={servings >= 10}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={handleSearch}
                disabled={loading || pantryItems.length === 0}
                className="w-full flex items-center justify-center gap-2 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Generate Recipes
              </button>
              {pantryItems.length === 0 && (
                <p className="text-center text-xs text-slate-400 mt-3 italic">
                  Add ingredients to start cooking
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-8" ref={resultsRef}>
            <div className="mb-6">
              <div className="flex items-center gap-4 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className={`pb-3 px-2 text-sm font-bold transition-all relative ${
                    activeTab === 'suggestions' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Suggestions
                  {activeTab === 'suggestions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`pb-3 px-2 text-sm font-bold transition-all relative flex items-center gap-1.5 ${
                    activeTab === 'saved' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Saved Recipes
                  {savedRecipes.length > 0 && (
                    <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded-full">
                      {savedRecipes.length}
                    </span>
                  )}
                  {activeTab === 'saved' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-25"></div>
                  <div className="bg-white p-6 rounded-3xl shadow-xl relative border border-slate-100">
                    <Loader2 className="animate-spin text-orange-500" size={48} />
                  </div>
                </div>
                <h3 className="text-slate-800 font-bold text-lg mb-2">Cooking up some ideas</h3>
                <p className="text-sm text-center max-w-xs px-4 text-slate-500">
                  Gemini is finding recipes for {servings} {servings === 1 ? 'person' : 'people'} using your ingredients...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-600">
                <AlertCircle className="mx-auto mb-4" size={32} />
                <p className="font-bold mb-2 text-lg">Something went wrong</p>
                <p className="text-sm opacity-80">{error}</p>
                <button 
                  onClick={handleSearch}
                  className="mt-6 px-8 py-3 bg-white text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-50 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : displayedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 pb-12">
                {activeTab === 'suggestions' && recipes.length > 0 && !loading && (
                  <div className="flex justify-end mb-2">
                    <button 
                      onClick={handleSearch}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 transition-colors"
                    >
                      <Sparkles size={14} /> Refresh Ideas
                    </button>
                  </div>
                )}
                {displayedRecipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    onToggleSave={toggleSaveRecipe}
                    isSaved={savedRecipes.some(r => r.id === recipe.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-16 text-center">
                <div className="inline-block p-6 bg-slate-50 rounded-full mb-6">
                  {activeTab === 'suggestions' ? (
                    <ShoppingBasket size={48} className="text-slate-300" />
                  ) : (
                    <Bookmark size={48} className="text-slate-300" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-3">
                  {activeTab === 'suggestions' ? 'Your Recipe Book is Empty' : 'No Saved Recipes'}
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto leading-relaxed text-sm">
                  {activeTab === 'suggestions' 
                    ? 'Start by adding ingredients and selecting your appliances. We\'ll find recipes that fit your kitchen perfectly.'
                    : 'Recipes you save while browsing suggestions will appear here for easy access later.'}
                </p>
                {activeTab === 'saved' && (
                  <button 
                    onClick={() => setActiveTab('suggestions')}
                    className="mt-6 text-sm font-bold text-orange-600 hover:underline"
                  >
                    Go to Suggestions
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      <div className="fixed bottom-6 right-6 lg:hidden">
        <button 
          onClick={handleSearch}
          disabled={loading || pantryItems.length === 0}
          className="flex items-center gap-2 px-8 py-5 bg-orange-500 text-white rounded-2xl font-bold shadow-2xl hover:bg-orange-600 transition-transform active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
          Generate Recipes
        </button>
      </div>
    </div>
  );
};

export default App;
