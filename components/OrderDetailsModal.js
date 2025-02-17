import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const OrderDetailsModal = ({ singleOrder, modalVisible, setModalVisible }) => {
    return (
        <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            <View className="flex-1 justify-center items-center bg-black/50 py-[65px]">
                <View className="w-[90%] bg-white rounded-lg p-4">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-[19px] font-bold text-black">Order Details</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <AntDesign name="closecircle" size={19} color="red" />
                        </TouchableOpacity>
                    </View>

                    {/* Order Items */}
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="border-t border-gray-500 pt-2">
                            {singleOrder.items.map((item) => (
                                <View key={`${item._id}-${item.size}`} className="flex justify-between my-2">

                                    <View className="flex-row items-center mb-2">
                                        <Text className="text-[16px] font-bold">{item.name}</Text>
                                    </View>
                                    <Text className="text-[12px] font-bold text-black">
                                        <Text className="font-semibold text-red-900">Quantity:</Text> {item.quantity}
                                    </Text>
                                    <Text className="text-[12px] font-bold text-black">
                                        <Text className="font-semibold text-red-900">Selected Size:</Text> {item.size}
                                    </Text>
                                    <Text className="text-[12px] font-bold text-black">
                                        <Text className="font-semibold text-red-900">Price:</Text> ${item.price ? item.price.toFixed(2) : 'N/A'}
                                    </Text>
                                    <Text className="text-[12px] font-bold text-black">
                                        <Text className="font-semibold text-red-900">Discounted Price:</Text> ${item.discountedPrice ? item.discountedPrice.toFixed(2) : 'N/A'}
                                    </Text>

                                    <View className="w-full h-[2px] mt-[8px] bg-gray-300"></View>

                                    <View className='flex-row mt-[8px] justify-between'>
                                        <Text className="text-[13px] text-center text-red-700 font-bold rounded-md">Total:</Text>
                                        <Text className="text-[13px] text-red-800 bg-red-50 font-bold rounded-md border border-red-300 px-[10px]">
                                            <Text className='mr-[4px]'>Rs.</Text>
                                            {item.discountedPrice && item.quantity ? (item.discountedPrice * item.quantity).toFixed(2) : 'N/A'}
                                        </Text>
                                    </View>

                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default OrderDetailsModal;
