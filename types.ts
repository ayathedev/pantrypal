
export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
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
