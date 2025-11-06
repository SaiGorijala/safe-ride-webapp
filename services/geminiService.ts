import { GoogleGenAI } from "@google/genai";
import { Ride } from '../types';

let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI | null {
  if (ai) {
    return ai;
  }
  
  try {
    const API_KEY = process.env.API_KEY;
    if (API_KEY) {
      ai = new GoogleGenAI({ apiKey: API_KEY });
      return ai;
    }
  } catch (e) {
    console.error("Could not access environment variables. This feature may not work in the current environment.", e);
  }
  
  console.warn("Gemini API key not found or is inaccessible. Make sure the API_KEY environment variable is set.");
  return null;
}


export const generateRideStory = async (ride: Ride): Promise<string> => {
  const aiInstance = getAiInstance();
  if (!aiInstance) {
    return "Gemini API key is not configured. Cannot generate story.";
  }

  try {
    const prompt = `Generate a short, fun, and slightly humorous story about a safe ride home. The user, ${ride.userName}, was responsible and called a SafeRide driver instead of driving under the influence. The trip was from "${ride.pickupLocation}" to "${ride.dropoffLocation}". The driver's name was ${ride.driverName}. The story should be under 100 words and celebrate the smart choice made.`;
    
    const response = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating ride story:", error);
    return "Could not generate a story for this ride. Please try again later.";
  }
};