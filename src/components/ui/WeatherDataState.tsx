import { ActivityIndicator, Text, View } from 'react-native';

interface WeatherDataStateProps {
  loading: boolean;
  compact?: boolean;
}

export function WeatherDataState({
  loading,
  compact = false,
}: WeatherDataStateProps) {
  const message = loading ? 'Loading weather' : 'Weather unavailable';

  if (compact) {
    return (
      <View
        accessibilityLabel={message}
        className="min-h-12 flex-row items-center justify-center gap-2 rounded-lg bg-surface-container-low px-2 py-2"
      >
        {loading ? <ActivityIndicator size="small" color="#406840" /> : null}
        <Text className="font-label-sm text-label-sm text-on-surface-variant">
          {loading ? 'Loading' : 'Unavailable'}
        </Text>
      </View>
    );
  }

  return (
    <View
      accessibilityLabel={message}
      className="min-h-24 items-center justify-center gap-2 rounded-xl bg-surface-container-low px-space-md py-space-md"
    >
      {loading ? <ActivityIndicator color="#406840" /> : null}
      <Text className="font-label-md text-label-md text-on-surface-variant">
        {message}
      </Text>
      {!loading ? (
        <Text className="text-center font-body-sm text-body-sm text-on-surface-variant">
          Connect to refresh current conditions.
        </Text>
      ) : null}
    </View>
  );
}