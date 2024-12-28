import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, clearCart, updateQuantity } from '@/hooks/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Entypo from '@expo/vector-icons/Entypo';
import { View, Text, Image, FlatList, Alert, TouchableOpacity } from 'react-native';
import config from '../../Config/Config';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CartItem = ({ id, size, quantity, onIncrease, onDecrease, onRemove }) => {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_BASE_URL}/fetchproducts/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return null;

  const discountedPrice = product.sale
    ? (product.price - (product.price * product.sale) / 100).toFixed(2)
    : product.price.toFixed(2);

  return (
    <View className="flex-row items-center h-[150px] justify-between rounded-xl px-2">
      <Image
        source={{ uri: `${config.REACT_APP_API_BASE_URL}/uploads/${product.image}` }} 
        className='w-[85px] h-[110px] border-2 border-gray-300 rounded-[22px]'
      />
      <View className="flex-1 mt-[10px] ml-4">
        <View className="flex-row h-[35px] justify-between">
          <View className="w-[200px] h-full">
            <Text className="text-[16px] font-bold underline">{product.name.slice(0,22)}{product.name.length > 25 && ' ...'}</Text>
          </View>
          <TouchableOpacity onPress={onRemove} className="w-[22px] text-red-950 flex justify-center items-center h-[22px] rounded-md">
            <Entypo name="cross" size={22} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center mb-2">
          <Text className="font-semibold text-red-950 mr-2">Selected Size:</Text>
          <Text className="font-bold px-2 bg-gray-500 text-[11px] text-white rounded-md">{size}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="py-1 rounded font-bold">$ {(discountedPrice * quantity).toFixed(2)}</Text>
          
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onDecrease} className="bg-gray-400 w-[20px] flex justify-center items-center h-[20px] rounded-[4px]">
              <Text className="text-[30px] mt-[-12px] text-white">-</Text>
            </TouchableOpacity>
            <Text className="mx-2 text-[16px] font-bold">{quantity}</Text>
            <TouchableOpacity onPress={onIncrease} className="bg-gray-400 w-[20px] flex justify-center items-center h-[20px] rounded-[4px]">
              <Text className="text-[18px] mt-[-3px] text-white">+</Text>
            </TouchableOpacity> 
          </View>
        </View>

        <View className="h-[3px] w-full mt-[8px] bg-gray-200 "></View>
      </View>
    </View>
  );
};

const Cart = () => {
  const router = useRouter();
  const cart = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);

  const parseJwt = (token) => {
    try {
      const [header, payload, signature] = token.split('.');
      const base64Url = payload.replace(/-/g, '+').replace(/_/g, '/');
      const base64 = base64Url + (base64Url.length % 4 === 0 ? '' : '='.repeat(4 - (base64Url.length % 4)));
      const decodedPayload = atob(base64);
      return JSON.parse(decodedPayload);
    }
    catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const decoded = parseJwt(token);
        setUserId(decoded?.id);
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productResponses = await Promise.all(
          cart.map(item => axios.get(`${config.REACT_APP_API_BASE_URL}/fetchproducts/products/${item.id}`))
        );
        setProducts(productResponses.map(response => response.data));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [cart]);

  const handleRemoveFromCart = (id, size) => {
    dispatch(removeFromCart({ id, size }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleIncreaseQuantity = (id, size) => {
    dispatch(updateQuantity({ id, quantity: getQuantity(id, size) + 1, size }));
  };

  const handleDecreaseQuantity = (id, size) => {
    dispatch(updateQuantity({ id, quantity: Math.max(getQuantity(id, size) - 1, 1), size }));
  };

  const getQuantity = (id, size) => {
    const item = cart.find(product => product.id === id && product.size === size);
    return item ? item.quantity : 1;
  };
 
  const calculateTotalBill = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p._id === item.id);
      if (product) {
        const discountedPrice = product.sale
          ? (product.price - (product.price * product.sale) / 100)
          : product.price;
        return total + (discountedPrice * item.quantity);
      }
      return total;
    }, 0).toFixed(2);
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

  const handleSaveCart = async () => {
    try {
      await axios.post(`${config.REACT_APP_API_BASE_URL}/cartState/cart/save`, { userId, items: cart });
      Alert.alert('Cart saved successfully!');
    } catch (error) {
      console.error('Error saving cart:', error);
      Alert.alert('Failed to save cart.');
    }
  };

  return (
    <View className="flex-1 pt-[45px] bg-white">

      <View className="p-4">
        <Text className="text-2xl mb-1 font-bold">Shopping Cart</Text>
        <View className="bg-gray-300 mb-3 w-full h-[3px]"></View>

        {cart.length === 0 ? (
          <View className="flex mt-[30px] justify-center items-center">
            <Text className="px-4 py-2 bg-red-100 border-2 border-red-700 rounded-lg text-lg font-medium text-red-700">
              Your cart is empty
            </Text>
          </View>
        ) : (
          <View className="flex">
            <View className="flex-row justify-between">
              <TouchableOpacity onPress={handleClearCart} className="bg-red-700 flex flex-row justify-center items-center rounded-lg py-1 px-3">
                <FontAwesome name="trash" size={14} color="white" />
                <Text className="text-[13px] font-medium text-white ml-2">Clear Cart</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSaveCart} className="bg-blue-700 flex flex-row justify-center items-center rounded-lg py-1 px-3">
                <MaterialIcons name="save" size={14} color="white" />
                <Text className="text-[13px] font-medium text-white ml-2">Buy Later</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/orderlist')} className="bg-green-700 flex flex-row justify-center items-center rounded-lg py-1 px-3">
                <Entypo name="shopping-cart" size={14} color="white" />
                <Text className="text-[13px] py-[2px] font-medium text-white ml-2">Checkout Cart</Text>
              </TouchableOpacity>
            </View>

            <View className="border border-gray-400 rounded-lg flex-row justify-between items-center px-3 mt-[10px] py-2">
              <Text>Your Cart Subtotal:</Text>
              <Text className="text-xl font-bold">Rs.{calculateTotalBill()}</Text>
            </View>
            <View className="h-[15px]"></View>
            <FlatList
              data={cart}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <CartItem
                  id={item.id}
                  size={item.size}
                  quantity={item.quantity}
                  onIncrease={() => handleIncreaseQuantity(item.id, item.size)}
                  onDecrease={() => handleDecreaseQuantity(item.id, item.size)}
                  onRemove={() => handleRemoveFromCart(item.id, item.size)}
                />
              )}
              keyExtractor={(item) => `${item.id}-${item.size}`}
              style={{ maxHeight: 550 }} // Custom max height in pixels
              className="w-full" // Optional: ensure full width
            />

          </View>
        )}
      </View>
    </View>
  );
};

export default Cart;
