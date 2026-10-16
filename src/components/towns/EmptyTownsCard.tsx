import { Pressable, Text, View } from 'react-native';
import { FieldRegisterIcon } from '../icons/FieldRegisterIcon';
import { AddLocationAlt } from '@material-symbols-svg/react-native';

interface EmptyTownsCardProps {
  onAddTown: () => void;
}

export function EmptyTownsCard({ onAddTown }: EmptyTownsCardProps) {
  return (
    <View className="items-center rounded-lg bg-surface-container p-6">
      <View className="my-3 h-28 w-28 items-center justify-center rounded-full bg-surface-container-high">
        <FieldRegisterIcon size={100} />
      </View>

      <Text className="mt-2 text-xl font-semibold text-primary">
        Your Town List is Empty
      </Text>

      <Text className="mt-2 max-w-xs text-center text-base text-on-surface-variant">
        Track municipal weather telemetry, barometric shifts, water
        temperatures, and real-time fly emergence for your favorite angling
        waters.
      </Text>

      <Pressable
        onPress={onAddTown}
        className="mt-4 w-full flex-row justify-center max-w-xs items-center rounded-lg bg-primary-container px-4 py-3"
      >
        <AddLocationAlt width={16} height={16} color="#fcf9f2" />
        <Text className="font-semibold text-surface pl-2">
          + Add Your First Town
        </Text>
      </Pressable>

      <Text className="mt-2 text-[10px] uppercase tracking-wider text-outline">
        Station Lookup • USGS Gauges • SNOTEL Index
      </Text>
    </View>
  );
}
