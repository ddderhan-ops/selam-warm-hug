import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { turkishCities, type City } from "@/lib/prayerTimes";
import { MapPin } from "lucide-react";

interface CitySelectorProps {
  selectedCity: City;
  onCityChange: (city: City) => void;
  disabled?: boolean;
}

export function CitySelector({
  selectedCity,
  onCityChange,
  disabled,
}: CitySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-primary" />
      <Select
        value={selectedCity.name}
        onValueChange={(value) => {
          const city = turkishCities.find((c) => c.name === value);
          if (city) onCityChange(city);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={`w-[160px] border-none bg-transparent text-lg font-semibold focus:ring-0 focus:ring-offset-0 px-0 ${
            disabled ? "opacity-70" : ""
          }`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {turkishCities.map((city) => (
            <SelectItem key={city.name} value={city.name}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
