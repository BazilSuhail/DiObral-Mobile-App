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

    const [visibleModalOrderId, setVisibleModalOrderId] = useState(null);

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

    useEffect(() => {
        const fetchTokenAndUserId = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const decodedToken = parseJwt(token);
                if (decodedToken) {
                    setUserId(decodedToken.id);
                }
            }
            catch (error) {
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
            }
            catch (error) {
                console.error('Error fetching orders:', error);
            }
            finally {
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
                    <TouchableOpacity onPress={() => setVisibleModalOrderId(singleOrder._id)} key={singleOrder._id} className="border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow-md">
                        <View className="flex-row items-center justify-between mb-2">
                            <View className='flex-row items-center'>
                                <Text className='font-[600] text-[12px] mr-[3px] text-yellow-700'>
                                    Placed:
                                </Text>
                                <Text className="text-[12px] font-bold text-yellow-800 bg-yellow-100 border border-yellow-400 px-[8px] rounded-lg">
                                    {Math.floor((new Date() - new Date(singleOrder.orderDate)) / (1000 * 60 * 60 * 24)) === 0
                                        ? " Today"
                                        : ` ${Math.floor((new Date() - new Date(singleOrder.orderDate)) / (1000 * 60 * 60 * 24))} days ago`}
                                </Text>
                            </View>
                            <Text className="text-[13px] font-bold text-red-600 underline">
                                {new Date(singleOrder.orderDate).toLocaleDateString()}
                            </Text>
                        </View>

<View className='h-[2.5px] mb-[8px] w-full mx-auto bg-gray-200 rounded-xl'></View>
                        <View className='flex-row items-center justify-between'>
                            <View>
                                <Text className="text-[12px] font-bold text-gray-400">Items Ordered:</Text>
                                <Text className="text-[14px] font-bold text-red-700">{singleOrder.items.length}</Text>
                            </View>

                            <View>
                                <Text className="text-[12px] font-bold text-gray-400">Checkout:</Text>
                                <Text className="text-[14px] font-bold text-blue-700"><Text className='text-[11px]'>Rs. </Text>{singleOrder.total ? singleOrder.total.toFixed(2) : 'N/A'}</Text>
                            </View>
                        </View>
{/* 

                        <Button title="Show Order Details" onPress={() => setVisibleModalOrderId(singleOrder._id)} />

*/}
                        <OrderDetailsModal
                            singleOrder={singleOrder}
                            modalVisible={visibleModalOrderId === singleOrder._id}
                            setModalVisible={(isVisible) => setVisibleModalOrderId(isVisible ? singleOrder._id : null)}
                        />
                    </TouchableOpacity>
                ))
            ))}
        </ScrollView>
    );
};

export default ShowOrders;
