import { Tabs } from 'expo-router';
import React from 'react'; 
import { FontAwesome } from '@expo/vector-icons'; // Import vector icons

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#B91C1C', // red-700
        tabBarInactiveTintColor: '#6B7280', // gray-500
        headerShown: false, 
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // white
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="productlist"
        options={{
          title: 'Product List',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="list" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="shopping-cart" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={28} color={color} />
          ),
        }}
      /> 
    </Tabs>
  );
}
