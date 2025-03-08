import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { WardrobeItem } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export function useAIOutfit() {
  const { toast } = useToast();

  const aiRecommendationMutation = useMutation({
    mutationFn: async ({
      items,
      weather,
      mood
    }: {
      items: WardrobeItem[];
      weather: WeatherData;
      mood: string;
    }) => {
      const response = await fetch('/api/ai/outfit-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items,
          weather,
          mood,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get AI recommendations');
      }

      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get AI recommendations',
        variant: 'destructive',
      });
    },
  });

  const getAIRecommendation = useCallback(
    async (items: WardrobeItem[], weather: WeatherData, mood: string) => {
      try {
        const result = await aiRecommendationMutation.mutateAsync({
          items,
          weather,
          mood,
        });
        return result.recommendations;
      } catch (error) {
        return null;
      }
    },
    [aiRecommendationMutation]
  );

  return {
    getAIRecommendation,
    isLoading: aiRecommendationMutation.isPending,
  };
}
