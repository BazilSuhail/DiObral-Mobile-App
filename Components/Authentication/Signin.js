import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setCart } from '../../redux/cartSlice';
import Icon from 'react-native-vector-icons/Ionicons';

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigation = useNavigation();
    const dispatch = useDispatch();
    console.log("helpppppppppp");
    const fetchUserCart = async (userId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/cartState/cart/${userId}`);
            console.log('Fetch cart response:', response);
            if (response.status === 200) {
                dispatch(setCart(response.data.items));
            }
        } catch (error) {
            console.error('Error fetching cart state:', error);
        }
    };

    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error parsing JWT:', error);
            return null;
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, { email, password });
            console.log('Login response:', response);
            if (response.data.token) {
                await AsyncStorage.setItem('token', response.data.token);

                // Decode token to get user ID
                const decodedToken = parseJwt(response.data.token);
                const userId = decodedToken?.id; // Adjust this based on your token structure

                console.log('User ID:', userId);

                // Fetch and set the cart state
                await fetchUserCart(userId);

                navigation.navigate('Profile');
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
            {/*error ? <View><Text className="text-red-500 p-2 border-2 border-red-600 rounded-md mb-4 text-center">{`Errhbububuybor: ${error}`}</Text></View> : null*/}
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

export default Signin;
