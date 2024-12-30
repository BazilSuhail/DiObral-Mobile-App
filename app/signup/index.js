import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useDispatch } from 'react-redux';

import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import config from '@/Config/Config';
import { Link, useRouter } from 'expo-router';

const SignUp = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    //const navigation = useNavigation();
    const dispatch = useDispatch();

    const handleSubmit = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await axios.post(`${config.REACT_APP_API_BASE_URL}/auth/register`, { email, password });
            setSuccess('Registration successful! Please log in.');
            setError('');
            setTimeout(() => router.push(`/login`), 1000);
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
            setSuccess('');
        }
    };

    return (

        <View className="relative flex items-center bg-red-100 justify-center pt-[48px] flex-1">
            {/* Wavy Background */}
            <View className="absolute h-screen w-screen">
                {/* Top Right Circles */}
                <View className="h-[850px] mt-[-580px] mr-[-65px] w-[850px] rounded-full bg-red-700  absolute top-0 right-0"></View>
                <View className="h-[700px] mt-[-610px] mr-[-110px] w-[700px] rounded-full bg-red-900 absolute top-0 right-0"></View>

                <View className="h-[550px] mb-[-460px]  w-screen rounded-[65px] bg-red-800  absolute bottom-0 left-0">
                    <Text className="text-white font-bold text-center mt-[15px]">Begin Shopping Using</Text>
                    <View className="flex-row justify-center mt-2 space-x-3">
                        <View className="h-[40px] w-[40px] rounded-full flex justify-center items-center bg-red-50"><FontAwesome name="google" size={25} color="#9b2c2c" /></View>
                        <View className="h-[40px] w-[40px] rounded-full flex justify-center items-center bg-red-50"><FontAwesome name="facebook" size={25} color="#9b2c2c" /></View>
                        <View className="h-[40px] w-[40px] rounded-full flex justify-center items-center bg-red-50"><FontAwesome name="twitter" size={25} color="#9b2c2c" /></View>
                        <View className="h-[40px] w-[40px] rounded-full flex justify-center items-center bg-red-50"><FontAwesome name="linkedin" size={25} color="#9b2c2c" /></View>
                    </View>
                </View>
            </View>

            <View className="absolute h-screen w-screen">
                <Text className="text-[40px] ml-[15px] mt-[108px] font-bold text-white">Create Account</Text>
                <Text className="text-md ml-[20px] font-medium text-red-50">Shpop Now !! By Creating an Account</Text>
            </View>


            {/* Content */}
            <View className="flex m-4 rounded-lg bg-white justify-center py-6 px-8 w-[85%]">
                <Text className="text-red-800  font-semibold  rounded-md mb-4">
                    Please Enter Your with <Text className="text-red-500 font-bold underline">Credentials</Text>
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
                <View className="flex-row items-center bg-red-700 px-4 rounded-2xl py-1 mb-4">
                    <Icon name="lock-closed" size={24} color="white" />
                    <TextInput
                        className="flex-1 text-red-50 placeholder:text-red-50 placeholder:font-extralight font-medium p-2 ml-1"
                        placeholder="Confirm your Password"
                        placeholderTextColor={"white"}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        required
                    />
                </View>
                <TouchableOpacity onPress={handleSubmit} className="bg-red-600 rounded-3xl py-2 px-4">
                    <Text className="text-center font-[600] text-[15px] text-white">Sign Up</Text>
                </TouchableOpacity>

{error ? (
                    <Text className="text-red-500 mt-4 font-[600] text-center underline">
                        {`${error}`}
                    </Text>
                ) : null}
                <View className="mt-[15px]">
                    <Text className="text-center text-[14px] font-medium">
                        Already have an account?{' '}
                        <Link className="text-red-700 font-bold underline" href="/login" replace={true}>
                            Sign In
                        </Link>
                        {/*
                        <Text className="text-red-700 font-bold underline" onPress={() => router.push(`/login`)}>
                            Sign In
                        </Text>
                        */}

                    </Text>
                </View>
            </View>
        </View>

    );
};

export default SignUp;
