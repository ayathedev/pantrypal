
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRecipesFromPantry = async (ingredients: string[], appliances: string[], servings: number): Promise<Recipe[]> => {
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
  6. Provide a "visualKeywords" string for each recipe. This should be a 5-8 word highly descriptive phrase of what the finished dish looks like.
  7. Provide an ESTIMATE of nutritional information (calories, protein, carbs, fat) per serving.
  8. Provide 2-3 "tips" which are general professional cooking techniques or secrets relevant to this specific recipe.
  9. Output the result in valid JSON format.`;

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
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              prepTime: { type: Type.STRING },
              totalTime: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              servings: { type: Type.INTEGER },
              visualKeywords: { type: Type.STRING },
              nutrition: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.STRING },
                  protein: { type: Type.STRING },
                  carbs: { type: Type.STRING },
                  fat: { type: Type.STRING }
                },
                required: ["calories", "protein", "carbs", "fat"]
              }
            },
            required: ["id", "name", "description", "ingredients", "instructions", "tips", "prepTime", "totalTime", "difficulty", "nutrition", "servings", "visualKeywords"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]") as Recipe[];
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
};

/**
 * Generates an AI image based on the recipe title using gemini-2.5-flash-image.
 */
export const generateImageFromTitle = async (title: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A professional, appetizing high-resolution food photograph of ${title}. Studio lighting, clean plating, neutral background.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating AI image from title:", error);
    return null;
  }
};
