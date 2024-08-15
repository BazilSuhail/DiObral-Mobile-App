import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../redux/cartSlice';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const ProfileDetail = ({ label, value }) => (
    <View className="bg-white rounded-lg shadow-md p-4 mb-4">
        <Text className="text-gray-600 text-sm">{label}</Text>
        <Text className="text-gray-800 text-lg font-semibold">{value}</Text>
    </View>
);

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        bio: '',
        address: {
            city: '',
            street: '',
            country: ''
        },
        contact: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    const REACT_APP_API_BASE_URL = "http://10.0.2.2:3001";
    const navigation = useNavigation();
    const dispatch = useDispatch(); // Use useDispatch to dispatch actions

    // Use useCallback to memoize the fetchProfile function
    const fetchProfile = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            if (token) {
                const response = await axios.get(`${REACT_APP_API_BASE_URL}/auth/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser(response.data);
                setFormData({
                    email: response.data.email,
                    fullName: response.data.fullName,
                    bio: response.data.bio,
                    address: response.data.address || { city: '', street: '', country: '' },
                    contact: response.data.contact || ''
                });
            } else {
                //navigation.navigate('Signin');
            }
        } catch (error) {
            setError('Failed to fetch profile');
        }
    }, [navigation]);

    const handleChange = (name, value) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleAddressChange = (name, value) => {
        setFormData(prevData => ({
            ...prevData,
            address: {
                ...prevData.address,
                [name]: value
            }
        }));
    };

    const handleSubmit = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.put(`${REACT_APP_API_BASE_URL}/auth/profile`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Optionally refetch the profile data to reflect updates
            fetchProfile();
            setIsEditing(false);
        } catch (error) {
            setError('Failed to update profile');
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        dispatch(clearCart()); // Clear cart on logout
        navigation.navigate('SignInUser');
    };

    const handleNavigatetoSignIn = async () => {
        navigation.navigate('SignInUser');
    };


    const handleSeeOrders = () => {
        navigation.navigate('ShowOrders');
    };

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    //    if (error) return <Text className="text-red-500 pt-[50px]">{error}</Text>;

    if (error) return <View className="pt-[48px] px-4">
        <TouchableOpacity className="mt-[45px] bg-green-800 rounded-lg py-2" onPress={handleNavigatetoSignIn}>
            <Text className="text-lg text-center text-white font-semibold">Sign In</Text>
        </TouchableOpacity>
        <View className="flex mt-[30px] justify-center items-center">
            <Text className="px-4 py-1 bg-red-100 border-2 border-red-700 rounded-lg text-lg font-medium text-red-700">
                {error}
            </Text>
        </View>
    </View>;
    if (!user) return <Text>Loading...</Text>;

    return (
        <View className="flex-1 bg-gray-200 pt-[50px] px-4">
            <View className="mb-4">
                {user.fullName !== "" &&
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-lg text-red-700 font-bold ">
                            Welcome, <Text className="text-black text-2xl">{user.fullName}</Text>
                        </Text>
                        <TouchableOpacity onPress={handleLogout} className="bg-red-800 rounded-md p-[6px]">
                        <MaterialIcons name="logout" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                }
                <View className="bg-gray-300 w-full mb-4 h-[3px]"></View>
                {isEditing ? (
                    <ScrollView className="space-y-4">
                        {user.fullName === "" &&
                            <Text className="text-lg text-red-500 mb-4">
                                * Kindly Before Placing Any Orders. Remember to Fill out Details for Faster Checkout. Only Entered info will be used for Shipping.
                            </Text>
                        }
                        <View>
                            <Text className="text-sm font-medium text-gray-700">Email</Text>
                            <TextInput
                                value={formData.email}
                                onChangeText={(value) => handleChange('email', value)}
                                className="p-2 border border-gray-300 rounded-md"
                                keyboardType="email-address"
                                placeholder="Enter your Email"
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-gray-700">Full Name</Text>
                            <TextInput
                                value={formData.fullName}
                                onChangeText={(value) => handleChange('fullName', value)}
                                className="p-2 border border-gray-300 rounded-md"
                                placeholder="Enter your Full Name"
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-gray-700">Bio</Text>
                            <TextInput
                                value={formData.bio}
                                onChangeText={(value) => handleChange('bio', value)}
                                className="p-2 border border-gray-300 rounded-md"
                                placeholder="Enter your Bio"
                                multiline
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-gray-700">City</Text>
                            <TextInput
                                value={formData.address.city}
                                onChangeText={(value) => handleAddressChange('city', value)}
                                className="p-2 border border-gray-300 rounded-md"
                                placeholder="Enter your City"
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-gray-700">Street</Text>
                            <TextInput
                                value={formData.address.street}
                                onChangeText={(value) => handleAddressChange('street', value)}
                                className="p-2 border border-gray-300 rounded-md"
                                placeholder="Enter your Street"
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-gray-700">Country</Text>
                            <TextInput
                                value={formData.address.country}
                                onChangeText={(value) => handleAddressChange('country', value)}
                                className="p-2 border border-gray-300 rounded-md"
                                placeholder="Enter your Country"
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-gray-700">Contact</Text>
                            <TextInput
                                value={formData.contact}
                                onChangeText={(value) => handleChange('contact', value)}
                                className="p-2 border border-gray-300 rounded-md"
                                placeholder="Enter your Contact"
                            />
                        </View>
                        <Button title="Update Profile" onPress={handleSubmit} color="#1E40AF" />
                    </ScrollView>
                ) : (
                    <ScrollView className="space-y-4">

                        <ProfileDetail label="Name" value={user.fullName} />

                        <ProfileDetail label="Email" value={user.email} />
                        <ProfileDetail label="Contact" value={user.contact} />
                        <ProfileDetail label="Country" value={user.address?.country} />
                        <ProfileDetail label="City" value={user.address?.city} />
                        <View>
                            <Text className="font-medium mb-2 mt-[-15px]">Address:</Text>
                            <View className="bg-red-200 p-2 rounded-lg">
                                <Text className="text-lg font-semibold">{user.address?.street}</Text>
                            </View>
                            <Text className="text-sm text-red-500">* Kindly fill the details carefully as this info will be used automatically by the system for shipping</Text>
                        </View>

                        <View className="h-[55px]"></View>
                    </ScrollView>
                )}
                <View className="flex-row space-x-4 mt-4">
                    <Button title={isEditing ? "Cancel" : "Edit Profile"} onPress={() => setIsEditing(!isEditing)} color="#3B82F6" />
                    <Button title="Order History" onPress={handleSeeOrders} color="#047857" />
                </View>
            </View>
            <View className="flex-1">
                <Button title="Logout" onPress={handleLogout} color="#EF4444" />
                {/* Replace <ShowOrders /> with appropriate component for orders tracking */}
                <Text className="mt-4">Order History Component Placeholder</Text>
            </View>
            <View className="h-[55px]"></View>
        </View>
    );
};

export default Profile;
