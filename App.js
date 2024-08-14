import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Provider } from 'react-redux';
import store from './redux/store';
import AppNavigator from './AppNavigator';  
import AuthenticationStack from './Components/Authentication/AuthenticationStack';

const REACT_APP_API_BASE_URL = "http://10.0.2.2:3001";

const parseJwt = (token) => {
  try {
    const [header, payload] = token.split('.');
    const base64Url = payload.replace(/-/g, '+').replace(/_/g, '/');
    const base64 = base64Url + (base64Url.length % 4 === 0 ? '' : '='.repeat(4 - (base64Url.length % 4)));
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const decodedToken = parseJwt(token);

          if (decodedToken && decodedToken.userId) {
            // Validate if the user exists in the profile collection
            try {
              const response = await axios.get(`${REACT_APP_API_BASE_URL}/auth/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (response.data) {
                console.log(isAuthenticated);
                setIsAuthenticated(true); // User exists
              } else {
                setIsAuthenticated(false); // User doesn't exist
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false); // Invalid token
          }
        } else {
          setIsAuthenticated(false); // No token found
        }
      } catch (error) {
        console.error('Error checking authentication:', error.message);
        setIsAuthenticated(false);
      }
      //console.log(isAuthenticated);
    };

    checkAuthentication();
  }, []);

  if (isAuthenticated === null) {
    // Show a loading indicator while checking authentication
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        {isAuthenticated ? <AppNavigator /> : <AppNavigator />}
      </NavigationContainer>
    </Provider>
  );
};

export default App;
