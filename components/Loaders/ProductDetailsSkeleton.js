import React, { useEffect, useRef } from 'react';
import { View, Animated, ScrollView } from 'react-native';

const ProductDetailsSkeleton = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const blink = () => {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 700, // 30% faster (700ms instead of 1000ms)
                    useNativeDriver: false,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 700, // 30% faster (700ms instead of 1000ms)
                    useNativeDriver: false,
                }),
            ]).start(() => blink()); // Loop the animation
        };

        blink();
    }, [fadeAnim]);

    const backgroundColor = fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgb(229, 229, 229)', 'rgb(243, 244, 246)'], // gray-200 to gray-100
    });

    return (
        <ScrollView showsVerticalScrollIndicator={false} className="w-full bg-white">
            <View className='p-[15px] overflow-hidden'>                
            <Animated.View style={{ backgroundColor }} className="h-[420px] rounded-md"></Animated.View>
            </View>

<View className='flex-row items-center px-[15px] overflow-hidden'>
<Animated.View style={{ backgroundColor }} className="h-[100px] w-[85px] mr-[5px] rounded-lg mb-[15px]"></Animated.View>
<Animated.View style={{ backgroundColor }} className="h-[100px] w-[85px] mx-[5px] rounded-lg mb-[15px]"></Animated.View>
<Animated.View style={{ backgroundColor }} className="h-[100px] w-[85px] mx-[5px] rounded-lg mb-[15px]"></Animated.View>
<Animated.View style={{ backgroundColor }} className="h-[100px] w-[85px] mx-[5px] rounded-lg mb-[15px]"></Animated.View>


</View>


            <Animated.View style={{ backgroundColor }} className="rounded-[8px] flex-row mb-[15px] items-center h-[50px] mx-[15px] pl-[15px]">
                <View className="h-[40px] w-[40px] rounded-full bg-gray-50"></View>
                <View className="ml-[15px] h-[25px] rounded-md w-[180px] bg-gray-50"></View>
            </Animated.View> 

            <Animated.View style={{ backgroundColor }} className="rounded-[10px] mx-[15px] mb-[15px] pt-[15px] flex pl-[15px] h-[180px]">
                <View className="h-[25px] rounded-md w-[100px] bg-gray-50"></View>
                <View className="h-[12px] rounded-md w-[180px] mt-[15px] bg-gray-50"></View>
                <View className="h-[8px] rounded-sm w-[180px] mt-[8px] bg-gray-50"></View>
                <View className="h-[15px] rounded-md mt-[25px] w-[100px] bg-gray-50"></View>
                <View className="h-[12px] rounded-md w-[180px] mt-[15px] bg-gray-50"></View>
                <View className="h-[8px] rounded-sm w-[180px] mt-[8px] bg-gray-50"></View>
            </Animated.View>

            <Animated.View style={{ backgroundColor }} className="rounded-[10px] mx-[15px] mb-[35px] pt-[15px] flex justify-center items-center h-[240px]">
                <View className="h-[55px] rounded-md w-[90%] bg-gray-50"></View>
                <View className="h-[12px] rounded-md w-[90%] mt-[15px] bg-gray-50"></View>
                <View className="h-[8px] rounded-sm w-[90%] mt-[8px] bg-gray-50"></View>
                <View className="h-[15px] rounded-md mt-[25px] w-[90%] bg-gray-50"></View>
                <View className="h-[12px] rounded-md w-[90%] mt-[15px] bg-gray-50"></View>
                <View className="h-[8px] rounded-sm w-[90%] mt-[8px] bg-gray-50"></View>
            </Animated.View>
        </ScrollView>
    );
};

export default ProductDetailsSkeleton