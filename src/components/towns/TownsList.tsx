import { View } from 'react-native';

import { fieldNotes } from '../../types/notes';
import { Station } from '../../types/station';
import { FieldNote } from './FieldNote';
import { SelectedTownCard } from './SelectedTownCard';
import { SeasonalFieldBanner } from '../ui/SeasonalFieldBanner';
import { CachedTownWeatherMap } from '../../context/WeatherContext';

interface TownsListProps {
  towns: Station[];
  weather: CachedTownWeatherMap;
  onRemove(townId: string): void;
  onPressTown(town: Station): void;
}

export function TownsList({
  towns,
  onPressTown,
  weather,
}: TownsListProps) {
  return (
    <View className="px-4 pb-24">
      <SeasonalFieldBanner date={new Date()} />
      <View className="gap-3 mt-6">
        {towns.map(town => (
          <SelectedTownCard
            key={town.id}
            town={town}
            weather={weather.get(town.id)}
            onPress={selectedTown => {
              onPressTown(selectedTown);
            }}
          />
        ))}
      </View>
      <View className="mt-6">
        <FieldNote
          title={fieldNotes.listNote.title}
          icon={fieldNotes.listNote.icon}
        >
          {fieldNotes.listNote.description}
        </FieldNote>
      </View>
    </View>
  );
}
