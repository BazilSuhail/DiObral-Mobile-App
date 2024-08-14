import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setCart } from '../../redux/cartSlice';
import jwtDecode from 'jwt-decode';
import Icon from 'react-native-vector-icons/Ionicons';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigation = useNavigation();
    const dispatch = useDispatch();
    const REACT_APP_API_BASE_URL = "http://10.0.2.2:3001";

    const fetchUserCart = async (userId) => {
        try {
            const response = await axios.get(`${REACT_APP_API_BASE_URL}/cartState/cart/${userId}`);
            //console.log('Fetch cart response:', response);
            if (response.status === 200) {
                dispatch(setCart(response.data.items));
            }
        } catch (error) {
            console.error('Error fetching cart state:', error);
        }
    };

    const parseJwt = (token) => {
        try {
            // Split the token into header, payload, and signature
            const [header, payload, signature] = token.split('.');
    
            // Decode the base64 URL encoded payload
            const base64Url = payload.replace(/-/g, '+').replace(/_/g, '/');
            const base64 = base64Url + (base64Url.length % 4 === 0 ? '' : '='.repeat(4 - (base64Url.length % 4)));
            const decodedPayload = atob(base64);
    
            // Convert to a JSON 
            //console.log(JSON.parse(decodedPayload));
            return JSON.parse(decodedPayload);
        } catch (error) {
            console.error('Error parsing JWT:', error);
            return null;
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post(`${REACT_APP_API_BASE_URL}/auth/login`, { email, password });
            if (response.data.token) {
                await AsyncStorage.setItem('token', response.data.token);
                //console.log(response.data.token);

                // Decode token to get user ID
                const decodedToken = parseJwt(response.data.token);
                const userId = decodedToken?.id; // Adjust this based on your token structure

                console.log('User ID:', userId);

                if (userId) {
                    // Fetch and set the cart state
                    await fetchUserCart(userId);
                    navigation.navigate('AppNavigator');
                } else {
                    setError('Error: Unable to get user ID from token');
                }
            } else {
                setError('Login failed: No token received');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <View className="flex-1 justify-center p-4 bg-white">
            <View className="mb-4">
                <Text className="text-3xl text-center font-bold text-red-800">Welcome Back</Text>
                <Text className="text-lg text-center font-medium text-red-800">Please enter Email and Password</Text>
            </View>
            {error ? <Text className="text-red-500 p-2 border-2 border-red-600 rounded-md mb-4 text-center">{`Error: ${error}`}</Text> : null}
            <View className="flex-row items-center border-b border-gray-300 mb-4">
                <Icon name="mail-outline" size={24} color="red" />
                <TextInput
                    className="flex-1 p-2 ml-2"
                    placeholder="Enter your Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    required
                />
            </View>
            <View className="flex-row items-center border-b border-gray-300 mb-4">
                <Icon name="lock-closed-outline" size={24} color="red" />
                <TextInput
                    className="flex-1 p-2 ml-2"
                    placeholder="Enter your Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    required
                />
            </View>
            <View className="flex-row items-center mb-4">
                <Button title="Remember me" onPress={() => { }} color="black" />
            </View>
            <Button title="Sign In" onPress={handleSubmit} color="red" />
            <View className="mt-4">
                <Text className="text-center text-lg">
                    Don't have an account?{' '}
                    <Text className="text-red-700 underline" onPress={() => navigation.navigate('Register')}>
                        Sign Up
                    </Text>
                </Text>
            </View>
        </View>
    );
};

export default SignIn;
