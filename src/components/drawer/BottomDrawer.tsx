// src/components/drawer/BottomDrawer.tsx

import React, { PropsWithChildren, useEffect, useMemo, useRef } from 'react';

import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomDrawerProps extends PropsWithChildren {
  visible: boolean;
  onClose: () => void;
  height?: number;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function BottomDrawer({
  visible,
  onClose,
  children,
  height = SCREEN_HEIGHT * 0.88,
}: BottomDrawerProps) {
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    translateY.setValue(height);

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 24,
      stiffness: 220,
      mass: 0.9,
    }).start();
  }, [visible, height, translateY]);

  const closeDrawer = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 220,
      useNativeDriver: true,
    }).start(onClose);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 6,

        onPanResponderMove: (_, gesture) => {
          if (gesture.dy > 0) {
            translateY.setValue(gesture.dy);
          }
        },

        onPanResponderRelease: (_, gesture) => {
          const shouldClose = gesture.dy > 120 || gesture.vy > 0.8;

          if (shouldClose) {
            closeDrawer();
            return;
          }

          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 24,
            stiffness: 220,
          }).start();
        },
      }),
    [height, translateY],
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Pressable
          onPress={closeDrawer}
          className="absolute inset-0 bg-black/40"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View
            className="overflow-hidden rounded-t-xl bg-surface shadow-xl"
            style={{
              height,
              paddingBottom: insets.bottom,
              transform: [{ translateY }],
            }}
          >
            {/* Drag area */}
            <View
              {...panResponder.panHandlers}
              className="items-center pb-2 pt-3"
            >
              <View className="h-1.5 w-10 rounded-full bg-outline-variant/60" />
            </View>

            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
