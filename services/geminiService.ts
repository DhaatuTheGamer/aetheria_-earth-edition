
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PlanetLore, PlanetParameters, POIData, ChallengeTarget } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const planetSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Name (e.g., Earth 2150, Neo-Terra)" },
    description: { type: Type.STRING, description: "A creative scenario description." },
    age: { type: Type.STRING, description: "Age of the planet" },
    civilizationType: { type: Type.STRING, description: "Kardashev scale or descriptive type" },
    atmosphereComposition: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of gases"
    },
    population: { type: Type.STRING, description: "Population estimate" },
    habitabilityScore: { type: Type.NUMBER, description: "0-100 score" },
    atmosphereColor: { type: Type.STRING, description: "Hex color for atmosphere" },
    rotationSpeed: { type: Type.NUMBER, description: "Rotation speed modifier" },
    cityLightColor: { type: Type.STRING, description: "Hex color for city lights (e.g. #ffcc00 for modern, #00ffff for future)" },
    waterMurkiness: { type: Type.NUMBER, description: "0 to 1" },
    snowLevel: { type: Type.NUMBER, description: "0 to 1" }
  },
  required: ["name", "description", "age", "civilizationType", "atmosphereComposition", "population", "habitabilityScore", "atmosphereColor", "rotationSpeed"]
};

// --- CORE GENERATION ---

export const generatePlanetData = async (): Promise<{ lore: PlanetLore, params: Partial<PlanetParameters> }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a scenario for an exoplanet or future Earth. Be creative with the biome and civilization status.",
      config: {
        responseMimeType: "application/json",
        responseSchema: planetSchema,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    const lore: PlanetLore = {
      name: data.name,
      description: data.description,
      age: data.age,
      civilizationType: data.civilizationType,
      atmosphereComposition: data.atmosphereComposition,
      population: data.population,
      habitabilityScore: data.habitabilityScore
    };

    const params: Partial<PlanetParameters> = {
      rotationSpeed: data.rotationSpeed || 0.05,
      atmosphereColor: data.atmosphereColor || "#3b82f6",
      cityLightColor: data.cityLightColor || "#ffaa33",
      cityLightIntensity: 1.0,
      waterMurkiness: data.waterMurkiness || 0.0,
      snowLevel: data.snowLevel || 0.0,
    };

    return { lore, params };

  } catch (error) {
    console.error("Failed to generate planet data:", error);
    throw error;
  }
};

// --- TEXTURE GENERATION (IMAGEN) ---

export const generatePlanetTexture = async (description: string): Promise<string | null> => {
  try {
    // We use Imagen to generate a seamless texture map
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A high quality, seamless, equirectangular projection texture map of a planet surface: ${description}. Flat lighting, no shadows, 4k resolution style. The map should show continents and oceans.`,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9', // Closest to 2:1 for equirectangular
        outputMimeType: 'image/png'
      }
    });

    const base64 = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64) {
      return `data:image/png;base64,${base64}`;
    }
    return null;
  } catch (e) {
    console.error("Texture generation failed", e);
    return null; // Fallback to default
  }
};

// --- EVENTS & TIME TRAVEL ---

const eventSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    eventTitle: { type: Type.STRING },
    newDescription: { type: Type.STRING },
    atmosphereColor: { type: Type.STRING },
    waterMurkiness: { type: Type.NUMBER },
    snowLevel: { type: Type.NUMBER },
    cityLightIntensity: { type: Type.NUMBER },
    cityLightColor: { type: Type.STRING },
    habitabilityScore: { type: Type.NUMBER }
  },
  required: ["eventTitle", "newDescription", "atmosphereColor", "waterMurkiness", "snowLevel"]
};

export const triggerDisaster = async (currentLore: PlanetLore): Promise<{ loreUpdate: Partial<PlanetLore>, paramsUpdate: Partial<PlanetParameters> }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Current Planet: ${currentLore.name} (${currentLore.description}). Trigger a catastrophic global event (e.g. Gamma Ray Burst, Supervolcano, Artificial AI Takeover). Return the new visual and lore states.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: eventSchema
    }
  });

  const data = JSON.parse(response.text || "{}");
  return {
    loreUpdate: {
      description: `[EVENT: ${data.eventTitle}] ${data.newDescription}`,
      habitabilityScore: data.habitabilityScore
    },
    paramsUpdate: {
      atmosphereColor: data.atmosphereColor,
      waterMurkiness: data.waterMurkiness,
      snowLevel: data.snowLevel,
      cityLightIntensity: data.cityLightIntensity ?? 0.0,
      cityLightColor: data.cityLightColor ?? "#ff0000"
    }
  };
};

export const evolveCivilization = async (currentLore: PlanetLore, years: number): Promise<{ loreUpdate: Partial<PlanetLore>, paramsUpdate: Partial<PlanetParameters> }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Advance (or regress) the civilization of ${currentLore.name} by ${years} years. Describe the technological changes or collapse.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: eventSchema
    }
  });
  
  const data = JSON.parse(response.text || "{}");
  return {
    loreUpdate: {
      description: `[YEAR +${years}] ${data.newDescription}`,
      civilizationType: "Evolved State",
      population: "Unknown",
      habitabilityScore: data.habitabilityScore
    },
    paramsUpdate: {
      cityLightColor: data.cityLightColor,
      cityLightIntensity: data.cityLightIntensity,
      atmosphereColor: data.atmosphereColor
    }
  };
};

// --- CHALLENGE MODE ---

const challengeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING },
    targetCloudDensity: { type: Type.NUMBER },
    targetAtmosphereType: { type: Type.STRING, description: "Visual hint like 'Blue' or 'Red'" },
    targetHabitability: { type: Type.NUMBER }
  },
  required: ["description", "targetHabitability"]
};

export const generateChallenge = async (): Promise<ChallengeTarget> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Create a terraforming challenge for a dead planet. Describe what needs to be fixed (e.g. 'Melting the ice caps', 'Clearing the smog').",
    config: {
      responseMimeType: "application/json",
      responseSchema: challengeSchema
    }
  });
  
  const data = JSON.parse(response.text || "{}");
  return {
    active: true,
    success: false,
    description: data.description,
    targetStats: {
      habitabilityScore: data.targetHabitability,
      cloudDensity: data.targetCloudDensity,
    }
  };
};

// --- POI ---

const poiSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Name of the location or anomaly" },
    description: { type: Type.STRING, description: "Brief status report or lore about this location in the current era." }
  },
  required: ["title", "description"]
};

export const generatePOIReport = async (loreContext: string, coordinates: { x: number, y: number }): Promise<POIData> => {
  try {
    const lat = Math.round(coordinates.y * 180 - 90);
    const lon = Math.round(coordinates.x * 360 - 180);
    
    const prompt = `
      Context: ${loreContext}
      Location: Latitude ${lat}, Longitude ${lon}.
      Generate a short sci-fi status report for this specific location.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: poiSchema,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    const data = JSON.parse(response.text || "{}");
    return {
      title: data.title,
      description: data.description,
      coordinates
    };
  } catch (e) {
    return {
      title: "Signal Lost",
      description: "Unable to retrieve telemetry from this sector.",
      coordinates
    };
  }
};
