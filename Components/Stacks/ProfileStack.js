import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Profile from '../Authentication/Profile';
import Register from '../Authentication/Register';
import ShowOrders from '../ShowOrder'; 
import AuthenticationStack from '../Authentication/AuthenticationStack'; // Import your SignIn component

const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator initialRouteName="ProfileofUser">
      <Stack.Screen
        name="ProfileofUser"
        options={{
          title: 'Profile',
          headerShown: false // Hide the header for this screen
        }}
        component={Profile}
      />
      <Stack.Screen name="ShowOrders"
         options={{
          title: 'Profile',
          headerShown: false // Hide the header for this screen
        }}
        component={ShowOrders} />
      
      <Stack.Screen
        name="SignInUser"
        options={{
          title: 'Sign In',
          headerShown: false // Hide the header for the SignIn screen
        }}
        component={AuthenticationStack} // Add the SignIn component to the stack
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;
