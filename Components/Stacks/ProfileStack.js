import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';  
import Profile from '../Authentication/Profile';
import ShowOrders from '../ShowOrder';

const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen name="Profile"
        options={{
          title: 'ProductList',
          headerShown: false // Hide the header for this screen
        }}
        component={Profile} />
      <Stack.Screen name="ShowOrders" component={ShowOrders} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
