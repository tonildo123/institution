import React from 'react';
import { View, ViewStyle } from 'react-native';

/**
 * Wrapper para todas las screens
 * Agrega marginTop: 40 de forma consistente
 */

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  scrollable = false,
}) => {
  return (
    <View
      style={[
        {
          flex: 1,
          marginTop: 40,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
