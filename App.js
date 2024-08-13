import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native'; // Import Text component
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux'; // Import Provider from react-redux
import store from './redux/store'; // Import your Redux store
import AppNavigator from './AppNavigator';
import Signin from './Components/Authentication/Signin'; // Import your SignIn screen

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          console.log('Token found:', token); // Debug log
        } else {
          console.log('No token found'); // Debug log
          setIsAuthenticated(false);

        }
        console.log(isAuthenticated); // Debug log
        setIsAuthenticated(!!token); // Check if token exists
      } catch (error) {
        console.error('Error checking authentication:', error.message); // Enhanced error logging
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);
 

  return (
    <Provider store={store}> {/* Wrap the application with Provider */}
      <NavigationContainer>
        {isAuthenticated ? <AppNavigator /> : <Signin />}
      </NavigationContainer>
    </Provider>
  );
};

export default App;
