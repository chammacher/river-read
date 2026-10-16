import { ComponentClass } from 'react';
import { Text, View } from 'react-native';

interface FieldNoteProps {
  title: string;
  children: React.ReactNode;
  reference?: string;
  source?: string;
  icon: ComponentClass<any, any> | React.FunctionComponent<any>;
}

export function FieldNote({
  title,
  children,
  reference,
  source,
  icon,
}: FieldNoteProps) {
  const Icon = icon;
  return (
    <View className="relative overflow-hidden rounded-lg bg-surface-container p-4">
      <View className="absolute bottom-0 left-0 top-0 w-1 bg-tertiary" />

      <View className="pl-2">
        <View className="flex-row">
          <Icon width={16} height={16} color="#381200" />
          <Text className="pl-2 text-xs font-semibold uppercase tracking-widest text-tertiary">
            {title}
          </Text>
        </View>

        <Text className="mt-1 text-[15px] italic leading-relaxed text-primary">
          {children}
        </Text>

        <View className="mt-2 flex-row justify-between">
          {reference && (
            <Text className="text-[11px] text-outline">{reference}</Text>
          )}

          {source && (
            <Text className="text-[10px] uppercase text-outline">{source}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
