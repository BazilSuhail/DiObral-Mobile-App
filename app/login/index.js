import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { useDispatch } from 'react-redux';
import { setCart } from '@/hooks/cartSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { TouchableOpacity } from 'react-native';
import config from '@/Config/Config';
import { Link, useRouter } from 'expo-router';
import { setToken } from '@/hooks/authSlice';

const Login = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const fetchUserCart = async (userId) => {
        try {
            const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/cartState/cart/${userId}`);
            if (response.status === 200) {
                dispatch(setCart(response.data.items));
            }
        }
        catch (error) {
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
            return JSON.parse(decodedPayload);
        }
        catch (error) {
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

                if (userId) {
                    await fetchUserCart(userId);
                    router.push('/cart');
                }
                else {
                    setError('Error: Unable to get user ID from token');
                }
            }
            else {
                setError('Login failed: No token received');
            }
        }
        catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <View className="relative flex items-center bg-white justify-center pt-[48px] flex-1">
            <View className="absolute h-screen w-screen">
                <View className="h-[850px] mt-[-580px] mr-[-65px] w-[950px] rounded-full bg-red-700  absolute top-0 right-0"></View>
                <View className="h-[700px] mt-[-610px] mr-[-150px] w-[750px] rounded-full bg-red-900 absolute top-0 right-0"></View>

                <View className="h-[500px] mb-[-460px]  w-screen rounded-[65px] absolute bottom-0 left-0">
                    <View className='bg-red-800 flex-row justify-between items-center px-[15px] rounded-[25px] w-[350px] py-[10px] mx-auto'>
                        <Text className="text-white text-[12px] font-bold text-center">Join us Also Using</Text>
                        <View className="flex-row justify-center space-x-2">
                            <View className="h-[28px] w-[28px] rounded-full flex justify-center items-center bg-red-50"><FontAwesome name="google" size={18} color="#9b2c2c" /></View>
                            <View className="h-[28px] w-[28px] rounded-full flex justify-center items-center bg-red-50"><FontAwesome name="facebook" size={18} color="#9b2c2c" /></View>
                            <View className="h-[28px] w-[28px] rounded-full flex justify-center items-center bg-red-50"><FontAwesome name="twitter" size={18} color="#9b2c2c" /></View>
                            <View className="h-[28px] w-[28px] rounded-full flex justify-center items-center bg-red-50"><FontAwesome name="linkedin" size={18} color="#9b2c2c" /></View>
                        </View>
                    </View>
                </View>
            </View>

            <View className="absolute h-screen w-screen">
                <Text className="text-[40px] ml-[15px] mt-[108px] font-bold text-white">Welcome Back</Text>
                <Text className="text-md ml-[20px] font-medium text-red-50">Hey, It's good to see you again</Text>
            </View>


            {/* Content */}
            <View className="w-full pt-[105px] px-[25px]">
                <Text className="text-red-800 font-semibold rounded-md mb-4">
                    Please Continue with <Text className="text-red-500 font-bold underline">Your Credentials</Text>
                </Text>
                <View className="flex-row items-center bg-red-700 px-4 rounded-[8px] py-1 mb-4">
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
                <View className="flex-row items-center bg-red-700 px-4 rounded-[8px] py-1 mb-4">
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
                <TouchableOpacity onPress={handleSubmit} className="bg-red-600 rounded-[18px] py-3 mt-[15px] px-4">
                    <Text className="text-center font-[600] text-[17px] text-white">Sign In</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center mt-4">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-2 text-gray-500">OR</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                </View>

                {error ? (
                    <Text className="text-red-500 mt-4 font-[600] text-center underline">
                        {`${error}`}
                    </Text>
                ) : null}
                <View className="mt-[15px]">
                    <Text className="text-center text-[14px] font-medium">
                        Don't have an account?{' '}
                        <Link className="text-red-700 font-bold underline" href="/signup" replace={true}>
                            Sign Up
                        </Link>
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default Login;
