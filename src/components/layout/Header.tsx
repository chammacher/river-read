import { Text, View, Pressable } from 'react-native';
import { ArrowBack, Close } from '@material-symbols-svg/react-native';
import type { PropsWithChildren } from 'react';

interface HeaderProps {
  onPress(): void;
  isDetails: boolean;
  onBack(): void;
}

export function Header({
  onPress,
  isDetails = false,
  onBack,
  children,
}: PropsWithChildren<HeaderProps>) {
  return (
    <View className="fixed top-0 pt-6 w-full z-50 bg-surface opacity-80 backdrop-blur-xl shadow-lg">
      <View className="h-16 pl-margin-mobile flex-row gap-4 items-center">
        {isDetails && (
          <Pressable
            aria-label="Navigate back"
            className="pr-20 flex-row items-center justify-center text-primary active:bg-surface-container transition-colors rounded-lg"
            onPress={onBack}
          >
            <ArrowBack width={22} height={22} color="#052215" />
          </Pressable>
        )}
        {children ? (
          children
        ) : (
          <View className="flex flex-col flex-1">
            <Text className="font-label-sm text-label-sm uppercase text-secondary tracking-widest">
              Field Register
            </Text>
            <Text className="font-headline-sm text-headline-sm text-primary leading-none ">
              Towns &amp; Waters
            </Text>
          </View>
        )}
        <View className="flex-row items-center">
          {isDetails ? (
            <Pressable
              className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-tertiary hover:bg-surface-container-high transition-all duration-200 active:scale-95 shadow-sm text-label-sm font-label-sm uppercase tracking-wider"
              onPress={onPress}
            >
              <Close width={16} height={16} color="#ffffff" />
              <Text className="text-on-secondary">Remove</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onPress}
              className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-primary hover:bg-surface-container-high transition-all duration-200 active:scale-95 shadow-sm text-label-sm font-label-sm uppercase tracking-wider"
            >
              <Text className="material-symbols-outlined text-[16px] text-on-secondary">
                +
              </Text>
              <Text className="text-on-secondary">Town</Text>
            </Pressable>
          )}
          <View className="w-11 h-11 flex items-center justify-center"></View>
        </View>
      </View>
    </View>
  );
}
