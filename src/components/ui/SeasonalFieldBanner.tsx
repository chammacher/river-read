import React from 'react';
import { ImageBackground, Text, View } from 'react-native';

type SeasonPhase =
  | 'early-winter'
  | 'late-winter'
  | 'early-spring'
  | 'late-spring'
  | 'early-summer'
  | 'late-summer'
  | 'early-fall'
  | 'late-fall';

interface SeasonalContent {
  label: string;
  description: string;
  image: number;
}

interface SeasonalFieldBannerProps {
  date?: Date;
}

const seasonalContent: Record<SeasonPhase, SeasonalContent> = {
  'early-winter': {
    label: 'Early Winter Holding',
    description:
      'Cooling water is concentrating fish into slower runs, deeper seams, and stable winter lies.',
    image: require('../../../assets/images/early-winter-river.jpg'),
  },

  'late-winter': {
    label: 'Late Winter Transition',
    description:
      'Longer afternoons can create brief feeding windows as water temperatures begin to recover.',
    image: require('../../../assets/images/late-winter-river.jpg'),
  },

  'early-spring': {
    label: 'Early Spring Emergence',
    description:
      'Warming margins and midday sun are beginning to trigger early mayfly and midge activity.',
    image: require('../../../assets/images/early-spring-river.jpg'),
  },

  'late-spring': {
    label: 'Late Spring Transition',
    description:
      'Rising flows and stronger hatches are shifting fish toward active seams and changing water.',
    image: require('../../../assets/images/late-spring-river.jpg'),
  },

  'early-summer': {
    label: 'Early Summer Hatches',
    description:
      'Consistent aquatic insect activity is creating productive morning and evening surface windows.',
    image: require('../../../assets/images/early-summer-river.jpg'),
  },

  'late-summer': {
    label: 'Late Summer Terrestrials',
    description:
      'Grasshoppers, ants, and beetles are becoming key food sources along shaded banks and edges.',
    image: require('../../../assets/images/late-summer-river.jpg'),
  },

  'early-fall': {
    label: 'Early Autumn Emergence',
    description:
      'High-country caddis and terrestrial activity remain strong as cooler nights return.',
    image: require('../../../assets/images/early-fall-river.jpg'),
  },

  'late-fall': {
    label: 'Late Autumn Transition',
    description:
      'Cooling water and shorter days are pushing fish toward deeper runs and concentrated feeding periods.',
    image: require('../../../assets/images/late-fall-river.jpg'),
  },
};

function getSeasonPhase(date: Date): SeasonPhase {
  const month = date.getMonth();

  switch (month) {
    case 0:
      return 'early-winter';

    case 1:
      return 'late-winter';

    case 2:
      return 'early-spring';

    case 3:
    case 4:
      return 'late-spring';

    case 5:
      return 'early-summer';

    case 6:
    case 7:
      return 'late-summer';

    case 8:
      return 'early-fall';

    case 9:
    case 10:
      return 'late-fall';

    case 11:
    default:
      return 'early-winter';
  }
}

export function SeasonalFieldBanner({
  date = new Date(),
}: SeasonalFieldBannerProps) {
  const phase = getSeasonPhase(date);
  const content = seasonalContent[phase];

  return (
    <View className="h-28 w-full overflow-hidden rounded-xl bg-surface-container-low">
      <ImageBackground
        source={content.image}
        resizeMode="cover"
        className="h-full w-full"
      >
        <View className="absolute inset-0 bg-primary/60" />

        <View className="flex-1 justify-center p-4">
          <View className="w-3/4">
            <Text className="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed">
              {content.label}
            </Text>

            <Text className="font-headline-sm text-headline-sm font-serif italic text-surface-bright leading-tight mt-0.">
              {content.description}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
