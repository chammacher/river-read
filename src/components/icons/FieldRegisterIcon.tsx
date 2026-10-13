import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface FieldRegisterIconProps {
  size?: number;
  showBadge?: boolean;
}

export function FieldRegisterIcon({
  size = 112,
  showBadge = true,
}: FieldRegisterIconProps) {
  const artSize = size * 0.72;

  return (
    <View
      style={{
        width: size,
        height: size,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer contour ring */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: size / 2,
          backgroundColor: 'rgba(235, 232, 225, 0.6)',
        }}
      />

      {/* Inner contour ring */}
      <View
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          bottom: 8,
          left: 8,
          borderRadius: size / 2,
          backgroundColor: 'rgba(246, 243, 236, 0.8)',
        }}
      />

      <Svg width={artSize} height={artSize} viewBox="0 0 100 100">
        {/* Lat / Long Crosshairs */}
        <Line
          x1="50"
          y1="6"
          x2="50"
          y2="94"
          stroke="#052215"
          strokeWidth={0.75}
          strokeDasharray="2 3"
          opacity={0.45}
        />

        <Line
          x1="6"
          y1="50"
          x2="94"
          y2="50"
          stroke="#052215"
          strokeWidth={0.75}
          strokeDasharray="2 3"
          opacity={0.45}
        />

        {/* River */}
        <Path
          d="M18 68 C 30 65, 32 54, 46 56 C 60 58, 64 42, 82 38"
          fill="none"
          stroke="#406840"
          strokeWidth={1.75}
          strokeLinecap="round"
        />

        <Path
          d="M16 61 C 28 58, 30 47, 44 49 C 58 51, 62 35, 80 31"
          fill="none"
          stroke="#052215"
          strokeWidth={0.85}
          strokeDasharray="2 2"
          opacity={0.35}
        />

        <Path
          d="M20 75 C 32 72, 34 61, 48 63 C 62 65, 66 49, 84 45"
          fill="none"
          stroke="#052215"
          strokeWidth={0.85}
          opacity={0.3}
        />

        {/* Mountain ridges */}
        <Path
          d="M30 38 L40 24 L52 38"
          fill="none"
          stroke="#052215"
          strokeWidth={1.25}
          strokeLinejoin="round"
          opacity={0.7}
        />

        <Path
          d="M48 38 L57 28 L68 40"
          fill="none"
          stroke="#052215"
          strokeWidth={1.2}
          strokeLinejoin="round"
          opacity={0.7}
        />

        <Path
          d="M40 24 L40 38"
          stroke="#052215"
          strokeWidth={0.75}
          strokeDasharray="1 2"
          opacity={0.5}
        />

        <Path
          d="M57 28 L57 39"
          stroke="#052215"
          strokeWidth={0.75}
          strokeDasharray="1 2"
          opacity={0.5}
        />

        {/* Compass focal point */}
        <Circle cx="50" cy="50" r="4.5" fill="#381200" />

        <Circle
          cx="50"
          cy="50"
          r="8"
          fill="none"
          stroke="#381200"
          strokeWidth={0.75}
          strokeDasharray="1.5 1.5"
        />

        <Circle cx="50" cy="50" r="1.5" fill="#FCF9F2" />

        {/* Outer index ring */}
        <Circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#052215"
          strokeWidth={0.75}
          opacity={0.25}
        />
      </Svg>

      {showBadge && (
        <View
          style={{
            position: 'absolute',
            right: -4,
            bottom: -4,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: '#052215',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* We can replace this with a proper water SVG/icon next */}
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path
              d="M12 3 C12 3 6.5 9.2 6.5 14
                 C6.5 17.1 9 19.5 12 19.5
                 C15 19.5 17.5 17.1 17.5 14
                 C17.5 9.2 12 3 12 3Z"
              fill="none"
              stroke="#FCF9F2"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      )}
    </View>
  );
}
