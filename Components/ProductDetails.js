import React, { useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';

const MediaCarousel = ({ mainImage, otherImages, onImageChange }) => {
  const [activeMedia, setActiveMedia] = useState(mainImage);

  const handleMediaClick = (mediaUrl) => {
    setActiveMedia(mediaUrl);
    onImageChange(mediaUrl);
  };

  return (
      <View className="flex">
          
      <View className="h-[320px] w-[290px] mx-auto mb-[25px] rounded-lg">
        <Image source={{ uri: activeMedia }} className="w-full h-full rounded-lg" />
          </View>
          
      <ScrollView horizontal className="mb-[25px]">
        <TouchableOpacity onPress={() => handleMediaClick(mainImage)}>
          <Image source={{ uri: mainImage }} className={`w-[140px] h-[150px] mx-1 rounded-lg border-2 ${activeMedia === mainImage ? 'border-blue-500' : 'border-gray-300'}`} />
        </TouchableOpacity>
        {otherImages.map((image, index) => (
          <TouchableOpacity key={index} onPress={() => handleMediaClick(image)}>
            <Image source={{ uri: image }} className={`w-[140px] h-[150px] mx-1 rounded-lg border-2 ${activeMedia === image ? 'border-blue-500' : 'border-gray-300'}`} />
          </TouchableOpacity>
        ))}
      </ScrollView>

    </View>
  );
};

const ProductDetails = () => {
  const route = useRoute();
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const REACT_APP_API_BASE_URL = "http://10.0.2.2:3001";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_BASE_URL}/fetchproducts/products/${id}`);
        setProduct(response.data);
        if (response.data.size.length > 0) {
          setSelectedSize(response.data.size[0]);
        }
        setActiveImage(`${REACT_APP_API_BASE_URL}/uploads/${response.data.image}`);
      } catch (error) {
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

  if (!product) return <Text>Loading...</Text>;

  const discountedPrice = product.sale
    ? (product.price - (product.price * product.sale) / 100).toFixed(2)
    : product.price.toFixed(2);

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 18 }}>
      <View className="flex justify-between px-2">
        <View className="flex-1">
          <MediaCarousel
            mainImage={`${REACT_APP_API_BASE_URL}/uploads/${product.image}`}
            otherImages={product.otherImages.map(image => `${REACT_APP_API_BASE_URL}/uploads/${image}`)}
            onImageChange={setActiveImage}
          />
        </View>

        <View className="flex-1 px-4">
          <Text className="bg-red-500 text-white py-1 px-2 rounded text-center text-lg font-bold">
            Sale: <Text className="font-extrabold text-xl">{product.sale}%</Text> OFF
          </Text>

          <Text className="text-2xl font-bold my-3">{product.name}</Text>

          <View className="flex-row items-center">
            <Text className="bg-gray-500 text-white py-1 px-2 rounded">{product.category}</Text>
            <Text className="text-lg font-bold underline ml-3">{product.subcategory}</Text>
          </View>

          <View className="my-2">
            <Text className="text-lg font-medium mb-2">Available Sizes:</Text>
            <View className="flex-row flex-wrap">
              {product.size.map((size, index) => (
                <TouchableOpacity
                  key={index}
                  className={`py-2 px-4 mx-1 border rounded-lg ${selectedSize === size ? 'bg-red-500' : 'bg-gray-300'}`}
                  onPress={() => handleSizeClick(size)}
                >
                  <Text className={`text-lg font-bold ${selectedSize === size ? 'text-white' : 'text-black'}`}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text className="text-lg my-2">Available Stock: <Text className="text-xl font-bold text-red-500">{product.stock}</Text></Text>

          <Text className="text-xl my-4">
            {product.sale && <Text className="line-through text-red-500">${product.price.toFixed(2)}</Text>}
            ${discountedPrice}
          </Text>

          <Text className="text-lg mb-2">Quantity</Text>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleDecreaseQuantity} className="bg-gray-300 p-2 rounded">
              <Text className="text-xl font-bold">-</Text>
            </TouchableOpacity>
            <Text className="text-xl mx-4">{quantity}</Text>
            <TouchableOpacity onPress={handleIncreaseQuantity} className="bg-gray-300 p-2 rounded">
              <Text className="text-xl font-bold">+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleAddToCart} className="bg-red-500 py-3 rounded mt-4">
            <Text className="text-center text-white text-lg font-bold">Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 my-4">
        <Text className="text-lg font-bold mb-2">Product Description:</Text>
        <Text>{product.description}</Text>
      </View>

      <View className="px-4 my-4">
        <Text className="text-lg font-bold mb-2">Reviews</Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-gray-500 rounded-full"></View>
          <View className="flex-1 h-px bg-gray-500 mx-2"></View>
          <View className="w-2 h-2 bg-gray-500 rounded-full"></View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductDetails;
