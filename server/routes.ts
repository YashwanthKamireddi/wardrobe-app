import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import express, { type Express as ExpressType } from "express";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertWardrobeItemSchema, 
  insertOutfitSchema, 
  insertWeatherPreferenceSchema, 
  insertMoodPreferenceSchema 
} from "@shared/schema";

// Create a router for API routes
const apiRouter = express.Router();

export async function registerRoutes(app: ExpressType): Promise<Server> {
  // Setup authentication first
  setupAuth(app);

  // Wardrobe routes
  apiRouter.get("/wardrobe", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const items = await storage.getWardrobeItems(req.user!.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wardrobe items" });
    }
  });

  apiRouter.post("/wardrobe", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const itemData = insertWardrobeItemSchema.parse({
        ...req.body,
        userId: req.user!.id
      });

      const item = await storage.createWardrobeItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid wardrobe item data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create wardrobe item" });
    }
  });

  apiRouter.get("/wardrobe/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseInt(req.params.id);
      const item = await storage.getWardrobeItem(id);

      if (!item) {
        return res.status(404).json({ message: "Wardrobe item not found" });
      }

      if (item.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wardrobe item" });
    }
  });

  apiRouter.patch("/wardrobe/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseInt(req.params.id);
      const item = await storage.getWardrobeItem(id);

      if (!item) {
        return res.status(404).json({ message: "Wardrobe item not found" });
      }

      if (item.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedItem = await storage.updateWardrobeItem(id, req.body);
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update wardrobe item" });
    }
  });

  apiRouter.delete("/wardrobe/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseInt(req.params.id);
      const item = await storage.getWardrobeItem(id);

      if (!item) {
        return res.status(404).json({ message: "Wardrobe item not found" });
      }

      if (item.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteWardrobeItem(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete wardrobe item" });
    }
  });

  // Outfit routes
  apiRouter.get("/outfits", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const outfits = await storage.getOutfits(req.user!.id);
      res.json(outfits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch outfits" });
    }
  });

  apiRouter.post("/outfits", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const outfitData = insertOutfitSchema.parse({
        ...req.body,
        userId: req.user!.id
      });

      const outfit = await storage.createOutfit(outfitData);
      res.status(201).json(outfit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid outfit data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create outfit" });
    }
  });

  apiRouter.get("/outfits/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseInt(req.params.id);
      const outfit = await storage.getOutfit(id);

      if (!outfit) {
        return res.status(404).json({ message: "Outfit not found" });
      }

      if (outfit.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(outfit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch outfit" });
    }
  });

  apiRouter.patch("/outfits/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseInt(req.params.id);
      const outfit = await storage.getOutfit(id);

      if (!outfit) {
        return res.status(404).json({ message: "Outfit not found" });
      }

      if (outfit.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedOutfit = await storage.updateOutfit(id, req.body);
      res.json(updatedOutfit);
    } catch (error) {
      res.status(500).json({ message: "Failed to update outfit" });
    }
  });

  apiRouter.delete("/outfits/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseInt(req.params.id);
      const outfit = await storage.getOutfit(id);

      if (!outfit) {
        return res.status(404).json({ message: "Outfit not found" });
      }

      if (outfit.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteOutfit(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete outfit" });
    }
  });

  // Inspiration routes
  apiRouter.get("/inspirations", async (req, res) => {
    try {
      const inspirations = await storage.getInspirations();
      res.json(inspirations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspirations" });
    }
  });

  apiRouter.get("/inspirations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inspiration = await storage.getInspiration(id);

      if (!inspiration) {
        return res.status(404).json({ message: "Inspiration not found" });
      }

      res.json(inspiration);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspiration" });
    }
  });

  // Weather preferences routes
  apiRouter.get("/weather-preferences", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const preferences = await storage.getWeatherPreferences(req.user!.id);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weather preferences" });
    }
  });

  apiRouter.post("/weather-preferences", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const preferenceData = insertWeatherPreferenceSchema.parse({
        ...req.body,
        userId: req.user!.id
      });

      const preference = await storage.createWeatherPreference(preferenceData);
      res.status(201).json(preference);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid weather preference data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create weather preference" });
    }
  });

  // Mood preferences routes
  apiRouter.get("/mood-preferences", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const preferences = await storage.getMoodPreferences(req.user!.id);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mood preferences" });
    }
  });

  apiRouter.post("/mood-preferences", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const preferenceData = insertMoodPreferenceSchema.parse({
        ...req.body,
        userId: req.user!.id
      });

      const preference = await storage.createMoodPreference(preferenceData);
      res.status(201).json(preference);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid mood preference data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create mood preference" });
    }
  });

  // Weather API route - enhanced mock implementation
  apiRouter.get("/weather", (req, res) => {
    console.log("Fetching weather for location:", req.query.location);
    
    // Get location from query parameter, defaulting to New York City
    const location = req.query.location as string || "New York City";

    // Use the getWeatherForLocation function from weather.ts
    import("./weather").then(({ getWeatherForLocation }) => {
      getWeatherForLocation(location).then(weatherData => {
        // Check if the response is an error
        if ('error' in weatherData) {
          console.log("Weather API error:", weatherData.error, weatherData.message);
          return res.status(400).json(weatherData);
        }

        // Map the weather data to the expected response format
        const response = {
          location: weatherData.type === 'snowy' || weatherData.type === 'cold' 
            ? location + " ❄️" 
            : weatherData.type === 'hot' || weatherData.type === 'sunny'
              ? location + " ☀️"
              : weatherData.type === 'rainy'
                ? location + " 🌧️"
                : weatherData.type === 'windy'
                  ? location + " 💨"
                  : location + " ☁️",
          temperature: weatherData.temperature,
          condition: weatherData.description,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
          icon: weatherData.type // We use the weather type as the icon identifier
        };

        console.log("Weather data received:", response);
        res.json(response);
      });
    });
  });

  // Weather suggestions API endpoint
  apiRouter.get("/weather-suggestions", async (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();

    if (!query || query.length < 2) {
      return res.json([]);
    }

    // Filter the valid locations
    const suggestions = validLocations
      .filter((location: string) => location.toLowerCase().includes(query))
      .slice(0, 10);

    res.json(suggestions);
  });

  // Mount the API router under /api
  app.use("/api", apiRouter);

  // Create and return the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}