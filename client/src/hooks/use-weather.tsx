import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { WardrobeItem, clothingCategories } from "@shared/schema";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface WeatherError {
  error: string;
  message: string;
}

export function useWeather(customLocation?: string) {
  // Build query string with location parameter if provided
  const queryString = customLocation ? `?location=${encodeURIComponent(customLocation)}` : "";

  return useQuery<WeatherData, Error>({
    queryKey: ["/api/weather", customLocation], // Include location in the query key for proper caching
    queryFn: async () => {
      console.log(`Fetching weather for location: ${customLocation || 'default'}`);
      const response = await fetch(`/api/weather${queryString}`);
      const data = await response.json();

      // Check if the response has an error property
      if (response.status !== 200 || data.error) {
        throw new Error(data.message || 'Weather data fetch failed');
      }

      console.log('Weather data received:', data);
      return data;
    },
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes for real-time updates
    retry: 1, // Only retry once for invalid locations
  });
}

// Enhanced recommendation function with weather-appropriate scoring
export function getWeatherBasedRecommendations(weather: WeatherData | undefined, items: WardrobeItem[] = []) {
  if (!weather) return {
    condition: "unknown",
    recommendation: "Wait for weather data to load",
    clothingTypes: ["tops", "bottoms", "outerwear"],
    recommendedItems: []
  };

  const { temperature, condition, humidity, windSpeed } = weather;
  let recommendation = "";
  let clothingTypes = ["tops", "bottoms"];

  // Score each item based on weather conditions
  const scoredItems = items.map(item => {
    let score = 0;

    // Temperature scoring
    if (temperature < 5) {
      score += item.category === "outerwear" ? 3 : 0;
      score += item.tags?.includes("winter") ? 2 : 0;
    } else if (temperature < 15) {
      score += item.category === "outerwear" ? 2 : 0;
      score += item.tags?.includes("spring") ? 2 : 0;
    } else if (temperature < 25) {
      score += item.category === "tops" || item.category === "bottoms" ? 2 : 0;
    } else {
      score += item.tags?.includes("summer") ? 3 : 0;
      score -= item.category === "outerwear" ? 2 : 0;
    }

    // Weather condition scoring
    if (condition.toLowerCase().includes("rain")) {
      score += item.tags?.includes("waterproof") ? 3 : 0;
      clothingTypes.push("outerwear");
      recommendation = "Rainy conditions - waterproof items recommended.";
    } else if (condition.toLowerCase().includes("snow")) {
      score += item.tags?.includes("winter") ? 3 : 0;
      clothingTypes.push("outerwear", "shoes");
      recommendation = "Snowy conditions - warm layers essential.";
    } else if (condition.toLowerCase().includes("wind")) {
      score += item.category === "outerwear" ? 2 : 0;
      recommendation = "Windy conditions - secure clothing recommended.";
    } else if (condition.toLowerCase().includes("sun")) {
      score += item.tags?.includes("summer") ? 2 : 0;
      clothingTypes.push("accessories");
      recommendation = "Sunny conditions - light, breathable items recommended.";
    }

    // Humidity scoring
    if (humidity > 80) {
      score += item.tags?.includes("breathable") ? 2 : 0;
    }

    return {
      item,
      score
    };
  });

  // Sort items by score and group by category
  const recommendedItems = clothingCategories.reduce((acc, category) => {
    const categoryItems = scoredItems
      .filter(({ item }) => item.category === category.value)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
      .slice(0, 2); // Get top 2 items per category

    return [...acc, ...categoryItems];
  }, [] as WardrobeItem[]);

  return {
    condition: condition.toLowerCase(),
    recommendation,
    clothingTypes,
    recommendedItems
  };
}