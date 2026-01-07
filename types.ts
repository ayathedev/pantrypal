
export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  totalTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  nutrition?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}

export interface PantryItem {
  id: string;
  name: string;
}

export interface Appliance {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}
