import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, } from '@react-navigation/stack';
import SignIn from './Signin';
import AppNavigator from '../../AppNavigator'; 
import Register from './Register';

const Stack = createStackNavigator();

const AuthenticationStack = () => {
    return (
        <Stack.Navigator initialRouteName="SignIn">
            <Stack.Screen
                name="SignIn"
                component={SignIn}
                options={{
                    title: 'CoursesTaught',
                    headerShown: false // Hide the header for this screen
                }}
            />
            <Stack.Screen
                name="AppNavigator"
                component={AppNavigator}
                options={{
                    title: 'AppNavigator',
                    headerShown: false // Hide the header for this screen
                }}
            />

            <Stack.Screen
                name="Register"
                component={Register}
                options={{
                    title: 'Register',
                    headerShown: false // Hide the header for this screen
                }}
            />

        </Stack.Navigator>
    );
};

export default AuthenticationStack;