import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProductList from '../ProductList';
import ProductDetails from '../ProductDetails'; 

const Stack = createStackNavigator();

const Products = () => {
  return (
    <Stack.Navigator initialRouteName="ProductList">
      <Stack.Screen name="ProductList"
        options={{
          title: 'ProductList',
          headerShown: false // Hide the header for this screen
        }}
        component={ProductList} />
      
      <Stack.Screen name="ProductDetails"
       options={{
        title: 'ProductDetails',
        headerShown: false // Hide the header for this screen
      }}  component={ProductDetails} />
    </Stack.Navigator>
  );
};

export default Products;
