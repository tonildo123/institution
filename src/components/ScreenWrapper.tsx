import React from 'react';
import { ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Wrapper para todas las screens
 * Respeta el área segura superior y lateral; el navegador de tabs reserva la inferior.
 */

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
}) => {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[
        {
          flex: 1,
        },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
};
