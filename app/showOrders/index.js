import { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Button, Image, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import config from '@/Config/Config';
import { useRouter } from 'expo-router';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import noOrder from '@/assets/noOrder.jpg';

const ShowOrders = () => {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchingOrders, setFetchingOrders] = useState(false);

    const [visibleModalOrderId, setVisibleModalOrderId] = useState(null); // Track which modal to show

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
                const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/place-order/orders/${userId}`);
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
        return (
            <View className='bg-white pt-[28px]'>
                <Text className="mx-auto mt-4 w-[92%] text-[18px] mb-1 text-red-800 font-bold">Order History</Text>
                <View className="bg-gray-300 mb-3 w-[92%] h-[3px] mx-auto"></View>

                <View className=" flex h-screen w-screen justify-center items-center">
                    <Image
                        source={noOrder}
                        className="h-[200px] w-[200px] mt-[-95px]"
                    />
                    <Text className='text-[12px] text-red-900 mt-[6px] font-[600]'>You haven't ordered anything</Text>
                    <Pressable onPress={() => router.push(`/productlist`)}>
                        <Text className='text-[14px] mt-[2px] font-[800] underline text-red-600'>Order Now !!</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <ScrollView className="pt-[48px] px-4">
            <View className="flex-row mb-1 items-center ">
                <TouchableOpacity
                    onPress={() => router.push('/profile')}
                    className="flex justify-center items-center"
                >
                    <Ionicons name="arrow-back" size={22} color="black" />
                </TouchableOpacity>
                <Text className="text-[18px] ml-[2px] font-bold"> Placed Orders</Text>
            </View>

            <View className="bg-gray-300 mb-3 w-full h-[3px]"></View>

            {orders.map(order => (
                order.orders.map(singleOrder => (
                    <View key={singleOrder._id} className="border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow-md">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-[13px] font-bold text-yellow-800 bg-yellow-100 border border-yellow-400 px-3 py-[2px] rounded-lg">
                                Placed:
                                {Math.floor((new Date() - new Date(singleOrder.orderDate)) / (1000 * 60 * 60 * 24)) === 0
                                    ? " Today"
                                    : ` ${Math.floor((new Date() - new Date(singleOrder.orderDate)) / (1000 * 60 * 60 * 24))} days ago`}
                            </Text>

                            <Text className="text-[13px] font-bold text-red-600 underline">
                                {new Date(singleOrder.orderDate).toLocaleDateString()}
                            </Text>
                        </View>

                        <View className="flex-row items-center justify-between mb-[8px]">
                            <Text className="text-[11px] font-bold text-blue-600">Bill Checkout:</Text>
                            <Text className="text-[13px] px-2 rounded-md py-[2px] font-bold text-blue-100 bg-blue-800">
                                <Text className='text-[10px]'>Rs.</Text> {singleOrder.total ? singleOrder.total.toFixed(2) : 'N/A'}
                            </Text>
                        </View>

                        <View className="flex-row items-center justify-between">
                            <Text className="text-[11px] font-bold text-blue-500">Items Ordered:</Text>
                            <Text className="text-[14px] font-bold text-blue-500">{singleOrder.items.length}</Text>
                        </View>

                        <Button title="Show Order Details" onPress={() => setVisibleModalOrderId(singleOrder._id)} />

                        <OrderDetailsModal
                            singleOrder={singleOrder}
                            modalVisible={visibleModalOrderId === singleOrder._id} // Check if this order's modal should be visible
                            setModalVisible={(isVisible) => setVisibleModalOrderId(isVisible ? singleOrder._id : null)} // Close modal
                        />

                        {/*
                        <View className="border-t border-gray-500 pt-2">
                            {singleOrder.items.map(item => (
                                <View key={`${item._id}-${item.size}`} className="flex justify-between mb-2">
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
                                    <View className="flex-row items-center justify-between mt-[8px] bg-gray-200 border-t border-b border-gray-400 px-2 py-[8px]">
                                        <Text className="text-[17px] font-bold text-red-800">Total:</Text>
                                        <Text className="text-[17px] font-bold text-red-800">
                                            Rs. {item.discountedPrice && item.quantity
                                                ? (item.discountedPrice * item.quantity).toFixed(2)
                                                : 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                        */}
                    </View>
                ))
            ))}
        </ScrollView>
    );
};

export default ShowOrders;
