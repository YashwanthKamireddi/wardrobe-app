import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CloudSun, 
  CloudRain, 
  Cloud, 
  CloudSnow, 
  Wind, 
  Sun, 
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
  hideLocation?: boolean;
}

export default function WeatherDisplay({ weather, recommendations, hideLocation = false }: WeatherDisplayProps) {
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

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="hover-scale"
          >
            {getWeatherIcon(weather.icon)}
          </motion.div>
          <div className="ml-3">
            {!hideLocation && (
              <motion.h3 
                className="text-xl font-bold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {weather.location.split(' ')[0]}
              </motion.h3>
            )}
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
        </div>
        <motion.div 
          className="mt-4 sm:mt-0 grid grid-cols-2 gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className="flex items-center hover-scale"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Thermometer className="h-4 w-4 mr-1 text-orange-500" />
            <span className="text-sm">Humidity: {weather.humidity}%</span>
          </motion.div>
          <motion.div 
            className="flex items-center hover-scale"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Wind className="h-4 w-4 mr-1 text-blue-500" />
            <span className="text-sm">Wind: {weather.windSpeed} km/h</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {recommendations && recommendations.length > 0 && (
        <motion.div 
          className="mt-4 overflow-hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
          <motion.div 
            className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin fade-edge-mask pr-2"
          >
            <AnimatePresence>
              {recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="hover-scale"
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
                  >
                    {recommendation}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}