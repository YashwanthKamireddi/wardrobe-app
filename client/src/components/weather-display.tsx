import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  CloudSun, 
  CloudRain, 
  Cloud, 
  CloudSnow, 
  Wind, 
  Sun, 
  Snowflake,
  Thermometer
} from "lucide-react";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface WeatherDisplayProps {
  weather: WeatherData;
  recommendations?: string[];
}

export default function WeatherDisplay({ weather, recommendations }: WeatherDisplayProps) {
  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sunny':
        return <Sun className="h-12 w-12 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="h-12 w-12 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="h-12 w-12 text-blue-400" />;
      case 'snowy':
        return <CloudSnow className="h-12 w-12 text-blue-200" />;
      case 'windy':
        return <Wind className="h-12 w-12 text-teal-500" />;
      default:
        return <CloudSun className="h-12 w-12 text-yellow-400" />;
    }
  };

  // Extract the base location name without the emoji
  const locationName = weather.location.split(' ')[0];

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <motion.div 
          className="flex items-center"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {getWeatherIcon(weather.icon)}
          <div className="ml-3">
            <motion.h3 
              className="text-xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {locationName}
            </motion.h3>
            <motion.p 
              className="text-2xl font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {weather.temperature}°C
            </motion.p>
            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {weather.condition}
            </motion.p>
          </div>
        </motion.div>
        <motion.div 
          className="mt-4 sm:mt-0 grid grid-cols-2 gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center">
            <Thermometer className="h-4 w-4 mr-1 text-orange-500" />
            <span className="text-sm">Humidity: {weather.humidity}%</span>
          </div>
          <div className="flex items-center">
            <Wind className="h-4 w-4 mr-1 text-blue-500" />
            <span className="text-sm">Wind: {weather.windSpeed} km/h</span>
          </div>
        </motion.div>
      </div>

      {recommendations && recommendations.length > 0 && (
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((recommendation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary">
                  {recommendation}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}