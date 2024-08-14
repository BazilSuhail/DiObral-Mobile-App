import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const ShowOrders = () => {
    const [orders, setOrders] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchingOrders, setFetchingOrders] = useState(false);
    const REACT_APP_API_BASE_URL = "http://10.0.2.2:3001";

    // Function to decode JWT token
    const parseJwt = (token) => {
        try {
            if (!token || typeof token !== 'string') return null;
            const [header, payload] = token.split('.');
            if (!payload) return null;
            const base64Url = payload.replace(/-/g, '+').replace(/_/g, '/');
            const base64 = base64Url + (base64Url.length % 4 === 0 ? '' : '='.repeat(4 - (base64Url.length % 4)));
            const decodedPayload = atob(base64);
            return JSON.parse(decodedPayload);
        } catch (error) {
            console.error('Error parsing JWT:', error);
            return null;
        }
    };

    // Get user ID from token when component mounts
    useEffect(() => {
        const fetchTokenAndUserId = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const decodedToken = parseJwt(token);
                if (decodedToken) {
                    setUserId(decodedToken.id); // Adjust according to your JWT structure
                }
            } catch (error) {
                console.error('Error fetching token:', error);
            }
        };

        fetchTokenAndUserId();
    }, []);

    // Fetch orders once userId is set
    useEffect(() => {
        const fetchOrders = async () => {
            if (!userId || fetchingOrders) return;
            setFetchingOrders(true);

            try {
                const response = await axios.get(`${REACT_APP_API_BASE_URL}/place-order/orders/${userId}`);
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userId, fetchingOrders]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!Array.isArray(orders) || !orders.length) {
        return <Text className="text-center text-lg font-bold mt-4">No orders found</Text>;
    }

    return (
        <ScrollView className="p-4">
            <Text className="text-2xl font-bold text-red-900 mb-4">Orders Placed</Text>
            {orders.map(order => (
                order.orders.map(singleOrder => (
                    <View key={singleOrder._id} className="border border-gray-400 rounded-lg p-4 mb-4 bg-white shadow-md">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-md font-bold text-yellow-800 bg-yellow-100 border border-yellow-400 px-3 py-1 rounded-lg">
                                <FontAwesome name="calendar" size={16} color="#FFD700" />
                                Days Passed: {Math.floor((new Date() - new Date(singleOrder.orderDate)) / (1000 * 60 * 60 * 24))} days
                            </Text>
                            <Text className="text-lg font-bold text-white bg-red-700 px-3 py-1 rounded-lg">
                                <FontAwesome name="clock-o" size={16} color="#fff" />
                                Order Date: {new Date(singleOrder.orderDate).toLocaleDateString()}
                            </Text>
                        </View>

                        <Text className="text-md font-bold text-green-800 bg-green-200 border border-green-800 px-3 py-1 rounded-lg mb-2">
                            Bill Checkout: <Text className="text-xl">${singleOrder.total ? singleOrder.total.toFixed(2) : 'N/A'}</Text>
                        </Text>

                        <View className="border-t border-gray-500 pt-2">
                            {singleOrder.items.map(item => (
                                <View key={item._id} className="flex-row justify-between mb-2">
                                    <View>
                                        <View className="flex-row items-center mb-2">
                                            <View className="w-3 h-3 rounded-full bg-red-800 mr-2" />
                                            <Text className="text-xl font-bold underline">{item.name}</Text>
                                        </View>
                                        <Text className="text-md font-bold text-black">
                                            <Text className="font-semibold text-red-900">Quantity:</Text> {item.quantity}
                                        </Text>
                                        <Text className="text-md font-bold text-black">
                                            <Text className="font-semibold text-red-900">Selected Size:</Text> {item.size}
                                        </Text>
                                        <Text className="text-md font-bold text-black">
                                            <Text className="font-semibold text-red-900">Price:</Text> ${item.price ? item.price.toFixed(2) : 'N/A'}
                                        </Text>
                                        <Text className="text-md font-bold text-black">
                                            <Text className="font-semibold text-red-900">Discounted Price through Sale/Coupons:</Text> ${item.discountedPrice ? item.discountedPrice.toFixed(2) : 'N/A'}
                                        </Text>
                                    </View>
                                    <Text className="text-lg font-bold text-red-800 bg-red-100 border border-red-700 px-3 py-1 rounded-xl">
                                        ${item.discountedPrice && item.quantity
                                            ? (item.discountedPrice * item.quantity).toFixed(2)
                                            : 'N/A'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))
            ))}
        </ScrollView>
    );
};

export default ShowOrders;
