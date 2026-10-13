import { Pressable, Text, View } from 'react-native';
import type { RecommendedTown } from '../../types/town';
import { getScoreColor } from '../../functions/func';
import { Explore } from '@material-symbols-svg/react-native';

interface Props {
  town: RecommendedTown;
  isAdded: boolean;
  onToggle: (town: RecommendedTown) => void;
}

export function RecommendedTownCard({ town, isAdded, onToggle }: Props) {
  const scoreColor = getScoreColor(town.score);
  return (
    <View className="flex-row items-center justify-between rounded-lg bg-surface-container-low p-4">
      <View className="mr-3 flex-1 flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high">
          <Explore width={20} height={20} color="#381200" />
        </View>

        <View className="flex-1">
          <View className="flex-row flex-wrap items-center gap-1.5">
            <Text className="text-xs uppercase tracking-wider text-secondary">
              {town.region} • {town.state}
            </Text>

            <View
              className={`flex-row items-center gap-1 rounded px-1.5`}
              style={{ backgroundColor: scoreColor.bgColor }}
            >
              <View
                className="h-1 w-1 rounded-full"
                style={{ backgroundColor: scoreColor.textColor }}
              />

              <Text
                className={`text-[10px] font-semibold`}
                style={{ color: scoreColor.textColor }}
              >
                {town.score} {town.status}
              </Text>
            </View>
          </View>

          <Text
            className="mt-0.5 text-lg font-semibold text-primary"
            numberOfLines={1}
          >
            {town.name}
          </Text>

          <Text className="text-sm text-on-surface-variant" numberOfLines={1}>
            {town.waters}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => onToggle(town)}
        className={
          isAdded
            ? 'rounded bg-primary-container px-3 py-2'
            : 'rounded bg-surface-container-high px-3 py-2'
        }
      >
        <Text
          className={
            isAdded
              ? 'text-xs uppercase text-surface'
              : 'text-xs uppercase text-primary'
          }
        >
          {isAdded ? '✓ Added' : '+ Add'}
        </Text>
      </Pressable>
    </View>
  );
}
