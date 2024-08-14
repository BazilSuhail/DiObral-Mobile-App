import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { clearCart } from '../redux/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons'; // Importing the necessary vector icons from Expo

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
    const REACT_APP_API_BASE_URL = "http://10.0.2.2:3001";

    const parseJwt = (token) => {
        console.log(token);
        try {

            if (!token || typeof token !== 'string') return null;

            // Split the token into header, payload, and signature
            const [header, payload, signature] = token.split('.');
            if (!payload) return null;

            // Decode the base64 URL encoded payload
            const base64Url = payload.replace(/-/g, '+').replace(/_/g, '/');
            const base64 = base64Url + (base64Url.length % 4 === 0 ? '' : '='.repeat(4 - (base64Url.length % 4)));
            const decodedPayload = atob(base64);

            // Convert to a JSON object
            //console.log(decodedPayload);

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
        <ScrollView className='xsx:w-[70%] flex flex-col xl:w-[60%] mx-auto'>
            <Text className="text-4xl flex items-center mx-auto text-red-900 underline underline-offset-4 mt-[15px] text-center font-bold">
                <Feather name="file-text" size={24} className='mt-[8px] mr-[5px]' />
                Final Invoice
            </Text>

            <View className='flex border shadow-custom-card mt-[25px] p-[15px] rounded-xl flex-col'>
                <Text className='text-2xl font-bold'>Checkout</Text>
                <View className='border-b border-t border-gray-400 text-[17px] font-semibold'>
                    <View className='flex mt-[15px] justify-between'>
                        <Text className='flex items-center'>
                            <FontAwesome name="dollar" size={24} className='text-green-600' />Your Cart Subtotal:
                        </Text>
                        <Text className='px-[8px] text-xl rounded-xl'><Text className='text-lg'>Rs.</Text>{calculateTotalBill()}</Text>
                    </View>
                    <View className='flex mt-[8px] justify-between'>
                        <Text className='flex items-center'>
                            <FontAwesome name="gift" size={24} className='text-blue-600 mr-2' />Discount Through Applied Sales:
                        </Text>
                        <Text className='px-[8px] text-xl rounded-xl'><Text className='text-lg'>Rs.</Text>{calculateActualTotalBill()}</Text>
                    </View>
                    <View className='flex my-[8px] justify-between'>
                        <Text className='flex items-center'>
                            <FontAwesome name="truck" size={24} className='text-red-600 mr-2' />Delivery Charges (*On Delivery):
                        </Text>
                        <Text className='px-[8px] text-xl rounded-xl'><Text className='text-lg'>Rs.</Text>200</Text>
                    </View>
                </View>

                <View className='flex justify-between'>
                    <Text className='px-[8px] text-4xl mt-[10px] font-bold rounded-xl'>
                        <Text className='text-xl font-medium mr-[3px]'>Rs.</Text>{calculateTotalBill()}
                    </Text>
                    <TouchableOpacity
                        onPress={openModal}
                        className="border-2 text-[20px] font-bold mt-[15px] py-[5px] hover:bg-white hover:bg-gradient-to-tl hover:scale-95 transition duration-300 bg-gradient-to-tr from-red-500 via-red-950 to-red-500  border-red-700 rounded-2xl px-[25px] text-red-50"
                    >
                        <Text>Place Order</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="mt-4 md:px-0 px-[8px]">
                {cart.map(item => {
                    const product = products.find(p => p._id === item.id);
                    if (!product) return null;

                    const discountedPrice = product.sale
                        ? product.price - (product.price * product.sale) / 100
                        : product.price;

                    return (
                        <View key={item.id} className="border flex flex-col bg-custom-light-red border-gray-400 rounded-lg p-4 mb-4">
                            <View className="ml-4 flex-1">
                                <View className='flex items-center mt-[8px]'>
                                    <View className='w-[12px] ml-[4px] h-[12px] rounded-full mr-[6px] bg-red-800 '></View>
                                    <Text className="text-xl xsx:text-2xl mb-[2px] underline font-bold">{product.name || 'Unknown Product'}</Text>
                                </View>

                                <Text className="text-md ml-[20px] font-bold text-black">
                                    <Text className='font-semibold text-red-900 mr-[5px]'>Quantity:</Text>  {item.quantity}
                                </Text>

                                <Text className="text-md ml-[20px] font-bold text-black">
                                    <Text className='font-semibold text-red-900 mr-[5px]'>Selected Size:</Text>  {item.size}
                                </Text>

                                <Text className="text-md ml-[20px] font-bold text-black">
                                    <Text className='font-semibold text-red-900 mr-[5px]'>Actual Price:</Text>${product.price.toFixed(2)}
                                </Text>

                                <Text className="text-md ml-[20px] font-bold text-black">
                                    <Text className='font-semibold text-red-900 mr-[5px]'>Discounted Price through Sales:</Text>${discountedPrice.toFixed(2)}
                                </Text>

                                <View className='flex justify-between'>
                                    <Text className="text-xl ml-[12px] text-red-400 underline font-bold rounded-md p-[5px]">Total Price:</Text>
                                    <Text className="text-2xl text-red-800 font-bold rounded-md p-[5px]"><Text className='text-lg mr-[4px]'>Rs.</Text>{(discountedPrice * item.quantity).toFixed(2)}</Text>
                                </View>
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
        </ScrollView>
    );
};

export default OrderList;

