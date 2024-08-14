import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { IoLockClosedOutline, IoMail } from 'react-native-vector-icons/Ionicons'; // Import from 'react-native-vector-icons'

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigation = useNavigation();
    const dispatch = useDispatch();
    const REACT_APP_API_BASE_URL = "http://10.0.2.2:3001";

    const handleSubmit = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await axios.post(`${REACT_APP_API_BASE_URL}/auth/register`, { email, password });
            setSuccess('Registration successful! Please log in.');
            setError('');
            setTimeout(() => navigation.navigate('Login'), 1000); // Navigate to Login screen
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
            setSuccess('');
        }
    };

    return (
        <View className="flex-1 justify-center p-4 bg-white">
            <View className="mb-4">
                <Text className="text-3xl text-center font-bold text-red-800">Create an Account</Text>
                <Text className="text-lg text-center font-medium text-red-800">Create an account for faster checkout</Text>
                <View className="h-1 bg-red-200 w-9/12 mx-auto mb-4" />
            </View>
            {error ? <Text className="text-red-500 p-2 border-2 border-red-600 rounded-md mb-4 text-center">{`Error: ${error}`}</Text> : null}
            {success ? <Text className="text-green-500 p-2 border-2 border-green-600 rounded-md mb-4 text-center">{success}</Text> : null}
            <View className="mb-4">
                <Text className="text-lg font-medium">Email</Text>
                <View className="flex-row items-center border-b border-gray-300 mb-2">
                    <IoMail name="mail-outline" size={24} color="red" />
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
            </View>
            <View className="mb-4">
                <Text className="text-lg font-medium">Password</Text>
                <View className="flex-row items-center border-b border-gray-300 mb-2">
                    <IoLockClosedOutline name="lock-closed-outline" size={24} color="red" />
                    <TextInput
                        className="flex-1 p-2 ml-2"
                        placeholder="Enter your Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        required
                    />
                </View>
            </View>
            <View className="mb-4">
                <Text className="text-lg font-medium">Confirm Password</Text>
                <View className="flex-row items-center border-b border-gray-300 mb-2">
                    <IoLockClosedOutline name="lock-closed-outline" size={24} color="red" />
                    <TextInput
                        className="flex-1 p-2 ml-2"
                        placeholder="Confirm your Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        required
                    />
                </View>
            </View>
            <Button title="Sign Up" onPress={handleSubmit} color="red" />
            <View className="mt-4">
                <Text className="text-center text-lg">
                    Already have an account?{' '}
                    <Text className="text-red-700 underline" onPress={() => navigation.navigate('Login')}>
                        Sign In
                    </Text>
                </Text>
            </View>
        </View>
    );
};

export default SignUp;
