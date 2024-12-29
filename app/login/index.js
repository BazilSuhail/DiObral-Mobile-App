import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
//import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setCart } from '@/hooks/cartSlice';
import Icon from 'react-native-vector-icons/Ionicons'; // For general icons
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // For Facebook, Twitter, LinkedIn, Google icons

import { TouchableOpacity } from 'react-native';
import config from '@/Config/Config';
import { useRouter } from 'expo-router';
import { setToken } from '@/hooks/authSlice';

const Login = () => {
  const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    //const navigation = useNavigation();
    const dispatch = useDispatch(); 

    const fetchUserCart = async (userId) => {
        try {
            const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/cartState/cart/${userId}`);
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
            const response = await axios.post(`${config.REACT_APP_API_BASE_URL}/auth/login`, { email, password });
            if (response.data.token) {
                await AsyncStorage.setItem('token', response.data.token); 
                dispatch(setToken(response.data.token)); 

                const decodedToken = parseJwt(response.data.token);
                const userId = decodedToken?.id;  
                console.log('User ID:', userId);

                if (userId) { 
                    await fetchUserCart(userId);  
                    router.push('/cart');
                } 
                else {
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
        <View className="relative flex items-center bg-red-100 justify-center pt-[48px] flex-1"> 
            <View className="absolute h-screen w-screen"> 
                <View className="h-[850px] mt-[-580px] mr-[-65px] w-[850px] rounded-full bg-red-700  absolute top-0 right-0"></View>
                <View className="h-[700px] mt-[-610px] mr-[-110px] w-[700px] rounded-full bg-red-900 absolute top-0 right-0"></View>

                <View className="h-[550px] mb-[-460px]  w-screen rounded-[65px] bg-red-800  absolute bottom-0 left-0">
                    <Text className="text-white font-bold text-center mt-[15px]">Join us Also Using</Text>
                    <View className="flex-row justify-center mt-2 space-x-3">
                        <View className="h-[40px] w-[40px] rounded-full flex justify-center items-center bg-red-50"><FontAwesome name="google" size={25} color="#9b2c2c" /></View>
                        <View className="h-[40px] w-[40px] rounded-full flex justify-center items-center bg-red-50"><FontAwesome name="facebook" size={25} color="#9b2c2c" /></View>
                        <View className="h-[40px] w-[40px] rounded-full flex justify-center items-center bg-red-50"><FontAwesome name="twitter" size={25} color="#9b2c2c" /></View>
                        <View className="h-[40px] w-[40px] rounded-full flex justify-center items-center bg-red-50"><FontAwesome name="linkedin" size={25} color="#9b2c2c" /></View>
                    </View>
                </View>
            </View>

            <View className="absolute h-screen w-screen">
                <Text className="text-[40px] ml-[15px] mt-[108px] font-bold text-white">Welcome Back</Text>
                <Text className="text-md ml-[20px] font-medium text-red-50">Hey, It's good to see you again</Text>
            </View>


            {/* Content */}
            <View className="flex m-4 rounded-lg bg-white justify-center py-6 px-8 w-[85%]">
                {error ? (
                    <Text className="text-red-500 p-2 border-2 border-red-600 rounded-md mb-4 text-center">
                        {`Error: ${error}`}
                    </Text>
                ) : null}
                <Text className="text-red-800  font-semibold  rounded-md mb-4">
                    Please Continue with <Text className="text-red-500 font-bold underline">Your Credentials</Text>
                </Text>
                <View className="flex-row items-center bg-red-700 px-4 rounded-2xl py-1 mb-4">
                    <Icon name="mail-outline" size={24} color="white" />
                    <TextInput
                        className="flex-1 text-red-50 font-medium placeholder:text-red-50 p-2 ml-1"
                        placeholder="Enter your Email"
                        placeholderTextColor={"white"}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        required
                    />
                </View>
                <View className="flex-row items-center bg-red-700 px-4 rounded-2xl py-1 mb-4">
                    <Icon name="lock-closed-outline" size={24} color="white" />
                    <TextInput
                        className="flex-1 text-red-50 placeholder:text-red-50 placeholder:font-extralight font-medium p-2 ml-1"
                        placeholder="Enter your Password"
                        placeholderTextColor={"white"}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        required
                    />
                </View>
                <TouchableOpacity onPress={handleSubmit} className="bg-red-600 rounded-3xl py-2 px-4">
                    <Text className="text-center text-lg text-white">Sign In</Text>
                </TouchableOpacity>
                <View className="mt-[15px]">
                    <Text className="text-center text-[15px] font-medium">
                        Don't have an account?{' '}
                        <Text className="text-red-700 font-bold underline" onPress={() => router.push(`/signup`)}>
                            Sign Up
                        </Text>
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default Login;
