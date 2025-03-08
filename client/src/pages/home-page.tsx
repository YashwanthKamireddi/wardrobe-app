import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWeather, getWeatherBasedRecommendations } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import NavigationBar from "@/components/navigation-bar";
import WeatherDisplay from "@/components/weather-display";
import MoodSelector from "@/components/mood-selector";
import OutfitRecommendation from "@/components/outfit-recommendation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCcw, AlertCircle, CloudSun, Sun, Cloud, Layers } from "lucide-react";
import { WardrobeItem, moodTypes } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { motion } from 'framer-motion';

export default function HomePage() {
  const { user } = useAuth();
  const [weatherLocation, setWeatherLocation] = useState(() =>
    localStorage.getItem("weatherLocation") || "New York"
  );
  const [locationInput, setLocationInput] = useState<string>(weatherLocation);
  const { data: weather, isLoading: weatherLoading, refetch, error: weatherError } = useWeather(weatherLocation);
  const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();
  const [selectedMood, setSelectedMood] = useState(moodTypes[0].value);
  const [recommendedOutfit, setRecommendedOutfit] = useState<WardrobeItem[]>([]);
  const [_, setUrlLocation] = useLocation();


  const weatherRecommendations = getWeatherBasedRecommendations(weather);

  // Function to handle location update with debounce
  const handleLocationUpdate = useCallback((newLocation?: string) => {
    const locationToUse = newLocation || locationInput;
    localStorage.setItem("weatherLocation", locationToUse);
    setWeatherLocation(locationToUse);
    setLocationInput(locationToUse);

    // Add a small delay before refetching to ensure smooth UI updates
    setTimeout(() => refetch(), 100);
  }, [locationInput, refetch]);

  // Function to generate outfit recommendation based on weather and mood
  const generateOutfitRecommendation = (): WardrobeItem[] => {
    if (!wardrobeItems || wardrobeItems.length === 0 || !weatherRecommendations) {
      return [];
    }

    // Filter items by the recommended clothing types from weather
    const weatherAppropriateItems = wardrobeItems.filter(item =>
      weatherRecommendations.clothingTypes.includes(item.category)
    );

    // If we don't have enough weather-appropriate items, fall back to all items
    const itemPool = weatherAppropriateItems.length > 3 ? weatherAppropriateItems : wardrobeItems;

    // For a real application, this would be a more sophisticated algorithm
    // considering color coordination, style matching, item pairing preferences, etc.
    const recommendedItems: WardrobeItem[] = [];

    // Try to get one item from each essential category
    const categories = ["tops", "bottoms", "outerwear", "shoes", "accessories"];

    for (const category of categories) {
      const categoryItems = itemPool.filter(item => item.category === category);

      if (categoryItems.length > 0) {
        // For now, just pick a random item from each category
        const randomIndex = Math.floor(Math.random() * categoryItems.length);
        recommendedItems.push(categoryItems[randomIndex]);
      }
    }

    return recommendedItems;
  };

  // Regenerate outfit when weather or mood changes
  useEffect(() => {
    if (weather) {
      console.log("Weather updated:", weather);
      const newOutfit = generateOutfitRecommendation();
      setRecommendedOutfit(newOutfit);
    }
  }, [weather, selectedMood, wardrobeItems]);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <motion.main
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to Cher's Closet, {user?.name || user?.username}!
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Weather Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="overflow-hidden border-2 border-primary/20 shadow-lg transition-all duration-300 hover:shadow-primary/10">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-center">
                  <CloudSun className="mr-2 h-6 w-6 text-primary" />
                  <CardTitle>Today's Weather</CardTitle>
                </div>
                <CardDescription>
                  Dress appropriately for the conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Location selector with autocomplete suggestions */}
                <div className="flex flex-col space-y-2 mb-4">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-primary" />
                    <Input
                      type="text"
                      placeholder="Enter city name (e.g., New York, London, Tokyo)"
                      className="pl-8 border-primary/30 focus:border-primary/60"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLocationUpdate()}
                    />
                    {locationInput.length > 2 && (
                      <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-md max-h-60 overflow-y-auto">
                        {["New York", "London", "Tokyo", "Paris", "Berlin", "Singapore", "Sydney", "Delhi", "Mumbai", "San Francisco", "Los Angeles", "Chicago", "Toronto", "Vancouver"].filter(city =>
                          city.toLowerCase().includes(locationInput.toLowerCase())
                        ).slice(0, 5).map((city, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-primary/10 cursor-pointer"
                            onClick={() => {
                              setLocationInput(city);
                              handleLocationUpdate(city);
                            }}
                          >
                            <MapPin className="inline-block mr-2 h-3 w-3 text-primary" />
                            {city}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleLocationUpdate()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      Update Weather
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/30 hover:bg-primary/10 text-primary"
                      onClick={() => navigator.geolocation && navigator.geolocation.getCurrentPosition(
                        position => {
                          const { latitude, longitude } = position.coords;
                          // In a real app, use a geocoding service (like Google Maps Geocoding API) to get the city name from latitude and longitude
                          const cityName = "Current Location";
                          setLocationInput(cityName);
                          handleLocationUpdate(cityName);
                        },
                        error => {
                          console.error("Error getting location:", error);
                          // Handle location error appropriately (e.g., display an error message)
                        }
                      )}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Use My Location
                    </Button>
                  </div>
                </div>

                {weatherLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-3/4" />
                  </div>
                ) : weatherError ? (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      {weatherError.message || "Could not find weather for this location. Try a major city name."}
                    </AlertDescription>
                  </Alert>
                ) : weather ? (
                  <WeatherDisplay weather={weather} recommendations={weatherRecommendations} />
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Unable to load weather data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Mood Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>How are you feeling today?</CardTitle>
                <CardDescription>
                  Select your mood for personalized outfit recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MoodSelector
                  selectedMood={selectedMood}
                  setSelectedMood={setSelectedMood}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Outfit Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Outfit Recommendation</CardTitle>
              <CardDescription>
                Based on today's weather and your mood
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wardrobeLoading || weatherLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : weather && wardrobeItems && wardrobeItems.length > 0 ? (
                <OutfitRecommendation
                  items={recommendedOutfit}
                  weather={weather}
                  mood={selectedMood}
                />
              ) : weatherError ? (
                <div className="text-center py-8 bg-muted rounded-lg">
                  <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-lg text-muted-foreground mb-4">
                    Enter a valid location to get weather-based outfit recommendations.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg text-muted-foreground mb-4">
                    You haven't added any items to your wardrobe yet.
                  </p>
                  <Button asChild>
                    <a href="/wardrobe">Manage Wardrobe</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div onClick={() => setUrlLocation("/wardrobe")} className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 mb-4 text-primary"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                <path d="M9 14v2" />
                <path d="M15 14v2" />
              </svg>
              <h3 className="text-lg font-medium mb-1">Manage Wardrobe</h3>
              <p className="text-sm text-muted-foreground">
                Add, organize, and update your clothing items
              </p>
            </CardContent>
          </div>

          <div onClick={() => setUrlLocation("/outfits")} className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 mb-4 text-primary"
              >
                <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
                <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
              </svg>
              <h3 className="text-lg font-medium mb-1">Create Outfits</h3>
              <p className="text-sm text-muted-foreground">
                Design and save your favorite outfit combinations
              </p>
            </CardContent>
          </div>

          <div onClick={() => setUrlLocation("/inspirations")} className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 mb-4 text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <h3 className="text-lg font-medium mb-1">Get Inspiration</h3>
              <p className="text-sm text-muted-foreground">
                Browse trending styles and fashion ideas
              </p>
            </CardContent>
          </div>

          <div onClick={() => setUrlLocation("/profile")} className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 mb-4 text-primary"
              >
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
              <h3 className="text-lg font-medium mb-1">Profile & Settings</h3>
              <p className="text-sm text-muted-foreground">
                Manage your account and preferences
              </p>
            </CardContent>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}