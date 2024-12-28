import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '@/Config/Config';

const AddReview = ({ productId }) => {
    const [user, setUser] = useState(null);
    const [rating, setRating] = useState(1);
    const [review, setReview] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/auth/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(response.data);
                }
            } catch (error) { 
                setError('Failed to fetch user details');
            }
        };

        fetchUserDetails();
    }, []);

    const handleStarClick = (index) => {
        setRating(index + 1); // Set rating based on star index (1-based)
    };

    const handleSubmit = async () => {
        try {
            if (!user) {
                setError('User not found');
                return;
            }

            const reviewData = {
                productId,
                review: {
                    name: user.fullName,
                    email: user.email,
                    phone: user.contact,
                    date: new Date(),
                    rating,
                    description: review,
                },
            };

            const token = await AsyncStorage.getItem('token');
            
            await axios.post(`${config.REACT_APP_API_BASE_URL}/product-reviews/reviews`, reviewData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuccess('Review submitted successfully');
            setRating(1);
            setReview('');
            Alert.alert('Success', 'Review submitted successfully');
        } 
        catch (error) {
            setError('Failed to submit review');
            Alert.alert('Error', 'Failed to submit review');
        }
    };

    return (
        <View className="bg-white rounded-lg my-[15px] p-4">
            <Text className="text-[20px] text-red-800 font-bold mb-2">Submit Your Review</Text>
         
            <View className="flex-row items-center mb-4">
                <Text className="text-[15px] mb-[2px] text-red-400 mr-[8px] font-medium underline">Rating:</Text>
                <View className="flex-row">
                    {[...Array(5)].map((_, index) => (
                        <TouchableOpacity key={index} onPress={() => handleStarClick(index)}>
                            <FontAwesome
                                name="star"
                                size={23}
                                color={index < rating ? '#FFD700' : '#D3D3D3'}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TextInput
                value={review}
                onChangeText={setReview}
                placeholder="Write your review..."
                multiline
                className="px-3 border-2 border-gray-300 w-full py-[35px] pt-[8px] text-[16px] mb-[15px] font-medium rounded-md"
            />

            <TouchableOpacity onPress={handleSubmit} className="w-[130px] py-1 bg-red-900 rounded-md">
                <Text className="text-white text-center text-[16px]">Submit Review</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddReview;
