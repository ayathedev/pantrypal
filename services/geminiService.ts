
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

export const getRecipesFromPantry = async (ingredients: string[], appliances: string[], servings: number): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const appliancesText = appliances.length > 0 
    ? `Available Appliances: ${appliances.join(", ")}.` 
    : "No appliances available (suggest strictly raw/no-heat meals).";

  const prompt = `I am a home cook. I have the following ingredients: ${ingredients.join(", ")}.
  ${appliancesText}

  TASK:
  1. Suggest 5 detailed recipes that can be made using these ingredients and appliances.
  2. TAILOR THE RECIPES FOR EXACTLY ${servings} SERVINGS. All ingredient quantities must be adjusted for this serving size.
  3. You CAN assume I have basic pantry staples like salt, pepper, cooking oil, and water.
  4. The instructions must be VERY detailed and clear, broken down into simple, easy-to-follow steps.
  5. Include prep time, total time, and a difficulty rating.
  6. Provide an ESTIMATE of nutritional information (calories, protein, carbs, fat) per serving.
  7. Output the result in valid JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredients: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              instructions: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              prepTime: { type: Type.STRING },
              totalTime: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              servings: { type: Type.INTEGER },
              nutrition: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.STRING, description: "Estimated kcal per serving" },
                  protein: { type: Type.STRING, description: "Estimated grams of protein" },
                  carbs: { type: Type.STRING, description: "Estimated grams of carbs" },
                  fat: { type: Type.STRING, description: "Estimated grams of fat" }
                },
                required: ["calories", "protein", "carbs", "fat"]
              }
            },
            required: ["id", "name", "description", "ingredients", "instructions", "prepTime", "totalTime", "difficulty", "nutrition", "servings"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as Recipe[];
  } catch (error) {
    console.error("Error fetching recipes from Gemini:", error);
    throw error;
  }
};
