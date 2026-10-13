import React from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  View,
} from 'react-native';
import { FieldRegisterIcon } from '../icons/FieldRegisterIcon';

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <FieldRegisterIcon size={140} showBadge={false} />
    </View>
  );
}