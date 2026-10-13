// src/components/towns/details/MetricCard.tsx

import React from 'react';
import { Text, View } from 'react-native';

interface MetricCardProps {
  label: string;
  value?: string;

  status?: string;
  footer?: string;
  secondFooter?: string;

  icon: React.ComponentType<any>;

  statusAccent?: boolean;
}

export function MetricCard({
  label,
  value,
  status,
  footer,
  secondFooter,
  icon: Icon,
  statusAccent = false,
}: MetricCardProps) {
  return (
    <View className=" flex-1 justify-between rounded-xl bg-surface-container-low p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          {label}
        </Text>

        <Icon size={18} color="#406840" />
      </View>

      {!status && !value ? '' : <View className="my-2">
        <Text className="font-headline-md text-headline-md font-semibold text-primary">
          {value}
        </Text>

        <Text
          className={`mt-0.5 font-telemetry text-[11px] ${
            statusAccent ? 'text-secondary' : 'text-on-surface-variant'
          }`}
        >
          {status}
        </Text>
      </View>}

      {footer && (
        <View className="rounded bg-surface-container p-1.5">
          <Text className="font-body-sm text-[11px] leading-tight text-on-surface-variant">
            {footer}
          </Text>
        </View>
      )}
  {secondFooter && (
          <View className="rounded bg-surface-container p-1.5">
            <Text className="font-body-sm text-[11px] leading-tight text-on-surface-variant">
              {secondFooter}
            </Text>
          </View>
        )}
    </View>
  );
}
