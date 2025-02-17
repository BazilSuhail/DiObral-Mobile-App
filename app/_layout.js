import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar'; 
import { Provider } from 'react-redux';
import store from '@/hooks/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import * as NavigationBar from 'expo-navigation-bar'; 

NavigationBar.setBackgroundColorAsync('#FFFFFF');
NavigationBar.setButtonStyleAsync('light');

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <StatusBar backgroundColor='#ffffff' barStyle='light-content' />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false, // Hide headers if not needed
            gestureEnabled: true, // Enable gestures
            gestureDirection: 'horizontal',
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            }),
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </GestureHandlerRootView>
    </Provider>
  );
}
