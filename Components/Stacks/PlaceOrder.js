import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';  
import OrderList from '../OrderList';
import Cart from '../Cart';

const Stack = createStackNavigator();

const PlaceOrder = () => {
  return (
    <Stack.Navigator initialRouteName="Cart">
      <Stack.Screen name="Cart"
        options={{
          title: 'Cart',
          headerShown: false // Hide the header for this screen
        }}
        component={Cart} /> 
      
      <Stack.Screen name="OrderList"
        options={{
          title: 'OrderList',
          headerShown: false // Hide the header for this screen
        }}
        component={OrderList} />
    </Stack.Navigator>
  );
};

export default PlaceOrder;
