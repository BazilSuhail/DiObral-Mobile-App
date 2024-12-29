import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/hooks/cartSlice';

import { usePathname, useRouter } from 'expo-router/build/hooks';
import { View, Text, Image, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

import Loader from '@/components/Loader';
import ProductReviews from '@/components/ProductReviews';
import AddReview from '@/components/AddReview';
import config from '@/Config/Config';

const MediaCarousel = ({ mainImage, otherImages, onImageChange }) => {
    const router = useRouter();
    const [activeMedia, setActiveMedia] = useState(mainImage);

    const handleMediaClick = (mediaUrl) => {
        setActiveMedia(mediaUrl);
        onImageChange(mediaUrl);
    };

    return (
        <View>
            <View className="h-[460px] w-full mx-auto mb-[15px] rounded-lg">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white w-[32px] flex justify-center items-center h-[32px] rounded-lg absolute z-10 top-[8px] left-[8px]"
                >
                    <Ionicons name="arrow-back" size={22} color="red" />
                </TouchableOpacity>
                <Image source={{ uri: activeMedia }} className="w-full h-full rounded-lg" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity onPress={() => handleMediaClick(mainImage)}>
                    <Image source={{ uri: mainImage }} className={`w-[70px] h-[80px] mx-1 border-2 ${activeMedia === mainImage ? 'border-blue-500' : 'border-gray-300'}`} />
                </TouchableOpacity>
                {otherImages.map((image, index) => (
                    <TouchableOpacity key={index} onPress={() => handleMediaClick(image)}>
                        <Image source={{ uri: image }} className={`w-[70px] h-[80px] bg-white mx-1 rounded-lg border-2 ${activeMedia === image ? 'border-blue-500' : 'border-gray-300'}`} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const ProductDetails = () => {
    const pathname = usePathname();
    const id = pathname.split("/").pop();
    //console.log("Product Id: "+ id)
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    console.log("Is Logged In: " + isLoggedIn)
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [averageRating, setAverageRating] = useState(null);
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAverageRating = async () => {
            try {
                const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/product-reviews/reviews/average/${id}`);
                setAverageRating(response.data.averageRating);
                //console.log(averageRating)
            }
            catch (error) {
                //console.error('Error fetching Product Reviews:', error);
                setAverageRating(0);
            }
        };

        fetchAverageRating();
    }, [id]);


    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/fetchproducts/products/${id}`);
                setProduct(response.data);
                if (response.data.size.length > 0) {
                    setSelectedSize(response.data.size[0]);
                }
                setActiveImage(`${config.REACT_APP_API_BASE_URL}/uploads/${response.data.image}`);
            }
            catch (error) {
                console.error('Error fetching product:', error);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            dispatch(addToCart({ id: product._id, quantity, size: selectedSize }));
        }
    };

    const handleIncreaseQuantity = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    const handleDecreaseQuantity = () => {
        setQuantity(prevQuantity => (prevQuantity > 1 ? prevQuantity - 1 : 1));
    };

    const handleSizeClick = (size) => {
        setSelectedSize(size);
    };

    if (!product) return (
        <View className='h-screen flex items-center justify-center'>
            <Loader />
        </View>
    );

    const discountedPrice = product.sale
        ? (product.price - (product.price * product.sale) / 100).toFixed(2)
        : product.price.toFixed(2);

    return (
        <SafeAreaView className="bg-gray-200 pt-[36px]" >
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }} style={{ paddingHorizontal: 10 }}>
                <View className="flex-1 mt-[4px]">
                    <MediaCarousel
                        mainImage={`${config.REACT_APP_API_BASE_URL}/uploads/${product.image}`}
                        otherImages={product.otherImages.map(image => `${config.REACT_APP_API_BASE_URL}/uploads/${image}`)}
                        onImageChange={setActiveImage}
                    />
                </View>
                <View className="bg-gray-300 w-full h-[3px] mt-[12px] mb-[10px]"></View>

                <View className="px-3 rounded-xl py-3 bg-white">
                    <Text className="text-2xl font-bold mb-3">{product.name}</Text>
                    <View className="flex-row items-end justify-between">
                        <View className="flex-row items-end">
                            <Text className={`line-through text-[13px] ${product.sale === 0 ? '' : 'mr-[10px]'} font-medium text-red-600`}>{product.sale === 0 ? '' : product.sale && (`${product.price.toFixed(2)}`)}</Text>
                            <Text className="text-[22px] font-extrabold text-red-800 ">${discountedPrice}</Text>
                        </View>
                        <View className="bg-red-600 px-[8px] rounded-xl h-[23px]">
                            <Text className="text-center text-red-100 mt-[3px] text-[12px] font-bold"><Text className="font-extrabold text-white">{product.sale}%</Text> OFF</Text>
                        </View>
                    </View>
                </View>

                <View className="p-3 bg-white rounded-xl mt-[15px]">
                    <View className="mb-2">
                        <Text className="text-lg font-medium mb-2">Sizes:</Text>
                        <View className="flex-row flex-wrap">
                            {product.size.map((size, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className={`py-1 px-4 mx-1 rounded-lg ${selectedSize === size ? 'bg-red-700' : 'bg-gray-200'}`}
                                    onPress={() => handleSizeClick(size)}
                                >
                                    <Text className={`text-lg font-bold ${selectedSize === size ? 'text-white' : 'text-black'}`}>
                                        {size}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <View className="p-3 bg-white rounded-xl mt-[15px]">
                    <View className="flex-row justify-around items-center">
                        <Text className="font-semibold w-[110px] text-center text-gray-400">Stock</Text>
                        <Text className="font-semibold w-[110px] text-center text-gray-400">Category</Text>
                        <Text className="font-semibold w-[110px] text-center text-gray-400">Sub-Category</Text>
                    </View>
                    <View className="flex-row justify-around items-center">
                        <View className="w-[110px] "><Text className=" mx-auto text-center mt-[4px] py-[3px] text-[24px] font-extrabold w-[50px] text-red-800 rounded-lg text-white]">{product.stock}</Text></View>
                        <View className="w-[110px] "><Text className=" mx-auto text-center mt-[4px] py-[2px] text-md font-medium px-[12px] bg-red-100 border border-red-300 text-red-800 rounded-lg text-white]">{product.category}</Text></View>
                        <View className="w-[110px] "><Text className=" mx-auto text-center mt-[4px] py-[3px] text-[13px] font-bold text-red-800  text-white]">{product.subcategory}</Text></View>
                    </View>
                </View>

                <View className="p-3 bg-white rounded-xl mt-[15px]">
                    <Text className="text-lg text-gray-700 font-bold mb-2">Product Description:</Text>
                    <Text>{product.description}</Text>
                </View>

                <View className="bg-white flex-row justify-between items-center rounded-lg mt-[15px] py-3 px-2">
                    <View className="flex-row items-end">
                        <Text className="text-red-800 text-[17px] font-medium mr-[8px]">{parseFloat(averageRating)}</Text>
                        {Array.from({ length: 5 }, (_, index) => {
                            const fullStarThreshold = index + 1;
                            const starFillPercentage = Math.min(1, Math.max(0, averageRating - index));

                            return (
                                <View key={index} style={{ position: 'relative', width: 22, height: 22 }}>
                                    <FontAwesome
                                        name="star"
                                        size={22}
                                        color="#D3D3D3"
                                        style={{ position: 'absolute', top: 0, left: 0 }}
                                    />
                                    <FontAwesome
                                        name="star"
                                        size={22}
                                        color="#FFD700"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: `${starFillPercentage * 100}%`,
                                            overflow: 'hidden',
                                        }}
                                    />
                                </View>
                            );
                        })}
                    </View>

                    <View>
                        <Pressable
                            onPress={() => setIsReviewsOpen(true)}
                            className="px-3 py-1 flex-row items-center bg-red-800 rounded-lg"
                        >
                            <FontAwesome name="comments" size={18} color="white" /><Text className="text-white ml-[6px] text-[16px]">Reviews</Text>
                        </Pressable>
                    </View>
                </View>

                {isLoggedIn ? <AddReview productId={id} /> : <></>}
                {isReviewsOpen && (
                    <ProductReviews productId={id} onClose={() => setIsReviewsOpen(false)} />
                )}
                <View className="h-[34px]"></View>

            </ScrollView>

            {!isReviewsOpen && (
                <View className="h-[60px] bottom-0 right-0 left-0 absolute rounded-md bg-white mx-[10px]">
                    <View className="flex-row items-center h-full justify-between px-4">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={handleDecreaseQuantity} className="bg-red-700 w-[32px] flex justify-center items-center h-[32px] rounded-full">
                                <Text className="text-[28px] mt-[-8px] text-white">-</Text>
                            </TouchableOpacity>
                            <Text className="mx-[8px] px-[15px] bg-gray-200 py-[6px] rounded-lg text-lg font-bold">{quantity}</Text>
                            <TouchableOpacity onPress={handleIncreaseQuantity} className="bg-red-700 w-[32px] flex justify-center items-center h-[32px] rounded-full">
                                <Text className="text-[20px] mt-[-2px] text-white">+</Text>
                            </TouchableOpacity>
                        </View>
                        {isLoggedIn ?
                            <TouchableOpacity onPress={handleAddToCart} className="bg-red-500 px-[20px] py-[6px] rounded-lg">
                                <Text className="text-center text-white text-lg font-bold">Add to Cart</Text>
                            </TouchableOpacity>
                            :
                            <View className="bg-red-300 px-[22px] py-[6px] rounded-lg">
                                <Text className="text-center text-white text-[12px] font-bold">Login to</Text>
                                <Text className="text-center text-white text-[11px] font-bold">Begin Shopping</Text>
                            </View>
                        }

                    </View>
                </View>
            )}

        </SafeAreaView>
    );
};

export default ProductDetails;
