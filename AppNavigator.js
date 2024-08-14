import React from 'react'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Home from './Components/Home'; 
import Profile from './Components/Authentication/Profile';  
import Products from './Components/Stacks/Products';
import PlaceOrder from './Components/Stacks/PlaceOrder';

const Tab = createBottomTabNavigator();

const AnimatedIcon = Animated.createAnimatedComponent(FontAwesome);

function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Products':
              iconName = 'list';
              break;
            case 'Profile':
              iconName = 'user';
              break;
            case 'Cart':
              iconName = 'shopping-cart';
              break;
            default:
              iconName = 'circle'; // Default icon if none matches
          }

          // Animated size and opacity for active tab
          const animatedSize = focused ? 28 : 24;
          const animatedOpacity = focused ? 1 : 0.7;

          return (
            <AnimatedIcon
              name={iconName}
              size={animatedSize}
              color={focused ? colors.primary : colors.border} // Use theme colors
              style={{
                opacity: animatedOpacity,
                transform: [{ scale: animatedSize / 24 }],
                padding: 5,
              }}
            />
          );
        },
        tabBarLabel: ({ focused, color }) => (
          <Text
            style={{
              fontSize: 14,
              color: focused ? colors.primary : colors.border, // Use theme colors
              fontWeight: '600',
            }}
          >
            {route.name}
          </Text>
        ),
        tabBarItemStyle: {
          paddingVertical: 3,
        },
        tabBarStyle: {
          backgroundColor: colors.background, // Use theme colors
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Products" component={Products} />
      <Tab.Screen name="Cart" component={PlaceOrder} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default AppNavigator;
