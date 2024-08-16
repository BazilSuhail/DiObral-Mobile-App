import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { clearCart } from '../redux/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons'; // Importing the necessary vector icons from Expo
import REACT_APP_API_BASE_URL from '../Config/Config';

const CustomModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={isOpen}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="w-4/5 p-5 bg-white rounded-lg items-center">
                    <Text className="text-lg font-bold mb-4">Confirm Order</Text>
                    <Text className="text-base mb-6 text-center">
                        Are you sure you want to place this order?
                    </Text>
                    <View className="flex-row justify-between w-full">
                        <TouchableOpacity
                            onPress={onConfirm}
                            className="px-5 py-2 bg-green-600 rounded-md"
                        >
                            <Text className="text-white font-bold text-center">
                                Confirm
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onClose}
                            className="px-5 py-2 bg-red-600 rounded-md"
                        >
                            <Text className="text-white font-bold text-center">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const OrderList = () => {
    const cart = useSelector(state => state.cart);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [products, setProducts] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); 

    const parseJwt = (token) => {
        console.log(token);
        try {

            if (!token || typeof token !== 'string') return null;
            const [header, payload, signature] = token.split('.');
            if (!payload) return null;
            // Decode the base64 URL encoded payload
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
                if (token) {
                    const user = parseJwt(token);
                    setUserId(user.id);
                } else {
                    console.log('No token found');
                }
            } catch (error) {
                console.error('Error fetching token:', error);
            }
        };

        fetchTokenAndUserId();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productResponses = await Promise.all(
                    cart.map(item => axios.get(`${REACT_APP_API_BASE_URL}/fetchproducts/products/${item.id}`))
                );
                setProducts(productResponses.map(response => response.data));
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, [cart]);

    const handleConfirmOrder = async () => {
        if (!userId) {
            Alert.alert('User not logged in');
            return;
        }

        const order = {
            items: cart.map(item => {
                const product = products.find(p => p._id === item.id);
                const discountedPrice = product?.sale
                    ? product.price - (product.price * product.sale) / 100
                    : product.price;
                return {
                    name: product?.name || 'Unknown Product',
                    price: product?.price || 0,
                    size: item?.size || 'No size Selected',
                    discountedPrice: discountedPrice || 0,
                    quantity: item.quantity
                };
            }),
            orderDate: new Date().toISOString(),
            total: calculateTotalBill()
        };
        console.log(userId);

        try {
            await axios.post(`${REACT_APP_API_BASE_URL}/place-order/orders/${userId}`, order);
            Alert.alert('Order confirmed!');
            dispatch(clearCart());

            await axios.post(`${REACT_APP_API_BASE_URL}/cartState/cart/save`, { userId, items: [] });
            //navigation.navigate('Cart');
            navigation.goBack();
        } catch (error) {
            console.error('Error confirming order:', error);
            Alert.alert('Failed to confirm order.');
        }
    };

    const calculateActualTotalBill = () => {
        return cart.reduce((total, item) => {
            const product = products.find(p => p._id === item.id);
            if (product) {
                return total + (product.price * item.quantity);
            }
            return total;
        }, 0).toFixed(2);
    };

    const calculateTotalBill = () => {
        return cart.reduce((total, item) => {
            const product = products.find(p => p._id === item.id);
            if (product) {
                const discountedPrice = product.sale
                    ? product.price - (product.price * product.sale) / 100
                    : product.price;
                return total + (discountedPrice * item.quantity);
            }
            return total;
        }, 0).toFixed(2);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    if (!cart.length) return <Text>Your cart is empty</Text>;

    return (
        <ScrollView className='pt-[50px] bg-gray-200 px-3'>

            <View className="flex-row mb-1 items-center ">
                <Feather name="file-text" size={24} color="#706700" />
                <Text className="text-2xl ml-[2px] font-bold"> Final Invoice</Text>
            </View>
            <View className="bg-gray-300 mb-3 w-full h-[3px]"></View>

            <View className='flex p-[15px] bg-gray-50 border border-gray-400 mb-[15px] rounded-xl flex-col'>

                <Text className='text-2xl font-bold'>Checkout</Text>
                <View className='border-b border-t border-gray-400 text-[17px] font-semibold'>
                    <View className='flex-row  items-center mt-[15px] justify-between'>
                        <View className='flex-row items-center'>
                            <FontAwesome name="dollar" size={18} color="green" /><Text className="ml-[8px] text-[12px]">Your Cart Subtotal:</Text>
                        </View>
                        <Text className='pr-[8px] text-[19px] font-bold'><Text className='text-gray-600 text-[15px]'>Rs.</Text>{calculateActualTotalBill()}</Text>
                    </View>

                    <View className='flex-row items-center mt-[8px] justify-between'>
                        <View className='flex-row items-center'>
                            <FontAwesome name="gift" size={20} color="blue" /><Text className="ml-[8px] text-[12px]">Discount Through Applied Sales:</Text>
                        </View>
                        <Text className='pr-[8px] text-[19px] font-bold'><Text className='text-gray-600 text-[15px]'>Rs.</Text>{calculateTotalBill()}</Text>
                    </View>

                    <View className='flex-row my-[8px] justify-between'>
                        <View className='flex-row items-center'>
                            <FontAwesome name="truck" size={20} color="red" /><Text className="ml-[8px] text-[12px]">Delivery Charges (*On Delivery):</Text>
                        </View>
                        <Text className='pr-[8px] text-[19px] font-bold'><Text className='text-gray-600 text-[15px]'>Rs.</Text>200</Text>
                    </View>
                </View>

                <View className='flex-row items-center mt-[15px] py-2 justify-between'>
                    <View className="flex-row items-end">
                        <Text className='text-lg text-gray-500 font-semibold '>Rs.</Text><Text className='text-[28px] font-bold '>{calculateTotalBill()}</Text>
                    </View>
                    <TouchableOpacity onPress={openModal}
                        className="text-[20px] font-bold py-[5px] rounded-2xl px-[25px] bg-green-700"
                    >
                        <Text className="text-white text-lg font-bold">Place Order</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1">
                {cart.map(item => {
                    const product = products.find(p => p._id === item.id);
                    if (!product) return null;

                    const discountedPrice = product.sale
                        ? product.price - (product.price * product.sale) / 100
                        : product.price;

                    return (
                        <View key={item.id} className="bg-white py-3 px-5 mb-[15px] rounded-lg ">
                            <View className='flex-row items-center my-[8px]'>
                                <View className='w-[12px] ml-[4px] h-[12px] rounded-full mr-[6px] bg-red-800 '></View>
                                <Text className="text-xl xsx:text-2xl mb-[2px] underline font-bold">{product.name || 'Unknown Product'}</Text>
                            </View>

                            <Text className="text-md font-bold text-black">
                                <Text className='font-semibold text-red-900 mr-[5px]'>Quantity:</Text>  {item.quantity}
                            </Text>

                            <Text className="text-md font-bold text-black">
                                <Text className='font-semibold text-red-900 mr-[5px]'>Selected Size:</Text>  {item.size}
                            </Text>

                            <Text className="text-md font-bold text-black">
                                <Text className='font-semibold text-red-900 mr-[5px]'>Actual Price:</Text>${product.price.toFixed(2)}
                            </Text>

                            <Text className="text-md font-bold text-black">
                                <Text className='font-semibold text-red-900 mr-[5px]'>Discounted Price through Sales:</Text>${discountedPrice.toFixed(2)}
                            </Text>

                            <View className="w-full h-[3px] mt-[10px] bg-gray-300"></View>

                            <View className='flex-row mt-[10px] justify-between'>
                                <Text className="text-[16px] h-[23px] my-auto text-center text-red-50 bg-red-800 font-bold rounded-md px-[15px]">Total Price:</Text>
                                <Text className="text-[17px] text-red-800 bg-red-100 h-[26px] font-bold rounded-md border border-red-400 px-[15px]"><Text className='mr-[4px]'>Rs.</Text>{(discountedPrice * item.quantity).toFixed(2)}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            <CustomModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={() => {
                    closeModal();
                    handleConfirmOrder();
                }}
            />
            <View className="h-[55px]"></View>
        </ScrollView>
    );
};

export default OrderList;

